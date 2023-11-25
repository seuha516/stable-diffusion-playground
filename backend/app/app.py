from flask import Flask, request, session, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, join_room
from predict import predict, predicting_rooms, set_lock
from PIL import Image
import random
import torch
import config
import const
import util
import milvus
# import storage

app = Flask(__name__)
app.config.from_object(config.LocalConfig)
CORS(app)
socketio = SocketIO(app, async_mode="threading", cors_allowed_origins="*")


@app.route('/health', methods=['GET'])
def health():
    if torch.cuda.is_available():
        return 'OK (CUDA)'
    elif torch.backends.mps.is_available():
        return 'OK (MPS)'
    else:
        return 'OK (CPU)'


@socketio.on('connect')
def connect():
    room = util.get_random_string()
    session['room'] = room
    join_room(room)

    print(f'Connect {room}')
    socketio.emit('message', f'Connect {room}', room=room)


@socketio.on('disconnect')
def disconnect():
    room = session['room']
    session.clear()

    with set_lock:
        if room in predicting_rooms:
            predicting_rooms.remove(room)

    print(f'Disconnect {room}')


@socketio.on("request")
def socket_request(message):
    room = session['room']
    print(f'(Socket request from {room})', message)
    body = message.get('body', {})

    if message['type'] == 'prediction':
        # for txt2img
        prompt = body.get('prompt', '')
        negative_prompt = body.get('negative_prompt', '')
        width = int(body.get('width', 1024))
        height = int(body.get('height', 1024))
        num_outputs = int(body.get('num_outputs', 1))
        num_inference_steps = int(body.get('num_inference_steps', 50))
        guidance_scale = float(body.get('guidance_scale', 7.5))
        scheduler = body.get('scheduler', 'K_EULER')
        seed = int(body.get('seed', random.randrange(1, 10000000)))

        # for img2img
        image_name = body.get('image', None)
        image = None
        if image_name:
            image = Image.open(f'{const.STORAGE_DIR_PATH}/{image_name}').convert('RGB')
        prompt_strength = float(body.get('prompt_strength', 0.8))

        with set_lock:
            predicting_rooms.add(room)
        predict(
            prompt=prompt,
            negative_prompt=negative_prompt,
            width=width,
            height=height,
            num_outputs=num_outputs,
            num_inference_steps=num_inference_steps,
            guidance_scale=guidance_scale,
            scheduler=scheduler,
            seed=seed,
            image=image,
            prompt_strength=prompt_strength,
            socketio=socketio,
            room=room
        )

    elif message['type'] == 'similar_by_prompt':
        prompt = body.get('prompt', '')
        similar_result = milvus.find_similar_images_by_prompt(prompt, 10)

        images = []
        for item in similar_result:
            images.append({"url": item.get('image_url'), "prompt": item.get('prompt_text')})

        socketio.emit('similar_by_prompt', {"images": images}, room=room)

    elif message['type'] == 'similar_by_image':
        image_url = body.get('image', '')
        similar_result = milvus.find_similar_images_by_image(image_url, 10)

        images = []
        for item in similar_result:
            images.append({"url": item.get('image_url'), "prompt": item.get('prompt_text')})

        socketio.emit('similar_by_image', {"images": images}, room=room)

    elif message['type'] == 'stop':
        with set_lock:
            if room in predicting_rooms:
                predicting_rooms.remove(room)

    else:
        print('Not found')


@app.route(f'{const.IMAGE_API_PATH}/<image_filename>', methods=['GET'])
def get_image(image_filename):
    try:
        return send_from_directory(const.STORAGE_DIR_PATH, image_filename)
    except Exception as e:
        return str(e)


@app.route(f'{const.IMAGE_API_PATH}', methods=['POST'])
def set_image():
    image = request.files.get('image', None)
    image = Image.open(image).convert('RGB')
    image_name = util.save_image(image, ttl=True).get("image_name")

    return image_name


@app.route(f'/similar/image/<image_filename>', methods=['GET'])
def similar_image(image_filename):
    return milvus.find_similar_images_by_image(f'{const.SERVER_URL}{const.IMAGE_API_PATH}/{image_filename}', 10)


@app.route(f'/similar/prompt/<prompt>', methods=['GET'])
def similar_prompt(prompt):
    return milvus.find_similar_images_by_prompt(prompt, 10)


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=8000, allow_unsafe_werkzeug=True)
