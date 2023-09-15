import { LoadingOutlined } from "@ant-design/icons";

import { LoadingProps } from "./model";
import classes from "./loading.module.scss";

export default function Loading({
  current,
  denoising_steps,
  batch_size,
}: LoadingProps) {
  return (
    <div className={classes.Container}>
      <LoadingOutlined className={classes.LoadingIcon} />

      <span className={classes.LoadingText}>Loading...</span>

      <span>{`${current} / ${denoising_steps * batch_size}`}</span>

      {batch_size > 1 && (
        <span
          className={classes.StepCalculation}
        >{`(${denoising_steps}x${batch_size})`}</span>
      )}

      <span className={classes.StepsText}>steps</span>
    </div>
  );
}
