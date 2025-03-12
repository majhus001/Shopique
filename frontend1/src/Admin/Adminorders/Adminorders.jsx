import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios"; // Importing axios for API requests
import "./Adminorders.css";
import Adnavbar from "../Adnavbar/Adnavbar";
import Sidebar from "../sidebar/Sidebar";
import API_BASE_URL from "../../api";

const Adminorders = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const stateUser = location.state?.user || null;
  const stateOrders = location.state?.orders || null;

  // State for user and orders
  const [user, setUser] = useState(stateUser);
  const [orders, setOrders] = useState(stateOrders);
  const [visibleItems, setVisibleItems] = useState({});
  const [loadingOrderId, setLoadingOrderId] = useState(null);
  const [filteredOrders, setFilteredOrders] = useState(orders);
  const [searchOrderId, setSearchOrderId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
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
      console.log("User fetched from backend:", userRes.data.data);
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
        setUsersPendingOrder(
          OrdersRes.data.filter((order) => order.OrderStatus === "Pending")
        );
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
        // Update both orders and filteredOrders
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
      navigate("/home");
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
    setCurrentPage(1); // Reset to first page on filter
  };

  return (
    <div>
      <div className="ad-nav">
        <Adnavbar user={user} />
      </div>
      <div className="admin-container">
        <Sidebar user={user} orders={orders} />

        <div className="main-content">
          <header className="admin-header">
            <h1>Order Details</h1>
            <div className="admin-info">
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </header>

          <div>
            <input
              type="text"
              placeholder="Search by Order ID"
              value={searchOrderId}
              onChange={(e) => setSearchOrderId(e.target.value)} // Only update value
              className="ad-ord-search-input"
            />
          </div>
          <div className="ad-or-nav">
            <h4
              className="filter-btn"
              onClick={() => handleFilterOrders("Pending")}
            >
              Pending Orders
            </h4>
            <h4
              className="filter-btn"
              onClick={() => handleFilterOrders("Accepted")}
            >
              Accepted Orders
            </h4>
            <h4
              className="filter-btn"
              onClick={() => handleFilterOrders("Completed")}
            >
              Completed Orders
            </h4>
            <h4
              className="filter-btn"
              onClick={() => handleFilterOrders("Cancelled")}
            >
              Cancelled Orders
            </h4>
            <h4
              className="filter-btn"
              onClick={() => handleFilterOrders("All")}
            >
              All Orders
            </h4>
          </div>

          <div>
            {currentOrders && currentOrders.length > 0 ? (
              currentOrders.map((order) => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <span className="order-id">Order ID: {order._id}</span>
                    <span
                      className={`order-status ${
                        order.OrderStatus === "Accepted"
                          ? "accepted"
                          : order.OrderStatus.toLowerCase()
                      }`}
                    >
                      {order.OrderStatus === "Accepted"
                        ? "Order Accepted"
                        : order.OrderStatus}
                    </span>
                    {order.OrderStatus === "Accepted" && (
                      <button
                        className="ad-or-d-btn"
                        onClick={() => handleCompleteOrd(order._id)}
                      >
                        Complete order
                      </button>
                    )}
                  </div>
                  <div className="order-details">
                    <p>
                      <strong>Delivery Address:</strong> {order.deliveryAddress}
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
                  </div>
                  <div className="order-items">
                    <button
                      className="ad-or-d-btn"
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
                    )}
                  </div>

                  {/* Accept Order Button for Pending Orders */}
                  {order.OrderStatus === "Pending" && (
                    <button
                      className="ad-or-d-btn"
                      disabled={loadingOrderId === order._id}
                      onClick={() => handleOrderAccept(order._id)}
                    >
                      Accept Order
                    </button>
                  )}
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
              Previous
            </button>

            <span style={{ padding: "0 10px" }}>
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="ad-or-d-btn"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Adminorders;
