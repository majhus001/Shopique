import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";
import API_BASE_URL from "../api";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    mobile: "",
    address: "",
    image: ""
  });

  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
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

      const response = await axios.post(
        `${API_BASE_URL}/api/auth/send-verify-otp/`,
        { email: formData.email }
      );

      if (response.data.success) {
        setGeneratedOtp(String(response.data.code)); 
        setStep("otp");
        setMessage("OTP sent successfully! Check your email.");
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

    if (otp.trim() === String(generatedOtp).trim()) {
      try {
        await axios.post(`${API_BASE_URL}/api/auth/signup/`, formData);
        setMessage("Account created successfully! Redirecting...");
        await axios.post(`${API_BASE_URL}/api/user/reactivity/add`, {
          name: formData.username, 
          activity: "has created an account"
        });
        setTimeout(() => navigate("/login"), 1500);
      } catch (error) {
        setMessage(
          error.response?.data?.message || "Failed to complete signup."
        );
      }
    } else {
      setMessage("Invalid OTP. Please try again.");
    }
    setIsLoading(false);
  };

  return (
    <div className="ecom-signup-container">
      <div className="ecom-signup-glass-card">
        <div className="ecom-signup-brand">
          <h1 className="ecom-signup-logo">SHOP<span>LYST</span></h1>
          <p className="ecom-signup-tagline">
            {step === "signup" ? "Create Your Account" : "Verify Your Email"}
          </p>
        </div>

        {message && (
          <div className={`ecom-message ${
            message.includes("success") ? "ecom-message-success" : 
            message.includes("OTP") ? "ecom-message-info" : "ecom-message-error"
          }`}>
            {message}
          </div>
        )}

        {step === "signup" ? (
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
              className={`ecom-signup-button ${isHovered ? "ecom-button-hover" : ""}`}
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
              className={`ecom-signup-button ${isHovered ? "ecom-button-hover" : ""}`}
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
            <Link to="/login" className="ecom-footer-link">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;