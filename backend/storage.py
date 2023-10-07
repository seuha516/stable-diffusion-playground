import json
import os
from google.cloud import storage
from PIL import Image
import boto3
import io

# Initialize Google Cloud Storage client
credentials_json = json.loads(os.environ.get("GCP_CREDENTIALS_JSON"))
storage_client = storage.Client.from_service_account_info(credentials_json)

# Initialize AWS S3 client
s3_client = boto3.client('s3')

def upload_to_gcs(image: Image.Image, bucket_name: str, object_name: str) -> str:
    """Upload an image to Google Cloud Storage and return its URI."""
    bucket = storage_client.get_bucket(bucket_name)
    byte_stream = io.BytesIO()
    image.save(byte_stream, format="JPEG")
    blob = bucket.blob(object_name)
    blob.upload_from_string(byte_stream.getvalue(), content_type="image/jpeg")
    return f"gs://{bucket.name}/{blob.name}"
