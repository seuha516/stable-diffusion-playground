import { useState } from "react";

import { Img2imgInputType } from "../model";
import classes from "./img2img.module.scss";
import InputWrapper from "./input-wrapper/input-wrapper";

const initialInput: Img2imgInputType = {
  image: null,
  prompt: "",
  negative_prompt: "",
  strength: 0.8,
  batch_size: 1,
  denoising_steps: 20,
  guidance_scale: 7.5,
  scheduler: "Scheduler1",
  seed: undefined,
};

export default function Img2img() {
  const [input, setInput] = useState<Img2imgInputType>(initialInput);

  return (
    <div className={classes.Container}>
      <div className={classes.InputWrapper}>
        <InputWrapper input={input} setInput={setInput} />
      </div>

      <div className={classes.OutputWrapper}>OutputWrapper</div>
    </div>
  );
}
