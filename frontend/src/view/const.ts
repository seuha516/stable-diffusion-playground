import { createContext } from "react";
import {
  ContextProps,
  ImageSize,
  InputType,
  OutputType,
  Scheduler,
} from "./model";

export const initialInput: InputType = {
  prompt: "",
  negative_prompt: "",
  width: 512,
  height: 512,
  batch_size: 1,
  denoising_steps: 20,
  guidance_scale: 7.5,
  scheduler: "DDIM",
  seed: undefined,

  // for img2img generate
  image: undefined,
  strength: 0.8,
};

export const initialOutput: OutputType = {
  images: null,
  similarImages: null,
  process: null,
};

export const imageSizeOptions: { value: ImageSize }[] = [
  { value: 512 },
  { value: 768 },
  { value: 1024 },
];

export const schedulerOptions: { value: Scheduler }[] = [
  { value: "DDIM" },
  { value: "DPMSolverMultistep" },
  { value: "HeunDiscrete" },
  { value: "KarrasDPM" },
  { value: "K_EULER_ANCESTRAL" },
  { value: "K_EULER" },
  { value: "PNDM" },
];

export const Context = createContext<ContextProps>({
  mode: "txt2img",
  input: initialInput,
  setInput: () => {},
  output: initialOutput,
  setOutput: () => {},
});
