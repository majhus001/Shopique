import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaListAlt, FaUser, FaShoppingCart } from "react-icons/fa";
import { motion } from "framer-motion";
import "./Bottomnav.css";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("home");
  const user = useSelector((state) => state.user);

  const handleNavigation = (path) => {
    setActiveTab(path);
    if (path === "profile") {
      navigate(`/user/${user?._id || "unauthorized"}/profile`);
    } else if (path === "cart") {
      navigate(`/user/${user?._id || "unauthorized"}/cart`);
    } else if (path === "myorders") {
      navigate(`/user/${user?._id || "unauthorized"}/myorders`);
    } else if (path === "home") {
      navigate(`/home`);
    } else {
      navigate(`${path}`);
    }
  };

  useEffect(() => {
    const path = location.pathname;

    if (path.includes("/profile")) {
      setActiveTab("profile");
    } else if (path.includes("/cart")) {
      setActiveTab("cart");
    } else if (path.includes("/myorders")) {
      setActiveTab("myorders");
    } else if (path === "/" || path.includes("/home")) {
      setActiveTab("home");
    } else {
      setActiveTab(""); // optional default
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
          {activeTab === "home" && (
            <motion.span layoutId="indicator" className="active-indicator" />
          )}
        </div>
        <span className="nav-label">Home</span>
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.9 }}
        className={`bot-nav-btn ${
          activeTab === "myorders" ? "bot-active" : ""
        }`}
        onClick={() => handleNavigation("myorders")}
      >
        <div className="icon-wrapper">
          <FaListAlt className="nav-icon" />
          {activeTab === "myorders" && (
            <motion.span layoutId="indicator" className="active-indicator" />
          )}
        </div>
        <span className="nav-label">Orders</span>
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.9 }}
        className={`bot-nav-btn ${activeTab === "profile" ? "bot-active" : ""}`}
        onClick={() => handleNavigation("profile")}
      >
        <div className="icon-wrapper">
          <FaUser className="nav-icon" />
          {activeTab === "profile" && (
            <motion.span layoutId="indicator" className="active-indicator" />
          )}
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
          {activeTab === "cart" && (
            <motion.span layoutId="indicator" className="active-indicator" />
          )}
        </div>
        <span className="nav-label">Cart</span>
      </motion.button>
    </div>
  );
}
