import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Sidebar.css";
import API_BASE_URL from "../../api";

const Sidebar = ({ user }) => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(user);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const fetchUpdatedUser = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/auth/fetch/${user._id}`
        );
        if (response.data.success) {
          setUserDetails(response.data.data); 
        }
      } catch (error) {
        console.log("Error fetching updated user:", error);
      }
    };

    fetchUpdatedUser();
  }, [user._id]); // Added user._id as dependency

  const toggleSidebar = () => {
    setIsActive(!isActive);
  };

  const handleNavigation = (path) => {
    navigate(path, { state: { user: userDetails } });
    setIsActive(false); // Close sidebar after navigation
  };

  return (
    <>
      <button className="usprof-sidebar-toggle" onClick={toggleSidebar}>
        <i className="fas fa-bars"></i>
      </button>

      <div className={`usprof-sidebar ${isActive ? "active" : ""}`}>
        <div className="usprof-user-card">
          <img 
            src={userDetails.image} 
            alt="profile" 
            className="usprof-user-img" 
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = "default-profile-image.png";
            }}
          />
          <h4 className="usprof-username">{userDetails.username}</h4>
        </div>

        <nav className="usprof-nav-menu">
          <button 
            className="usprof-nav-btn" 
            onClick={() => handleNavigation("/profilepage")}
          >
            <i className="usprof-icon fas fa-user"></i>
            <span>Profile</span>
          </button>
          <button 
            className="usprof-nav-btn" 
            onClick={() => handleNavigation("/wishlist")}
          >
            <i className="usprof-icon fas fa-heart"></i>
            <span>Wishlist</span>
          </button>
          <button 
            className="usprof-nav-btn" 
            onClick={() => handleNavigation("/myorders")}
          >
            <i className="usprof-icon fas fa-box"></i>
            <span>My Orders</span>
          </button>
          <button 
            className="usprof-nav-btn" 
            onClick={() => handleNavigation("/settings")}
          >
            <i className="usprof-icon fas fa-cog"></i>
            <span>Settings</span>
          </button>
          <button 
            className="usprof-nav-btn" 
            onClick={() => handleNavigation("/home")}
          >
            <i className="usprof-icon fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;