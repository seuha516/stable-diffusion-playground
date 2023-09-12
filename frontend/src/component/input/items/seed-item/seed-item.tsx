import { Input } from "antd";
import { useEffect, useState } from "react";

import type { SeedItemProps } from "./model";
import ItemWrapper from "../item-wrapper";

export default function SeedItem({ title, value, onChange }: SeedItemProps) {
  const [input, setInput] = useState<string>((value ?? "").toString());

  useEffect(() => {
    if ((input === "" ? undefined : Number(input)) !== value) {
      setInput((value ?? "").toString());
    }
  }, [value]);

  return (
    <ItemWrapper title={title}>
      <Input
        value={input}
        onChange={(e) => {
          const newInput = e.target.value.replaceAll(/\D/g, "");

          setInput(newInput);
          onChange(newInput === "" ? undefined : Number(newInput));
        }}
      />
    </ItemWrapper>
  );
}
