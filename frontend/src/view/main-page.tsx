import { Tabs } from "antd";

import Txt2img from "./txt2img/txt2img";
import Img2img from "./img2img/img2img";
import classes from "./main-page.module.scss";

function MainPage() {
  return (
    <div className={classes.Container}>
      <span className={classes.Title}>Stable Diffusion Playground</span>

      <Tabs
        className={classes.Tabs}
        items={[
          { key: "txt2img", label: "txt2img", children: <Txt2img /> },
          { key: "img2img", label: "img2img", children: <Img2img /> },
        ]}
      />
    </div>
  );
}

export default MainPage;
