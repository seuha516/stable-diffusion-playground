export type Txt2imgInputType = {
  prompt: string;
  negative_prompt: string;
  width: ImageSize;
  height: ImageSize;
  batch_size: number;
  denoising_steps: number;
  guidance_scale: number;
  scheduler: Scheduler;
  seed?: string;
};

export type Img2imgInputType = {
  image: File;
  prompt: string;
  negative_prompt: string;
  strength: number;
  batch_size: number;
  denoising_steps: number;
  guidance_scale: number;
  scheduler: Scheduler;
  seed?: number;
};

export type UpscalingInputType = {
  image: File;
  scale: UpscalingScale;
};

export type ImageSize = 512 | 768 | 1024;
export type Scheduler = "Scheduler1" | "Scheduler2" | "Scheduler3";
export type UpscalingScale = 2 | 4;
