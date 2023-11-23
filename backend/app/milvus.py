from pymilvus import Collection, connections, FieldSchema, CollectionSchema, DataType, utility
from transformers import ViTFeatureExtractor, ViTModel
from sentence_transformers import SentenceTransformer
from PIL import Image
from enum import Enum
from io import BytesIO
import requests
import torch
import time
import const

# Connect to Milvus server at specific host and port
connections.connect(alias='default', host=const.MILVUS_HOST, port=const.MILVUS_PORT)


# Define an Enum for search type
class SearchType(Enum):
    IMAGE = 'image'
    PROMPT = 'prompt'


# Define the collection schema for image embeddings
image_fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True),
    FieldSchema(name="image_url", dtype=DataType.VARCHAR, max_length=255, description="Image URL"),
    FieldSchema(name="image_embedding", dtype=DataType.FLOAT_VECTOR, dim=768)
]
image_schema = CollectionSchema(image_fields, description="Image search collection")

# Define the collection schema for prompt embeddings
prompt_fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True),
    FieldSchema(name="prompt_text", dtype=DataType.VARCHAR, max_length=255, description="Prompt Text"),
    FieldSchema(name="prompt_embedding", dtype=DataType.FLOAT_VECTOR, dim=384)  # Assuming BERT-like model with 768 dimensions
]
prompt_schema = CollectionSchema(prompt_fields, description="Prompt search collection")

# Create the collections in Milvus (if not already created)
image_collection_name = "image_search"
prompt_collection_name = "prompt_search"

# ########### TODO: remove these lines ###########
# utility.drop_collection(image_collection_name)
# utility.drop_collection(prompt_collection_name)
# ################################################

if not utility.has_collection(image_collection_name):
    image_collection = Collection(name=image_collection_name, schema=image_schema)
else:
    image_collection = Collection(name=image_collection_name)

if not utility.has_collection(prompt_collection_name):
    prompt_collection = Collection(name=prompt_collection_name, schema=prompt_schema)
else:
    prompt_collection = Collection(name=prompt_collection_name)

# 인덱스가 존재하는지 확인
if image_collection.indexes.__len__() == 0:
    # 인덱스 생성 파라미터 정의
    image_index_params = {
        "metric_type": "L2",
        "index_type": "IVF_FLAT",
        "params": {"nlist": 100}
    }
    # 인덱스 생성
    image_collection.create_index(field_name="image_embedding", index_params=image_index_params)
    print("Image index created.")
else:
    print("Image index already exists.")

# 프롬프트 컬렉션에 대한 인덱스 정보 가져오기

# 인덱스가 존재하는지 확인
if prompt_collection.indexes.__len__() == 0:
    # 인덱스 생성 파라미터 정의
    prompt_index_params = {
        "metric_type": "L2",
        "index_type": "IVF_FLAT",
        "params": {"nlist": 100}
    }
    # 인덱스 생성
    prompt_collection.create_index(field_name="prompt_embedding", index_params=prompt_index_params)
    print("Prompt index created.")
else:
    print("Prompt index already exists.")


image_collection.load(replica_number=1)
prompt_collection.load(replica_number=1)

utility.wait_for_loading_complete(image_collection_name)
utility.wait_for_loading_complete(prompt_collection_name)

# Initialize the feature extractor and model
feature_extractor = ViTFeatureExtractor.from_pretrained('google/vit-base-patch16-224')
image_model = ViTModel.from_pretrained('google/vit-base-patch16-224')


# Function to convert image to vector
def image_to_vector(image_url):
    response = requests.get(image_url.replace(const.SERVER_URL, const.INTERNAL_SERVER_URL, 1))
    image = Image.open(BytesIO(response.content))
    # Apply feature extractor to the image
    inputs = feature_extractor(images=image, return_tensors="pt")
    # Get the model's output
    with torch.no_grad():
        outputs = image_model(**inputs)
    # Extract the features from the last hidden state
    features = outputs.last_hidden_state[:, 0, :]
    print("shape of features:", features.shape)
    return features.squeeze(0).cpu().numpy()


text_model = SentenceTransformer('multi-qa-MiniLM-L6-cos-v1')


# Function to convert prompt to vector
def prompt_to_vector(prompt_text):
    vector = text_model.encode(prompt_text)
    print("shape of vector:", vector.shape)
    return vector


