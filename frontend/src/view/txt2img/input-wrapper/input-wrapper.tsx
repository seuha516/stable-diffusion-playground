import classes from "./input-wrapper.module.scss";
import { InputWrapperProps } from "./model";
import { ImageSize, Scheduler } from "../../model";
import TextAreaItem from "../../../component/input/items/textarea-item/textarea-item";
import SelectItem from "../../../component/input/items/select-item/select-item";
import SliderItem from "../../../component/input/items/slider-item/slider-item";

export default function InputWrapper({ input, setInput }: InputWrapperProps) {
  return (
    <div className={classes.Container}>
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
      />

      <SelectItem<ImageSize>
        title="height"
        value={input.height}
        onChange={(height) => setInput({ ...input, height })}
      />

      <SliderItem
        title="batch_size"
        value={input.batch_size}
        onChange={(batch_size) => setInput({ ...input, batch_size })}
      />

      <SliderItem
        title="denoising_steps"
        value={input.denoising_steps}
        onChange={(denoising_steps) => setInput({ ...input, denoising_steps })}
      />

      <SliderItem
        title="guidance_scale"
        value={input.guidance_scale}
        onChange={(guidance_scale) => setInput({ ...input, guidance_scale })}
      />

      <SelectItem<Scheduler>
        title="scheduler"
        value={input.scheduler}
        onChange={(scheduler) => setInput({ ...input, scheduler })}
      />
    </div>
  );
}
