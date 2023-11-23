import { Button, Tabs } from "antd";
import axios from "axios";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";

import { Context, initialInput, initialOutput } from "./const";
import InputWrapper from "./input-wrapper/input-wrapper";
import classes from "./main-page.module.scss";
import { InputType, Mode, OutputType } from "./model";
import OutputWrapper from "./output-wrapper/output-wrapper";

const SERVER_URL = process.env.REACT_APP_SERVER_URL ?? "https://localhost";
const socket = io(SERVER_URL);

function MainPage() {
  const [mode, setMode] = useState<Mode>("txt2img");
  const [input, setInput] = useState<InputType>(initialInput);
  const [output, setOutput] = useState<OutputType>(initialOutput);

  const isReadyForGenerate = output.process === null || output.isStopped;

  useEffect(() => {
    socket.on("message", (message: any) => {
      console.log(message);
    });
    socket.on("intermediate_data", (data: any) => {
      console.log(data);
      setOutput({
        ...initialOutput,
        images: data.images,
        process: data.process,
      });
    });
    socket.on("final_data", (data: any) => {
      console.log(data);
      setOutput({
        ...initialOutput,
        images: data.images,
        process: null,
      });
      socket.emit("request", {
        type: "similar_by_prompt",
        body: { prompt: input.prompt },
      });
      socket.emit("request", {
        type: "similar_by_image",
        body: { image: data.images[0] },
      });
    });
    socket.on("similar_by_prompt", (data: any) => {
      console.log(data);
      setOutput((prev) => ({
        ...prev,
        similarImagesByPrompt: data.images,
      }));
    });
    socket.on("similar_by_image", (data: any) => {
      console.log(data);
      setOutput((prev) => ({
        ...prev,
        similarImagesByImage: data.images,
      }));
    });
    socket.on("stop", () => {
      console.log("stop");
      setOutput((prev) => ({
        ...prev,
        isStopped: true,
      }));
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
    setOutput({ ...initialOutput, process: 0, isStopped: false });

    socket.emit("request", { type: "prediction", body: jsonData });
  };

  const stop = () => {
    socket.emit("request", { type: "stop" });
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
          if (output.process !== null && !output.isStopped) return;
          setMode(newMode as Mode);
        }}
      />

      <Context.Provider value={{ mode, input, setInput, output, setOutput }}>
        <div className={classes.ContentWrapper}>
          <div className={classes.InputWrapper}>
            <InputWrapper />

            {isReadyForGenerate ? (
              <Button
                className={classes.InputButton}
                type="primary"
                onClick={generate}
              >
                Generate
              </Button>
            ) : (
              <Button className={classes.InputButton} onClick={stop}>
                Stop
              </Button>
            )}
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
