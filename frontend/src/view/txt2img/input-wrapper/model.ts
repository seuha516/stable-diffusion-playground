import { Dispatch, SetStateAction } from "react";

import { Txt2imgInputType } from "../../model";

export interface InputWrapperProps {
  input: Txt2imgInputType;
  setInput: Dispatch<SetStateAction<Txt2imgInputType>>;
}
