import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Orderhistory.css";
import "../../App.css";
import API_BASE_URL from "../../api";
import Navbar from "../navbar/Navbar";
import Sidebar from "../sidebar/Sidebar";
import {
  FaHome,
  FaListAlt,
  FaUser,
  FaShoppingCart,
  FaTimes,
  FaArrowRight,
  FaRedo,
} from "react-icons/fa";
import {
  FiLogIn,
  FiAlertCircle,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import {
  MdDeliveryDining,
  MdPendingActions,
  MdCancel,
  MdCheckCircle,
} from "react-icons/md";
import ValidUserData from "../../utils/ValidUserData";
import { motion, AnimatePresence } from "framer-motion";

const Orderhistory = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = location.state || {};

  const [userDetails, setUserDetails] = useState(user);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");

  const checkUser = async () => {
    try {
      const userData = await ValidUserData();
      if (userData) {
        setUserDetails(userData);
        setIsLoggedIn(true);
        return true;
      }
      setIsLoggedIn(false);
      return false;
    } catch (error) {
      setIsLoggedIn(false);
      setError("Error validating user session");
      console.error("Error validating user:", error);
      return false;
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${API_BASE_URL}/api/orders/fetch/${user._id}`
      );
      const result = response.data.data;
      if (result) {
        setOrders(result);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const isUserValid = await checkUser();
      if (isUserValid) {
        await fetchOrders();
      }
    };
    initialize();
  }, [user]);

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/orders/cancelorder/${orderId}`
      );
      if (response.data.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId
              ? { ...order, OrderStatus: "Cancelled" }
              : order
          )
        );
      } else {
        alert("Failed to cancel the order. Please try again.");
      }
    } catch (error) {
      console.error("Error canceling order:", error);
      alert("An error occurred while canceling the order.");
    }
  };

  const statusConfig = {
    Accepted: {
      text: "Confirmed",
      icon: <MdCheckCircle className="status-icon" />,
      color: "#10B981",
      bgColor: "#ECFDF5",
    },
    Completed: {
      text: "Delivered",
      icon: <MdDeliveryDining className="status-icon" />,
      color: "#3B82F6",
      bgColor: "#EFF6FF",
    },
    Pending: {
      text: "Processing",
      icon: <MdPendingActions className="status-icon" />,
      color: "#F59E0B",
      bgColor: "#FFFBEB",
    },
    Cancelled: {
      text: "Cancelled",
      icon: <MdCancel className="status-icon" />,
      color: "#EF4444",
      bgColor: "#FEF2F2",
    },
  };

  const handleNavigation = (path) => {
    navigate(`/${path}`, { state: { user: userDetails } });
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredOrders = filter === "All" 
    ? orders 
    : orders.filter(order => order.OrderStatus === filter);

  const orderCounts = orders.reduce((acc, order) => {
    acc[order.OrderStatus] = (acc[order.OrderStatus] || 0) + 1;
    return acc;
  }, {All: orders.length});

  return (
    <div className="order-history-container">
      <Navbar user={userDetails} />

      <div className="order-history-content">
        {!isLoggedIn ? (
          <motion.div 
            className="auth-required"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="auth-card">
              <FiAlertCircle className="auth-icon" />
              <h2>Sign In Required</h2>
              <p>Please login to view your order history</p>
              <button
                className="auth-button"
                onClick={() => handleNavigation("login")}
              >
                <FiLogIn className="btn-icon" />
                Sign In
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            <Sidebar user={userDetails} />
            <div className="order-history-main">
              <div className="order-history-header-container">
                <div className="order-history-header">
                  <motion.h1 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    My Orders
                  </motion.h1>
                  <p>View and manage your recent purchases</p>
                  
                  <div className="order-filters">
                    {['All', 'Pending', 'Accepted', 'Completed', 'Cancelled'].map((status) => (
                      <button
                        key={status}
                        className={`filter-btn ${filter === status ? 'active' : ''}`}
                        onClick={() => setFilter(status)}
                      >
                        {status} {orderCounts[status] ? `(${orderCounts[status]})` : ''}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {loading ? (
                <motion.div 
                  className="loading-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="loading-spinner"></div>
                  <p>Loading your orders...</p>
                </motion.div>
              ) : error ? (
                <motion.div 
                  className="error-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <FiAlertCircle className="error-icon" />
                  <p>{error}</p>
                  <button onClick={fetchOrders} className="retry-button">
                    <FaRedo className="retry-icon" />
                    Try Again
                  </button>
                </motion.div>
              ) : filteredOrders.length > 0 ? (
                <div className="orders-list">
                  <div>
                    {filteredOrders.map((order) => (
                      <motion.div
                        key={order._id}
                        className={`order-card ${expandedOrder === order._id ? 'expanded' : ''}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        layout
                        onClick={() => toggleOrderExpand(order._id)}
                      >
                        <div className="order-card-header">
                          <div className="order-meta">
                            <span className="order-date">
                              {formatDate(order.createdAt)}
                            </span>
                            <span className="order-id">
                              Order #{order._id.slice(-8).toUpperCase()}
                            </span>
                          </div>
                          <div
                            className="order-status"
                            style={{
                              color: statusConfig[order.OrderStatus]?.color,
                              backgroundColor:
                                statusConfig[order.OrderStatus]?.bgColor,
                            }}
                          >
                            {statusConfig[order.OrderStatus]?.icon}
                            <span>{statusConfig[order.OrderStatus]?.text}</span>
                          </div>
                        </div>

                        <div className="order-summary">
                          <div className="summary-item">
                            <span>Total:</span>
                            <strong className="order-total">
                              {formatCurrency(order.totalPrice)}
                            </strong>
                          </div>
                          <div className="summary-item">
                            <span>Items:</span>
                            <strong>{order.OrderedItems.length}</strong>
                          </div>
                        </div>

                        <AnimatePresence>
                          {expandedOrder === order._id && (
                            <motion.div
                              className="order-details"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="delivery-info">
                                <span>Delivery to:</span>
                                <strong>{order.deliveryAddress}</strong>
                              </div>
                              <div className="payment-info">
                                <span>Payment:</span>
                                <strong>{order.paymentMethod}</strong>
                              </div>

                              <div className="order-items">
                                {order.OrderedItems.map((item, index) => (
                                  <div key={index} className="order-item">
                                    <div className="item-image">
                                      <img
                                        src={
                                          item.image ||
                                          "https://via.placeholder.com/80?text=No+Image"
                                        }
                                        alt={item.name}
                                        onError={(e) => {
                                          e.target.src =
                                            "https://via.placeholder.com/80?text=No+Image";
                                        }}
                                      />
                                    </div>
                                    <div className="item-details">
                                      <h4>{item.name}</h4>
                                      <div className="item-meta">
                                        <span className="item-price">
                                          {formatCurrency(item.price)} ×{" "}
                                          {item.quantity}
                                        </span>
                                        <span className="item-subtotal">
                                          {formatCurrency(item.price * item.quantity)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {order.OrderStatus === "Pending" && (
                                <button
                                  className="cancel-order-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelOrder(order._id);
                                  }}
                                >
                                  <FaTimes className="cancel-icon" />
                                  Cancel Order
                                </button>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <motion.div 
                  className="empty-orders"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="empty-content">
                    <img
                      src="https://cdn.dribbble.com/users/5107895/screenshots/14532312/media/a7e6c2e9333d0989e3a54c95dd8321d7.gif"
                      alt="No orders found"
                    />
                    <h2>No Orders Found</h2>
                    <p>You don't have any {filter.toLowerCase()} orders yet</p>
                    <button
                      className="shop-now-btn"
                      onClick={() => handleNavigation("products")}
                    >
                      Browse Products <FaArrowRight className="arrow-icon" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="bottom-nav">
        <button
          className="bot-nav-btn"
          onClick={() => handleNavigation("home")}
        >
          <FaHome />
          <span>Home</span>
        </button>
        <button
          className="bot-nav-btn bot-active"
          onClick={() => handleNavigation("myorders")}
        >
          <FaListAlt />
          <span>Orders</span>
        </button>
        <button
          className="bot-nav-btn"
          onClick={() => handleNavigation("profilepage")}
        >
          <FaUser />
          <span>Account</span>
        </button>
        <button
          className="bot-nav-btn"
          onClick={() => handleNavigation("cart")}
        >
          <FaShoppingCart />
          <span>Cart</span>
        </button>
      </div>
    </div>
  );
};

export default Orderhistory;