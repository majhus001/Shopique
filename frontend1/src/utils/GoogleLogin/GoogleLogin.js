import axios from "axios";
import { jwtDecode } from "jwt-decode";
import API_BASE_URL from "../../api";

const handleGoogleLogin = async ({
  credentialResponse,
  setMessage,
  setIsLoading,
  dispatch,
  setUserData,
  navigate,
}) => {
  setIsLoading(true);
  try {
    const decoded = jwtDecode(credentialResponse.credential);

    const response = await axios.post(
      `${API_BASE_URL}/api/auth/google-login/`,
      { token: credentialResponse.credential },
      { withCredentials: true }
    );

    if (response.data.success) {
      setMessage("Google login successful! Redirecting...");
      const data = response.data.user;

      dispatch(
        setUserData({
          _id: data._id,
          username: data.username,
          email: data.email,
          image: data.image,
          pincode: data.pincode || "",
        })
      );

      setTimeout(() => {
        navigate("/home");
      }, 1500);
    } else {
      setMessage(response.data.message || "Google login failed. Please try again.");
    }
  } catch (error) {
    setMessage(
      error.response?.data?.message || "An error occurred during Google login."
    );
  } finally {
    setIsLoading(false);
  }
};

export default handleGoogleLogin;
