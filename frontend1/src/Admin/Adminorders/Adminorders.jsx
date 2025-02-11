import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios"; // Importing axios for API requests
import "./Adminorders.css";
import Adnavbar from "../Adnavbar/Adnavbar";
import API_BASE_URL from "../../api"

const Adminorders = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, user, orders } = location.state || {};
  const [visibleItems, setVisibleItems] = useState({});
  const [filteredOrders, setFilteredOrders] = useState(orders); 

  const toggleItemsVisibility = (orderId) => {
    setVisibleItems((prevState) => ({
      ...prevState,
      [orderId]: !prevState[orderId],
    }));
  };

  // Function to handle accepting the order
  const handleOrderAccept = async (orderId) => {
    console.log(`Order with ID: ${orderId} accepted`);

    try {
      // Update the order status to "Accepted"
      const response = await axios.put(
        `${API_BASE_URL}/api/admin/update-orders`,
        {
          orderId,
          status: "Accepted", // You can customize the status as per your needs
        }
      );

      if (response.status === 200) {
        console.log(`Order with ID: ${orderId} has been successfully accepted`);

        // Directly modify the filteredOrders state without need for useEffect
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
      alert("There was an error accepting the order. Please try again.");
    }
  };

  const handleDashclk = () => {
    navigate("/adhome", { state: { userId, user } });
  };

  const handleprofileclk = () => {
    navigate("/adprof", { state: { userId, user, orders } });
  };

  const handleUsemanclk = () => {
    navigate("/userman", { state: { userId, user, orders  } });
  };

  const handleOrderclk = () => {
    navigate("/adorders", { state: { userId, user, orders } });
  };

  
  const handleProdclk = () =>{
    navigate("/adprodlist", { state: { userId, user, orders } });
  }

  const handleLogout = () => {
    navigate("/home");
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
  };

  return (
    <div>
      <div className="ad-nav">
        <Adnavbar userId={userId} user={user} />
      </div>
      <div className="admin-container">
        <div className="admin-sidebar">
          <div className="ad-sb-img-cont">
            {user?.image ? (
              <img
                src={user.image}
                alt="admin"
                className="ad-sb-img"
              />
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
                <button className="ad-sb-btns"  onClick={handleProdclk}>
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
            <h1>Order Details</h1>
            <div className="admin-info">
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </header>

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
            {filteredOrders && filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
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

                  {/* Accept Order Button for Pending Orders */}
                  {order.OrderStatus === "Pending" && (
                    <button
                      className="ad-or-d-btn"
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
        </div>
      </div>
    </div>
  );
};

export default Adminorders;
