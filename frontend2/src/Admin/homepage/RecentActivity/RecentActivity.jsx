import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./RecentActivity.css";
import Adnavbar from "../../Adnavbar/Adnavbar";
import Sidebar from "../../sidebar/Sidebar";
import axios from "axios";
import API_BASE_URL from "../../../api";
import { FiClock, FiCalendar, FiLogOut } from "react-icons/fi";
const RecentActivity = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const stateUser = location.state?.user || null;
  const stateOrders = location.state?.orders || [];
  const recactivity =
    location.state?.recactivity || location.state?.RecentActivities || [];
  const [loading, setLoading] = useState(false);
  const [isEmployee, setisEmployee] = useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [user, setUser] = useState(stateUser);
  const [orders, setOrders] = useState(stateOrders);
  const [currentPage, setCurrentPage] = useState(1); // Page state

  const activitiesPerPage = 20; // Number of activities to show per page
  const totalPages = Math.ceil(recactivity.length / activitiesPerPage); // Total pages

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/auth/checkvaliduser`,
        {
          withCredentials: true,
        }
      );

      const loggedInUser = response.data.user;
      if (!loggedInUser) {
        navigate("/login");
        return;
      }

      const isEmp = loggedInUser.role === "Employee";
      setisEmployee(isEmp);

      const userId = isEmp ? loggedInUser.employeeId : loggedInUser.userId;

      const userRes = await axios.get(
        isEmp
          ? `${API_BASE_URL}/api/employees/fetch/${userId}`
          : `${API_BASE_URL}/api/auth/fetch/${userId}`
      );

      setUser(userRes.data.data);
    } catch (error) {
      console.error("Error fetching user:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderData = async () => {
    try {
      const OrdersRes = await axios.get(
        `${API_BASE_URL}/api/admin/pendingorders`
      );
      setOrders(OrdersRes.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    if (user.role == "Employee") {
      setisEmployee(true);
    }
    fetchUserData();
    fetchOrderData();
  }, []);

  const handleLogout = async () => {
    try {
      const empId = user._id;
      if (isEmployee) {
        await axios.post(
          `${API_BASE_URL}/api/auth/employee/logout/${empId}`,
          {},
          { withCredentials: true }
        );
      } else {
        await axios.post(
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

  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  const handleBack = () => {
    navigate("/adhome", { state: { user, orders } });
  };

  // Pagination Handlers
  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Get current page activities
  const indexOfLastActivity = currentPage * activitiesPerPage;
  const indexOfFirstActivity = indexOfLastActivity - activitiesPerPage;
  const currentActivities = recactivity.slice(
    indexOfFirstActivity,
    indexOfLastActivity
  );

  return (
    <div style={{ cursor: loading ? "wait" : "default" }}>
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
          <header className="admin-header-box">
            <div className="header-greeting">
              <h1>
                {!isEmployee ? "Admin Panel" : `${user.fullName} Activities`}
              </h1>
            </div>
            <div className="admin-info">
              <button className="logout-btn" onClick={handleLogout}>
                <FiLogOut /> Logout
              </button>
            </div>
          </header>

          <div className="recent-activity-container">
            <header className="recent-activity-header">
              <h2>Recent User Activities</h2>
              <button className="back-btn" onClick={handleBack}>
                Back to Dashboard
              </button>
            </header>

            {!isEmployee ? (
              <div className="recent-activity-list">
                {currentActivities.length === 0 ? (
                  <p className="no-activity">No recent activities available.</p>
                ) : (
                  <ul>
                    {currentActivities.map((item, index) => (
                      <li key={index} className="activity-item">
                        <strong>{item.username}</strong> {item.activity} on{" "}
                        <span className="activity-time">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div className="recent-activity">
                <div className="emp-reac-title">
                  <span>Description</span>
                  <span>Total Amount</span>
                  <span>Date</span>
                </div>
                {currentActivities.length > 0 ? (
                  <ul>
                    {currentActivities.slice(0, 3).map((item, index) => (
                      <li key={index}>
                        <div className="activity-icon">
                          <FiClock />
                        </div>
                        <div className="activity-content">
                          <div className="activity-header">
                            <strong className="username">
                              Bill #{item.billId.toString().slice(-4)} -{" "}
                              {item.description}
                            </strong>

                            <p className="emp-activity-amount">
                              ₹ {item.totalAmount.toFixed(2)}
                            </p>
                            <span className="activity-time">
                              <FiCalendar className="time-icon" />{" "}
                              {new Date(item.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="activity-description">
                            Total Items : {item.itemsCount}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="no-activity">
                    <p>No recent activity to display</p>
                  </div>
                )}
              </div>
            )}

            {/* Pagination Buttons */}
            {recactivity.length > activitiesPerPage && (
              <div className="pagination-buttons">
                <button
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                  className="ad-or-d-btn"
                >
                  ← Previous
                </button>
                <span style={{ padding: "0 10px" }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className="ad-or-d-btn"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
