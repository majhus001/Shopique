import axios from "axios";
import API_BASE_URL from "../api";
import { logoutUser } from "../Redux/slices/userSlice";

const handleLogout = async (dispatch) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/logout`,
      {},
      { withCredentials: true }
    );

    if (response.data.success) {
      dispatch(logoutUser());
      localStorage.removeItem("shopiqueUser"); 
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.error("Logout error:", err);
    return false;
  }
};

export default handleLogout;
