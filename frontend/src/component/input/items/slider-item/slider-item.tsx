import { Input, Slider } from "antd";
import { useEffect, useState } from "react";

import type { SliderItemProps } from "./model";
import classes from "./slider-item.module.scss";
import ItemWrapper from "../item-wrapper";

const clamp = (
  target: number,
  min: number = Number.POSITIVE_INFINITY,
  max: number = Number.NEGATIVE_INFINITY
) => {
  if (target < min) return min;
  else if (target > max) return max;
  return target;
};

export default function SliderItem({
  title,
  value,
  onChange,
  min,
  max,
  step,
  isInteger,
}: SliderItemProps) {
  const [input, setInput] = useState<string>(value.toString());

  useEffect(() => {
    setInput(value.toString());
  }, [value]);

  const onSubmitOrBlur = () => {
    const number = Number(input);

    if (Number.isNaN(number)) {
      setInput(value.toString());

      return;
    }

    const newNumber = clamp(isInteger ? Math.floor(number) : number, min, max);

    setInput(newNumber.toString());
    onChange(newNumber);
  };

  return (
    <ItemWrapper title={title}>
      <div className={classes.ContentWrapper}>
        <Input
          allowClear={false}
          className={classes.Input}
          value={input}
          onBlur={onSubmitOrBlur}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSubmitOrBlur();
            }
          }}
        />

        <Slider
          className={classes.Slider}
          max={max}
          min={min}
          step={step}
          value={value}
          onChange={onChange}
        />
      </div>
    </ItemWrapper>
  );
}
