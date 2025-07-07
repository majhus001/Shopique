import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";

// Load user data from localStorage
const loadFromLocalStorage = () => {
  try {
    const storedUser = localStorage.getItem("userState");
    if (storedUser === null) return undefined;
    return { user: JSON.parse(storedUser) };
  } catch (e) {
    console.error("Could not load from localStorage", e);
    return undefined;
  }
};

// Save user data to localStorage
const saveToLocalStorage = (state) => {
  try {
    const userState = state.user;
    localStorage.setItem("userState", JSON.stringify(userState));
  } catch (e) {
    console.error("Could not save to localStorage", e);
  }
};

const store = configureStore({
  reducer: {
    user: userReducer,
  },
  preloadedState: loadFromLocalStorage(),
});

// Subscribe to store changes and persist to localStorage
store.subscribe(() => {
  saveToLocalStorage(store.getState());
});

export { store };
