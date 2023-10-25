from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO
from PIL import Image
from predict import predict
import json
import torch
import config
# import storage


app = Flask(__name__)
app.config.from_object(config.LocalConfig)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")


@app.route('/health', methods=['GET'])
def health():
    return 'OK'


@app.route('/gpu', methods=['GET'])
def gpu():
    return 'True' if torch.cuda.is_available() else 'False'


@app.route('/images/<image_filename>', methods=['GET'])
def get_images(image_filename):
    try:
        return send_from_directory('storage', image_filename)
    except Exception as e:
        return str(e)


@app.route('/v1/predictions', methods=['POST'])
def predictions():
    input_data = json.loads(request.form['data'])

    # for txt2img
    prompt = input_data.get('prompt', '')
    negative_prompt = input_data.get('negative_prompt', '')
    width = int(input_data.get('width', 1024))
    height = int(input_data.get('height', 1024))
    num_outputs = int(input_data.get('num_outputs', 1))
    num_inference_steps = int(input_data.get('num_inference_steps', 50))
    guidance_scale = float(input_data.get('guidance_scale', 7.5))
    scheduler = input_data.get('scheduler', 'K_EULER')
    seed = int(input_data.get('seed', -1))

    # for img2img
    image = request.files.get('image', None)
    if image:
        image = Image.open(image).convert('RGB')
    prompt_strength = float(input_data.get('prompt_strength', 0.8))

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
    )

    return jsonify(success=True)


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)