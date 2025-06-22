import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import API_BASE_URL from "../api";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
        setTimeout(() => {
          navigate(response.data.role === "Admin" ? "/adhome" : "/home", {
            state: { user: response.data.user },
          });
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

  return (
    <div className="ecom-login-container">
      <div className="ecom-login-glass-card">
        <div className="ecom-login-brand">
          <h1 className="ecom-login-logo">SHOP<span>IQUE</span></h1>
          <p className="ecom-login-tagline">Premium E-Commerce Experience</p>
        </div>

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
            className={`ecom-login-button ${isHovered ? "ecom-button-hover" : ""}`}
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

        {message && (
          <div className={`ecom-message ${message.includes("success") ? "ecom-message-success" : "ecom-message-error"}`}>
            {message}
          </div>
        )}

        <div className="ecom-login-footer">
          <Link to="/forgot-password" className="ecom-footer-link">
            Forgot Password?
          </Link>
          <p className="ecom-footer-text">
            New to SHOPIQUE? <Link to="/signup" className="ecom-footer-link">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;