import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Navbar from "../navbar/Navbar";
import axios from "axios";
import "./Orderdetails.css";
import API_BASE_URL from "../../api";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";

const Orderdetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  const {
    cartItems = [],
    totalPrice = 0,
    deliveryfee = 0,
    platformFee = 0,
    discount = 0,
    statePincode = "",
    path,
  } = location.state || {};

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [pincode, setPincode] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [isMobileDone, setIsMobileDone] = useState(false);
  const [isAddressDone, setIsAddressDone] = useState(false);
  const [isPincodeDone, setIsPincodeDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Initialize user data and check authentication
  useEffect(() => {
    const initialize = async () => {
      try {
        if (!user?._id) {
          setIsLoggedIn(false);
          return;
        }
        const response = await axios.get(
          `${API_BASE_URL}/api/auth/profile/${user._id}`
        );
        const userData = response.data.user;

        setIsLoggedIn(true);
        setMobileNumber(userData.mobile || "");
        setPincode(statePincode || user.pincode || "");
        setDeliveryAddress(userData.address || "");

        // Auto-mark fields as done if they're valid
        if (userData.mobile?.length === 10) {
          setIsMobileDone(true);
        }
        if (statePincode?.length === 6 || user.pincode?.length === 6) {
          setIsPincodeDone(true);
        }
        if (userData.address) {
          setIsAddressDone(true);
        }
      } catch (err) {
        toast.error("Failed to initialize order details");
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    };

    initialize();
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

  const validateForm = useCallback(() => {
    if (!isLoggedIn) {
      toast.warn("Please login to place an order");
      return false;
    }

    if (!mobileNumber || mobileNumber.length !== 10) {
      toast.warn("Please enter a valid 10-digit mobile number");
      return false;
    }

    if (!pincode || pincode.length !== 6) {
      toast.warn("Please enter a valid 6-digit pincode");
      return false;
    }

    if (!deliveryAddress.trim()) {
      toast.warn("Please enter your delivery address");
      return false;
    }

    if (cartItems.length === 0) {
      toast.warn("Your cart is empty");
      return false;
    }

    return true;
  }, [isLoggedIn, mobileNumber, pincode, deliveryAddress, cartItems]);

  const handlePlaceOrder = useCallback(async () => {
    if (!validateForm()) return;

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

      const [orderResponse] = await Promise.all([
        axios.post(`${API_BASE_URL}/api/orders/add`, orderData),
        path === "cart" ? clearCart() : Promise.resolve(),
      ]);

      if (orderResponse.data.success) {
        await axios.post(`${API_BASE_URL}/api/user/reactivity/add`, {
          name: user.username,
          activity: "has Placed an order",
        });
        toast.success("Order Placed Successfully!");
        setTimeout(() => {
          navigate("/myorders");
        }, 3000);
      } else {
        throw new Error(orderResponse.data.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Order placement error:", error);
      toast.error(error.message || "An error occurred. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  }, [
    validateForm,
    user,
    cartItems,
    totalPrice,
    deliveryfee,
    platformFee,
    discount,
    mobileNumber,
    pincode,
    deliveryAddress,
    paymentMethod,
    path,
    navigate,
  ]);

  const clearCart = useCallback(async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/cart/clear/${user._id}`);
    } catch (error) {
      console.error("Error clearing cart:", error);
      // Don't block order placement if cart clearing fails
    }
  }, [user?._id]);

  const handleProductNavigation = (item) => {
    navigate(`/prodlist/${item._id}`);
  };

  if (loading) {
    return (
      <div className="checkout-container">
        <Navbar />
        <div className="ord-container">
          <div className="ord-skeleton-loading">
            <div className="ord-skeleton-header"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="ord-skeleton-line"></div>
            ))}
          </div>
          <div className="ord-skeleton-loading">
            <div className="ord-skeleton-header"></div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="ord-skeleton-line"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <Navbar />
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

      <motion.h1
        className="ord-checkout-title"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Checkout
      </motion.h1>

      <div className="ord-container">
        {/* Address Details Section */}
        <div className="ord-address-details">
          <h3>Address Details</h3>

          <div className="ord-input-group">
            {!isLoggedIn ? (
              <div className="ord-step-incomplete">
                <h4>
                  1. User Login <span className="ord-crossmark">✗</span>
                </h4>
                <Link to="/login" state={{ from: location }}>
                  <button className="ord-login-btn">Login to Continue</button>
                </Link>
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
            <input
              type="text"
              placeholder="Enter 10-digit mobile number"
              value={mobileNumber}
              onChange={handleMobileChange}
              maxLength="10"
              className="ord-input"
              disabled={!isLoggedIn}
            />
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
            <input
              type="text"
              placeholder="Enter 6-digit pincode"
              value={pincode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                if (value.length <= 6) {
                  setPincode(value);
                  setIsPincodeDone(value.length === 6);
                }
              }}
              maxLength="6"
              className="ord-input"
              disabled={!isMobileDone}
            />
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
            <textarea
              placeholder="Enter complete delivery address"
              value={deliveryAddress}
              onChange={handleAddressChange}
              className="ord-textarea"
              disabled={!isPincodeDone}
            />
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
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="ord-select"
              disabled={!isAddressDone}
            >
              <option value="Cash on Delivery">Cash on Delivery</option>
              <option value="Credit/Debit Card">Credit/Debit Card</option>
              <option value="UPI">UPI</option>
            </select>
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="ord-price-details">
          <div className="ord-products-list">
            <h4>Order Summary ({cartItems.length} items)</h4>
            <ul>
              {cartItems.map((item) => (
                <li key={item._id || item.id}>
                  <img
                    src={item.image || "/placeholder-product.png"}
                    alt={item.name}
                    className="ord-product-img"
                    onError={(e) => {
                      e.target.src = "/placeholder-product.png";
                    }}
                  />
                  <div
                    className="ord-product-details"
                    onClick={() => handleProductNavigation(item)}
                  >
                    <span className="ord-product-name">{item.name}</span>
                    <span className="ord-product-price">
                      {item.quantity} × ₹{item.price} = ₹
                      {item.quantity * item.price}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="ord-price-breakdown">
            <h4>Price Breakdown</h4>
            <div className="ord-price-row">
              <span>Subtotal:</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="ord-price-row">
                <span>Discount:</span>
                <span>-₹{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="ord-price-row">
              <span>Delivery Fee:</span>
              <span>₹{deliveryfee.toFixed(2)}</span>
            </div>
            {platformFee > 0 && (
              <div className="ord-price-row">
                <span>Platform Fee:</span>
                <span>₹{platformFee.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="ord-total-section">
            <div className="ord-price-row ord-total">
              <span>Total Amount:</span>
              <span>
                ₹
                {(totalPrice + deliveryfee + platformFee - discount).toFixed(2)}
              </span>
            </div>

            <button
              className={`ord-buy-now-btn ${
                !(isMobileDone && isPincodeDone && isAddressDone)
                  ? "ord-disabled"
                  : ""
              }`}
              onClick={handlePlaceOrder}
              disabled={
                !(isMobileDone && isPincodeDone && isAddressDone) ||
                placingOrder ||
                cartItems.length === 0
              }
            >
              {placingOrder ? (
                <>
                  <span className="ord-spinner"></span>
                  Processing...
                </>
              ) : (
                "Place Order"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orderdetails;
