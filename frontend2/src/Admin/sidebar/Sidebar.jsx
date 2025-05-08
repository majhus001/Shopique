import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";
import API_BASE_URL from "../../api";
import {
  FiHome,
  FiUser,
  FiUsers,
  FiShoppingBag,
  FiPackage,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiChevronLeft,
  FiDollarSign,
} from "react-icons/fi";

const Sidebar = ({ user, orders, onCollapsedChange }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [isEmployee, setisEmployee] = useState(false);
  // Check if current path matches the menu item path
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Notify parent component about initial collapsed state
  useEffect(() => {
    if (onCollapsedChange) {
      onCollapsedChange(collapsed);
    }

    if (user.role == "Employee") {
      setisEmployee(true);
    }
  }, [collapsed, onCollapsedChange]);

  const handleLogout = async () => {
    try {
      if (isEmployee) {
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/employee/logout`,
          {},
          { withCredentials: true }
        );
        console.log(response.data.message);
      } else {
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/logout`,
          {},
          { withCredentials: true }
        );
        console.log(response.data.message);
      }
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleDashclk = () => navigate("/adhome", { state: { user, orders } });
  const handleprofileclk = () =>
    navigate("/adprof", { state: { user, orders } });
  const handleUsemanclk = () =>
    navigate("/userman", { state: { user, orders } });
  const handleCustomerclk = () =>
    navigate("/customers", { state: { user, orders } });
  const handleEmployeesclk = () =>
    navigate("/employees", { state: { user, orders } });
  const handleOrderclk = () =>
    navigate("/adorders", { state: { user, orders } });
  const handleProdclk = () =>
    navigate("/adprodlist", { state: { user, orders } });

  const handleBillingClick = () =>
    navigate("/billing", { state: { user, orders } });

  // Toggle sidebar collapse state
  const toggleSidebar = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);

    // Notify parent component about the collapsed state change
    if (onCollapsedChange) {
      onCollapsedChange(newCollapsedState);
    }
  };

  return (
    <div>
      <div className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-toggle" onClick={toggleSidebar}>
          {collapsed ? <FiMenu /> : <FiChevronLeft />}
        </div>

        <div className="ad-sb-img-cont">
          {user?.image ? (
            <img src={user.image} alt="admin" className="ad-sb-img" />
          ) : (
            <div className="placeholder-img">
              {!collapsed && (isEmployee ? "Employee" : "Admin")}
            </div>
          )}
          {!collapsed && (
            <h4 className="ad-sb-username">
              {user?.username ||
                user?.fullName ||
                (isEmployee ? "Employee" : "Admin")}
            </h4>
          )}
        </div>

        <div className="ad-sb-list-cont">
          <ul className="ad-sb-list-items">
            <li>
              <button
                className={`ad-sb-btns ${isActive("/adhome") ? "active" : ""}`}
                onClick={handleDashclk}
                title="Dashboard"
              >
                <FiHome className="menu-icon" />
                {!collapsed && <span>Dashboard</span>}
              </button>
            </li>
            <li>
              <button
                className={`ad-sb-btns ${isActive("/adprof") ? "active" : ""}`}
                onClick={handleprofileclk}
                title="Profile"
              >
                <FiUser className="menu-icon" />
                {!collapsed && <span>Profile</span>}
              </button>
            </li>
            <div className="menu-divider"></div>
            <li>
              <button
                className={`ad-sb-btns ${
                  isActive("/adprodlist") ? "active" : ""
                }`}
                onClick={handleProdclk}
                title="Products"
              >
                <FiPackage className="menu-icon" />
                {!collapsed && <span>Products</span>}
              </button>
            </li>

            {!isEmployee ? (
              <li>
                <button
                  className={`ad-sb-btns ${
                    isActive("/adorders") ? "active" : ""
                  }`}
                  onClick={handleOrderclk}
                  title="Orders"
                >
                  <FiShoppingBag className="menu-icon" />
                  {!collapsed && <span>Orders</span>}
                </button>
              </li>
            ) : null}

            <div className="menu-divider"></div>
            <li>
              <button
                className={`ad-sb-btns ${isActive("/billing") ? "active" : ""}`}
                onClick={handleBillingClick}
                title="Billing"
              >
                <FiDollarSign className="menu-icon" />
                {!collapsed && <span>Billing</span>}
              </button>
            </li>
            <div className="menu-divider"></div>

            {!isEmployee ? (
              <>
                <li>
                  <button
                    className={`ad-sb-btns ${
                      isActive("/userman") ? "active" : ""
                    }`}
                    onClick={handleUsemanclk}
                    title="User Management"
                  >
                    <FiUsers className="menu-icon" />
                    {!collapsed && <span>Online Users</span>}
                  </button>
                </li>
                <li>
                  <button
                    className={`ad-sb-btns ${
                      isActive("/employees") ? "active" : ""
                    }`}
                    onClick={handleEmployeesclk}
                    title="Employee Management"
                  >
                    <FiUsers className="menu-icon" />
                    {!collapsed && <span>Employees</span>}
                  </button>
                </li>
              </>
            ) : null}

            <li>
              <button
                className={`ad-sb-btns ${
                  isActive("/customers") ? "active" : ""
                }`}
                onClick={handleCustomerclk}
                title="Customer Management"
              >
                <FiUsers className="menu-icon" />
                {!collapsed && <span>Customers </span>}
              </button>
            </li>

            <div className="menu-divider"></div>

            <li>
              <button
                className={`ad-sb-btns ${
                  isActive("/settings") ? "active" : ""
                }`}
                title="Settings"
              >
                <FiSettings className="menu-icon" />
                {!collapsed && <span>Settings</span>}
              </button>
            </li>
            <li>
              <button
                className="ad-sb-btns"
                onClick={handleLogout}
                title="Logout"
              >
                <FiLogOut className="menu-icon" />
                {!collapsed && <span>Logout</span>}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
