import { PropsWithChildren } from "react";

import classes from "./item-wrapper.module.scss";

export default function ItemWrapper({
  title,
  children,
}: PropsWithChildren<{ title: string }>) {
  return (
    <div className={classes.Container}>
      <label className={classes.Label}>{title}</label>

      {children}
    </div>
  );
}
