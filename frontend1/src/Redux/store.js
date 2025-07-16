import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import axios from "axios";
import API_BASE_URL from "../api";

// ✅ Load user data from localStorage
const loadFromLocalStorage = async () => {
  try {
    const storedUser = localStorage.getItem("shopiqueUser");
    if (!storedUser) return undefined;

    const userObj = JSON.parse(storedUser);

    const res = await axios.post(
      `${API_BASE_URL}/api/auth/login/check/${userObj._id}`
    );
    if (res.data.success === false) {
      localStorage.removeItem("shopiqueUser");
      return undefined;
    }

    return { user: userObj };
  } catch (e) {
    console.error("Could not load from localStorage:", e);
    return undefined;
  }
};

// ✅ Save user data to localStorage
const saveToLocalStorage = (state) => {
  try {
    const userState = state.user;
    localStorage.setItem("shopiqueUser", JSON.stringify(userState));
  } catch (e) {
    console.error("Could not save to localStorage", e);
  }
};

// ✅ Async store setup
export const setupStore = async () => {
  const preloadedState = await loadFromLocalStorage();

  const store = configureStore({
    reducer: {
      user: userReducer,
    },
    preloadedState,
  });

  store.subscribe(() => {
    saveToLocalStorage(store.getState());
  });

  return store;
};
