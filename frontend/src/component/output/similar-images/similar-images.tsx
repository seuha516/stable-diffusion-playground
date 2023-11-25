import { SimilarImagesProps } from "./model";
import classes from "./similar-images.module.scss";
import ImageButton from "../image-button/image-button";

export default function SimilarImages({ text, images }: SimilarImagesProps) {
  return (
    <div className={classes.Container}>
      <span className={classes.Title}>{text}</span>

      <div className={classes.ImageWrapper}>
        {images.map((image, index) => (
          <ImageButton key={index} size="small" src={image} />
        ))}
        {images.length === 0 && <span>(No images)</span>}
      </div>
    </div>
  );
}
