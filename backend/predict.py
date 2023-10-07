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


class KarrasDPM:
    def from_config(config):
        return DPMSolverMultistepScheduler.from_config(config, use_karras_sigmas=True)


device = "cuda"

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
) -> Any:
    if image:
        pipe = IMG2IMG_PIPE
    else:
        pipe = TXT2IMG_PIPE

    pipe.scheduler = SCHEDULERS[scheduler].from_config(pipe.scheduler.config)
    generator = torch.Generator(device).manual_seed(seed)

    args = {
        "generator": generator,
        "prompt": [prompt] * num_outputs,
        "negative_prompt": [negative_prompt] * num_outputs,
        "width": width,
        "height": height,
        "num_inference_steps": num_inference_steps,
        "guidance_scale": guidance_scale,
    }

    if image:
        args["image"] = image
        args["strength"] = prompt_strength

    print('predict start')
    output = pipe(**args).images

    return output
