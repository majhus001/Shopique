import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./AdminHome.css";
import Adnavbar from "../Adnavbar/Adnavbar";
import API_BASE_URL from "../../api";
import Sidebar from "../sidebar/Sidebar";
import {
  FiUsers,
  FiPackage,
  FiShoppingBag,
  FiPieChart,
  FiActivity,
  FiLogOut,
  FiCalendar,
  FiClock,
  FiDollarSign,
} from "react-icons/fi";

const AdminHome = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const stateUser = location.state?.user || null;
  const stateOrders = location.state?.orders || null;
  const isEmployee = location.state?.isEmployee || null;

  const [user, setUser] = useState(stateUser);
  const [orders, setOrders] = useState(stateOrders);
  const [userData, setUserData] = useState([]);
  const [customersDataRes, setCustomersDataRes] = useState([]);
  const [recactivity, setRecactivity] = useState([]);
  const [pendingOrders, setUsersPendingOrder] = useState([]);
  const [productsRes, setProductsRes] = useState([]);
  const [clothprod, setClothProducts] = useState([]);
  const [homeappliprod, setHomeAppliProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      console.log("Checking user validity...");
      const response = await axios.get(
        `${API_BASE_URL}/api/auth/checkvaliduser`,
        {
          withCredentials: true,
        }
      );

      if (!response.data.user) {
        navigate("/login");
        return;
      }

      const userId = response.data.user.userId;
      const userRes = await axios.get(
        `${API_BASE_URL}/api/auth/fetch/${userId}`
      );
      setUser(userRes.data.data);
      console.log("User fetched from backend:", userRes.data.data);
    } catch (error) {
      console.error("Error fetching user:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch order data from backend if not available in state
  const fetchOrderData = async () => {
    try {
      setLoading(true);
      const OrdersRes = await axios.get(
        `${API_BASE_URL}/api/admin/pendingorders`
      );
      setOrders(OrdersRes.data);
      setUsersPendingOrder(
        OrdersRes.data.filter((order) => order.OrderStatus === "Pending")
      );
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchOrderData();
  }, []);

  // Fetch other required data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userDataRes, customersDataRes, userRecActRes, productsRes] =
          await Promise.all([
            axios.get(`${API_BASE_URL}/api/admin/userdata`),
            axios.get(`${API_BASE_URL}/api/customers/fetch`),
            axios.get(`${API_BASE_URL}/api/user/reactivity/fetch`),
            axios.get(`${API_BASE_URL}/api/products/fetchAll`),
          ]);

        setUserData(userDataRes.data);
        setCustomersDataRes(customersDataRes.data.data);
        setRecactivity(userRecActRes.data);
        setProductsRes(productsRes.data.data);
      } catch (err) {
        console.error("Error fetching additional data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      console.log(response.data.message);
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleUsemanclk = () =>
    navigate("/userman", { state: { user, orders } });
  const handlecustomersclk = () =>
    navigate("/customers", { state: { user, orders } });
  const handleOrderclk = () =>
    navigate("/adorders", { state: { user, orders } });
  const handleReportsclk = () =>
    navigate("/adreports", { state: { user, orders } });
  const handleProdclk = () =>
    navigate("/adprodlist", { state: { user, orders } });

  const handleRecentActivityClick = () => {
    navigate("/recentactivity", { state: { user, orders, recactivity } });
  };

  const handleBillingClick = () => {
    navigate("/billing", { state: { user, orders } });
  };

  // Handle sidebar collapse state change
  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

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
          <header className="admin-header">
            <div className="header-greeting">
              <h1>Welcome to the Admin Dashboard</h1>
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
            <h2 className="section-title">Dashboard Overview</h2>
            <p className="section-subtitle">
              Quick summary of your store's performance
            </p>
          </div>

          <div className="admin-dashboard">
            <div className="ad-det-card" onClick={handleUsemanclk}>
              <div className="card-icon-wrapper users-icon">
                <FiUsers className="card-icon" />
              </div>
              <div className="card-content">
                <h3>Total Online Users</h3>
                <p>{userData.length}</p>
                <span className="card-description">Registered accounts</span>
              </div>
            </div>

            <div className="ad-det-card" onClick={handlecustomersclk}>
              <div className="card-icon-wrapper users-icon">
                <FiUsers className="card-icon" />
              </div>
              <div className="card-content">
                <h3>Total Customers</h3>
                <p>{customersDataRes.length}</p>
                <span className="card-description">Registered accounts</span>
              </div>
            </div>

            <div className="ad-det-card" onClick={handleProdclk}>
              <div className="card-icon-wrapper products-icon">
                <FiPackage className="card-icon" />
              </div>
              <div className="card-content">
                <h3>Total Products</h3>
                <p>{productsRes.length}</p>
                <span className="card-description">Items in inventory</span>
              </div>
            </div>

            <div className="ad-det-card" onClick={handleOrderclk}>
              <div className="card-icon-wrapper orders-icon">
                <FiShoppingBag className="card-icon" />
              </div>
              <div className="card-content">
                <h3>Pending Orders</h3>
                <p>{pendingOrders.length}</p>
                <span className="card-description">Awaiting processing</span>
              </div>
            </div>

            <div className="ad-det-card" onClick={handleReportsclk}>
              <div className="card-icon-wrapper reports-icon">
                <FiPieChart className="card-icon" />
              </div>
              <div className="card-content">
                <h3>Reports</h3>
                <p>View</p>
                <span className="card-description">Analytics & statistics</span>
              </div>
            </div>
          </div>

          <section className="recent-activity-section">
            <div className="section-header">
              <h2 className="section-title">
                <FiActivity className="section-icon" /> Recent Activity
              </h2>
              <button
                className="view-all-btn"
                onClick={handleRecentActivityClick}
              >
                View All
              </button>
            </div>

            <div className="recent-activity">
              {recactivity.length > 0 ? (
                <ul>
                  {recactivity.slice(0, 3).map((item, index) => (
                    <li key={index}>
                      <div className="activity-icon">
                        <FiClock />
                      </div>
                      <div className="activity-content">
                        <div className="activity-header">
                          <strong className="username">{item.username}</strong>
                          <span className="activity-time">
                            <FiCalendar className="time-icon" />{" "}
                            {new Date(item.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="activity-description">{item.activity}</p>
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
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
