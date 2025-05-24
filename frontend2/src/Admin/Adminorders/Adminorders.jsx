import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios"; // Importing axios for API requests
import "./Adminorders.css";
import Adnavbar from "../Adnavbar/Adnavbar";
import Sidebar from "../sidebar/Sidebar";
import API_BASE_URL from "../../api";
import { FiLogOut } from "react-icons/fi";

const Adminorders = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const stateUser = location.state?.user || null;
  const stateOrders = location.state?.orders || null;

  const [user, setUser] = useState(stateUser);
  const [orders, setOrders] = useState(stateOrders);
  const [visibleItems, setVisibleItems] = useState({});
  const [expandedDetails, setExpandedDetails] = useState({});
  const [expandedActions, setExpandedActions] = useState({});
  const [loadingOrderId, setLoadingOrderId] = useState(null);
  const [filteredOrders, setFilteredOrders] = useState(orders);
  const [searchOrderId, setSearchOrderId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const ordersPerPage = 10;

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const fetchUserData = async () => {
    try {
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
    } catch (error) {
      console.error("Error fetching user:", error);
      navigate("/login");
    }
  };

  // Function to fetch order data from backend if not available in state
  const fetchOrderData = async () => {
    try {
      const OrdersRes = await axios.get(
        `${API_BASE_URL}/api/admin/pendingorders`
      );
      setOrders(OrdersRes.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchOrderData();
  }, []);

  const toggleItemsVisibility = (orderId) => {
    setVisibleItems((prevState) => ({
      ...prevState,
      [orderId]: !prevState[orderId],
    }));
  };

  const toggleDetailsVisibility = (orderId) => {
    setExpandedDetails((prevState) => ({
      ...prevState,
      [orderId]: !prevState[orderId],
    }));
  };

  const toggleActionsVisibility = (orderId) => {
    setExpandedActions((prevState) => ({
      ...prevState,
      [orderId]: !prevState[orderId],
    }));
  };

  const handleOrderAccept = async (orderId) => {
    try {
      setLoadingOrderId(orderId);
      const response = await axios.put(
        `${API_BASE_URL}/api/admin/update-orders`,
        {
          orderId,
          status: "Accepted",
        }
      );
      if (response.status === 200) {
        const order = response.data.order;
        const orduser = response.data.user;
        GenerateUserReport(orduser, order);
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId
              ? { ...order, OrderStatus: "Accepted" }
              : order
          )
        );

        setFilteredOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId
              ? { ...order, OrderStatus: "Accepted" }
              : order
          )
        );
      }
    } catch (error) {
      console.error("Error accepting the order:", error);
    } finally {
      setLoadingOrderId(null);
    }
  };

  // Complete Order Function
  const handleCompleteOrd = async (orderId) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/admin/update-orders`,
        {
          orderId,
          status: "Completed",
        }
      );

      if (response.status === 200) {
        // Update both orders and filteredOrders
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId
              ? { ...order, OrderStatus: "Completed" }
              : order
          )
        );
        setFilteredOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId
              ? { ...order, OrderStatus: "Completed" }
              : order
          )
        );
      }
    } catch (error) {
      console.error("Error completing the order:", error);
    }
  };

  useEffect(() => {
    if (searchOrderId.trim() === "") {
      setFilteredOrders(orders); // If empty, show all orders
    } else {
      const searchedOrders = orders.filter((order) =>
        order._id.toLowerCase().startsWith(searchOrderId.trim().toLowerCase())
      );
      setFilteredOrders(searchedOrders);
    }
    setCurrentPage(1); // Reset to first page on search
  }, [searchOrderId, orders]);

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

  const handleFilterOrders = (status) => {
    if (status === "All") {
      setFilteredOrders(orders); // Show all orders if 'All' is selected
    } else {
      const filtered = orders.filter(
        (order) => order.OrderStatus.toLowerCase() === status.toLowerCase()
      );
      setFilteredOrders(filtered);
    }
    setCurrentPage(1);
  };

  const GenerateUserReport = async (orduser, order) => {
    const reportData = {
      orderId: order._id,
      username: orduser.username,
      email: orduser.email,
      mobile: orduser.mobile,
      address: orduser.address,
      pincode: order.pincode || orduser.address,
      generatedAt: new Date().toISOString(), // Timestamp
    };

    try {
      console.log("hiiii");
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/reports/generate`,
        reportData
      );

      navigate("/generateuserreport", {
        state: { orduser, order, user, orders },
      });
    } catch (error) {
      console.error("Error storing report:", error);
    }
  };

  const handlereports = () => {
    navigate("/reports", { state: { user, orders } });
  };

  // Handle sidebar collapse state change
  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  const statusMapping = {
    Accepted: "Order Confirmed",
    Completed: "✅Delivered",
    Pending: "Pending",
    Cancelled: "Cancelled",
  };

  return (
    <div>
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
            <h1>
              <i className="fas fa-shopping-cart"></i> Orders
            </h1>
            </div>
            <div className="admin-info">
              <button className="logout-btn" onClick={handleLogout}>
                <FiLogOut /> Logout
              </button>
            </div>
          </header>

          <div className="ad-ord-search-rep">
            <div className="search-container">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                placeholder="Search by Order ID"
                value={searchOrderId}
                onChange={(e) => setSearchOrderId(e.target.value)}
                className="ad-ord-search-input"
              />
            </div>
            <button className="ad-or-d-btn" onClick={handlereports}>
              <i className="fas fa-file-alt"></i>
              <span className="btn-text">Reports</span>
            </button>
            <div className="order-stats">
              <span className="ad-ord-tot-info">
                <strong>Total</strong>
                <span>{orders.length}</span>
              </span>
              <span className="ad-ord-tot-info">
                <strong>Pending</strong>
                <span>
                  {
                    orders.filter(
                      (filorder) =>
                        filorder.OrderStatus.toLowerCase() === "pending"
                    ).length
                  }
                </span>
              </span>
              <span className="ad-ord-tot-info">
                <strong>Ongoing</strong>
                <span>
                  {
                    orders.filter(
                      (filorder) =>
                        filorder.OrderStatus.toLowerCase() === "accepted"
                    ).length
                  }
                </span>
              </span>
            </div>
          </div>
          <div className="ad-or-nav">
            <div
              className="filter-btn"
              onClick={() => handleFilterOrders("Pending")}
            >
              <i className="fas fa-clock"></i> Pending
            </div>
            <div
              className="filter-btn"
              onClick={() => handleFilterOrders("Accepted")}
            >
              <i className="fas fa-spinner"></i> Accepted
            </div>
            <div
              className="filter-btn"
              onClick={() => handleFilterOrders("Completed")}
            >
              <i className="fas fa-check-circle"></i> Completed
            </div>
            <div
              className="filter-btn"
              onClick={() => handleFilterOrders("Cancelled")}
            >
              <i className="fas fa-times-circle"></i> Cancelled
            </div>
            <div
              className="filter-btn"
              onClick={() => handleFilterOrders("All")}
            >
              <i className="fas fa-list"></i> All
            </div>
          </div>

          <div>
            {currentOrders && currentOrders.length > 0 ? (
              currentOrders.map((order) => (
                <div key={order._id} className="order-card">
                  <div
                    className="order-header"
                    onClick={() => toggleDetailsVisibility(order._id)}
                  >
                    <span className="order-id">Order ID: {order._id}</span>
                    <div className="header-right">
                      <span
                        className={`order-status ${order.OrderStatus.toLowerCase()}`}
                      >
                        {statusMapping[order.OrderStatus] || order.OrderStatus}
                      </span>
                      <span className="toggle-indicator">
                        <i
                          className={`fas fa-${
                            expandedDetails[order._id]
                              ? "chevron-up"
                              : "chevron-down"
                          }`}
                        ></i>
                      </span>
                    </div>
                  </div>

                  <div
                    className={`order-details ${
                      expandedDetails[order._id] ? "expanded" : ""
                    }`}
                  >
                    <p>
                      <strong>Delivery Address:</strong> {order.deliveryAddress}
                    </p>
                    <p>
                      <strong>Pincode:</strong> {order.pincode}
                    </p>
                    <p>
                      <strong>Mobile Number:</strong> {order.mobileNumber}
                    </p>
                    <p>
                      <strong>Payment Method:</strong> {order.paymentMethod}
                    </p>
                    <p>
                      <strong>Total Price:</strong> ₹{order.totalPrice}
                    </p>

                    <div
                      className="toggle-indicator"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleItemsVisibility(order._id);
                      }}
                    >
                      {visibleItems[order._id] ? "Hide Items" : "View Items"}
                      <i
                        className={`fas fa-${
                          visibleItems[order._id]
                            ? "chevron-up"
                            : "chevron-down"
                        }`}
                      ></i>
                    </div>
                  </div>

                  <div
                    className={`order-items ${
                      visibleItems[order._id] ? "expanded" : ""
                    }`}
                  >
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
                            <strong>Description:</strong> {item.description}
                          </p>
                          <p>
                            <strong>Category:</strong> {item.category}
                          </p>
                          <p>
                            <strong>Rating:</strong>{" "}
                            {item.rating ? item.rating : "No rating yet"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    className={`order-actions ${
                      expandedDetails[order._id] ? "expanded" : ""
                    }`}
                  >
                    {order.OrderStatus === "Accepted" && (
                      <button
                        className="ad-or-d-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteOrd(order._id);
                        }}
                      >
                        Complete order
                        <i className="fas fa-truck"></i>
                      </button>
                    )}

                    {order.OrderStatus === "Pending" && (
                      <button
                        className="ad-or-d-btn"
                        disabled={loadingOrderId === order._id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOrderAccept(order._id);
                        }}
                      >
                        Accept Order
                        <i className="fas fa-check-circle"></i>
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>No orders found.</p>
            )}
          </div>
          <div className="pagination-buttons">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="ad-or-d-btn"
            >
              <i className="fas fa-chevron-left"></i>
            </button>

            <span
              style={{
                padding: "0 10px",
                fontWeight: "500",
                color: "#2c3e50",
                fontSize: "0.85rem",
              }}
            >
              {currentPage}/{totalPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="ad-or-d-btn"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Adminorders;
