import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";
import API_BASE_URL from "../api";
import AuthButton from "./AuthButton";
import { FaUser, FaLock, FaEnvelope, FaShoppingBag, FaGoogle, FaFacebookF, FaTwitter } from "react-icons/fa";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    mobile: "",
    address: "",
    image: "",
  });

  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [step, setStep] = useState("signup");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle OTP input change
  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  // Handle signup request
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

      // Send OTP to the user's email
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/send-verify-otp/`,
        { email: formData.email }
      );

      if (response.data.success) {
        setGeneratedOtp(String(response.data.code));
        setStep("otp");
        setMessage("OTP sent successfully! Enter OTP to verify.");
      } else {
        setMessage(response.data.message || "Failed to send OTP.");
        setTimeout(() => setMessage(""), 4000);
      }
    } catch (error) {
      console.error("Signup Error:", error);
      setMessage(
        error.response?.data?.message || "An error occurred. Try again."
      );
      setTimeout(() => setMessage(""), 4000);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async () => {
    setIsLoading(true);
    setMessage("Verifying OTP...");

    console.log("Generated OTP:", generatedOtp);
    console.log("User Entered OTP:", otp);

    if (otp.trim() === String(generatedOtp).trim()) {
      try {
        // Complete signup after OTP verification
        await axios.post(`${API_BASE_URL}/api/auth/signup/`, formData);
        setMessage("Signup successful! Redirecting to login...");
        const recentActivity = await axios.post(`${API_BASE_URL}/api/user/reactivity/add`,
           {name: formData.username, activity: " has created his account"});
        setTimeout(() => navigate("/login"), 2000);
      } catch (error) {
        console.error("Signup Error:", error);
        setMessage(
          error.response?.data?.message || "Failed to complete signup. Try again."
        );
      }
    } else {
      setMessage("Invalid OTP. Please enter the correct OTP.");
    }

    setIsLoading(false);
  };

  return (
    <div className="outer">
      <div className="su-container">
        <div className="brand-logo">
          <FaShoppingBag />
        </div>
        <h2>{step === "signup" ? "Create Account" : "Verify OTP"}</h2>

        {step === "signup" && (
          <form onSubmit={handleSignup} className="form">
            <div className="lg-input-group">
              <label className="label">Username</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="Enter your username"
                />
                <FaUser className="input-icon" />
              </div>
            </div>

            <div className="lg-input-group">
              <label className="label">Email</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="Enter your email"
                />
                <FaEnvelope className="input-icon" />
              </div>
            </div>

            <div className="lg-input-group">
              <label className="label">Password</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="Create a password"
                />
                <FaLock className="input-icon" />
              </div>
            </div>

            <AuthButton
              type="submit"
              disabled={isLoading}
              isLoading={isLoading}
              loadingText="Sending OTP..."
            >
              Continue
            </AuthButton>
          </form>
        )}

        {step === "otp" && (
          <div className="otp-container">
            <p className="otp-info">
              We've sent a verification code to <strong>{formData.email}</strong>
            </p>

            <div className="lg-input-group">
              <label className="label">Enter OTP</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  name="otp"
                  value={otp}
                  onChange={handleOtpChange}
                  required
                  className="input otp-input"
                  placeholder="Enter verification code"
                />
              </div>
            </div>

            <AuthButton
              onClick={handleVerifyOtp}
              disabled={isLoading}
              isLoading={isLoading}
              loadingText="Verifying..."
            >
              Verify & Create Account
            </AuthButton>

            <p className="resend-otp">
              Didn't receive the code? <a href="#" onClick={(e) => { e.preventDefault(); handleSignup(e); }}>Resend OTP</a>
            </p>
          </div>
        )}

        {message && <p className={`message ${message.includes("successful") ? "success" : message.includes("OTP sent") ? "success" : "error"}`}>{message}</p>}

        <div className="divider">
          <div className="divider-line"></div>
          <div className="divider-text">or sign up with</div>
          <div className="divider-line"></div>
        </div>

        <div className="social-login">
          <button className="social-btn google">
            <FaGoogle />
          </button>
          <button className="social-btn facebook">
            <FaFacebookF />
          </button>
          <button className="social-btn twitter">
            <FaTwitter />
          </button>
        </div>

        <p className="login-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
