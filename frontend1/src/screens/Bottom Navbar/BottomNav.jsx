import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaListAlt, FaUser, FaShoppingCart } from "react-icons/fa";
import { motion } from "framer-motion";
import "./Bottomnav.css";
import { useEffect, useState } from "react";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("home");

  const handleNavigation = (path) => {
    navigate(`/${path}`);
    setActiveTab(path);
  };

  useEffect(() => {
    // Extract the current path from location
    const path = location.pathname.substring(1); // remove the leading '/'
    
    // Set active tab based on current path
    if (path === "home" || path === "") {
      setActiveTab("home");
    } else if (path === "myorders") {
      setActiveTab("myorders");
    } else if (path === "profilepage") {
      setActiveTab("profilepage");
    } else if (path === "cart") {
      setActiveTab("cart");
    }
  }, [location.pathname]);

  return (
    <div className="bottom-nav">
      <motion.button
        whileTap={{ scale: 0.9 }}
        className={`bot-nav-btn ${activeTab === "home" ? "bot-active" : ""}`}
        onClick={() => handleNavigation("home")}
      >
        <div className="icon-wrapper">
          <FaHome className="nav-icon" />
          {activeTab === "home" && <motion.span layoutId="indicator" className="active-indicator" />}
        </div>
        <span className="nav-label">Home</span>
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.9 }}
        className={`bot-nav-btn ${activeTab === "myorders" ? "bot-active" : ""}`}
        onClick={() => handleNavigation("myorders")}
      >
        <div className="icon-wrapper">
          <FaListAlt className="nav-icon" />
          {activeTab === "myorders" && <motion.span layoutId="indicator" className="active-indicator" />}
        </div>
        <span className="nav-label">Orders</span>
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.9 }}
        className={`bot-nav-btn ${activeTab === "profilepage" ? "bot-active" : ""}`}
        onClick={() => handleNavigation("profilepage")}
      >
        <div className="icon-wrapper">
          <FaUser className="nav-icon" />
          {activeTab === "profilepage" && <motion.span layoutId="indicator" className="active-indicator" />}
        </div>
        <span className="nav-label">Account</span>
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.9 }}
        className={`bot-nav-btn ${activeTab === "cart" ? "bot-active" : ""}`}
        onClick={() => handleNavigation("cart")}
      >
        <div className="icon-wrapper">
          <FaShoppingCart className="nav-icon" />
          {activeTab === "cart" && <motion.span layoutId="indicator" className="active-indicator" />}
        </div>
        <span className="nav-label">Cart</span>
      </motion.button>
    </div>
  );
}