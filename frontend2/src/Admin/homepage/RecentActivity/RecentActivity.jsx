import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./RecentActivity.css";
import Adnavbar from "../../Adnavbar/Adnavbar";
import Sidebar from "../../sidebar/Sidebar";
import axios from "axios";
import API_BASE_URL from "../../../api";

const RecentActivity = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const stateUser = location.state?.user || null;
  const stateOrders = location.state?.orders || [];
  const recactivity = location.state?.recactivity || [];
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState(stateUser);
  const [orders, setOrders] = useState(stateOrders);
  const [currentPage, setCurrentPage] = useState(1); // Page state

  const activitiesPerPage = 20; // Number of activities to show per page
  const totalPages = Math.ceil(recactivity.length / activitiesPerPage); // Total pages

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/auth/checkvaliduser`, {
        withCredentials: true,
      });

      if (!response.data.user) {
        navigate("/login");
        return;
      }

      const userId = response.data.user.userId;
      const userRes = await axios.get(`${API_BASE_URL}/api/auth/fetch/${userId}`);
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
      const OrdersRes = await axios.get(`${API_BASE_URL}/api/admin/pendingorders`);
      setOrders(OrdersRes.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchOrderData();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
      navigate("/home");
    } catch (error) {
      console.error("Error during logout:", error);
    }
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
  const currentActivities = recactivity.slice(indexOfFirstActivity, indexOfLastActivity);

  return (
    <div style={{ cursor: loading ? "wait" : "default" }}>
      <div className="ad-nav">
        <Adnavbar user={user} />
      </div>
      <div className="admin-container">
        <Sidebar user={user} orders={orders} />
        <div className="main-content">
          <header className="admin-header">
            <h1>Admin Panel</h1>
            <div className="admin-info">
              <button className="logout-btn" onClick={handleLogout}>
                Logout
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
