import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Navbar from "../navbar/Navbar";
import axios from "axios";
import "./Orderdetails.css";
import API_BASE_URL from "../../api";
import getCoordinates from "../../utils/Geolocation";
import { motion } from "framer-motion";

const Orderdetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    cartItems = [],
    totalPrice = 0,
    deliveryfee = 0,
    platformFee = 0,
    discount = 0,
    statePincode = "",
    path,
  } = location.state || {};

  const user = location.state?.user || null;
  const [isLoggedIn, setIsLoggedIn] = useState(!!user);
  const [mobileNumber, setMobileNumber] = useState(user?.mobile || "");
  const [pincode, setPincode] = useState(statePincode);
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || "");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [isMobileDone, setIsMobileDone] = useState(false);
  const [isAddressDone, setIsAddressDone] = useState(false);
  const [isPincodeDone, setIsPincodeDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate(-1);
      return;
    }

    // Auto-mark done if fields are already filled
    if (user.mobile?.length === 10) {
      setIsMobileDone(true);
    }
    if (statePincode?.length === 6) {
      setIsPincodeDone(true);
    }
    if (user.address) {
      setIsAddressDone(true);
    }
  }, [user, navigate, statePincode]);

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      setMobileNumber(value);
      setIsMobileDone(value.length === 10);
    }
  };

  const handleAddressChange = (e) => {
    setDeliveryAddress(e.target.value);
    setIsAddressDone(!!e.target.value.trim());
  };

  const handlePlaceOrder = async () => {
    if (!isLoggedIn) {
      alert("Please login to place an order");
      return;
    }

    if (!mobileNumber || mobileNumber.length !== 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!pincode || pincode.length !== 6) {
      alert("Please enter a valid 6-digit pincode.");
      return;
    }

    if (!deliveryAddress.trim()) {
      alert("Please enter your delivery address.");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty. Please add items before placing an order.");
      return;
    }

    setPlacingOrder(true);

    try {
      const orderData = {
        userId: user._id,
        cartItems,
        totalPrice: totalPrice + deliveryfee + platformFee - discount,
        mobileNumber,
        pincode,
        deliveryAddress,
        paymentMethod,
      };

      console.log(orderData)
      const response = await axios.post(
        `${API_BASE_URL}/api/orders/add`,
        orderData
      );

      if (response.data.success) {
        await clearCart();
        
        // await axios.put(`${API_BASE_URL}/api/orders/stockupdate/`, {
        //   cartItems,
        // });

        await axios.post(`${API_BASE_URL}/api/user/reactivity/add`, {
          name: user.username,
          activity: "has Placed an order",
        });

        alert("Order placed successfully!");
        navigate("/home", { state: { user } });
      } else {
        throw new Error(response.data.message || "Failed to place order.");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert(error.message || "An error occurred. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/cart/clear/${user._id}`);
      console.log("Cart cleared successfully!");
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="ord-container">
          <div className="ord-skeleton-loading">
            <div className="ord-skeleton-header"></div>
            <div className="ord-skeleton-line"></div>
            <div className="ord-skeleton-line"></div>
            <div className="ord-skeleton-line"></div>
            <div className="ord-skeleton-line"></div>
            <div className="ord-skeleton-line"></div>
          </div>
          <div className="ord-skeleton-loading">
            <div className="ord-skeleton-header"></div>
            <div className="ord-skeleton-line"></div>
            <div className="ord-skeleton-line"></div>
            <div className="ord-skeleton-line"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="cart-navbar">
        <Navbar />
      </div>
      <motion.h1
        className="ord-checkout-title"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Your CheckOut
      </motion.h1>
      <div className="ord-container">
        <div className="ord-address-details">
          <h3>Address Details</h3>

          <div className="ord-input-group">
            {!isLoggedIn ? (
              <div className="ord-step-incomplete">
                <h4>
                  1. User Login <span className="ord-crossmark">✗</span>
                </h4>
                <h5>
                  You are not logged in. Please log in to place an order.
                  <Link to="/login" state={{ from: location }}>
                    <button className="ord-login-btn">Login</button>
                  </Link>
                </h5>
              </div>
            ) : (
              <div className="ord-step-complete">
                <h4>
                  1. User Login <span className="ord-checkmark">✓</span>
                </h4>
              </div>
            )}
          </div>

          <div className="ord-input-group">
            <h4>
              2. Mobile Number{" "}
              {isMobileDone ? (
                <span className="ord-checkmark">✓</span>
              ) : (
                <span className="ord-crossmark">✗</span>
              )}
            </h4>
            {isLoggedIn ? (
              <>
                <input
                  type="text"
                  name="mobile"
                  placeholder="Enter your mobile number"
                  value={mobileNumber}
                  onChange={handleMobileChange}
                  maxLength="10"
                  className="ord-input"
                />
                {mobileNumber.length === 10 && !isMobileDone && (
                  <button
                    className="ord-done-btn"
                    onClick={() => setIsMobileDone(true)}
                  >
                    Verify
                  </button>
                )}
              </>
            ) : (
              <p className="ord-login-required">Please log in to continue.</p>
            )}
          </div>

          <div className="ord-input-group">
            <h4>
              3. Pincode{" "}
              {isPincodeDone ? (
                <span className="ord-checkmark">✓</span>
              ) : (
                <span className="ord-crossmark">✗</span>
              )}
            </h4>
            {isMobileDone ? (
              <>
                <input
                  type="text"
                  name="pincode"
                  placeholder="Enter your pincode"
                  value={pincode}
                  maxLength="6"
                  className="ord-input"
                  readOnly
                />
              </>
            ) : (
              <p className="ord-step-waiting">Complete previous step first.</p>
            )}
          </div>

          <div className="ord-input-group">
            <h4>
              4. Delivery Address{" "}
              {isAddressDone ? (
                <span className="ord-checkmark">✓</span>
              ) : (
                <span className="ord-crossmark">✗</span>
              )}
            </h4>
            {isPincodeDone ? (
              <>
                <textarea
                  name="address"
                  placeholder="Enter your delivery address"
                  value={deliveryAddress}
                  onChange={handleAddressChange}
                  className="ord-textarea"
                />
                {deliveryAddress.trim() && !isAddressDone && (
                  <button
                    className="ord-done-btn"
                    onClick={() => setIsAddressDone(true)}
                  >
                    Confirm
                  </button>
                )}
              </>
            ) : (
              <p className="ord-step-waiting">Complete previous step first.</p>
            )}
          </div>

          <div className="ord-input-group">
            <h4>
              5. Payment Method{" "}
              {isAddressDone ? (
                <span className="ord-checkmark">✓</span>
              ) : (
                <span className="ord-crossmark">✗</span>
              )}
            </h4>
            {isAddressDone ? (
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="ord-select"
              >
                <option value="Cash on Delivery">Cash on Delivery</option>
                <option value="Credit/Debit Card">Credit/Debit Card</option>
                <option value="UPI">UPI</option>
              </select>
            ) : (
              <p className="ord-step-waiting">Complete previous steps first.</p>
            )}
          </div>
        </div>

        <div className="ord-price-details">
          <div className="ord-price-breakdown">
            <div className="ord-products-list">
              <h4>Products in Cart:</h4>
              <ul>
                {cartItems.map((item) => (
                  <li key={item._id || item.id}>
                    <img src={item.images[0]} className="ord-product-img" />
                    <div className="ord-product-details">
                      <span className="ord-product-item-name">{item.name}</span>
                      <span>
                        {item.quantity} × ₹{item.price} ={" "}
                        {item.quantity + item.price}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <h3>Price Details</h3>
            <div className="ord-price-row">
              <span>Total items:</span>
              <span>{cartItems.length}</span>
            </div>
            <div className="ord-price-row">
              <span>Subtotal:</span>
              <span>₹{totalPrice}</span>
            </div>
            <div className="ord-price-row">
              <span>Discount:</span>
              <span>-₹{discount}</span>
            </div>

            <div className="ord-price-row">
              <span>Delivery Fee:</span>
              <span>₹{deliveryfee}</span>
            </div>
          </div>

          <div className="ord-total-section">
            <div className="ord-price-row ord-total">
              <span>Total Price:</span>
              <span>₹{totalPrice + platformFee + deliveryfee - discount}</span>
            </div>

            <button
              className={`ord-buy-now-btn ${
                !(isMobileDone && isPincodeDone && isAddressDone) ||
                placingOrder
                  ? "ord-disabled"
                  : ""
              }`}
              onClick={handlePlaceOrder}
              disabled={
                !(isMobileDone && isPincodeDone && isAddressDone) ||
                placingOrder
              }
            >
              {placingOrder ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orderdetails;
