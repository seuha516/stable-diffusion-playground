import { Dispatch, SetStateAction } from "react";

import { Img2imgInputType } from "../../model";

export interface InputWrapperProps {
  input: Img2imgInputType;
  setInput: Dispatch<SetStateAction<Img2imgInputType>>;
}
