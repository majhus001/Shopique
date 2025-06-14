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
  const [employeeDataRes, setEmployeeDataRes] = useState([]);
  const [recactivity, setRecactivity] = useState([]);
  const [pendingOrders, setUsersPendingOrder] = useState([]);
  const [productsRes, setProductsRes] = useState([]);
  const [dailysales, setDailysalesRes] = useState([]);
  const [lowstockitems, setLowstockItems] = useState([]);
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
        `${API_BASE_URL}/api/auth/fetch/${userId}`,
        {
          withCredentials: true,
        }
      );
      setUser(userRes.data.data);
      await fetchOrderData();
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
        `${API_BASE_URL}/api/admin/pendingorders`,
        {
          withCredentials: true,
        }
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
  }, []);

  // Fetch other required data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          userDataRes,
          customersDataRes,
          employeeDataRes,
          userRecActRes,
          productsRes,
          dailysalesRes,
        ] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/admin/userdata`, {
            withCredentials: true,
          }),
          axios.get(`${API_BASE_URL}/api/customers/fetch`, {
            withCredentials: true,
          }),
          axios.get(`${API_BASE_URL}/api/employees/fetch`, {
            withCredentials: true,
          }),
          axios.get(`${API_BASE_URL}/api/user/reactivity/fetch`, {
            withCredentials: true,
          }),
          axios.get(`${API_BASE_URL}/api/products/fetchAll`, {
            withCredentials: true,
          }),
          axios.get(`${API_BASE_URL}/api/dailysales/fetch`, {
            withCredentials: true,
          }),
        ]);

        const products = productsRes.data.data;
        const lowStockItems = products.filter((item) => item.stock <= 50);

        setLowstockItems(lowStockItems);
        setUserData(userDataRes.data);
        setCustomersDataRes(customersDataRes.data.data);
        setEmployeeDataRes(employeeDataRes.data.data);
        setRecactivity(userRecActRes.data);
        setProductsRes(productsRes.data.data);
        setDailysalesRes(dailysalesRes.data.data);
      } catch (err) {
        console.error("Error fetching additional data:", err);
        // Consider adding error state handling here
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
  const handlemployeesclk = () =>
    navigate("/employees", { state: { user, orders } });
  const handleOrderclk = () =>
    navigate("/adorders", { state: { user, orders } });
  const handleReportsclk = () =>
    navigate("/adreports", { state: { user, orders } });
  const handleProdclk = () =>
    navigate("/adprodlist", { state: { user, orders } });

  const handleLowstockClick = () => {
    navigate("/stockmaintain", { state: { user, orders, productsRes } });
  };

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

  const handlelowstockview = (item) => {
    navigate("/viewproductdetails", {
      state: {
        user,
        orders,
        item,
      },
    });
  };
  const handlelowstockadd = (item) => {
    navigate("/addproducts", {
      state: {
        user,
        orders,
        editProduct: item,
      },
    });
  };

  const handleDailySalesClick = () => {
    navigate("/viewdailysales", {
      state: {
        user,
        orders,
        dailysales,
      },
    });
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
          <header className="admin-header-box">
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
                <FiDollarSign /> Go to Billing
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                <FiLogOut /> Logout
              </button>
            </div>
          </header>

          <div className="dashboard-summary">
            <div className="section-title">
              <h2>Dashboard Overview</h2>
            </div>
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
                <span className="card-description">Regular customers</span>
              </div>
            </div>

            <div className="ad-det-card" onClick={handlemployeesclk}>
              <div className="card-icon-wrapper users-icon">
                <FiUsers className="card-icon" />
              </div>
              <div className="card-content">
                <h3>Total Employees</h3>
                <p>{employeeDataRes.length}</p>
                <span className="card-description">shop workers</span>
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
            <div className="ad-det-card" onClick={handleLowstockClick}>
              <div className="card-icon-wrapper reports-icon">
                <FiPieChart className="card-icon" />
              </div>
              <div className="card-content">
                <h3>Low Stocks </h3>
                <p>{lowstockitems.length}</p>
                <span className="card-description">
                  items with Low Stocks in Inventory
                </span>
              </div>
            </div>
          </div>

          <section className="recent-activity-section">
            <div className="section-header">
              <h2 className="section-title">
                <FiActivity className="section-icon" /> Low stocks
              </h2>
              <button className="view-all-btn" onClick={handleLowstockClick}>
                View All
              </button>
            </div>

            <div className="stock-list">
              {lowstockitems.length > 0 ? (
                <ul className="low-stock-ul">
                  <div className="low-stock-title">
                    <li>Items</li>
                    <li>stocks</li>
                    <li>Category</li>
                    <li>price</li>
                    <li>Last Purchased</li>
                    <li>Action</li>
                  </div>
                  {lowstockitems.slice(0, 5).map((item, index) => (
                    <li
                      key={index}
                      className="low-stock-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/addproducts", {
                          state: {
                            user,
                            orders,
                            editProduct: item,
                          },
                        });
                      }}
                    >
                      <div className="low-stock-info">
                        <div className="low-stock-info-header">
                          <img
                            className="stock-item-img"
                            src={item.images[0]}
                          />
                          <strong className="item-name">{item.name}</strong>
                        </div>

                        <span className="item-stock"> {item.stock}</span>
                        <strong className="item-name">
                          {item.category} - {item.subCategory}
                        </strong>
                        <span className="item-stock-price"> {item.price}</span>
                        <span>
                          {new Date(item.updatedAt).toLocaleDateString()}
                        </span>
                        <div className="low-stock-action-btn-cont">
                          <span
                            className="low-stock-action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlelowstockview(item);
                            }}
                          >
                            view
                          </span>

                          <span
                            className="low-stock-action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlelowstockadd(item);
                            }}
                          >
                            Add
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="no-stock-msg">
                  <p>No low stock items to display</p>
                </div>
              )}
            </div>
          </section>

          <section className="recent-activity-section">
            <div className="section-header">
              <h2 className="section-title">
                <FiActivity className="section-icon" /> Daily sales Items
              </h2>
              <button className="view-all-btn" onClick={handleDailySalesClick}>
                View All
              </button>
            </div>

            <div className="stock-list">
              {dailysales.length > 0 ? (
                <ul className="low-stock-ul">
                  <div className="low-stock-title">
                    <li>Items</li>
                    <li>Quantity</li>
                    <li>Category</li>
                    <li>price</li>
                    <li>Purchased At</li>
                    <li>Bill No</li>
                  </div>
                  {dailysales.slice(0, 5).map((item, index) => (
                    <li
                      key={index}
                      className="low-stock-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlelowstockview(item);
                      }}
                    >
                      <div className="low-stock-info">
                        <div className="low-stock-info-header">
                          <strong className="item-name">
                            {item.productname}
                          </strong>
                        </div>

                        <span className="item-stock"> {item.quantity}</span>
                        <strong className="item-name">{item.category}</strong>
                        <span className="item-stock-price"> {item.price}</span>
                        <span>
                          {new Date(item.soldAt).toLocaleDateString()}
                        </span>
                        <span>{item.billNumber}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="no-stock-msg">
                  <p>No Daily Sales items to display</p>
                </div>
              )}
            </div>
          </section>

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
                  {recactivity.slice(0, 5).map((item, index) => (
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
