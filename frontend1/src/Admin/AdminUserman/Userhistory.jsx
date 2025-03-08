import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Adnavbar from "../Adnavbar/Adnavbar";
import API_BASE_URL from "../../api";
import "./Userhistory.css";

const Userhistory = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, orders, userdata } = location.state || {};

  const [fetchedUserData, setFetchedUserData] = useState(null);
  const [orderHistory, setOrderHistory] = useState(null);
  const [isUserDataVisible, setIsUserDataVisible] = useState(true);
  const [visibleItems, setVisibleItems] = useState({});
  const [ordersCount, setOrdersCount] = useState("");

  // Fetch user data and order history
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const UserdataRes = await axios.get(
          `${API_BASE_URL}/api/auth/fetch/${userdata._id}`
        );
        setFetchedUserData(UserdataRes.data.data); // Store the fetched user data
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchOrderHistory = async () => {
      try {
        const UserorderhisRes = await axios.get(
          `${API_BASE_URL}/api/orders/fetch/${userdata._id}`
        );
        if (UserorderhisRes) {
          setOrderHistory(UserorderhisRes.data.data);
          setOrdersCount(UserorderhisRes.data.data.length);
        } else {
          setOrderHistory([]);
        }
      } catch (error) {
        console.error("Error fetching order history:", error);
      }
    };

    if (userdata) {
      fetchUserData();
      fetchOrderHistory();
    }
  }, [userdata]);

  const toggleItemsVisibility = (orderId) => {
    setVisibleItems((prevState) => ({
      ...prevState,
      [orderId]: !prevState[orderId],
    }));
  };

  // Handle navigation
  const handleDashclk = () => {
    navigate("/adhome", { state: { userId, user, orders } });
  };
  const handleprofileclk = () => {
    navigate("/adprof", { state: { userId, user, orders } });
  };
  const handleUsemanclk = () => {
    navigate("/userman", { state: { userId, user, orders } });
  };
  const handleOrderclk = () => {
    navigate("/adorders", { state: { userId, user, orders } });
  };
  const handleProdclk = () => {
    navigate("/adprodlist", { state: { userId, user, orders } });
  };
  const handleLogout = () => {
    navigate("/home");
  };

  // Toggle visibility of user data and order history
  const handleToggleData = (section) => {
    if (section === "user") {
      setIsUserDataVisible(true);
    } else if (section === "orders") {
      setIsUserDataVisible(false);
    }
  };

  return (
    <div>
      <div className="ad-nav">
        <Adnavbar user={user} />
      </div>
      <div className="admin-container">
        <div className="admin-sidebar">
          <div className="ad-sb-img-cont">
            {user?.image ? (
              <img src={user.image} alt="admin" className="ad-sb-img" />
            ) : (
              <div className="placeholder-img">No Image</div>
            )}
            <h4 className="ad-sb-username">{user?.username || "Admin"}</h4>
          </div>
          <div className="ad-sb-list-cont">
            <ul className="ad-sb-list-items">
              <li>
                <button className="ad-sb-btns" onClick={handleDashclk}>
                  Dashboard
                </button>
              </li>
              <li>
                <button className="ad-sb-btns" onClick={handleprofileclk}>
                  Profile
                </button>
              </li>
              <li>
                <button className="ad-sb-btns" onClick={handleUsemanclk}>
                  User Management
                </button>
              </li>
              <li>
                <button className="ad-sb-btns" onClick={handleOrderclk}>
                  Orders
                </button>
              </li>
              <li>
                <button className="ad-sb-btns" onClick={handleProdclk}>
                  Products
                </button>
              </li>
              <li>
                <button className="ad-sb-btns">Settings</button>
              </li>
            </ul>
          </div>
        </div>
        <div className="main-content">
          <header className="admin-header">
            <h1>{userdata?.username}</h1>
            <h3>{userdata?.email}</h3>
            <div className="admin-info">
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </header>

          {/* Toggle buttons for User Data and Order History */}
          <div className="ad-or-nav">
            <h4 className="ad-userhis-filbtn" onClick={() => handleToggleData("user")}>
              Users Data
            </h4>
            <h4
              className="ad-userhis-filbtn"
              onClick={() => handleToggleData("orders")}
            >
              Orders History
            </h4>
          </div>

          {/* Show user data */}
          <div className="ad-user-data-container">
            {isUserDataVisible ? (
              fetchedUserData ? (
                <div className="ad-us-fd-ud">
                  <h4>Fetched User Details</h4>
                  <div className="ad-us-dt-cont">
                    <div className="ad-us-det-tit">
                      <p>
                        <strong>Username</strong>
                      </p>
                      <p>
                        <strong>Email</strong>
                      </p>
                      <p>
                        <strong>Address</strong>
                      </p>
                      <p>
                        <strong>Mobile Number </strong>
                      </p>
                      <p>
                        <strong>Account created At</strong>
                      </p>
                      <p>
                        <strong>Profile updated At</strong>
                      </p>
                      <p>
                        <strong>Total orders</strong>
                      </p>
                    </div>
                    <div className="ad-us-det-dt">
                      <p>: {fetchedUserData.username}</p>
                      <p>: {fetchedUserData.email}</p>
                      <p>: {fetchedUserData.address}</p>
                      <p>: {fetchedUserData.mobile}</p>
                      <p>: {fetchedUserData.createdAt}</p>
                      <p>: {fetchedUserData.updatedAt}</p>
                      <p>: {ordersCount}</p>
                    </div>
                    <div className="ad-us-det-img">
                        <img src={fetchedUserData.image} alt="no image"/>
                    </div>
                  </div>
                </div>
              ) : (
                <p>Loading user data...</p>
              )
            ) : // Show order history
            orderHistory ? (
              <div className="ad-us-fd-orh">
                <h4>Order History</h4>
                <ul>
                  {orderHistory.length > 0 ? (
                    orderHistory.map((order) => (
                      <div key={order._id} className="order-card">
                        <div className="order-header">
                          <span className="order-id">
                            Order ID: {order._id}
                          </span>
                          {/* Updated order status display logic */}
                          <span
                            className={`order-status ${
                              order.OrderStatus === "Accepted"
                                ? "accepted"
                                : order.OrderStatus.toLowerCase()
                            }`}
                          >
                            {order.OrderStatus === "Accepted"
                              ? "Order completed"
                              : order.OrderStatus}
                          </span>
                        </div>
                        <div className="order-details">
                          <p>
                            <strong>Delivery Address:</strong>{" "}
                            {order.deliveryAddress}
                          </p>
                          <p>
                            <strong>Mobile Number:</strong> {order.mobileNumber}
                          </p>
                          <p>
                            <strong>Payment Method:</strong>{" "}
                            {order.paymentMethod}
                          </p>
                          <p>
                            <strong>Total Price:</strong> ₹{order.totalPrice}
                          </p>
                        </div>
                        <div className="order-items">
                          <button
                            className="view-items-button"
                            onClick={() => toggleItemsVisibility(order._id)}
                          >
                            {visibleItems[order._id]
                              ? "Hide Ordered Items"
                              : "View Ordered Items"}
                          </button>
                          {visibleItems[order._id] && (
                            <div>
                              <h4>Ordered Items:</h4>
                              {order.OrderedItems.map((item, index) => (
                                <div key={index} className="order-item">
                                  <div className="item-image">
                                    <img src={item.image} alt={item.name} />
                                  </div>
                                  <div className="item-details">
                                    <p>
                                      <strong>Item:</strong> {item.name}
                                    </p>
                                    <p>
                                      <strong>Price:</strong> ₹{item.price}
                                    </p>
                                    <p>
                                      <strong>Brand:</strong>{" "}
                                      {item.brand || "Not available"}
                                    </p>
                                    <p>
                                      <strong>Quantity:</strong> {item.quantity}
                                    </p>
                                    <p>
                                      <strong>Description:</strong>{" "}
                                      {item.description}
                                    </p>
                                    <p>
                                      <strong>Category:</strong> {item.category}
                                    </p>
                                    <p>
                                      <strong>Rating:</strong>{" "}
                                      {item.rating
                                        ? item.rating
                                        : "No rating yet"}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No orders found for this user.</p>
                  )}
                </ul>
              </div>
            ) : (
              <p>Loading order history...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Userhistory;
