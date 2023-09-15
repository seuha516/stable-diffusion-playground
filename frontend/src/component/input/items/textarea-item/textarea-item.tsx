import { Input } from "antd";

import type { TextAreaItemProps } from "./model";
import classes from "./textarea-item.module.scss";
import ItemWrapper from "../item-wrapper";
import { useContext } from "react";
import { Context } from "../../../../view/const";

export default function TextAreaItem({
  title,
  value,
  onChange,
}: TextAreaItemProps) {
  const { output } = useContext(Context);
  const disabled = output.process !== null;

  return (
    <ItemWrapper title={title}>
      <Input.TextArea
        className={classes.TextArea}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </ItemWrapper>
  );
}
