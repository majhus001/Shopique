import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Adnavbar from "../Adnavbar/Adnavbar";
import API_BASE_URL from "../../api";
import "./ViewCustomers.css";
import Sidebar from "../sidebar/Sidebar";
import {
  FiUser,
  FiMail,
  FiHome,
  FiPhone,
  FiCalendar,
  FiClock,
  FiShoppingBag,
  FiPackage,
  FiDollarSign,
  FiCreditCard,
  FiTruck,
  FiChevronDown,
  FiChevronUp,
  FiArrowLeft,
  FiLogOut,
  FiInfo,
  FiStar,
  FiBox,
  FiTag,
  FiX,
} from "react-icons/fi";

const Userhistory = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, orders, userdata } = location.state || {};

  const [fetchedUserData, setFetchedUserData] = useState(null);
  const [orderHistory, setOrderHistory] = useState(null);
  const [isUserDataVisible, setIsUserDataVisible] = useState(true);
  const [visibleItems, setVisibleItems] = useState({});
  const [ordersCount, setOrdersCount] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isEmployee, setisEmployee] = useState(false);
    
  useEffect(() => {
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
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchbillHistory = async () => {
      try {
        setLoading(true);
        const custbillRes = await axios.get(
          `${API_BASE_URL}/api/orders/fetch/${userdata._id}`
        );
      } catch (error) {
        console.error("Error fetching order history:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userdata) {
      fetchUserData();
      fetchbillHistory();
    }
  }, [userdata]);

  const toggleItemsVisibility = (orderId) => {
    setVisibleItems((prevState) => ({
      ...prevState,
      [orderId]: !prevState[orderId],
    }));
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

  // Toggle visibility of user data and order history
  const handleToggleData = (section) => {
    if (section === "user") {
      setIsUserDataVisible(true);
    } else if (section === "orders") {
      setIsUserDataVisible(false);
    }
  };

  const handleBack = () => {
    console.log("Back button clicked");
    // Navigate to the user management page with the user and orders state
    navigate("/userman", {
      state: { user, orders },
      replace: true,
    });
  };

  // Handle sidebar collapse state change
  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  // Format date to a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
          <header className="admin-header">
            <div className="header-content">
              <div className="user-header-info">
                <h1>
                  <FiUser className="header-icon" /> {userdata?.username}
                </h1>
                <p className="user-email">
                  <FiMail className="email-icon" /> {userdata?.email}
                </p>
              </div>
              <div className="admin-actions">
                <button
                  className="back-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleBack();
                  }}
                  type="button"
                >
                  <FiArrowLeft className="btn-icon" /> Back
                </button>
                <button
                  className="logout-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleLogout();
                  }}
                  type="button"
                >
                  <FiLogOut className="btn-icon" /> Logout
                </button>
              </div>
            </div>
          </header>

          {/* Toggle tabs for User Data and Order History */}
          <div className="user-tabs">
            <button
              className={`tab-btn ${isUserDataVisible ? "active" : ""}`}
              onClick={() => handleToggleData("user")}
            >
              <FiUser className="tab-icon" /> User Profile
            </button>
            <button
              className={`tab-btn ${!isUserDataVisible ? "active" : ""}`}
              onClick={() => handleToggleData("orders")}
            >
              <FiShoppingBag className="tab-icon" /> Order History
              {ordersCount > 0 && (
                <span className="order-count">{ordersCount}</span>
              )}
            </button>
          </div>

          {/* Content container */}
          <div className="user-content-container">
            {/* User Profile Tab */}
            {isUserDataVisible ? (
              fetchedUserData ? (
                <div className="user-profile-card">
                  <div className="profile-header">
                    <h2>User Profile</h2>
                  </div>

                  <div className="profile-content">
                    <div className="profile-image-container">
                      {fetchedUserData.image ? (
                        <img
                          src={fetchedUserData.image}
                          alt={fetchedUserData.username}
                          className="profile-image"
                        />
                      ) : (
                        <div className="profile-image-placeholder">
                          <FiUser className="placeholder-icon" />
                        </div>
                      )}
                    </div>

                    <div className="profile-details">
                      <div className="detail-group">
                        <div className="detail-item">
                          <div className="detail-icon">
                            <FiUser />
                          </div>
                          <div className="detail-content">
                            <h4>Full Name</h4>
                            <p>{fetchedUserData.username || "Not provided"}</p>
                          </div>
                        </div>

                        <div className="detail-item">
                          <div className="detail-icon">
                            <FiMail />
                          </div>
                          <div className="detail-content">
                            <h4>Email Address</h4>
                            <p>{fetchedUserData.email || "Not provided"}</p>
                          </div>
                        </div>

                        <div className="detail-item">
                          <div className="detail-icon">
                            <FiPhone />
                          </div>
                          <div className="detail-content">
                            <h4>Mobile Number</h4>
                            <p>{fetchedUserData.mobile || "Not provided"}</p>
                          </div>
                        </div>

                        <div className="detail-item">
                          <div className="detail-icon">
                            <FiHome />
                          </div>
                          <div className="detail-content">
                            <h4>Address</h4>
                            <p>{fetchedUserData.address || "Not provided"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="detail-group">
                        <div className="detail-item">
                          <div className="detail-icon">
                            <FiCalendar />
                          </div>
                          <div className="detail-content">
                            <h4>Account Created</h4>
                            <p>{formatDate(fetchedUserData.createdAt)}</p>
                          </div>
                        </div>

                        <div className="detail-item">
                          <div className="detail-icon">
                            <FiClock />
                          </div>
                          <div className="detail-content">
                            <h4>Last Updated</h4>
                            <p>{formatDate(fetchedUserData.updatedAt)}</p>
                          </div>
                        </div>

                        <div className="detail-item">
                          <div className="detail-icon">
                            <FiShoppingBag />
                          </div>
                          <div className="detail-content">
                            <h4>Total Orders</h4>
                            <p>{ordersCount || "0"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading user data...</p>
                </div>
              )
            ) : // Order History Tab
            orderHistory ? (
              <div className="order-history-container">
                <div className="order-history-header">
                  <h2>
                    <FiShoppingBag className="section-icon" /> Order History
                  </h2>
                  <div className="order-count-badge">
                    {orderHistory.length}{" "}
                    {orderHistory.length === 1 ? "Order" : "Orders"}
                  </div>
                </div>

                {orderHistory.length > 0 ? (
                  <div className="order-list">
                    {Array.isArray(orderHistory) &&
                      orderHistory.map((order) => {
                        // Skip rendering if order is invalid
                        if (!order || typeof order !== "object") {
                          return null;
                        }

                        return (
                          <div
                            key={
                              order._id ||
                              `order-${Math.random()
                                .toString(36)
                                .substring(2, 9)}`
                            }
                            className="order-card"
                          >
                            <div className="order-card-header">
                              <div className="order-id-container">
                                <span className="order-label">Order ID</span>
                                <span className="order-id">
                                  {order._id || "Unknown ID"}
                                </span>
                              </div>
                              <div className="order-status-container">
                                <span
                                  className={`order-status ${
                                    order.OrderStatus === "Accepted"
                                      ? "accepted"
                                      : order.OrderStatus === "Pending"
                                      ? "pending"
                                      : order.OrderStatus === "Delivered"
                                      ? "delivered"
                                      : order.OrderStatus === "Cancelled"
                                      ? "cancelled"
                                      : "other"
                                  }`}
                                >
                                  {order.OrderStatus === "Accepted" ? (
                                    <>
                                      <FiTruck /> Order Accepted
                                    </>
                                  ) : order.OrderStatus === "Pending" ? (
                                    <>
                                      <FiClock /> Pending
                                    </>
                                  ) : order.OrderStatus === "Delivered" ? (
                                    <>
                                      <FiPackage /> Delivered
                                    </>
                                  ) : order.OrderStatus === "Cancelled" ? (
                                    <>
                                      <FiX /> Cancelled
                                    </>
                                  ) : (
                                    <>{order.OrderStatus || "Unknown Status"}</>
                                  )}
                                </span>
                              </div>
                            </div>

                            <div className="order-card-body">
                              <div className="order-info-grid">
                                <div className="order-info-item">
                                  <div className="info-icon">
                                    <FiHome />
                                  </div>
                                  <div className="info-content">
                                    <h4>Delivery Address</h4>
                                    <p>
                                      {order.deliveryAddress || "Not provided"}
                                    </p>
                                  </div>
                                </div>

                                <div className="order-info-item">
                                  <div className="info-icon">
                                    <FiPhone />
                                  </div>
                                  <div className="info-content">
                                    <h4>Contact Number</h4>
                                    <p>
                                      {order.mobileNumber || "Not provided"}
                                    </p>
                                  </div>
                                </div>

                                <div className="order-info-item">
                                  <div className="info-icon">
                                    <FiCreditCard />
                                  </div>
                                  <div className="info-content">
                                    <h4>Payment Method</h4>
                                    <p>
                                      {order.paymentMethod || "Not provided"}
                                    </p>
                                  </div>
                                </div>

                                <div className="order-info-item">
                                  <div className="info-icon">
                                    <FiDollarSign />
                                  </div>
                                  <div className="info-content">
                                    <h4>Total Amount</h4>
                                    <p className="price">
                                      ₹{order.totalPrice || "0"}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="order-items-section">
                                <button
                                  className="toggle-items-btn"
                                  onClick={() =>
                                    toggleItemsVisibility(order._id)
                                  }
                                >
                                  {visibleItems[order._id] ? (
                                    <>
                                      Hide Items{" "}
                                      <FiChevronUp className="toggle-icon" />
                                    </>
                                  ) : (
                                    <>
                                      View Items{" "}
                                      <FiChevronDown className="toggle-icon" />
                                    </>
                                  )}
                                </button>

                                {visibleItems[order._id] && (
                                  <div className="ordered-items">
                                    <h3 className="items-heading">
                                      Ordered Items
                                    </h3>

                                    <div className="items-grid">
                                      {Array.isArray(order.OrderedItems) ? (
                                        order.OrderedItems.length > 0 ? (
                                          order.OrderedItems.map(
                                            (item, index) => (
                                              <div
                                                key={index}
                                                className="item-card"
                                              >
                                                <div className="item-image-container">
                                                  {item && item.image ? (
                                                    <img
                                                      src={item.image}
                                                      alt={
                                                        item.name || "Product"
                                                      }
                                                      className="item-image"
                                                      onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.style.display =
                                                          "none";
                                                        e.target.parentNode.innerHTML =
                                                          '<div class="item-image-placeholder"><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg></div>';
                                                      }}
                                                    />
                                                  ) : (
                                                    <div className="item-image-placeholder">
                                                      <FiBox />
                                                    </div>
                                                  )}
                                                </div>

                                                <div className="item-info">
                                                  <h4 className="item-name">
                                                    {item?.name ||
                                                      "Unknown Item"}
                                                  </h4>

                                                  <div className="item-details-grid">
                                                    <div className="item-detail">
                                                      <span className="detail-label">
                                                        <FiDollarSign /> Price:
                                                      </span>
                                                      <span className="detail-value">
                                                        ₹{item?.price || "0"}
                                                      </span>
                                                    </div>

                                                    <div className="item-detail">
                                                      <span className="detail-label">
                                                        <FiTag /> Brand:
                                                      </span>
                                                      <span className="detail-value">
                                                        {item?.brand ||
                                                          "Not available"}
                                                      </span>
                                                    </div>

                                                    <div className="item-detail">
                                                      <span className="detail-label">
                                                        <FiPackage /> Quantity:
                                                      </span>
                                                      <span className="detail-value">
                                                        {item?.quantity || "1"}
                                                      </span>
                                                    </div>

                                                    <div className="item-detail">
                                                      <span className="detail-label">
                                                        <FiBox /> Category:
                                                      </span>
                                                      <span className="detail-value">
                                                        {item?.category ||
                                                          "Other"}
                                                      </span>
                                                    </div>

                                                    <div className="item-detail">
                                                      <span className="detail-label">
                                                        <FiStar /> Rating:
                                                      </span>
                                                      <span className="detail-value">
                                                        {item?.rating ||
                                                          "No rating"}
                                                      </span>
                                                    </div>
                                                  </div>

                                                  {item?.description && (
                                                    <div className="item-description">
                                                      <span className="description-label">
                                                        <FiInfo /> Description:
                                                      </span>
                                                      <p className="description-text">
                                                        {item.description}
                                                      </p>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            )
                                          )
                                        ) : (
                                          <div className="no-items-message">
                                            <FiBox className="no-items-icon" />
                                            <p>No items found in this order</p>
                                          </div>
                                        )
                                      ) : (
                                        <div className="no-items-message">
                                          <FiBox className="no-items-icon" />
                                          <p>No items data available</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="no-orders">
                    <FiShoppingBag className="no-orders-icon" />
                    <p>No orders found for this user.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading order history...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Userhistory;
