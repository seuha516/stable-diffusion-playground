import string
import random


def get_image_name():
    letters_set = string.ascii_letters
    random_list = random.sample(letters_set, 24)
    name = ''.join(random_list)

    return f'{name}.png'
