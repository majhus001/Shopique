import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaListAlt, FaUser, FaShoppingCart } from "react-icons/fa";
import "./BottomNav.css";
import { useEffect, useState } from "react";

export default function BottomNav({ UserData }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("home");

  const handleNavigation = (path) => {
    navigate(`/${path}`, { state: { user: UserData } });
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
      <button
        className={`bot-nav-btn ${activeTab === "home" ? "bot-active" : ""}`}
        onClick={() => handleNavigation("home")}
      >
        <FaHome />
        <span>Home</span>
      </button>
      <button
        className={`bot-nav-btn ${activeTab === "myorders" ? "bot-active" : ""}`}
        onClick={() => handleNavigation("myorders")}
      >
        <FaListAlt />
        <span>Orders</span>
      </button>
      <button
        className={`bot-nav-btn ${activeTab === "profilepage" ? "bot-active" : ""}`}
        onClick={() => handleNavigation("profilepage")}
      >
        <FaUser />
        <span>Account</span>
      </button>
      <button
        className={`bot-nav-btn ${activeTab === "cart" ? "bot-active" : ""}`}
        onClick={() => handleNavigation("cart")}
      >
        <FaShoppingCart />
        <span>Cart</span>
      </button>
    </div>
  );
}