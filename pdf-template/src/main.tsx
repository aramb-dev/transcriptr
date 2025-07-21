import "./globals.css";
import React from "react";
import ReactDOM from "react-dom/client";
import TranscriptionApp from "./App.tsx";
import { setup } from "@printerz-app/template-sdk";

setup();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TranscriptionApp />
  </React.StrictMode>,
);
