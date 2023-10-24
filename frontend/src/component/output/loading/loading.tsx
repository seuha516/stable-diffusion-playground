import { LoadingOutlined } from "@ant-design/icons";

import { LoadingProps } from "./model";
import classes from "./loading.module.scss";

export default function Loading({
  current,
  num_inference_steps,
}: LoadingProps) {
  return (
    <div className={classes.Container}>
      <LoadingOutlined className={classes.LoadingIcon} />

      <span className={classes.LoadingText}>Loading...</span>

      <span>{`${current} / ${num_inference_steps}`}</span>

      <span className={classes.StepsText}>steps</span>
    </div>
  );
}
