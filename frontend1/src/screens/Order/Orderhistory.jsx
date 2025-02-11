import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./Orderhistory.css";
import API_BASE_URL from "../../api";
import Navbar from "../navbar/Navbar";

const Orderhistory = () => {
  const location = useLocation();
  const { userId } = location.state || {}; 

  const [orders, setOrders] = useState([]);
  const [visibleItems, setVisibleItems] = useState({}); // To track visibility of items for each order
  console.log(userId);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/orders/fetch/${userId}`
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

    if (userId) {
      fetchOrders();
    }
  }, [userId]);

  // Function to toggle visibility of ordered items for a specific order
  const toggleItemsVisibility = (orderId) => {
    setVisibleItems((prevState) => ({
      ...prevState,
      [orderId]: !prevState[orderId],
    }));
  };

  return (
    <div>
      <div className="or-hi-nav">
        <Navbar userId={userId} />
      </div>

      <div className="order-history-container">
        <h2>Order History</h2>
        {orders.length > 0 ? (
          orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <span className="order-id">Order ID: {order._id}</span>
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
                          <img
                            src={item.image}
                            alt={item.name}
                          />
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
