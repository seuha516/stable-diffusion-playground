import torch
from diffusers import (
    DDIMScheduler,
    DiffusionPipeline,
    DPMSolverMultistepScheduler,
    EulerAncestralDiscreteScheduler,
    EulerDiscreteScheduler,
    HeunDiscreteScheduler,
    PNDMScheduler,
    StableDiffusionXLImg2ImgPipeline
)
from PIL import Image
from typing import Any, Optional
import datetime
from flask_socketio import SocketIO


class KarrasDPM:
    def from_config(config):
        return DPMSolverMultistepScheduler.from_config(config, use_karras_sigmas=True)


if torch.cuda.is_available():
    device = "cuda"
else:
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

TXT2IMG_PIPE = DiffusionPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    torch_dtype=torch.float32,
    use_safetensors=True,
    variant="fp32",
)
TXT2IMG_PIPE.to(device)

IMG2IMG_PIPE = StableDiffusionXLImg2ImgPipeline(
    vae=TXT2IMG_PIPE.vae,
    text_encoder=TXT2IMG_PIPE.text_encoder,
    text_encoder_2=TXT2IMG_PIPE.text_encoder_2,
    tokenizer=TXT2IMG_PIPE.tokenizer,
    tokenizer_2=TXT2IMG_PIPE.tokenizer_2,
    unet=TXT2IMG_PIPE.unet,
    scheduler=TXT2IMG_PIPE.scheduler,
)
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
) -> Any:
    if image:
        pipe = IMG2IMG_PIPE
    else:
        pipe = TXT2IMG_PIPE

    def latents_callback(i, t, latents):
        vae = pipe.vae
        latents = 1 / 0.18215 * latents
        latent = vae.decode(latents).sample[0]
        latent = (latent / 2 + 0.5).clamp(0, 1)
        if torch.cuda.is_available():
            latent = latent.cuda().permute(1, 2, 0).numpy()
        else:
            latent = latent.cpu().permute(1, 2, 0).numpy()
        latent_image = pipe.numpy_to_pil(latent)[0]

        image_name = (
            f'{str(datetime.datetime.now().isoformat())}(intermediate_{i})'
            .replace(".", "_")
            .replace(":", "_")
            + ".png"
        )
        latent_image.save(f'./storage/{image_name}', "PNG")
        socketio.send(f'http://localhost:5000/images/{image_name}')

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

    output = pipe(**args, callback=latents_callback, callback_steps=10).images

    return output
