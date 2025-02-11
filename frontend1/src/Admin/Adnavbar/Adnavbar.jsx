import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Adnavbar.css"; // Assuming you have a separate CSS for this navbar

const Adnavbar = ({ userId, user }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    
    if (userId) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [userId]);


  return (
    <nav className="hm-navbar">
      <div className="nav-logo">
        <h2 onClick={() => navigate("/home")}>SHOPIQUE</h2>
      </div>

      <h2 onClick={() => navigate("/home")}>Admin Panel</h2>

      {isLoggedIn ? (
        <button
          className="nav-btns"
          aria-label="Go to profile page"
        >
          {user.username}
        </button>
      ) : (
        <button
          className="nav-btns"
          onClick={() => navigate("/login", { state: { userId } })}
          aria-label="Go to profile page"
        >
          Login
        </button>
      )}
    </nav>
  );
};

export default Adnavbar;
