import axios from "axios";
import API_BASE_URL from "../api";

const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      if (response.data.success) {
        return true;
      }
    } catch (err) {
      console.error("Logout error:", err);
      return false;
    }
  };

  export default handleLogout;