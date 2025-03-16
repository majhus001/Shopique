import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./Orderhistory.css";
import API_BASE_URL from "../../api";
import Navbar from "../navbar/Navbar";

const Orderhistory = () => {
  const location = useLocation();
  const { user } = location.state || {};

  const [orders, setOrders] = useState([]);
  const [visibleItems, setVisibleItems] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/orders/fetch/${user._id}`
        );
        const result = response.data.data;
        if (result) {
          setOrders(result);
        } else {
          console.log("No orders found for this user.");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  // Function to toggle visibility of ordered items for a specific order
  const toggleItemsVisibility = (orderId) => {
    setVisibleItems((prevState) => ({
      ...prevState,
      [orderId]: !prevState[orderId],
    }));
  };

  // Function to cancel an order
  const handleCancelOrder = async (orderId) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/orders/cancelorder/${orderId}`
      );
      if (response.data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId
              ? { ...order, OrderStatus: "Cancelled" }
              : order
          )
        );
      } else {
        alert("Failed to cancel the order.");
      }
    } catch (error) {
      console.error("Error canceling order:", error);
      alert("An error occurred while canceling the order.");
    }
  };

  return (
    <div>
      <div className="or-hi-nav">
        <Navbar user={user} />
      </div>

      <div className="order-history-container">
        <h2>Order History</h2>
        {orders.length > 0 ? (
          orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <span className="order-id">Order ID: {order._id}</span>

                <span
                  className={`order-status ${order.OrderStatus.toLowerCase()}`}
                >
                  {statusMapping[order.OrderStatus] || order.OrderStatus}
                </span>
              </div>

              <div className="order-details">
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
              </div>

              {/* Display cancel button if OrderStatus is "Pending" */}
              {order.OrderStatus === "Pending" && (
                <button
                  className="cancel-order-button"
                  onClick={() => handleCancelOrder(order._id)}
                >
                  Cancel Order
                </button>
              )}

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
            </div>
          ))
        ) : (
          <p>No orders found.</p>
        )}
      </div>
    </div>
  );
};

export default Orderhistory;
