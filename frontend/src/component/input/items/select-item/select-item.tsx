import { Select } from "antd";

import type { SelectItemProps } from "./model";
import ItemWrapper from "../item-wrapper";

export default function SelectItem<T>({
  title,
  value,
  onChange,
  options,
}: SelectItemProps<T>) {
  return (
    <ItemWrapper title={title}>
      <Select value={value} onChange={onChange} options={options} />
    </ItemWrapper>
  );
}
