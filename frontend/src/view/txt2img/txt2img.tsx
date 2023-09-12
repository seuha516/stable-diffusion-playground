import { useState } from "react";

import { Txt2imgInputType } from "../model";
import classes from "./txt2img.module.scss";
import InputWrapper from "./input-wrapper/input-wrapper";

const initialInput: Txt2imgInputType = {
  prompt: "",
  negative_prompt: "",
  width: 512,
  height: 512,
  batch_size: 1,
  denoising_steps: 20,
  guidance_scale: 7.5,
  scheduler: "Scheduler1",
  seed: undefined,
};

export default function Txt2img() {
  const [input, setInput] = useState<Txt2imgInputType>(initialInput);

  return (
    <div className={classes.Container}>
      <div className={classes.InputWrapper}>
        <InputWrapper input={input} setInput={setInput} />
      </div>

      <div className={classes.OutputWrapper}>OutputWrapper</div>
    </div>
  );
}
