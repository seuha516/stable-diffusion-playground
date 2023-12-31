from diffusers import (
    DDIMScheduler,
    DiffusionPipeline,
    DPMSolverMultistepScheduler,
    EulerAncestralDiscreteScheduler,
    EulerDiscreteScheduler,
    HeunDiscreteScheduler,
    PNDMScheduler,
    StableDiffusionXLImg2ImgPipeline,
    StableDiffusionPipeline,
    StableDiffusionImg2ImgPipeline
)
from PIL import Image
from typing import Optional
from flask_socketio import SocketIO
import torch
import const
import util
import milvus
from threading import Lock

set_lock = Lock()
predicting_rooms = set()


class KarrasDPM:
    def from_config(config):
        return DPMSolverMultistepScheduler.from_config(config, use_karras_sigmas=True)


if torch.cuda.is_available():
    print('CUDA is available')
    device = "cuda"
elif torch.backends.mps.is_available():
    print('MPS is available')
    device = "mps"
else:
    print('CPU is available')
    device = "cpu"

SCHEDULERS = {
    "DDIM": DDIMScheduler,
    "DPMSolverMultistep": DPMSolverMultistepScheduler,
    "HeunDiscrete": HeunDiscreteScheduler,
    "KarrasDPM": KarrasDPM,
    "K_EULER_ANCESTRAL": EulerAncestralDiscreteScheduler,
    "K_EULER": EulerDiscreteScheduler,
    "PNDM": PNDMScheduler,
}

if const.IS_LIGHT_MODEL:
    print('Use light model')
    TXT2IMG_PIPE = StableDiffusionPipeline.from_pretrained(
        "runwayml/stable-diffusion-v1-5",
        torch_dtype=torch.float16,
        safety_checker=None,
        requires_safety_checker=False
    )
    IMG2IMG_PIPE = StableDiffusionImg2ImgPipeline.from_pretrained(
        "runwayml/stable-diffusion-v1-5",
        torch_dtype=torch.float16,
        safety_checker=None,
        requires_safety_checker=False
    )
else:
    print('Use sdxl')
    TXT2IMG_PIPE = DiffusionPipeline.from_pretrained(
        "stabilityai/stable-diffusion-xl-base-1.0",
        torch_dtype=torch.float32,
        use_safetensors=True,
        variant="fp32",
    )
    IMG2IMG_PIPE = StableDiffusionXLImg2ImgPipeline(
        vae=TXT2IMG_PIPE.vae,
        text_encoder=TXT2IMG_PIPE.text_encoder,
        text_encoder_2=TXT2IMG_PIPE.text_encoder_2,
        tokenizer=TXT2IMG_PIPE.tokenizer,
        tokenizer_2=TXT2IMG_PIPE.tokenizer_2,
        unet=TXT2IMG_PIPE.unet,
        scheduler=TXT2IMG_PIPE.scheduler,
    )

TXT2IMG_PIPE.to(device)
IMG2IMG_PIPE.to(device)


def predict(
    prompt: str,
    negative_prompt: str,
    width: int,
    height: int,
    num_outputs: int,
    num_inference_steps: int,
    guidance_scale: float,
    scheduler: str,
    seed: int,
    image: Optional[Image.Image],
    prompt_strength: Optional[float],
    socketio: SocketIO,
    room: str
):
    if image:
        pipe = IMG2IMG_PIPE
    else:
        pipe = TXT2IMG_PIPE

    # TODO: update callback function
    def latents_callback(i, t, latents):
        with set_lock:
            if room not in predicting_rooms:
                socketio.emit('stop', room=room)
                print(f'Inference cancelled: {room}')
                raise Exception("Inference Stopped")

        intermediate_image_urls = []

        latents = 1 / 0.18215 * latents
        latents = pipe.vae.decode(latents).sample

        for latent in latents:
            latent = (latent / 2 + 0.5).clamp(0, 1)

            if torch.cuda.is_available():
                latent = latent.cuda().cpu().permute(1, 2, 0).numpy()
            else:
                latent = latent.cpu().permute(1, 2, 0).numpy()

            latent_image = pipe.numpy_to_pil(latent)[0]
            latent_image_url = util.save_image(latent_image, ttl=True).get("image_url")
            intermediate_image_urls.append(latent_image_url)

        print(f'Emit intermediate images to {room} (process: {i + 1})')
        socketio.emit(
            'intermediate_data',
            {"images": intermediate_image_urls, "process": i + 1},
            room=room
        )

    pipe.scheduler = SCHEDULERS[scheduler].from_config(pipe.scheduler.config)
    generator = torch.Generator(device).manual_seed(seed)

    args = {
        "generator": generator,
        "prompt": [prompt] * num_outputs,
        "negative_prompt": [negative_prompt] * num_outputs,
        "num_inference_steps": num_inference_steps,
        "guidance_scale": guidance_scale,
    }

    if image:
        args["image"] = image
        args["strength"] = prompt_strength
    else:
        args["width"] = width
        args["height"] = height

    outputs = pipe(**args, callback=latents_callback, callback_steps=1).images

    image_urls = []
    for output_num, output in enumerate(outputs):
        image_url = util.save_image(output).get("image_url")
        image_urls.append(image_url)
        
    print(f'Saving final images to db')
    for image_url in image_urls:
        try:
            milvus.insert_image_and_prompt(image_url, prompt)
        except Exception as e:
            print(e)
            pass

    print(f'Emit final images to {room}')
    socketio.emit('final_data', {"images": image_urls}, room=room)
