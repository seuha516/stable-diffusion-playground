import { Input } from "antd";

import type { TextAreaItemProps } from "./model";
import classes from "./textarea-item.module.scss";
import ItemWrapper from "../item-wrapper";

export default function TextAreaItem({
  title,
  value,
  onChange,
}: TextAreaItemProps) {
  return (
    <ItemWrapper title={title}>
      <Input.TextArea
        className={classes.TextArea}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </ItemWrapper>
  );
}
