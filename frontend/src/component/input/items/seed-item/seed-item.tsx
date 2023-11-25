import { Input } from "antd";
import { useContext, useEffect, useState } from "react";

import type { SeedItemProps } from "./model";
import ItemWrapper from "../item-wrapper";
import { Context } from "../../../../view/const";

export default function SeedItem({ title, value, onChange }: SeedItemProps) {
  const { output } = useContext(Context);
  const disabled = output.process !== null && !output.isStopped;

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
        disabled={disabled}
      />
    </ItemWrapper>
  );
}
