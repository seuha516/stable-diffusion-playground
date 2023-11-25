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
  num_outputs: number;
  num_inference_steps: number;
  guidance_scale: number;
  scheduler: Scheduler;
  seed?: number;

  // for img2img generate
  image?: File;
  prompt_strength?: number;
};

export type OutputType = {
  images: string[] | null;
  similarImagesByPrompt: SimilarImage[] | null;
  similarImagesByImage: SimilarImage[] | null;
  process: number | null;
  isStopped: boolean;
};

export type SimilarImage = {
  url: string;
  prompt: string;
};
