import { Button, Tabs } from "antd";
import { useEffect, useState } from "react";

import { Context, initialInput, initialOutput } from "./const";
import InputWrapper from "./input-wrapper/input-wrapper";
import classes from "./main-page.module.scss";
import { InputType, Mode, OutputType } from "./model";
import OutputWrapper from "./output-wrapper/output-wrapper";

import test1 from "../test-image/test1.png";
import test2 from "../test-image/test2.png";
import test3 from "../test-image/test3.png";
import test4 from "../test-image/test4.png";
import test5 from "../test-image/test5.png";

function MainPage() {
  const [mode, setMode] = useState<Mode>("txt2img");
  const [input, setInput] = useState<InputType>(initialInput);
  const [output, setOutput] = useState<OutputType>(initialOutput);

  // reset input and output when mode is changed
  useEffect(() => {
    setInput(initialInput);
    setOutput(initialOutput);
  }, [mode]);

  const generate = () => {
    const requestBody =
      mode === "txt2img"
        ? input
        : { ...input, image: undefined, strength: undefined };

    // TODO: send request to backend
    console.log(requestBody);

    window.scrollTo(0, 0);
    setOutput({ ...initialOutput, process: 0 });

    // FIXME: replace this after backend is ready
    setTimeout(() => {
      setOutput({ images: [test1, test1], similarImages: null, process: 100 });
      setTimeout(() => {
        setOutput({
          images: [test2, test1, test1],
          similarImages: null,
          process: 200,
        });
        setTimeout(() => {
          setOutput({
            images: [test3, test2, test3],
            similarImages: null,
            process: 300,
          });
          setTimeout(() => {
            setOutput({
              images: [test3, test3, test3],
              similarImages: null,
              process: 400,
            });
            setTimeout(() => {
              setOutput({
                images: [test3, test3, test3],
                similarImages: [test4, test5, test4, test5],
                process: null,
              });
            }, 1000);
          }, 1000);
        }, 1000);
      }, 1000);
    }, 1000);
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
