from flask import Flask, request, session, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, join_room
from predict import predict
from PIL import Image
import torch
import config
import const
import util
# import storage

app = Flask(__name__)
app.config.from_object(config.LocalConfig)
CORS(app)
socketio = SocketIO(app, async_mode="threading", cors_allowed_origins="*")


@app.route('/health', methods=['GET'])
def health():
    return 'OK'


@app.route('/gpu', methods=['GET'])
def gpu():
    return 'True' if torch.cuda.is_available() else 'False'


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

    print(f'Disconnect {room}')


@socketio.on("request")
def socket_request(message):
    room = session['room']
    print(f'(Socket request from {room})', message)

    body = message['body']

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
        seed = int(body.get('seed', -1))

        # for img2img
        image_name = body.get('image', None)
        image = None
        if image_name:
            image = Image.open(f'{const.STORAGE_DIR_PATH}/{image_name}').convert('RGB')
        prompt_strength = float(body.get('prompt_strength', 0.8))

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
    image_name = util.save_image(image).get("image_name")

    return image_name


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)
