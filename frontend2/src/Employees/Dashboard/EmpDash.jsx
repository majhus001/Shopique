import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { FiDollarSign, FiLogOut } from "react-icons/fi"; // Added missing icons
import Adnavbar from "../../Admin/Adnavbar/Adnavbar";
import Sidebar from "../../Admin/sidebar/Sidebar";
import API_BASE_URL from "../../api";
import "./EmpDash.css";
import {
  FiClock,
  FiWatch,
  FiCheckCircle,
  FiActivity,
  FiCalendar,
  FiCheckSquare,
} from "react-icons/fi";
export default function EmpDash() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get initial state from location or set to null
  const [user] = useState(location.state?.user || null);
  const [orders] = useState(location.state?.orders || null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isEmployee, setisEmployee] = useState(false);

  useEffect(() => {
    if (user.role == "Employee") {
      setisEmployee(true);
    }
  });

  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  const handleBillingClick = () => {
    navigate("/billing", { state: { user, orders } });
  };

  const handleLogout = async () => {
    try {
      if (isEmployee) {
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/employee/logout`,
          {},
          { withCredentials: true }
        );
      } else {
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/logout`,
          {},
          { withCredentials: true }
        );
      }
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div>
      <div className="ad-nav">
        <Adnavbar user={user} />
      </div>
      <div
        className={`admin-container ${
          sidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        <Sidebar
          user={user}
          orders={orders}
          onCollapsedChange={handleSidebarCollapse}
        />

        <div className="main-content">
          <header className="admin-header">
            <div className="header-greeting">
              <h1>Welcome to the Employee Dashboard</h1>{" "}
              {/* Changed from Admin to Employee */}
              <p className="date-display">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="admin-info">
              <button className="billing-btn" onClick={handleBillingClick}>
                <FiDollarSign className="btn-icon" /> Go to Billing
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                <FiLogOut className="btn-icon" /> Logout
              </button>
            </div>
          </header>

          <div className="dashboard-summary">
            <div className="summary-header">
              <h2 className="section-title">Employee Dashboard Overview</h2>
              <div className="login-time">
                <FiClock className="icon" />
                <span>Login time: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>

            <p className="section-subtitle">Your daily performance summary</p>

            <div className="metrics-grid">
              {/* Work Hours Card */}
              <div className="metric-card">
                <div className="metric-header">
                  <FiWatch className="card-icon" />
                  <h5>Today's Hours</h5>
                </div>
                <div className="metric-value">6.5/8 hrs</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: "81%" }}></div>
                </div>
              </div>

              {/* Tasks Completed Card */}
              <div className="metric-card">
                <div className="metric-header">
                  <FiCheckCircle className="card-icon" />
                  <h5>Tasks Completed</h5>
                </div>
                <div className="metric-value">8/12</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: "67%" }}></div>
                </div>
              </div>

              {/* Recent Activity Card */}
              <div className="metric-card wide-card">
                <div className="metric-header">
                  <FiActivity className="card-icon" />
                  <h5>Recent Activity</h5>
                </div>
                <ul className="activity-list">
                  <li>Processed order #4521</li>
                  <li>Updated customer record</li>
                  <li>Completed inventory check</li>
                </ul>
              </div>

              {/* Upcoming Tasks Card */}
              <div className="metric-card wide-card">
                <div className="metric-header">
                  <FiCalendar className="card-icon" />
                  <h5>Upcoming Tasks</h5>
                </div>
                <ul className="task-list">
                  <li>
                    <FiCheckSquare className="task-icon" />
                    <span>End-of-day report</span>
                  </li>
                  <li>
                    <FiCheckSquare className="task-icon" />
                    <span>Restock Section A</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
