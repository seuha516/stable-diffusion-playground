import { useEffect, useState, useRef, ChangeEvent } from "react";

import classes from "./image-item.module.scss";
import { ImageItemProps } from "./model";
import ItemWrapper from "../item-wrapper";

const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.addEventListener("load", () => resolve(reader.result as string));
    reader.addEventListener("load", (error) => reject(error));
  });

export default function ImageItem({ title, value, onChange }: ImageItemProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    const setSrc = async (file: File | null) => {
      const src = file ? await getBase64(file) : null;
      setImageSrc(src);
    };

    setSrc(value);
  }, [value]);

  const handleImage = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const file = e.target.files[0];
    const src = await getBase64(file);

    onChange(file);
    setImageSrc(src);
  };

  return (
    <ItemWrapper title={title}>
      <button
        className={classes.UploadButton}
        type="button"
        onClick={() => inputRef.current?.click()}
      >
        {imageSrc ? (
          <img alt="input-image" className={classes.Image} src={imageSrc} />
        ) : (
          <span>Upload image</span>
        )}
      </button>

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
