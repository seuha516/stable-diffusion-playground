import { Button, Tabs } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";

import { Context, initialInput, initialOutput } from "./const";
import InputWrapper from "./input-wrapper/input-wrapper";
import classes from "./main-page.module.scss";
import { InputType, Mode, OutputType } from "./model";
import OutputWrapper from "./output-wrapper/output-wrapper";

function MainPage() {
  const [mode, setMode] = useState<Mode>("txt2img");
  const [input, setInput] = useState<InputType>(initialInput);
  const [output, setOutput] = useState<OutputType>(initialOutput);

  // reset input and output when mode is changed
  useEffect(() => {
    setInput(initialInput);
    setOutput(initialOutput);
  }, [mode]);

  const generate = async () => {
    const formData = new FormData();
    const jsonData =
      mode === "txt2img"
        ? { ...input, image: undefined, prompt_strength: undefined }
        : { ...input, image: undefined };

    if (input.image) {
      formData.append("image", input.image);
    }

    formData.append("data", JSON.stringify(jsonData));

    window.scrollTo(0, 0);
    setOutput({ ...initialOutput, process: 0 });

    const response = await axios.post(
      "http://localhost:5000/v1/predictions",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    setOutput({
      images: response.data as string[],
      similarImages: [],
      process: null,
    });
  };

  return (
    <div className={classes.Container}>
      <span className={classes.Title}>Stable Diffusion Playground</span>

      <Tabs
        className={classes.Tabs}
        items={[
          { key: "txt2img", label: "txt2img" },
          { key: "img2img", label: "img2img" },
        ]}
        activeKey={mode}
        onChange={(x) => {
          if (output.process) return;
          setMode(x as Mode);
        }}
      />

      <Context.Provider value={{ mode, input, setInput, output, setOutput }}>
        <div className={classes.ContentWrapper}>
          <div className={classes.InputWrapper}>
            <InputWrapper />

            <Button
              className={classes.GenerateButton}
              type="primary"
              onClick={generate}
              disabled={output.process !== null}
            >
              Generate
            </Button>
          </div>

          <div className={classes.OutputWrapper}>
            <OutputWrapper />
          </div>
        </div>
      </Context.Provider>
    </div>
  );
}

export default MainPage;