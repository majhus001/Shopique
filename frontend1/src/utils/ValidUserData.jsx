import axios from "axios";
import API_BASE_URL from "../api";

import { setUserData } from "../Redux/slices/userSlice";

const ValidUserData = async (dispatch) => {
  try {
    console.log("Checking user validity...");
    const response = await axios.get(
      `${API_BASE_URL}/api/auth/checkvaliduser`,
      {
        withCredentials: true,
      }
    );

    if (response.status == 401) {
        console.log("ggg")
      throw new Error("No valid user found");
    }
    
    const userId = response.data.user.userId;
    const userRes = await axios.get(
      `${API_BASE_URL}/api/auth/fetch/${userId}`,
      {
        withCredentials: true,
      }
    );

    if (!userRes.data.data) {
      throw new Error("User data not found");
    }

    const data = userRes.data.data;

    dispatch(
      setUserData({
        _id: data._id,
        username: data.username,
        email: data.email,
        image: data.image,
        pincode: data.pincode,
      })
    );

    console.log(userRes.data.data);
    return userRes.data.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

export default ValidUserData;