# Function to generate a unique ID (this is just a placeholder, you need to implement your own ID generation logic)
def generate_unique_id():
    # Implement a method to generate a unique ID
    # This could be a simple increment, a UUID, a timestamp, or any other method that guarantees uniqueness
    return int(time.time() * 1000)  # Example using a timestamp


# Insert an image and its prompt into Milvus with the same ID
def insert_image_and_prompt(image_url, prompt_text):
    unique_id = generate_unique_id()  # Generate a unique ID for the pair
    image_vector = image_to_vector(image_url)
    prompt_vector = prompt_to_vector(prompt_text)
    image_mr = image_collection.insert([{"id": unique_id, "image_url": image_url, "image_embedding": image_vector}])
    prompt_mr = prompt_collection.insert([{"id": unique_id, "prompt_text": prompt_text, "prompt_embedding": prompt_vector}])
    return unique_id  # Return the common ID of the inserted vectors


# Search for similar images or prompts
def search(query, top_k=5, search_by=SearchType.IMAGE):
    if search_by == SearchType.IMAGE:
        vector = image_to_vector(query)
        results = image_collection.search([vector], "image_embedding", {"metric_type": "L2", "params": {"nprobe": 16}}, top_k, "id > 0")
    elif search_by == SearchType.PROMPT:
        vector = prompt_to_vector(query)
        results = prompt_collection.search([vector], "prompt_embedding", {"metric_type": "L2", "params": {"nprobe": 16}}, top_k, "id > 0")
    else:
        raise ValueError("search_by must be 'SearchType.IMAGE' or 'SearchType.PROMPT'")
    
    return results


# Function to find similar image URLs from the database and their matching prompts
def find_similar_images_by_image(image_url, top_k=5):
    query_vector = image_to_vector(image_url)
    results = image_collection.search([query_vector], "image_embedding", {"metric_type": "L2", "params": {"nprobe": 16}}, top_k, "id > 0")
    
    # Collect all the IDs and distances from the search results
    ids_and_distances = [(hit.id, hit.distance) for hits in results for hit in hits]
    
    # Separate IDs for querying
    ids = [id for id, _ in ids_and_distances]
    
    # Retrieve all image entities at once by their IDs
    image_entities = image_collection.query("id in {}".format(ids), output_fields=["id", "image_url"])
    image_info_dict = {entity['id']: {"image_url": entity['image_url']} for entity in image_entities}

    # Retrieve all prompt entities at once by their IDs
    prompt_entities = prompt_collection.query("id in {}".format(ids), output_fields=["id", "prompt_text"])
    prompt_info_dict = {entity['id']: {"prompt_text": entity['prompt_text']} for entity in prompt_entities}
    
    similar_images_with_prompts = []
    for hit_id, distance in ids_and_distances:
        # Combine the prompt and image information using the ID as a key
        combined_info = {"id": hit_id, **prompt_info_dict.get(hit_id, {}), **image_info_dict.get(hit_id, {}), "distance": distance}
        similar_images_with_prompts.append(combined_info)
        
    return similar_images_with_prompts


# Function to find similar images based on a prompt
def find_similar_images_by_prompt(prompt_text, top_k=5):
    query_vector = prompt_to_vector(prompt_text)
    results = prompt_collection.search([query_vector], "prompt_embedding", {"metric_type": "L2", "params": {"nprobe": 16}}, top_k, "id > 0")
    
    # Collect all the IDs and distances from the search results
    ids_and_distances = [(hit.id, hit.distance) for hits in results for hit in hits]
    
    # Separate IDs for querying
    ids = [id for id, _ in ids_and_distances]
    
    # Retrieve all prompt entities at once by their IDs
    
    prompt_entities = prompt_collection.query("id in {}".format(ids), output_fields=["id", "prompt_text"])
    print("prompt_entities:", prompt_entities)
    prompt_info_dict = {entity['id']: {"prompt_text": entity['prompt_text']} for entity in prompt_entities}
    
    # Retrieve all image entities at once by their IDs
    image_entities = image_collection.query("id in {}".format(ids), output_fields=["id", "image_url"])
    print("image_entities:", image_entities)
    image_info_dict = {entity['id']: {"image_url": entity['image_url']} for entity in image_entities}

    similar_images_with_prompts = []
    for hit_id, distance in ids_and_distances:
        # Combine the prompt and image information using the ID as a key
        combined_info = {"id": hit_id, **prompt_info_dict.get(hit_id, {}), **image_info_dict.get(hit_id, {}), "distance": distance}
        similar_images_with_prompts.append(combined_info)
    
    return similar_images_with_prompts
