import { Dispatch, SetStateAction } from "react";

export type Mode = "txt2img" | "img2img";

export type ImageSize = 512 | 768 | 1024;
export type Scheduler =
  | "DDIM"
  | "DPMSolverMultistep"
  | "HeunDiscrete"
  | "KarrasDPM"
  | "K_EULER_ANCESTRAL"
  | "K_EULER"
  | "PNDM";

export interface ContextProps {
  mode: Mode;
  input: InputType;
  setInput: Dispatch<SetStateAction<InputType>>;
  output: OutputType;
  setOutput: Dispatch<SetStateAction<OutputType>>;
}

export type InputType = {
  prompt: string;
  negative_prompt: string;
  width: ImageSize;
  height: ImageSize;
  batch_size: number;
  denoising_steps: number;
  guidance_scale: number;
  scheduler: Scheduler;
  seed?: number;

  // for img2img generate
  image?: File;
  strength?: number;
};

export type OutputType = {
  images: string[] | null;
  similarImages: string[] | null;
  process: number | null;
};
