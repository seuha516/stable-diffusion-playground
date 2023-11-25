import { useEffect, useState, useRef, ChangeEvent, useContext } from "react";

import classes from "./image-item.module.scss";
import { ImageItemProps } from "./model";
import ItemWrapper from "../item-wrapper";
import { Context } from "../../../../view/const";

const getBase64 = (file?: File): Promise<string | null> =>
  new Promise((resolve, reject) => {
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.addEventListener("load", () => resolve(reader.result as string));
      reader.addEventListener("load", (error) => reject(error));
    } else {
      resolve(null);
    }
  });

export default function ImageItem({ title, value, onChange }: ImageItemProps) {
  const { output } = useContext(Context);
  const disabled = output.process !== null && !output.isStopped;

  const inputRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    const setSrc = async (file?: File) => {
      setImageSrc(await getBase64(file));
    };

    setSrc(value);
  }, [value]);

  const handleImage = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const file = e.target.files[0];
    if (!file) return;

    const src = await getBase64(file);

    onChange(file);
    setImageSrc(src);
  };

  return (
    <ItemWrapper title={title}>
      <div
        className={`${classes.UploadButton} ${
          disabled ? classes.Disabled : ""
        }`}
        onClick={() => {
          if (!disabled) inputRef.current?.click();
        }}
      >
        {imageSrc ? (
          <img className={classes.Image} src={imageSrc} />
        ) : (
          <span className={classes.UploadText}>Upload image</span>
        )}
      </div>

      <input
        ref={inputRef}
        className={classes.Input}
        accept="image/*"
        type="file"
        onChange={handleImage}
      />
    </ItemWrapper>
  );
}
