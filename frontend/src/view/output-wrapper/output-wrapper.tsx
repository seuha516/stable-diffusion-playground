import classes from "./output-wrapper.module.scss";
import OutputImages from "../../component/output/output-images/output-images";
import Loading from "../../component/output/loading/loading";
import { useContext } from "react";
import { Context } from "../const";
import SimilarImages from "../../component/output/similar-images/similar-images";

export default function OutputWrapper() {
  const {
    input: { denoising_steps, batch_size },
    output: { images, similarImages, process },
  } = useContext(Context);

  const isReadyForGenerate =
    process === null && images === null && similarImages === null;

  return (
    <div className={classes.Container}>
      <span className={classes.Title}>Output</span>

      {isReadyForGenerate && (
        <div>
          <h3>How to run?</h3>
          <p>
            1. In the upper right corner of the screen, you can choose between
            'txt2img' and 'img2img'.
          </p>
          <p>
            2. Adjust inputs on the left, then click 'Generate' button below.
          </p>
        </div>
      )}

      {process !== null && (
        <Loading
          current={process}
          denoising_steps={denoising_steps}
          batch_size={batch_size}
        />
      )}

      {images !== null && <OutputImages images={images} />}

      {similarImages !== null && <SimilarImages images={similarImages} />}
    </div>
  );
}
