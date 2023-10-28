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

      {mode === "txt2img" && (
        <SelectItem<ImageSize>
          title="width"
          value={input.width}
          onChange={(width) => setInput({ ...input, width })}
          options={imageSizeOptions}
        />
      )}

      {mode === "txt2img" && (
        <SelectItem<ImageSize>
          title="height"
          value={input.height}
          onChange={(height) => setInput({ ...input, height })}
          options={imageSizeOptions}
        />
      )}

      {mode === "img2img" && (
        <SliderItem
          title="prompt_strength"
          value={input.prompt_strength ?? 0.8}
          onChange={(prompt_strength) =>
            setInput({ ...input, prompt_strength })
          }
          min={0}
          max={1}
          step={0.01}
        />
      )}

      <SliderItem
        title="num_outputs"
        value={input.num_outputs}
        onChange={(num_outputs) => setInput({ ...input, num_outputs })}
        min={1}
        max={4}
        step={1}
        isInteger={true}
      />

      <SliderItem
        title="num_inference_steps"
        value={input.num_inference_steps}
        onChange={(num_inference_steps) =>
          setInput({ ...input, num_inference_steps })
        }
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
