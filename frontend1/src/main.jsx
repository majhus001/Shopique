import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { setupStore } from "./Redux/store"; // ✅ correct relative path
import { Provider } from "react-redux";

(async () => {
  const store = await setupStore();

  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  );
})();
