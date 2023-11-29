import { useContext } from "react";
import classes from "./image-button.module.scss";
import { ImageButtonProps } from "./model";
import { Context } from "../../../view/const";
import { Tooltip } from "antd";

export default function ImageButton({
  src,
  prompt,
  size = "default",
}: ImageButtonProps) {
  const { output } = useContext(Context);
  const clickable = output.process === null;

  const onClick = () => {
    if (clickable) window.open(src);
  };

  const imageButtonComponent =
    size === "default" ? (
      <img
        className={`${classes.Image} ${clickable ? classes.Clickable : ""}`}
        src={src}
        onClick={onClick}
      />
    ) : (
      <div className={classes.ImageWrapper}>
        <img
          className={`${classes.Image} ${clickable ? classes.Clickable : ""}`}
          src={src}
          onClick={onClick}
        />
      </div>
    );

  return prompt ? (
    <Tooltip title={`prompt: "${prompt}"`}>{imageButtonComponent}</Tooltip>
  ) : (
    imageButtonComponent
  );
}
