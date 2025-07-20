import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { setupStore } from "./Redux/store"; // ✅ correct relative path
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";

(async () => {
  const store = await setupStore();

  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <Provider store={store}>
        <GoogleOAuthProvider clientId="585410625750-k6o8id6105lsf6seeubgtll52u2v0pbt.apps.googleusercontent.com">
          <App />
        </GoogleOAuthProvider>
      </Provider>
    </React.StrictMode>
  );
})();
