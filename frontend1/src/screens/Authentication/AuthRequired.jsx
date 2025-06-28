import React from "react";
import { useNavigate } from "react-router-dom";
import { FiLogIn, FiAlertCircle } from "react-icons/fi";
import { motion } from "framer-motion";
import "./AuthRequired.css";

const AuthRequired = ({ message = "Please login to view this content" }) => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(`/${path}`, { state: { from: window.location.pathname } });
  };

  return (
    <motion.div
      className="auth-required"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="auth-card">
        <FiAlertCircle className="auth-icon" />
        <h2>Sign In Required</h2>
        <p>{message}</p>
        <button
          className="auth-button"
          onClick={() => handleNavigation("login")}
        >
          <FiLogIn className="btn-icon" />
          Sign In
        </button>
      </div>
    </motion.div>
  );
};

export default AuthRequired;