from PIL import Image
import string
import random
import const


def get_image_name():
    letters_set = string.ascii_letters
    random_letters_list = random.sample(letters_set, 24)
    image_name = ''.join(random_letters_list)

    return f'{image_name}.png'


# TODO: Upload the image to Google Cloud Storage
# NOTE: intermediate image should not be used in vector DB
def get_image_url(image: Image.Image) -> str:
    image_name = get_image_name()
    image.save(f'{const.STORAGE_DIR_PATH}/{image_name}', "PNG")

    return f'{const.SERVEL_URL}{const.GET_IMAGE_API_PATH}/{image_name}'
