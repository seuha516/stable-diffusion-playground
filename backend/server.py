from flask import Flask, request, jsonify
from predict import predict

app = Flask(__name__)


@app.route('/v1/predictions', methods=['POST'])
def predictions():
    data = request.json
    input_data = data.get('input', {})

    prompt = input_data.get('prompt', 'An astronaut riding a rainbow unicorn')
    negative_prompt = input_data.get('negative_prompt', '')
    image = input_data.get('image')
    mask = input_data.get('mask')
    width = int(input_data.get('width', 1024))
    height = int(input_data.get('height', 1024))
    num_outputs = int(input_data.get('num_outputs', 1))
    scheduler = input_data.get('scheduler', 'K_EULER')
    num_inference_steps = int(input_data.get('num_inference_steps', 50))
    guidance_scale = float(input_data.get('guidance_scale', 7.5))
    prompt_strength = float(input_data.get('prompt_strength', 0.8))
    seed = input_data.get('seed')
    apply_watermark = bool(input_data.get('apply_watermark'))
    # lora_scale = float(input_data.get('lora_scale', 0.6))

    # Here, you would typically process the image and other inputs to generate the output.
    # For demonstration, we are just returning the inputs as JSON.
    outs = predict(
        prompt=prompt,
        negative_prompt=negative_prompt,
        image=image,
        mask=mask,
        width=width,
        height=height,
        num_outputs=num_outputs,
        scheduler=scheduler,
        num_inference_steps=num_inference_steps,
        guidance_scale=guidance_scale,
        prompt_strength=prompt_strength,
        seed=seed,
        apply_watermark=apply_watermark,
        # lora_scale=lora_scale,
    )

    output = {
        "type": "array",
        "items": {
            "type": "string",
            "format": "uri"
        },
        "title": "Output"
    }

    return jsonify(output)


if __name__ == '__main__':
    app.run(ssl_context='adhoc')  # ssl_context is added for HTTPS

