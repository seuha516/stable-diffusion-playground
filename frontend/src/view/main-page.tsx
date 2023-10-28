import { Button, Tabs } from "antd";
import axios from "axios";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";

import { Context, initialInput, initialOutput } from "./const";
import InputWrapper from "./input-wrapper/input-wrapper";
import classes from "./main-page.module.scss";
import { InputType, Mode, OutputType } from "./model";
import OutputWrapper from "./output-wrapper/output-wrapper";

const SERVER_URL = process.env.REACT_APP_SERVER_URL ?? "https://localhost:5000";
const socket = io(SERVER_URL);

function MainPage() {
  const [mode, setMode] = useState<Mode>("txt2img");
  const [input, setInput] = useState<InputType>(initialInput);
  const [output, setOutput] = useState<OutputType>(initialOutput);

  useEffect(() => {
    socket.on("message", (message: any) => {
      console.log(message);
    });
    socket.on("intermediate_data", (data: any) => {
      console.log(data);
      setOutput({
        images: data.images,
        similarImages: [],
        process: data.process,
      });
    });
    socket.on("final_data", (data: any) => {
      console.log(data);
      setOutput({
        images: data.images,
        similarImages: [],
        process: null,
      });
    });
  }, []);

  // reset input and output when mode is changed
  useEffect(() => {
    setInput(initialInput);
    setOutput(initialOutput);
  }, [mode]);

  const generate = async () => {
    const jsonData =
      mode === "txt2img"
        ? { ...input, image: undefined, prompt_strength: undefined }
        : { ...input, image: undefined };

    if (input.image) {
      const formData = new FormData();
      formData.append("image", input.image);

      const { data: imageName } = await axios.post(
        `${SERVER_URL}/image`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      jsonData.image = imageName;
    }

    window.scrollTo(0, 0);
    setOutput({ ...initialOutput, process: 0 });

    socket.emit("request", { type: "prediction", body: jsonData });
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
        onChange={(newMode) => {
          if (output.process !== null) return;
          setMode(newMode as Mode);
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
