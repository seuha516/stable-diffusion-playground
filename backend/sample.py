from diffusers import DiffusionPipeline
import torch

pipeline = DiffusionPipeline.from_pretrained("runwayml/stable-diffusion-v1-5", torch_dtype=torch.float32)
pipeline.to("mps")
out = pipeline("An image of a squirrel in Picasso style").images[0]
out.save("result.png", "PNG")

