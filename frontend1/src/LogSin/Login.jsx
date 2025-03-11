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
            const adminData = user;
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
    <div className="outer">
      <div className="lg-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit} className="form">
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
            {isLoading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <span className="loading-text">Logging in...</span>
              </div>
            ) : (
              "Login"
            )}
          </button>
        </form>
        {message && <p className="message">{message}</p>}
        <p className="login-link">
          Don't have an account? <Link to="/signup">Signup here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
