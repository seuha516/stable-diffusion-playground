from PIL import Image
import string
import random
import const


def get_random_string():
    letters_set = string.ascii_letters
    random_letters_list = random.sample(letters_set, 24)
    random_string = ''.join(random_letters_list)

    return random_string


def get_image_name():
    image_name = f'{get_random_string()}.png'

    return image_name


# TODO: Upload the image to Google Cloud Storage
# TODO: Save image in vector DB with vectorize process
# NOTE: Intermediate image should not be used in vector DB
def save_image(image: Image.Image, ttl: bool = True):
    # TODO: save ttl cloud if ttl is True
    image_name = get_image_name()
    image.save(f'{const.STORAGE_DIR_PATH}/{image_name}', "PNG")
    image_url = f'{const.SERVEL_URL}{const.IMAGE_API_PATH}/{image_name}'

    return {"image_url": image_url, "image_name": image_name}
