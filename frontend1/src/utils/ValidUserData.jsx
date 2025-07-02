import axios from "axios";
import API_BASE_URL from "../api";

const ValidUserData = async () => {
  try {
    console.log("Checking user validity...");
    const response = await axios.get(
      `${API_BASE_URL}/api/auth/checkvaliduser`,
      {
        withCredentials: true,
      }
    );

    if (!response.data.user) {
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
    
    console.log(userRes.data.data);
    return userRes.data.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error; 
  } 
};

export default ValidUserData;