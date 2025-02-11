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

    console.log("Generated OTP:", generatedOtp); // Debugging
    console.log("User Entered OTP:", otp); // Debugging

    if (otp.trim() === String(generatedOtp).trim()) {
      try {
        // Complete signup after OTP verification
        await axios.post(`${API_BASE_URL}/api/auth/signup/`, formData);
        setMessage("Signup successful! Redirecting to login...");
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
        <h2>Signup</h2>

        {step === "signup" && (
          <form onSubmit={handleSignup} className="form">
            <div className="lg-input-group">
              <label className="label">Username:</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="input"
              />
            </div>
            <div className="lg-input-group">
              <label className="label">Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input"
              />
            </div>
            <div className="lg-input-group">
              <label className="label">Password:</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="input"
              />
            </div>
            <button type="submit" className="sg-button" disabled={isLoading}>
              {isLoading ? <span className="loading-text">Sending OTP...</span> : "Signup"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <div className="lg-input-group">
            <label className="label">Enter OTP:</label>
            <input
              type="text"
              name="otp"
              value={otp}
              onChange={handleOtpChange}
              required
              className="input"
              style={{width: "350px", marginTop: "10px"}}
           
            />

            <button
              onClick={handleVerifyOtp}
              className="sg-button"
              disabled={isLoading}
              style={{width: "382px", marginTop: "10px"}}
            >
              {isLoading ? <span className="loading-text">Verifying...</span> : "Verify OTP"}
            </button>
          </div>
        )}

        {message && <p className="message">{message}</p>}

        <p className="login-link">
          Already registered? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
