import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import "./index.css";
// import App from "./App";
// import App2 from "./App2";
import App3 from "./App3";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ChakraProvider>
      {/* <App /> */}
      {/* <App2 /> */}
      <App3 />
    </ChakraProvider>
  </React.StrictMode>
);
