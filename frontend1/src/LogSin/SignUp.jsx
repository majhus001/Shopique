import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";
import API_BASE_URL from "../api";
import EmailFunction from "../utils/EmailFunction";
import { useDispatch } from "react-redux";
import { setUserData } from "../Redux/slices/userSlice";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import handleGoogleLogin from "../utils/GoogleLogin/GoogleLogin";

const SignUp = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    mobile: "",
    address: "",
    image: "",
  });

  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("signup");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("Checking email and sending OTP...");

    try {
      const echeckRes = await axios.get(
        `${API_BASE_URL}/api/auth/signup/check?email=${formData.email}`
      );

      if (!echeckRes.data.success) {
        setMessage(echeckRes.data.message);
        setTimeout(() => setMessage(""), 4000);
        setIsLoading(false);
        return;
      }

      if (!isValidEmail(formData.email)) {
        setMessage("Invalid email format");
      }

      const response = await EmailFunction({
        path: "signup",
        email: formData.email,
      });

      if (response.data.success) {
        setStep("otp");
        setMessage(response.data.message);
      } else {
        setMessage(response.data.message || "Failed to send OTP.");
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "An error occurred. Try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    setMessage("Verifying OTP...");
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/auth/send-otp/verify-otp/${otp}?email=${formData.email}`
      );
      if (res.data.success) {
        const signup = await axios.post(
          `${API_BASE_URL}/api/auth/signup/`,
          formData
        );
        if (signup.data.success) {
          setMessage("Account created successfully! Redirecting...");
          await axios.post(`${API_BASE_URL}/api/user/reactivity/add`, {
            name: formData.username,
            activity: "has created an account",
          });
          
          setTimeout(() => navigate("/auth/login"), 1500);
        }
      }
    } catch {
      console.log("error on verifying otp");
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

  return (
    <div className="ecom-signup-container">
      <div className="ecom-signup-glass-card">
        <div className="ecom-signup-brand">
          <h1 className="ecom-signup-logo">
            SHOPI<span>QUE</span>
          </h1>
          <p className="ecom-signup-tagline">
            {step === "signup" ? "Create Your Account" : "Verify Your Email"}
          </p>
        </div>

        {message && (
          <div
            className={`ecom-message ${
              message.includes("success")
                ? "ecom-message-success"
                : message.includes("OTP")
                ? "ecom-message-info"
                : "ecom-message-error"
            }`}
          >
            {message}
          </div>
        )}

        {step === "signup" ? (
          <div>
            <form onSubmit={handleSignup} className="ecom-signup-form">
              <div className="ecom-form-group">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="ecom-form-input"
                  placeholder=" "
                />
                <label className="ecom-form-label">Username</label>
                <span className="ecom-input-border"></span>
              </div>

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
                className={`ecom-signup-button ${
                  isHovered ? "ecom-button-hover" : ""
                }`}
                disabled={isLoading}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {isLoading ? (
                  <div className="ecom-loading-circle"></div>
                ) : (
                  "SEND OTP"
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
          </div>
        ) : (
          <div className="ecom-otp-verification">
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
              onClick={handleVerifyOtp}
              className={`ecom-signup-button ${
                isHovered ? "ecom-button-hover" : ""
              }`}
              disabled={isLoading}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {isLoading ? (
                <div className="ecom-loading-circle"></div>
              ) : (
                "VERIFY & CREATE ACCOUNT"
              )}
            </button>
          </div>
        )}

        <div className="ecom-signup-footer">
          <p className="ecom-footer-text">
            Already have an account?{" "}
            <Link to="/auth/login" className="ecom-footer-link">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
