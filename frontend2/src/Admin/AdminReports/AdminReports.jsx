import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiDollarSign,
  FiLogOut,
  FiUsers,
  FiShoppingBag,
  FiTrendingUp,
  FiPieChart,
  FiCheckCircle,
  FiLoader,
  FiArrowUp,
  FiArrowDown,
  FiCalendar,
  FiClock,
} from "react-icons/fi";
import Adnavbar from "../../Admin/Adnavbar/Adnavbar";
import Sidebar from "../../Admin/sidebar/Sidebar";
import API_BASE_URL from "../../api";
import "./AdminReports.css";

export default function AdminReports() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [bills, setBills] = useState([]);
  const [todayrevenue, setTodayrevenue] = useState(0);
  const [monthlyrevenue, setMonthyrevenue] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [topProductSalesMap, setTopProductSalesMap] = useState({});
  const [todaysbills, setTodaybills] = useState(0);

  const [metrics, setMetrics] = useState({
    todayRevenue: 0,
    monthlyRevenue: 0,
    totalEmployees: 0,
    activeEmployees: 0,
    totalOrders: 0,
    todayOrders: 0,
    popularItems: [],
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    fetchUserData();
    fetchbills();
    loadMetricsData();

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) {
      fetchbills();
    }
  }, [currentTime, user]);

  const loadMetricsData = async () => {
    try {
      // Fetch employees data
      const employeesRes = await axios.get(
        `${API_BASE_URL}/api/employees/fetch`
      );
      const employeesData = employeesRes.data?.data || [];
      const activeEmployees = employeesData.filter(
        (emp) => emp?.status === "Active"
      ).length;

      // Fetch orders data
      const ordersRes = await axios.get(
        `${API_BASE_URL}/api/admin/pendingorders`
      );
      const ordersData = ordersRes.data || [];

      const popularItems = calculatePopularItems(ordersData);
      const todayOrders = ordersData.filter((order) => {
        const orderDate = new Date(order?.createdAt || new Date());
        return orderDate.toDateString() === new Date().toDateString();
      }).length;

      setMetrics({
        ...metrics,
        totalEmployees: employeesData.length,
        activeEmployees,
        totalOrders: ordersData.length,
        todayOrders,
        popularItems,
      });
    } catch (error) {
      console.error("Error loading metrics:", error);
      setMetrics({
        ...metrics,
        totalEmployees: 0,
        activeEmployees: 0,
        totalOrders: 0,
        todayOrders: 0,
      });
    }
  };

  const calculatePopularItems = (orders) => {
    const itemCounts = {};

    orders?.forEach((order) => {
      if (order?.items?.length) {
        order.items.forEach((item) => {
          const itemName = item.name || item.itemName;
          if (itemName) {
            itemCounts[itemName] =
              (itemCounts[itemName] || 0) + (item.quantity || 1);
          }
        });
      }
    });

    return Object.entries(itemCounts)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 3);
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
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
    } catch (error) {
      console.error("Error fetching user:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchbills = async () => {
    try {
      const billres = await axios.get(`${API_BASE_URL}/api/billing/fetch`);
      const allBills = billres.data.data;

      const today = new Date().toISOString().split("T")[0];
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const todaysBills = allBills.filter((bill) => {
        const billDate = new Date(bill.createdAt);
        return billDate.toISOString().split("T")[0] === today;
      });

      const monthlyBills = allBills.filter((bill) => {
        const billDate = new Date(bill.createdAt);
        return (
          billDate.getMonth() === currentMonth &&
          billDate.getFullYear() === currentYear
        );
      });

      const todayRevenue = todaysBills.reduce(
        (sum, bill) => sum + (bill.grandTotal || 0),
        0
      );
      const monthRevenue = monthlyBills.reduce(
        (sum, bill) => sum + (bill.grandTotal || 0),
        0
      );

      // Step 1: Count total quantity sold for each productId
      const productCountMap = {};

      allBills.forEach((bill) => {
        bill.items.forEach((prod) => {
          const id = prod.productId.toString();
          productCountMap[id] = (productCountMap[id] || 0) + prod.quantity;
        });
      });

      // Set this in state to use elsewhere
      setTopProductSalesMap(productCountMap);

      // Step 2: Get top 5 productIds
      const topProductIds = Object.entries(productCountMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([productId]) => productId);

      let topproducts = [];
      try {
        const productsres = await axios.post(
          `${API_BASE_URL}/api/products/top-selling`,
          { productIds: topProductIds }
        );
        topproducts = productsres.data;
      } catch (error) {
        console.error("Error fetching products:", error);
      }

      setBills(allBills);
      setTodaybills(todaysBills)
      setTodayrevenue(todayRevenue);
      setMonthyrevenue(monthRevenue);

      setMetrics((prev) => ({
        ...prev,
        todayRevenue,
        monthlyRevenue: monthRevenue,
        popularItems: topproducts,
      }));
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  const handleLogout = async () => {
    try {
      const empId = user?._id;
      await axios.post(
        `${API_BASE_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const calculateChange = (current, previous) => {
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  };

  if (loading || !user) {
    return (
      <div className="loading-overlay">
        <div className="loading-content">
          <FiLoader className="loading-spinner" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-reports-container">
      <div className="ad-nav">
        <Adnavbar user={user} orders={orders} />
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
              <h1>Reports Dashboard</h1>
              <div className="date-time-display">
                <span className="date-icon">
                  <FiCalendar />
                </span>
                <span>
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="time-icon">
                  <FiClock />
                </span>
                <span>
                  {new Date().toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
            <div className="admin-info">
              <button className="logout-btn" onClick={handleLogout}>
                <FiLogOut className="btn-icon" /> Logout
              </button>
            </div>
          </header>

          <div className="dashboard-summary">
            <div className="summary-header">
              <h2 className="section-title">
                <span className="title-highlight">Business</span> Overview
              </h2>
              <p className="section-subtitle">
                Key performance indicators and metrics at a glance
              </p>
            </div>

            <div className="metrics-grid">
              {/* Revenue Card */}
              <div className="metric-card revenue-card">
                <div className="metric-icon">
                  <FiDollarSign />
                  <div className="icon-bg"></div>
                </div>
                <div className="metric-content">
                  <h3>Today's Products sold</h3>
                  <p className="metric-value">{todaysbills.length}</p>
                  <div className="metric-change positive"></div>
                </div>
                <div className="card-wave"></div>
              </div>

              <div className="metric-card revenue-card">
                <div className="metric-icon">
                  <FiDollarSign />
                  <div className="icon-bg"></div>
                </div>
                <div className="metric-content">
                  <h3>Today's Revenue</h3>
                  <p className="metric-value">${todayrevenue.toFixed(2)}</p>
                  <div className="metric-change positive">
                    <FiTrendingUp />
                    <span>
                      {calculateChange(
                        todayrevenue,
                        metrics.todayRevenue
                      ).toFixed(1)}
                      % from yesterday
                    </span>
                  </div>
                </div>
                <div className="card-wave"></div>
              </div>

              {/* Monthly Revenue Card */}
              <div className="metric-card monthly-card">
                <div className="metric-icon">
                  <FiPieChart />
                  <div className="icon-bg"></div>
                </div>
                <div className="metric-content">
                  <h3>Monthly Revenue</h3>
                  <p className="metric-value">${monthlyrevenue.toFixed(2)}</p>
                  <div className="metric-change positive">
                    <FiTrendingUp />
                    <span>
                      {calculateChange(
                        monthlyrevenue,
                        metrics.monthlyRevenue
                      ).toFixed(1)}
                      % from last month
                    </span>
                  </div>
                </div>
                <div className="card-wave"></div>
              </div>

              {/* Employees Card */}
              <div className="metric-card employees-card">
                <div className="metric-icon">
                  <FiUsers />
                  <div className="icon-bg"></div>
                </div>
                <div className="metric-content">
                  <h3>Staff</h3>
                  <p className="metric-value">
                    {metrics.activeEmployees}/{metrics.totalEmployees} Active
                  </p>
                  <div className="metric-change neutral">
                    <span>
                      {Math.round(
                        (metrics.activeEmployees / metrics.totalEmployees) * 100
                      )}
                      % availability
                    </span>
                  </div>
                </div>
                <div className="card-wave"></div>
              </div>

              {/* Orders Card */}
              <div className="metric-card orders-card">
                <div className="metric-icon">
                  <FiShoppingBag />
                  <div className="icon-bg"></div>
                </div>
                <div className="metric-content">
                  <h3>Online Orders</h3>
                  <p className="metric-value">
                    {metrics.todayOrders} today ({metrics.totalOrders} total)
                  </p>
                  <div className="metric-change positive">
                    <FiTrendingUp />
                    <span>
                      +{calculateChange(metrics.todayOrders, 35).toFixed(1)}%
                      from yesterday
                    </span>
                  </div>
                </div>
                <div className="card-wave"></div>
              </div>
            </div>

            <div className="recent-activity-section">
              <div className="popular-items">
                <div className="popular-items-header">
                  <h3>Top Selling Items</h3>
                  <span className="badge">This Week</span>
                </div>
                <ul className="items-list">
                  {metrics.popularItems.length > 0 ? (
                    metrics.popularItems.map((item, index) => {
                      const quantitySold = topProductSalesMap[item._id] || 0; // Get quantity by product ID

                      return (
                        <li key={index} className="item">
                          <div className="item-rank">{index + 1}</div>
                          <div className="item-details">
                            <img src={item.images[0]} alt={item.name} />
                            <span className="item-name">{item.name}</span>
                            <span className="item-sales">
                              {quantitySold}{" "}
                              {quantitySold === 1 ? "sale" : "sales"}
                            </span>
                          </div>
                          <div className="progress-container">
                            <div
                              className="progress-bar"
                              style={{
                                width: `${Math.min(
                                  (quantitySold /
                                    (topProductSalesMap[
                                      metrics.popularItems[0]?._id
                                    ] || 1)) *
                                    100,
                                  100
                                )}%`,
                                backgroundColor: `hsl(${
                                  210 - index * 30
                                }, 70%, 50%)`,
                              }}
                            ></div>
                          </div>
                        </li>
                      );
                    })
                  ) : (
                    <div className="no-data-placeholder">
                      <p>No popular items data available</p>
                    </div>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
