import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaTrash,
  FaPlus,
  FaMinus,
  FaShoppingBag,
  FaTruck,
  FaMapMarkerAlt,
  FaCalendarAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../CartScreen/Cart.css";
import AuthRequired from "../../components/Authentication/AuthRequired";
import HandleCheckDelivery from "../../utils/DeliveryPincodeCheck/DeliveryCheck";

const Buynow = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const { product } = location.state || {};

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pincode, setPincode] = useState(user?.pincode || "");
  const [isPincodeTouched, setIsPincodeTouched] = useState(false);
  const [pincodeload, setPincodeLoad] = useState(false);
  const [deliveryfee, setDeliveryFee] = useState(0);

  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [expectedDeliverydate, setExpectedDeliverydate] = useState("");
  const [isPincodeDone, setIsPincodeDone] = useState(false);

  useEffect(() => {
    if (product) {
      setCartItems([
        {
          _id: product._id,
          name: product.name,
          price: product.price,
          offerPrice: product.offerPrice,
          brand: product.brand,
          quantity: 1,
          description: product.description,
          image:
            product.images?.[0] ||
            "https://via.placeholder.com/150?text=No+Image",
          category: product.category,
          subCategory: product.subCategory,
        },
      ]);
    } else {
      navigate("/");
    }

    if (user) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      toast.error("Please login to continue");
    }
  }, [user]);

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.offerPrice * item.quantity,
      0
    );
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal + deliveryfee;
  };

  const handleBuyNow = () => {
    if (user._id && cartItems.length > 0) {
      navigate(`/user/${user._id}/order/checkout`, {
        state: {
          cartItems,
          totalPrice: calculateSubtotal(),
          stateDF: deliveryfee,
          statePincode: pincode,
          path: "buynow",
        },
      });
    } else {
      toast.error("Please log in and add items to proceed with the purchase.");
    }
  };

  const updateQuantity = (itemId, change) => {
    const updatedCartItems = cartItems.map((item) =>
      item._id === itemId
        ? { ...item, quantity: Math.max(item.quantity + change, 1) }
        : item
    );
    setCartItems(updatedCartItems);
    toast.success(
      `Quantity updated to ${
        updatedCartItems.find((item) => item._id === itemId).quantity
      }`
    );
  };

  const handleCheckDelivery = (value) => {
    HandleCheckDelivery(
      value,
      setExpectedDelivery,
      setExpectedDeliverydate,
      setIsPincodeDone,
      setDeliveryFee,
      setPincodeLoad
    );
  };

  return (
    <div className="cart-page">
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
        <AuthRequired message="Please login to proceed with your purchase" />
      ) : loading ? (
        <div className="cart-skeleton">
          <div className="cart-skeleton-header"></div>
          <div className="cart-skeleton-content"></div>
        </div>
      ) : (
        <div className="cart-container">
          <motion.div
            className="cart-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="cart-title">
              <FaShoppingBag className="cart-title-icon" /> Quick Checkout
            </h1>
            {cartItems.length > 0 && (
              <div className="cart-item-count">
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
              </div>
            )}
          </motion.div>

          {cartItems?.length > 0 ? (
            <div className="cart-content">
              <div className="cart-items-container">
                {cartItems.map((item) => (
                  <motion.div
                    key={item._id}
                    className="cart-item"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{
                      boxShadow: "0 4px 12px rgba(0, 122, 255, 0.1)",
                    }}
                  >
                    <div className="cart-item-image-container">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="cart-item-img"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/150?text=No+Image";
                        }}
                      />
                    </div>
                    <div className="cart-item-details">
                      <h3 className="cart-item-name">{item.name}</h3>
                      <p className="cart-item-brand">{item.brand}</p>
                      <p className="cart-item-price">
                        ₹{item.offerPrice.toLocaleString()}
                      </p>
                      <div className="cart-quantity-controls">
                        <button
                          onClick={() => updateQuantity(item._id, -1)}
                          disabled={item.quantity <= 1}
                          className="cart-quantity-btn minus"
                          aria-label="Decrease quantity"
                        >
                          <FaMinus size={12} />
                        </button>
                        <span className="cart-quantity">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, 1)}
                          className="cart-quantity-btn plus"
                          aria-label="Increase quantity"
                        >
                          <FaPlus size={12} />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => setCartItems([])}
                      className="cart-remove-btn"
                      aria-label="Remove item"
                    >
                      <FaTrash size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>

              <div className="cart-order-summary">
                <h3 className="summary-title">Order Summary</h3>
                <div className="cart-summary-row">
                  <span>Subtotal ({cartItems.length} item)</span>
                  <span className="summary-value">
                    ₹{calculateSubtotal().toLocaleString()}
                  </span>
                </div>

                <div className="delivery-section">
                  <div className="delivery-header">
                    <FaTruck className="delivery-icon" />
                    <h4>Delivery Information</h4>
                  </div>
                  <div className="pincode-input-container">
                    <div className="pincode-input-wrapper">
                      <FaMapMarkerAlt className="pincode-icon" />
                      <input
                        className="pincode-input"
                        placeholder="Enter delivery pincode"
                        value={pincode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          if (value.length <= 6) {
                            setPincode(value);
                            if (value.length === 6) {
                              handleCheckDelivery(value);
                            }
                          }
                          if (!isPincodeTouched) {
                            setIsPincodeTouched(true);
                          }
                        }}
                        onFocus={() => {
                          if (!isPincodeTouched) {
                            setIsPincodeTouched(true);
                          }
                        }}
                        style={{ color: isPincodeTouched ? "inherit" : "#aaa" }}
                        maxLength={6}
                      />
                    </div>
                    <button
                      className="cart-pincode-check-btn"
                      onClick={() => handleCheckDelivery(pincode)}
                      disabled={pincodeload || !isPincodeTouched}
                    >
                      {pincodeload ? (
                        <>
                          <span className="cart-loader"></span>
                          <span>Checking...</span>
                        </>
                      ) : (
                        "Check"
                      )}
                    </button>
                  </div>

                  {!isPincodeDone && (
                    <div className="pincode-prompt">
                      Enter Pincode to check delivery options
                    </div>
                  )}

                  {pincodeload ? (
                    <div className="cart-delivery-loading">
                      <span className="cart-loader"></span>
                      <span>Checking delivery availability...</span>
                    </div>
                  ) : expectedDelivery ? (
                    <div className="cart-delivery-info">
                      <div className="delivery-message-row">
                        <FaMapMarkerAlt className="delivery-info-icon" />
                        <div>
                          <strong>Delivery Address:</strong>
                          <div>{expectedDelivery}</div>
                        </div>
                      </div>

                      {expectedDeliverydate && (
                        <div className="delivery-message-row">
                          <FaCalendarAlt className="delivery-info-icon" />
                          <div>
                            <strong>Estimated Delivery:</strong>
                            <div>{expectedDeliverydate}</div>
                          </div>
                        </div>
                      )}

                      {deliveryfee > 0 && (
                        <div className="delivery-message-row">
                          <FaTruck className="delivery-info-icon" />
                          <div>
                            <strong>Delivery Fee:</strong>
                            <div>₹{deliveryfee}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>

                <div className="cart-summary-row">
                  <span>Delivery Fee</span>
                  <span className="summary-value">
                    ₹{deliveryfee.toLocaleString()}
                  </span>
                </div>

                <div className="cart-summary-total">
                  <span>Total Amount</span>
                  <span className="total-value">
                    ₹{calculateTotal().toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={handleBuyNow}
                  className="cart-checkout-btn"
                  disabled={pincodeload}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          ) : (
            <motion.div
              className="cart-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="cart-empty-content">
                <img
                  src="https://cdni.iconscout.com/illustration/premium/thumb/empty-cart-5521508-4610092.png"
                  alt="Empty cart"
                  className="cart-empty-img"
                />
                <h3>No items to checkout</h3>
                <p>Looks like you haven't selected any items to purchase</p>
                <button
                  onClick={() => navigate("/home")}
                  className="cart-shop-now-btn"
                >
                  Continue Shopping
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default Buynow;
