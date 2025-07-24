import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import axios from "axios";
import BottomNav from "../../components/Bottom Navbar/BottomNav";
import normalizeError from "../../utils/Error/NormalizeError";
import ErrorDisplay from "../../utils/Error/ErrorDisplay";
import "./OrderCheckout.css";
import API_BASE_URL from "../../api";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import RazorPayment from "../../utils/RazorPayment";
import EmailFunction from "../../utils/EmailFunction";

const OrderDetailsSkeleton = () => {
  return (
    <div className="checkout-container">
      <div className="ord-notification"></div>
      <div className="ord-checkout-title ord-skeleton-loading">
        <div className="ord-skeleton-line" style={{ width: "200px", margin: "0 auto" }}></div>
      </div>
      <div className="ord-container">
        {/* Skeleton content remains the same */}
      </div>
    </div>
  );
};

const Orderdetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  const {
    cartItems = [],
    totalPrice = 0,
    deliveryfee = 0,
    statePincode = "",
    path,
  } = location.state || {};

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState(null);
  const [mobileNumber, setMobileNumber] = useState("");
  const [pincode, setPincode] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [isMobileDone, setIsMobileDone] = useState(false);
  const [isAddressDone, setIsAddressDone] = useState(false);
  const [isPincodeDone, setIsPincodeDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const allStepsComplete = isMobileDone && isPincodeDone && isAddressDone;

  useEffect(() => {
    const initialize = async () => {
      try {
        if (!user?._id) {
          setIsLoggedIn(false);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/auth/profile/${user._id}`);
        const userData = response.data.user;

        // Set all states at once
        setMobileNumber(userData.mobile || "");
        setPincode(statePincode || user.pincode || "");
        setDeliveryAddress(userData.address || "");
        setIsLoggedIn(true);

        // Validate fields after setting all states
        setIsMobileDone(userData.mobile?.length === 10);
        setIsPincodeDone((statePincode || user.pincode)?.length === 6);
        setIsAddressDone(!!userData.address);

        setInitialLoadComplete(true);
      } catch (err) {
        toast.error("Failed to initialize order details");
        console.error("Initialization error:", err);
        if (err?.response?.status >= 400 && err?.response?.status < 500) {
          toast.error(err.response.data.message || "Error fetching user data");
        } else {
          setError(normalizeError(err));
        }
      } finally {
        setLoading(false);
      }
    };

    initialize();
    if (!location.state?.cartItems) {
      navigate("/home");
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

  const validateForm = useCallback(() => {
    const errors = [];
    
    if (!isLoggedIn) errors.push("Please login to place an order");
    if (mobileNumber.length !== 10) errors.push("Please enter a valid 10-digit mobile number");
    if (pincode.length !== 6) errors.push("Please enter a valid 6-digit pincode");
    if (!deliveryAddress.trim()) errors.push("Please enter your delivery address");
    if (cartItems.length === 0) errors.push("Your cart is empty");

    if (errors.length > 0) {
      errors.forEach(error => toast.warn(error));
      return false;
    }
    return true;
  }, [isLoggedIn, mobileNumber, pincode, deliveryAddress, cartItems]);

  const handlePlaceOrder = useCallback(async (paymentId = null) => {
    if (!validateForm()) return;

    setPlacingOrder(true);
    try {
      const orderData = {
        userId: user._id,
        cartItems,
        totalPrice: totalPrice + deliveryfee,
        mobileNumber,
        pincode,
        deliveryfee,
        deliveryAddress,
        paymentMethod,
        paymentId,
      };

      const orderResponse = await axios.post(`${API_BASE_URL}/api/orders/add`, orderData);
      
      if (orderResponse.data.success) {
        await Promise.all([
          EmailFunction({
            path: "orderplaced",
            email: user.email,
            data: orderData,
            orderId: orderResponse.data.orderId,
          }),
          path === "cart" ? clearCart() : Promise.resolve(),
          axios.post(`${API_BASE_URL}/api/user/reactivity/add`, {
            name: user.username,
            activity: "has Placed an order",
          })
        ]);
        
        toast.success("Order Placed Successfully!");
        navigate(`/user/${user._id}/myorders`, { replace: true });
      }
    } catch (error) {
      console.error("Order placement error:", error);
      toast.error(error.message || "An error occurred. Please try again.");
      throw error;
    } finally {
      setPlacingOrder(false);
    }
  }, [validateForm, user, cartItems, totalPrice, deliveryfee, mobileNumber, pincode, deliveryAddress, paymentMethod, path, navigate]);

  const clearCart = useCallback(async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/cart/clear/${user._id}`);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  }, [user?._id]);

  const handlePayment = async () => {
    if (!validateForm()) return;
    
    if (paymentMethod === "Cash on Delivery") {
      await handlePlaceOrder();
      return;
    }

    setPlacingOrder(true);
    try {
      const paymentId = await RazorPayment({ 
        cartItems, 
        user, 
        mobileNumber,
         deliveryfee
      });
      
      if (paymentId) {
        console.log(paymentId)
        await handlePlaceOrder(paymentId);
      } else {
        toast.error("Payment failed. Please try again.");
      }
    } catch (error) {
      toast.error(error.message || "Payment processing failed");
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleProductNavigation = (item) => {
    navigate(`/products/${item.category}/${item.subCategory}/${item._id}`);
  };

  if (loading) {
    return (
      <div className="product-page-container">
        <Navbar />
        <div className="product-main-content">
          <OrderDetailsSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="usprof-container">
        <div className="usprof-nav">
          <Navbar />
        </div>
        <ErrorDisplay
          error={error}
          onRetry={() => window.location.reload()}
        />
        <BottomNav />
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
                <Link to="/auth/login" state={{ from: location }}>
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
            <h4>5. Payment Method</h4>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="ord-payment-select"
              disabled={!isAddressDone}
            >
              <option value="Cash on Delivery">Cash on Delivery</option>
              <option value="Online Payment">Online Payment</option>
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
                      {item.quantity} × ₹{item.offerPrice} = ₹
                      {item.quantity * item.offerPrice}
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
            <div className="ord-price-row">
              <span>Delivery Fee:</span>
              <span>₹{deliveryfee.toFixed(2)}</span>
            </div>
          </div>

          <div className="ord-total-section">
            <div className="ord-price-row ord-total">
              <span>Total Amount:</span>
              <span>₹{(totalPrice + deliveryfee).toFixed(2)}</span>
            </div>

            <button
              className={`ord-buy-now-btn ${
                !allStepsComplete ? "ord-disabled" : ""
              }`}
              onClick={handlePayment}
              disabled={!allStepsComplete || placingOrder}
            >
              {placingOrder ? (
                <>
                  <span className="ord-spinner"></span>
                  Processing...
                </>
              ) : (
                paymentMethod === "Online Payment" ? "Pay Now" : "Place Order"
              )}
            </button>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Orderdetails;