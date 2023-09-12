import React from "react";
import ReactDOM from "react-dom/client";

import "./index.scss";
import MainPage from "./view/main-page";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <MainPage />
  </React.StrictMode>
);
