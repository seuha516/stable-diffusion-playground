import os
import shutil
from typing import Any, Optional
import torch
from diffusers import (
    DDIMScheduler,
    DiffusionPipeline,
    DPMSolverMultistepScheduler,
    EulerAncestralDiscreteScheduler,
    EulerDiscreteScheduler,
    HeunDiscreteScheduler,
    PNDMScheduler,
    StableDiffusionXLImg2ImgPipeline,
    StableDiffusionXLInpaintPipeline,
)
from diffusers.utils import load_image

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
    torch_dtype=torch.float16,
    use_safetensors=True,
    variant="fp16",
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

INPAINT_PIPE = StableDiffusionXLInpaintPipeline(
    vae=TXT2IMG_PIPE.vae,
    text_encoder=TXT2IMG_PIPE.text_encoder,
    text_encoder_2=TXT2IMG_PIPE.text_encoder_2,
    tokenizer=TXT2IMG_PIPE.tokenizer,
    tokenizer_2=TXT2IMG_PIPE.tokenizer_2,
    unet=TXT2IMG_PIPE.unet,
    scheduler=TXT2IMG_PIPE.scheduler,
)
INPAINT_PIPE.to(device)


def load_image_from_path(path):
    shutil.copyfile(path, "/tmp/image.png")
    return load_image("/tmp/image.png").convert("RGB")


def predict(
    prompt: str,
    negative_prompt: str,
    image: Optional[str],
    mask: Optional[str],
    width: int,
    height: int,
    num_outputs: int,
    scheduler: str,
    num_inference_steps: int,
    guidance_scale: float,
    prompt_strength: float,
    seed: Optional[int],
    apply_watermark: bool,
    # lora_scale: float,
) -> Any:
    if seed is None:
        seed = int.from_bytes(os.urandom(2), "big")

    kwargs = {}

    if image and mask:
        kwargs["image"] = load_image_from_path(image)
        kwargs["mask_image"] = load_image_from_path(mask)
        kwargs["strength"] = prompt_strength
        kwargs["width"] = width
        kwargs["height"] = height
        pipe = INPAINT_PIPE
    elif image:
        kwargs["image"] = load_image_from_path(image)
        kwargs["strength"] = prompt_strength
        pipe = IMG2IMG_PIPE
    else:
        kwargs["width"] = width
        kwargs["height"] = height
        pipe = TXT2IMG_PIPE

    if not apply_watermark:
        # toggles watermark for this prediction
        watermark_cache = pipe.watermark
        pipe.watermark = None

    pipe.scheduler = SCHEDULERS[scheduler].from_config(pipe.scheduler.config)
    generator = torch.Generator(device).manual_seed(seed)

    common_args = {
        "prompt": [prompt] * num_outputs,
        "negative_prompt": [negative_prompt] * num_outputs,
        "guidance_scale": guidance_scale,
        "generator": generator,
        "num_inference_steps": num_inference_steps,
    }

    # kwargs["cross_attention_kwargs"] = {"scale": lora_scale}

    if not apply_watermark:
        pipe.watermark = watermark_cache

    output = pipe(**common_args, **kwargs).images

    return output
