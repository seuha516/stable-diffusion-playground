from predict import predict

outs = predict(
        prompt="man looking for dinner",
        negative_prompt="meat",
        image=None,
        mask=None,
        width=256,
        height=256,
        num_outputs=2,
        scheduler='K_EULER',
        num_inference_steps=50,
        guidance_scale=7.5,
        prompt_strength=0.8,
        seed=None,
        apply_watermark=False,
    )
print(len(outs))
for i in range(outs):
    outs[i].save("result"+str(i)+"png", "PNG")
