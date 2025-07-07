import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  _id: "",
  username: "",
  email: "",
  image: "",
  isLoggedIn: false,
  pincode: "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      const { _id, username, email, image, pincode } = action.payload;
      state._id = _id;
      state.username = username;
      state.email = email;
      state.image = image;
      state.pincode = pincode;
      state.isLoggedIn = true;
    },    
    logoutUser: (state) => {
      state._id = "";
      state.username = "";
      state.email = "";
      state.image = "";
      state.pincode = "";
      state.isLoggedIn = false;
    },
  },
});

export const { setUserData, logoutUser } = userSlice.actions;

export default userSlice.reducer;
