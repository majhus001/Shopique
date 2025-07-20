import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import API_BASE_URL  from "../api";
import { FiChevronLeft } from "react-icons/fi";
import "./Login.css";
import handleGoogleLogin from "../utils/GoogleLogin/GoogleLogin";
import { useDispatch } from "react-redux";
import { setUserData } from "../Redux/slices/userSlice";
import { GoogleLogin } from "@react-oauth/google";
import EmailFunction from "../utils/EmailFunction";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [step, setStep] = useState("login");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/login/`,
        formData,
        { withCredentials: true }
      );
      if (response.data.success) {
        setMessage("Login successful! Redirecting...");
        const data = response.data.user;
        dispatch(
          setUserData({
            _id: data._id,
            username: data.username,
            email: data.email,
            image: data.image,
            pincode: data.pincode,
          })
        );
        setTimeout(() => {
          navigate("/home");
        }, 1500);
      } else {
        setMessage(response.data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    await handleGoogleLogin({
      credentialResponse,
      setMessage,
      setIsLoading,
      dispatch,
      setUserData,
      navigate,
    });
  };

  const handleGoogleLoginFailure = () => {
    setMessage("Google login failed. Please try again.");
  };

  const handleForgetPwd = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await EmailFunction({
        path: "forget-pwd",
        email: formData.email,
      });
      if (response.data.type === 200) {
        setMessage(response.data.message);
        setStep("otp");
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "An error occurred. Try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("Verifying OTP...");
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/auth/send-otp/verify-otp/${otp}?email=${formData.email}`
      );
      if (res.data.success) {
        setMessage(res.data.message);
        setStep("resetpwd");
      } else {
        setMessage(res.data.message);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Error verifying OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage("Passwords don't match");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/send-otp/reset-password`, {
        email: formData.email,
        newPassword: formData.newPassword
      });
      
      if (response.data.success) {
        setMessage("Password reset successfully. You can now login with your new password.");
        setStep("login");
        setFormData({...formData, password: "", newPassword: "", confirmPassword: ""});
        setOtp("");
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Error resetting password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ecom-login-container">
      <div className="ecom-login-glass-card">
        {(step === "forgetpwd" || step === "otp" || step === "resetpwd") && (
          <div className="forgetpwd-back-btn" onClick={() => {
            setMessage("")
            setStep("login")}}>
            <FiChevronLeft size={20} />
            <span>back</span>
          </div>
        )}
        <div className="ecom-login-brand">
          <h1 className="ecom-login-logo">
            SHOP<span>IQUE</span>
          </h1>
          <p className="ecom-signup-tagline">
            {step === "login" 
              ? "Login to Your Account" 
              : step === "forgetpwd" 
                ? "Reset Your Password" 
                : step === "otp" 
                  ? "Verify Your Email" 
                  : "Set New Password"}
          </p>
        </div>

        {message && (
          <div
            className={`ecom-message ${
              message.includes("success") || message.toLowerCase().includes("reset")
                ? "ecom-message-success"
                : "ecom-message-error"
            }`}
          >
            {message}
          </div>
        )}

        {step === "login" ? (
          <div>
            <form onSubmit={handleSubmit} className="ecom-login-form">
              <div className="ecom-form-group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="ecom-form-input"
                  placeholder=" "
                />
                <label className="ecom-form-label">Email</label>
                <span className="ecom-input-border"></span>
              </div>

              <div className="ecom-form-group">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="ecom-form-input"
                  placeholder=" "
                />
                <label className="ecom-form-label">Password</label>
                <span className="ecom-input-border"></span>
              </div>

              <button
                type="submit"
                className={`ecom-login-button ${
                  isHovered ? "ecom-button-hover" : ""
                }`}
                disabled={isLoading}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {isLoading ? (
                  <div className="ecom-loading-circle"></div>
                ) : (
                  "SIGN IN"
                )}
              </button>
            </form>

            <div className="ecom-login-divider">
              <span className="ecom-divider-line"></span>
              <span className="ecom-divider-text">OR</span>
              <span className="ecom-divider-line"></span>
            </div>

            <div
              className="ecom-google-login"
              style={{ transform: "scale(1.2)", transformOrigin: "top" }}
            >
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginFailure}
                shape="pill"
                type="standard"
                size="large"
                text="signin_with"
                width="310"
                height="100"
              />
            </div>

            <div className="ecom-login-footer">
              <p
                onClick={() => {
                  setMessage("")
                  setStep("forgetpwd")}}
                className="ecom-footer-link"
              >
                Forgot Password?
              </p>
              <p className="ecom-footer-text">
                New to SHOPIQUE?{" "}
                <Link to="/auth/signup" className="ecom-footer-link">
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        ) : step === "forgetpwd" ? (
          <form onSubmit={handleForgetPwd} className="ecom-login-form">
            <div className="ecom-form-group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="ecom-form-input"
                placeholder=" "
              />
              <label className="ecom-form-label">Email</label>
              <span className="ecom-input-border"></span>
            </div>

            <button
              type="submit"
              className={`ecom-login-button ${
                isHovered ? "ecom-button-hover" : ""
              }`}
              disabled={isLoading}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {isLoading ? (
                <div className="ecom-loading-circle"></div>
              ) : (
                "GET OTP"
              )}
            </button>
          </form>
        ) : step === "otp" ? (
          <form onSubmit={handleVerifyOtp} className="ecom-login-form">
            <div className="ecom-form-group">
              <input
                type="text"
                name="otp"
                value={otp}
                onChange={handleOtpChange}
                required
                className="ecom-form-input"
                placeholder=" "
                maxLength="6"
              />
              <label className="ecom-form-label">Enter 6-digit OTP</label>
              <span className="ecom-input-border"></span>
            </div>

            <button
              type="submit"
              className={`ecom-login-button ${
                isHovered ? "ecom-button-hover" : ""
              }`}
              disabled={isLoading}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {isLoading ? (
                <div className="ecom-loading-circle"></div>
              ) : (
                "VERIFY OTP"
              )}
            </button>
          </form>
        ) : step === "resetpwd" ? (
          <form onSubmit={handleResetPassword} className="ecom-login-form">
            <div className="ecom-form-group">
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                className="ecom-form-input"
                placeholder=" "
              />
              <label className="ecom-form-label">New Password</label>
              <span className="ecom-input-border"></span>
            </div>

            <div className="ecom-form-group">
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="ecom-form-input"
                placeholder=" "
              />
              <label className="ecom-form-label">Confirm Password</label>
              <span className="ecom-input-border"></span>
            </div>

            <button
              type="submit"
              className={`ecom-login-button ${
                isHovered ? "ecom-button-hover" : ""
              }`}
              disabled={isLoading}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {isLoading ? (
                <div className="ecom-loading-circle"></div>
              ) : (
                "RESET PASSWORD"
              )}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
};

export default Login;