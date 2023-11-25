import { LoadingOutlined } from "@ant-design/icons";

import { LoadingProps } from "./model";
import classes from "./loading.module.scss";

export default function Loading({
  current,
  num_inference_steps,
  isStopped,
}: LoadingProps) {
  return (
    <div className={`${classes.Container} ${isStopped ? classes.Stopped : ""}`}>
      {!isStopped && <LoadingOutlined className={classes.LoadingIcon} />}

      <span className={classes.LoadingText}>
        {isStopped ? "Stopped" : "Loading..."}
      </span>

      <span
        className={classes.StepsNumber}
      >{`${current} / ${num_inference_steps}`}</span>

      <span className={classes.StepsText}>steps</span>
    </div>
  );
}
