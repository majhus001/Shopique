import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { FiDollarSign, FiLogOut } from "react-icons/fi";
import Adnavbar from "../../Admin/Adnavbar/Adnavbar";
import Sidebar from "../../Admin/sidebar/Sidebar";
import API_BASE_URL from "../../api";
import "./EmpDash.css";
import { FiClock, FiWatch, FiActivity, FiCalendar } from "react-icons/fi";

export default function EmpDash() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(location.state?.user || null);
  const [orders] = useState(location.state?.orders || null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isEmployee, setisEmployee] = useState(false);
  const [bills, setBills] = useState([]);
  const [productsRes, setProductsRes] = useState([]);
  const [lowstockitems, setLowstockItems] = useState([]);
  const [todaysbills, setTodaysbills] = useState([]);
  const [dailysales, setdailysales] = useState([]);
  const [popularItems, settopproducts] = useState([]);
  const [todaysoldprods, settodaysoldprods] = useState(0);
  const [topProductSalesMap, setTopProductSalesMap] = useState({});
  const [RecentActivities, setActivities] = useState([]);
  const [todayLoginTime, setTodayLoginTime] = useState(null);
  const [workingHours, setWorkingHours] = useState({
    completed: 0,
    percentage: 0,
  });
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update current time every minute to refresh working hours
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user?.role == "Employee") {
      setisEmployee(true);
    }
    fetchUserData();
    fetchbills();
    fetchEmpActivities();
    fetchProductData();
  }, [currentTime]); // Re-run when currentTime updates

  const calculateWorkingHours = (checkInTime) => {
    if (!checkInTime) return { completed: 0, percentage: 0 };

    const now = currentTime;
    const checkIn = new Date(checkInTime);

    // Calculate difference in milliseconds
    const diffMs = now - checkIn;

    // Convert to hours
    const diffHours = diffMs / (1000 * 60 * 60);

    // Round to 1 decimal place
    const roundedHours = Math.round(diffHours * 10) / 10;

    return {
      completed: roundedHours,
    };
  };

  const fetchUserData = async () => {
    try {
      console.log("Checking employee validity...");
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
      const attendance = userRes.data.data.attendance || [];
      const today = new Date().toDateString();

      const todaysEntries = attendance
        .filter((entry) => new Date(entry.date).toDateString() === today)
        .sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn));

      if (todaysEntries.length > 0) {
        const loginTime = new Date(todaysEntries[0].checkIn);
        setTodayLoginTime(loginTime.toLocaleTimeString());

        // Calculate working hours
        const hoursData = calculateWorkingHours(todaysEntries[0].checkIn);
        setWorkingHours(hoursData);
      } else {
        setTodayLoginTime(null);
        setWorkingHours({ completed: 0, percentage: 0 });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      navigate("/login");
    }
  };

  const fetchEmpActivities = async () => {
    try {
      const employeeId = user._id;
      const activities = await axios.get(
        `${API_BASE_URL}/api/employees/activities/fetch/${employeeId}`
      );
      setActivities(activities.data.data);
    } catch {}
  };

  const fetchbills = async () => {
    try {
      const billres = await axios.get(`${API_BASE_URL}/api/billing/fetch`);

      const allBills = billres.data.data;

      const today = new Date().toISOString().split("T")[0];

      const todaysBills = allBills.filter((bill) => {
        const billDate = new Date(bill.createdAt).toISOString().split("T")[0];
        return billDate === today;
      });

      const productCountMap = {};

      allBills.forEach((bill) => {
        bill.items.forEach((prod) => {
          const id = prod.productId.toString();
          productCountMap[id] = (productCountMap[id] || 0) + prod.quantity;
        });
      });

      setTopProductSalesMap(productCountMap);

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

      const soldprods = todaysBills.reduce((total, bill) => {
        return total + bill.items.reduce((sum, prod) => sum + prod.quantity, 0);
      }, 0);

      setBills(allBills);
      setTodaysbills(todaysBills);
      settopproducts(topproducts);
      settodaysoldprods(soldprods);
    } catch (error) {
      console.log("error", error);
    }
  };

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/products/fetchAll`);
      const allProducts = res.data.data;
      const lowStockItems = allProducts.filter((item) => item.stock <= 50);

      setProductsRes(allProducts);
      setLowstockItems(lowStockItems);
    } catch (err) {
      console.error("Error fetching products:", err);
    }

    try {
      setLoading(true);
      const dailysalesres = await axios.get(
        `${API_BASE_URL}/api/dailysales/fetch`
      );
      setdailysales(dailysalesres.data.data);
    } catch (err) {
      console.error("Error fetching sales:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  const handleBillingClick = () => {
    navigate("/billing", { state: { user, orders } });
  };

  const handleRecentActivityClick = () => {
    navigate("/recentactivity", { state: { user, orders, RecentActivities } });
  };

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

  const handleLowstockClick = () => {
    navigate("/stockmaintain", { state: { user, orders, productsRes } });
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
  }

  return (
    <div style={{ cursor: loading ? "wait" : "default" }}>
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
          <header className="admin-header-box">
            <div className="header-greeting">
              <h1>Welcome to the Employee Dashboard</h1>
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
                <FiLogOut /> Logout
              </button>
            </div>
          </header>

          <div className="emp-dashboard-summary">
            <div className="emp-summary-header">
              <h2 className="emp-section-title">Employee Dashboard Overview</h2>
              <div className="login-time">
                <FiClock className="icon" />
                <span>Login time: {todayLoginTime || "Not Logged In Yet"}</span>
              </div>
            </div>

            <p className="section-subtitle">Your daily performance summary</p>

            <div className="metrics-grid">
              <div className="ad-det-card">
                <div className="card-icon-wrapper products-icon">
                  <FiWatch className="card-icon" />
                </div>
                <div className="card-content">
                  <h3>Today's Working Hours</h3>
                  <p>
                    {todayLoginTime
                      ? `${workingHours.completed} hrs`
                      : "Not logged in"}
                  </p>
                </div>
              </div>

              <div className="ad-det-card">
                <div className="card-icon-wrapper products-icon">
                  <FiActivity className="card-icon" />
                </div>
                <div className="card-content">
                  <h3>Overall Todays bills</h3>
                  <p>{todaysbills.length}</p>
                </div>
              </div>

              <div className="ad-det-card">
                <div className="card-icon-wrapper products-icon">
                  <FiActivity className="card-icon" />
                </div>
                <div className="card-content">
                  <h3>Todays sold Products</h3>
                  <p>{todaysoldprods}</p>
                </div>
              </div>

              <div className="ad-det-card">
                <div className="card-icon-wrapper products-icon">
                  <FiActivity className="card-icon" />
                </div>
                <div className="card-content">
                  <h3>Today's Revenue</h3>
                  <p>
                    ₹
                    {todaysbills
                      .reduce((total, item) => total + item.grandTotal, 0)
                      .toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className=" recent-activity-section">
              <div className="popular-items">
                <div className="popular-items-header">
                  <h3>Top Selling Items</h3>
                  <span className="badge">This Week</span>
                </div>
                <ul className="items-list">
                  {popularItems.length > 0 ? (
                    popularItems.map((item, index) => {
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
                                    (topProductSalesMap[popularItems[0]?._id] ||
                                      1)) *
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
                          <span className="item-stock-price">
                            {" "}
                            {item.price}
                          </span>
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
                    <p>No product sold today</p>
                  </div>
                )}
              </div>
            </section>

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
                          <span className="item-stock-price">
                            {" "}
                            {item.price}
                          </span>
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
                <div className="emp-reac-title">
                  <span>Description</span>
                  <span>Total Amount</span>
                  <span>Date</span>
                </div>
                {RecentActivities.length > 0 ? (
                  <ul>
                    {RecentActivities.slice(0, 3).map((item, index) => (
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
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
