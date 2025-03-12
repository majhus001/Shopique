import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./RecentActivity.css"; // You can create and style this CSS file
import Adnavbar from "../../Adnavbar/Adnavbar";
import Sidebar from "../../sidebar/Sidebar";

const RecentActivity = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const user = location.state?.user || null;
  const orders = location.state?.orders || null;
  const recactivity = location.state?.recactivity || [];
  const [loading, setLoading] = useState(false);
    
  if (!user) {
    navigate("/adhome");
    return null;
  }

  const handleBack = () => {
    navigate("/adhome", { state: { user } });
  };

  return (
    <div style={{ cursor: loading ? "wait" : "default" }}>
      <div className="ad-nav">
        <Adnavbar user={user} />
      </div>
      <div className="admin-container">
        <Sidebar user={user} orders={orders} />

    <div className="recent-activity-container">
      <header className="recent-activity-header">
        <h1>Recent User Activities</h1>
        <button className="back-btn" onClick={handleBack}>
          ← Back to Dashboard
        </button>
      </header>

      <div className="recent-activity-list">
        {recactivity.length === 0 ? (
          <p>No recent activities available.</p>
        ) : (
          <ul>
            {recactivity.map((item, index) => (
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
    </div>
    </div>
    </div>
  );
};

export default RecentActivity;
