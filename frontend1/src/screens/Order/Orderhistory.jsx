import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Orderhistory.css";
import "../../App.css";
import normalizeError from "../../utils/Error/NormalizeError";
import ErrorDisplay from "../../utils/Error/ErrorDisplay";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import HandleProdlistNavigation from "../../utils/Navigation/ProdlistNavigation";
import API_BASE_URL from "../../api";
import Sidebar from "../../components/sidebar/Sidebar";
import { FaTimes, FaArrowRight } from "react-icons/fa";
import {
  MdDeliveryDining,
  MdPendingActions,
  MdCancel,
  MdCheckCircle,
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "../../components/Bottom Navbar/BottomNav";
import AuthRequired from "../../components/Authentication/AuthRequired";

const Orderhistory = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const hasFetchedOrders = useRef();
  const user = useSelector((state) => state.user);

  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(user?.isLoggedIn);
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const SkeletonLoading = () => {
    return (
      <div className="ordhis-skeleton-loading-container">
        {/* Header skeleton */}
        <div className="ordhis-skeleton-header">
          <div className="ordhis-skeleton-title"></div>
          <div className="ordhis-skeleton-subtitle"></div>
        </div>

        {/* Filter skeletons */}
        <div className="ordhis-skeleton-filters">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="ordhis-skeleton-filter"></div>
          ))}
        </div>

        {/* Order skeletons */}
        <div className="ordhis-skeleton-orders">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="ordhis-skeleton-order">
              <div className="ordhis-skeleton-order-header">
                <div className="ordhis-skeleton-order-meta">
                  <div className="ordhis-skeleton-text short"></div>
                  <div className="ordhis-skeleton-text short"></div>
                </div>
                <div className="ordhis-skeleton-status"></div>
              </div>
              <div className="ordhis-skeleton-order-summary">
                <div className="ordhis-skeleton-summary-item"></div>
                <div className="ordhis-skeleton-summary-item"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const fetchOrders = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${API_BASE_URL}/api/orders/fetch/${userId}`
      );

      if (response.data.success) {
        setOrders(response.data.data || []);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      if (
        err?.response &&
        err?.response?.status >= 400 &&
        err?.response?.status < 500
      ) {
        toast.error(err.response.data.message || "Error fetching order data");
      } else {
        let errorMessage = normalizeError(err);
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!user?.isLoggedIn || !user?._id || hasFetchedOrders.current) return;

      setIsLoggedIn(true);
      hasFetchedOrders.current = true;
      await fetchOrders(user._id);
    };

    loadData();
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
        toast.error("Failed to cancel the order. Please try again.");
      }
    } catch (error) {
      console.error("Error canceling order:", error);
      toast.error("An error occurred while canceling the order.");
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
    navigate(`/${path}`);
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

  const filteredOrders =
    filter === "All"
      ? orders
      : orders.filter((order) => order.OrderStatus === filter);

  const orderCounts = orders.reduce(
    (acc, order) => {
      acc[order.OrderStatus] = (acc[order.OrderStatus] || 0) + 1;
      return acc;
    },
    { All: orders.length }
  );

  if (error) {
    return (
      <div className="usprof-container">
        <ErrorDisplay
          error={error}
          onRetry={() => user?._id && fetchOrders(user._id)}
        />
      </div>
    );
  }

  return (
    <div className="order-history-container">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
      {!isLoggedIn ? (
        <AuthRequired message="Please login to view your order history" />
      ) : (
        <div className="orderhis-main-cont">
          <Sidebar />
          <div className="order-history-content">
            {loading ? (
              <SkeletonLoading />
            ) : (
              <>
                <div className="order-history-header-container">
                  <div className="order-history-header-title-tag">
                    <motion.h1
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="ord-his-header-title"
                    >
                      My Orders
                    </motion.h1>
                    <p>View and manage your recent purchases</p>
                  </div>
                  <div className="order-filters">
                    {[
                      "All",
                      "Pending",
                      "Accepted",
                      "Completed",
                      "Cancelled",
                    ].map((status) => (
                      <button
                        key={status}
                        className={`ord-his-filter-btn ${
                          filter === status ? "active" : ""
                        }`}
                        onClick={() => setFilter(status)}
                      >
                        {status}{" "}
                        {orderCounts[status] ? `(${orderCounts[status]})` : ""}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredOrders.length > 0 ? (
                  <div className="orders-list">
                    <div>
                      {filteredOrders.map((order) => (
                        <motion.div
                          key={order._id}
                          className={`order-card ${
                            expandedOrder === order._id ? "expanded" : ""
                          }`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.3 }}
                          layout
                          onClick={() => toggleOrderExpand(order._id)}
                        >
                          <div className="order-card-header">
                            <div className="order-meta">
                              <span className="order-id">
                                Order #{order._id.toUpperCase().slice(0, 8)}
                              </span>
                              <span className="order-date">
                                {formatDate(order.createdAt)}
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
                              <span>
                                {statusConfig[order.OrderStatus]?.text}
                              </span>
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
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <div className="delivery-info">
                                  <span>Delivery to:</span>
                                  <strong className="ord-his-truncated-name">
                                    {order.deliveryAddress}
                                  </strong>
                                </div>
                                <div className="delivery-info">
                                  <span>Delivery fee:</span>
                                  <strong>{order.deliveryfee}</strong>
                                </div>
                                <div className="payment-info">
                                  <span>Payment:</span>
                                  <strong>{order.paymentMethod}</strong>
                                </div>

                                <div className="order-items">
                                  {order.OrderedItems.map((item, index) => (
                                    <div key={index} className="order-item">
                                      <img
                                        className="item-image"
                                        src={
                                          item.image ||
                                          "https://via.placeholder.com/80?text=No+Image"
                                        }
                                        alt={item.name}
                                        onError={(e) => {
                                          e.target.src =
                                            "https://via.placeholder.com/80?text=No+Image";
                                        }}
                                        onClick={(e) => {
                                          e.preventDefault();

                                          HandleProdlistNavigation(
                                            item,
                                            navigate
                                          );
                                        }}
                                      />
                                      <div className="item-details-cont">
                                        <h4
                                          className="ord-his-truncated-name"
                                          onClick={(e) => {
                                            e.preventDefault();

                                            HandleProdlistNavigation(
                                              item,
                                              navigate
                                            );
                                          }}
                                        >
                                          {item.name}
                                        </h4>
                                        <div className="ord-his-item-details-info">
                                          <div className="item-details">
                                            <span>Price :</span>
                                            <span className="item-price">
                                              {formatCurrency(item.price)}
                                            </span>
                                          </div>
                                          <div className="item-details ord-item-quantity">
                                            <span>Quantity :</span>
                                            <span>{item.quantity}</span>
                                          </div>
                                          <div className="item-details">
                                            <span>Total :</span>
                                            <span className="item-subtotal">
                                              {formatCurrency(
                                                item.price * item.quantity
                                              )}
                                            </span>
                                          </div>
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
                      <p>
                        You don't have any {filter.toLowerCase()} orders yet
                      </p>
                      <button
                        className="shop-now-btn"
                        onClick={() => handleNavigation("home")}
                      >
                        Browse Products <FaArrowRight className="arrow-icon" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Orderhistory;
