import classes from "./input-wrapper.module.scss";
import { ImageSize, Scheduler } from "../model";
import TextAreaItem from "../../component/input/items/textarea-item/textarea-item";
import SelectItem from "../../component/input/items/select-item/select-item";
import SliderItem from "../../component/input/items/slider-item/slider-item";
import SeedItem from "../../component/input/items/seed-item/seed-item";
import ImageItem from "../../component/input/items/image-item/image-item";
import { Context, imageSizeOptions, schedulerOptions } from "../const";
import { useContext } from "react";

export default function InputWrapper() {
  const { mode, input, setInput } = useContext(Context);

  return (
    <div className={classes.Container}>
      {mode === "img2img" && (
        <ImageItem
          title="image"
          value={input.image}
          onChange={(image) => setInput({ ...input, image })}
        />
      )}

      <TextAreaItem
        title="prompt"
        value={input.prompt}
        onChange={(prompt) => setInput({ ...input, prompt })}
      />

      <TextAreaItem
        title="negative_prompt"
        value={input.negative_prompt}
        onChange={(negative_prompt) => setInput({ ...input, negative_prompt })}
      />

      <SelectItem<ImageSize>
        title="width"
        value={input.width}
        onChange={(width) => setInput({ ...input, width })}
        options={imageSizeOptions}
      />

      <SelectItem<ImageSize>
        title="height"
        value={input.height}
        onChange={(height) => setInput({ ...input, height })}
        options={imageSizeOptions}
      />

      {mode === "img2img" && (
        <SliderItem
          title="strength"
          value={input.strength ?? 0.8}
          onChange={(strength) => setInput({ ...input, strength })}
          min={0}
          max={1}
          step={0.01}
        />
      )}

      <SliderItem
        title="batch_size"
        value={input.batch_size}
        onChange={(batch_size) => setInput({ ...input, batch_size })}
        min={1}
        max={4}
        step={1}
        isInteger={true}
      />

      <SliderItem
        title="denoising_steps"
        value={input.denoising_steps}
        onChange={(denoising_steps) => setInput({ ...input, denoising_steps })}
        min={1}
        max={500}
        step={1}
        isInteger={true}
      />

      <SliderItem
        title="guidance_scale"
        value={input.guidance_scale}
        onChange={(guidance_scale) => setInput({ ...input, guidance_scale })}
        min={1}
        max={20}
        step={0.01}
      />

      <SelectItem<Scheduler>
        title="scheduler"
        value={input.scheduler}
        onChange={(scheduler) => setInput({ ...input, scheduler })}
        options={schedulerOptions}
      />

      <SeedItem
        title="seed"
        value={input.seed}
        onChange={(seed) => setInput({ ...input, seed })}
      />
    </div>
  );
}
