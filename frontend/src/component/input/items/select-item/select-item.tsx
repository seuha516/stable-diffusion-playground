import { Select } from "antd";

import type { SelectItemProps } from "./model";
import ItemWrapper from "../item-wrapper";
import { useContext } from "react";
import { Context } from "../../../../view/const";

export default function SelectItem<T>({
  title,
  value,
  onChange,
  options,
}: SelectItemProps<T>) {
  const { output } = useContext(Context);
  const disabled = output.process !== null;

  return (
    <ItemWrapper title={title}>
      <Select
        value={value}
        onChange={onChange}
        options={options}
        disabled={disabled}
      />
    </ItemWrapper>
  );
}
