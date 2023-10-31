import { OutputImagesProps } from "./model";
import classes from "./output-images.module.scss";
import ImageButton from "../image-button/image-button";

export default function OutputImages({ images }: OutputImagesProps) {
  return (
    <div
      className={`${classes.Container} ${
        images.length <= 1 ? classes.OneImage : ""
      }`}
    >
      {images.map((image, index) => (
        <ImageButton key={index} src={image} />
      ))}
    </div>
  );
}
