import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Adnavbar.css";
import { FiHome, FiUser, FiLogOut } from "react-icons/fi";

const Adnavbar = ({ user }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEmployee, setisEmployee] = useState(false);
  
  useEffect(() => {
    if (user?.role == "Employee") {
      setisEmployee(true);
    }
  });

  useEffect(() => {
    if (user) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [user]);

  return (
    <nav className="hm-navbar">
      <div className="nav-logo">
        <h2 onClick={() => navigate("/adhome")}>
          <FiHome className="nav-icon" /> SHOPIQUE
        </h2>
      </div>

      <h2 className="admin-title" onClick={() => navigate("/adhome")}>
        Admin Panel
      </h2>

      {isLoggedIn ? (
        <button
          className="nav-btns"
          aria-label="Go to profile page"
          onClick={() => navigate("/adprof")}
        >
          <FiUser className="nav-icon" /> {user.username || user.fullName || "User"}
        </button>
      ) : (
        <button
          className="nav-btns"
          onClick={() => navigate("/login")}
          aria-label="Go to login page"
        >
          <FiLogOut className="nav-icon" /> Login
        </button>
      )}
    </nav>
  );
};

export default Adnavbar;
