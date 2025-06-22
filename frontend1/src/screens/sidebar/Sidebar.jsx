import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ user }) => {
  const navigate = useNavigate();

  const [isActive, setIsActive] = useState(false);

  const toggleSidebar = () => {
    setIsActive(!isActive);
  };
  const handleOnClickProfile = () => {
    navigate("/profilepage", { state: { user } });
  };
  const handleOnClickWishlist = () => {
    navigate("/wishlist", { state: { user } });
  };
  const handleOnClickOrders = () => {
    navigate("/myorders", { state: { user } });
  };
  const handleOnClickSettings = () => {
    navigate("/settings", { state: { user } });
  };
  const handleOnClickLogout = () => {
    navigate("/home");
  };

  return (
    <>
      <button className="usprof-sidebar-toggle" onClick={toggleSidebar}>
        <i className="fas fa-bars"></i>
      </button>

    <div className={`usprof-sidebar ${isActive ? 'active' : ''}`}>
      <div className="usprof-user-card">
        <img src={user.image} alt="profile" className="usprof-user-img" />
        <h4 className="usprof-username">{user.username}</h4>
      </div>
      
      <nav className="usprof-nav-menu">
        <button className="usprof-nav-btn" onClick={handleOnClickProfile}>
          <i className="usprof-icon fas fa-user"></i>
          <span>Profile</span>
        </button>
        <button className="usprof-nav-btn" onClick={handleOnClickWishlist}>
          <i className="usprof-icon fas fa-heart"></i>
          <span>Wishlist</span>
        </button>
        <button className="usprof-nav-btn" onClick={handleOnClickOrders}>
          <i className="usprof-icon fas fa-box"></i>
          <span>My Orders</span>
        </button>
        <button className="usprof-nav-btn" onClick={handleOnClickSettings}>
          <i className="usprof-icon fas fa-cog"></i>
          <span>Settings</span>
        </button>
        <button className="usprof-nav-btn" onClick={handleOnClickLogout}>
          <i className="usprof-icon fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </button>
      </nav>
    </div>
    </>
  );
};

export default Sidebar;