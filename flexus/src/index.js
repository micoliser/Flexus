import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import "./styles/home.css";
import "./styles/products.css";
import "./styles/contact.css";
import App from "./components/App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
