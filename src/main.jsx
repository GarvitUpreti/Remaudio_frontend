import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";   // ✅ import this
import "./index.css";
import App from "./App.jsx";
import { store } from "./store";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>   {/* ✅ Redux provider */}
    <StrictMode>
      <App />
    </StrictMode>
  </Provider>
);
