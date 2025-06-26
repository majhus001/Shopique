import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Sidebar.css";
import API_BASE_URL from "../../api";

const Sidebar = ({ user }) => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoize the user object to prevent unnecessary effect triggers
  const memoizedUser = useMemo(() => user, [user?._id]);

  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      if (!memoizedUser?._id) {
        if (isMounted) {
          setIsLoading(false);
          setUserDetails(null);
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/auth/fetch/${memoizedUser._id}`,
          { withCredentials: true }
        );

        if (isMounted && response.data.success) {
          setUserDetails(response.data.data);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching user:", err);
          setError("Failed to load user data");
          // Fallback to the passed user prop if available
          setUserDetails(memoizedUser);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [memoizedUser]);

  const handleNavigation = (path) => {
    navigate(path, { state: { user: userDetails || user } });
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      if (response.data.success) {
        navigate("/home");
      }
    } catch (err) {
      console.error("Logout error:", err);
      setError("Logout failed. Please try again.");
    }
  };

  // Determine which user data to display
  const displayUser = userDetails || user;

  if (isLoading) {
    return (
      <div className="usprof-sidebar">
        <div className="usprof-loading">Loading user data...</div>
      </div>
    );
  }

  if (!displayUser) {
    return (
      <div className="usprof-sidebar">
        <div className="usprof-error">
          {error || "No user data available"}
          <button
            className="usprof-nav-btn"
            onClick={() => navigate("/login")}
          >
            <i className="usprof-icon fas fa-sign-in-alt"></i>
            <span>Login</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="usprof-sidebar">
      {error && (
        <div className="usprof-error-banner">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="usprof-user-card">
        <img
          src={displayUser.image || "default-profile-image.png"}
          alt="profile"
          className="usprof-user-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "default-profile-image.png";
          }}
        />
        <h4 className="usprof-username">
          {displayUser.username || "User"}
        </h4>
        <p className="usprof-user-email">{displayUser.email || ""}</p>
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
        <button className="usprof-nav-btn" onClick={handleLogout}>
          <i className="usprof-icon fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;