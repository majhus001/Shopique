import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import API_BASE_URL from "../api";
import "./Login.css";
import AuthButton from "./AuthButton";
import { FaUser, FaLock, FaShoppingBag, FaGoogle, FaFacebookF, FaTwitter } from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log(formData)
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/login/`,
        formData,
        { withCredentials: true }
      );
      if (response.data.success) {
        const user = response.data.user;

        setMessage("Login successful!");
        setTimeout(() => {
          if (response.data.role === "Admin") {
            navigate("/adhome", { state: { user } });
          } else {
            navigate("/home", { state: { user } });
          }
        }, 1000);
      } else {
        setMessage(response.data.message || "Login failed. Try again.");
        setTimeout(() => {
          setMessage("");
        }, 3000);
      }
    } catch (error) {
      console.error("Error logging in:", error);
      if (error.response && error.response.data) {
        setMessage(
          error.response.data.message || "An error occurred. Please try again."
        );
      } else {
        setMessage("Network error. Please try again.");
      }
      setTimeout(() => {
        setMessage("");
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ad-outer">
      <div className="ad-lg-container">
        <div className="ad-brand-logo">
          <FaShoppingBag />
        </div>
        <h2>Welcome Back</h2>

        <form onSubmit={handleSubmit} className="ad-form">
          <div className="ad-input-group">
            <label className="ad-label">Email</label>
            <div className="ad-input-wrapper">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="ad-input"
                placeholder="Enter your email"
              />
              <FaUser className="ad-input-icon" />
            </div>
          </div>

          <div className="ad-input-group">
            <label className="ad-label">Password</label>
            <div className="ad-input-wrapper">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="ad-input"
                placeholder="Enter your password"
              />
              <FaLock className="ad-input-icon" />
            </div>
          </div>

          <div className="ad-forgot-password">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <AuthButton
            type="submit"
            disabled={isLoading}
            isLoading={isLoading}
            loadingText="Logging in..."
          >
            Login
          </AuthButton>
        </form>

        {message && <p className={`ad-message ${message.includes("successful") ? "ad-success" : "ad-error"}`}>{message}</p>}

        <div className="ad-divider">
          <div className="ad-divider-line"></div>
          <div className="ad-divider-text">or login with</div>
          <div className="ad-divider-line"></div>
        </div>

        <div className="ad-social-login">
          <button className="ad-social-btn ad-google">
            <FaGoogle />
          </button>
          <button className="ad-social-btn ad-facebook">
            <FaFacebookF />
          </button>
          <button className="ad-social-btn ad-twitter">
            <FaTwitter />
          </button>
        </div>

        <p className="ad-login-link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
