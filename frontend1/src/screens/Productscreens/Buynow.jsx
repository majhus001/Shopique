import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../navbar/Navbar";
import API_BASE_URL from "../../api";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import { FiAlertCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "../Bottom Navbar/BottomNav";
import "./Cart.css";
import getCoordinates from "../../utils/Geolocation";

// Helper function to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c); // Distance in km
};

const Buynow = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract data from location state
  const {
    user,
    itemId,
    name,
    price,
    brand,
    quantity = 1,
    description,
    images,
    category,
    deliverytime,
    rating,
    stock,
  } = location.state || {};

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updateMessage, setUpdateMessage] = useState("");
  const [pincode, setPincode] = useState(user?.pincode || "");
  const [pincodeload, setPincodeLoad] = useState(false);
  const [deliveryfee, setDeliveryFee] = useState(0);
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || "");
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [expectedDeliverydist, setExpectedDeliverydist] = useState("");
  const [expectedDeliverydate, setExpectedDeliverydate] = useState("");
  const [isPincodeDone, setIsPincodeDone] = useState(false);
  const warehousePincode = "641008";
  const platformFee = 50;

  useEffect(() => {
    if (location.state) {
      setCartItems([
        {
          userId: user?._id,
          itemId,
          name,
          price,
          brand,
          quantity,
          description,
          image: images?.[0] || "https://via.placeholder.com/150?text=No+Image",
          category,
          deliverytime,
          rating,
          stock,
        },
      ]);
    }
  }, [location.state]);

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal + deliveryfee + platformFee;
  };

  const handleBuyNow = () => {
    if (user && cartItems.length > 0) {
      
      navigate("/ordercheckout", {
        state: {
          cartItems,
          user,
          totalPrice: calculateSubtotal(),
          deliveryfee,
          statePincode: pincode,
          path: "buynow",
        },
      });
    } else {
      alert("Please log in and add items to proceed with the purchase.");
    }
  };

  const updateQuantity = (itemId, change) => {
    const updatedCartItems = cartItems.map((item) =>
      item.itemId === itemId
        ? { ...item, quantity: Math.max(item.quantity + change, 1) }
        : item
    );
    setCartItems(updatedCartItems);
    setUpdateMessage(
      `Quantity updated to ${
        updatedCartItems.find((item) => item.itemId === itemId).quantity
      }`
    );
    setTimeout(() => setUpdateMessage(""), 3000);
  };

  const handleCheckDelivery = async (value) => {
    if (value.length !== 6) {
      setExpectedDelivery("Please enter a valid 6-digit pincode");
      setExpectedDeliverydate("");
      setIsPincodeDone(false);
      return;
    }

    setPincodeLoad(true);
    setExpectedDelivery("");
    setExpectedDeliverydate("");
    setIsPincodeDone(false);

    try {
      const warehouseCoords = await getCoordinates(warehousePincode);
      const userCoords = await getCoordinates(value);

      if (!warehouseCoords || !userCoords) {
        throw new Error("Could not get coordinates for pincodes");
      }

      const distanceKm = calculateDistance(
        warehouseCoords.lat,
        warehouseCoords.lon,
        userCoords.lat,
        userCoords.lon
      );

      let deliveryDays = Math.min(Math.ceil(distanceKm / 100) + 1, 6);
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);

      if (distanceKm > 0 && distanceKm < 100) {
        setDeliveryFee(50);
      } else if (distanceKm > 100) {
        setDeliveryFee(100);
      }

      setDeliveryAddress(userCoords.address);
      setExpectedDelivery(`${userCoords.address}`);

      setExpectedDeliverydate(
        ` in ${deliveryDays} day(s) (by ${deliveryDate.toLocaleDateString()})`
      );

      setIsPincodeDone(true);
    } catch (error) {
      console.error("Error checking delivery:", error);
      setExpectedDelivery("❌ Error checking delivery for this pincode");
      setExpectedDeliverydist("Please try again or contact support");
      setIsPincodeDone(false);
    } finally {
      setPincodeLoad(false);
    }
  };

  return (
    <div className="cart-page">
      <div className="cart-navbar">
        <Navbar user={user} />
      </div>

      {!user ? (
        <div className="cart-error-message">
          <FiAlertCircle /> Please login to proceed with your purchase
        </div>
      ) : loading ? (
        <div className="cart-skeleton">
          {/* Skeleton loading similar to Cart page */}
          <div className="cart-skeleton-header"></div>
          <div className="cart-skeleton-content">{/* Skeleton items */}</div>
        </div>
      ) : error ? (
        <div className="cart-error-message">
          <FiAlertCircle /> {error}
        </div>
      ) : (
        <div className="cart-container">
          <motion.h1
            className="cart-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            Check Out
          </motion.h1>

          {updateMessage && (
            <motion.div
              className="cart-update-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {updateMessage}
            </motion.div>
          )}

          {cartItems.length > 0 ? (
            <div className="cart-content">
              <div className="cart-items-container">
                {cartItems.map((item) => (
                  <motion.div
                    key={item.itemId}
                    className="cart-item"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
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
                        ₹{item.price.toLocaleString()}
                      </p>
                      <div className="cart-quantity-controls">
                        <button
                          onClick={() => updateQuantity(item.itemId, -1)}
                          disabled={item.quantity <= 1}
                          className="cart-quantity-btn"
                        >
                          <FaMinus />
                        </button>
                        <span className="cart-quantity">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.itemId, 1)}
                          className="cart-quantity-btn"
                        >
                          <FaPlus />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => setCartItems([])}
                      className="cart-remove-btn"
                    >
                      <FaTrash />
                    </button>
                  </motion.div>
                ))}
              </div>

              <div className="cart-order-summary">
                <h3>Order Summary</h3>
                <div className="cart-summary-row">
                  <span>Subtotal ({cartItems.length} item)</span>
                  <span>₹{calculateSubtotal().toLocaleString()}</span>
                </div>

                <div className="cart-summary-row">
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
                    }}
                    maxLength={6}
                  />
                  <button
                    className="cart-pincode-check-btn"
                    onClick={() => handleCheckDelivery(pincode)}
                    disabled={pincodeload || pincode.length !== 6}
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

                {pincodeload ? (
                  <div className="cart-delivery-loading">
                    <span className="cart-loader"></span>
                    <span>Checking delivery availability...</span>
                  </div>
                ) : expectedDelivery ? (
                  <div className="cart-delivery-info">
                    <div className="cart-delivery-message">
                      <strong className="cart-delivery-address-label">
                        Delivery Address:
                      </strong>
                    </div>
                    <div className="cart-delivery-message">
                      {expectedDelivery}
                    </div>

                    {expectedDeliverydate && (
                      <div className="cart-delivery-date">
                        <strong className="cart-delivery-address-label">
                          Estimated Delivery:
                        </strong>
                        {expectedDeliverydate}
                      </div>
                    )}
                    <div className="cart-summary-row">
                      <span>Delivery Fee</span>
                      <span>₹{deliveryfee}</span>
                    </div>
                  </div>
                ) : null}

                <div className="cart-summary-total">
                  <span>Total</span>
                  <span>₹{calculateTotal().toLocaleString()}</span>
                </div>
                <button
                  onClick={handleBuyNow}
                  className="cart-checkout-btn"
                  disabled={!isPincodeDone || pincodeload}
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

      <BottomNav UserData={user} />
    </div>
  );
};

export default Buynow;
