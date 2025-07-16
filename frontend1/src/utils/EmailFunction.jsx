import axios from "axios";
import API_BASE_URL from "../api";

const EmailFunction = async ({ path, email, data = {}, orderId = null }) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/send-otp/${path}`,
      {
        email,
        data, 
        orderId
      }
    );
    return response;
  } catch (error) {
    console.error("❌ EmailFunction error:", error.message);
    return null;
  }
};

export default EmailFunction;
