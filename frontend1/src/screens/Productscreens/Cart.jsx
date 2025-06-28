import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../navbar/Navbar";
import API_BASE_URL from "../../api";
import {
  FaHome,
  FaListAlt,
  FaUser,
  FaShoppingCart,
  FaTrash,
  FaPlus,
  FaMinus,
} from "react-icons/fa";
import { FiLogIn, FiAlertCircle } from "react-icons/fi";
import ValidUserData from "../../utils/ValidUserData";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "../Bottom Navbar/BottomNav";
import AuthRequired from "../Authentication/AuthRequired";
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

const Cart = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(location.state?.user || null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateMessage, setUpdateMessage] = useState("");
  const [pincode, setPincode] = useState(userDetails?.pincode || "");
  const [pincodeload, setPincodeLoad] = useState(false);
  const [deliveryfee, setDeliveryFee] = useState(0);
  const [deliveryAddress, setDeliveryAddress] = useState(
    userDetails?.address || ""
  );
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [expectedDeliverydist, setExpectedDeliverydist] = useState("");
  const [expectedDeliverydate, setExpectedDeliverydate] = useState("");
  const [isPincodeDone, setIsPincodeDone] = useState(false);
  const warehousePincode = "641008";

  // Skeleton Loading Component
  const CartSkeletonLoading = () => (
    <div className="cart-skeleton">
      <div className="cart-skeleton-header"></div>
      <div className="cart-skeleton-content">
        <div className="cart-skeleton-items">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="cart-skeleton-item">
              <div className="cart-skeleton-image"></div>
              <div className="cart-skeleton-details">
                <div className="cart-skeleton-line cart-skeleton-short"></div>
                <div className="cart-skeleton-line cart-skeleton-medium"></div>
                <div className="cart-skeleton-line cart-skeleton-long"></div>
                <div className="cart-skeleton-quantity">
                  <div className="cart-skeleton-btn"></div>
                  <div className="cart-skeleton-count"></div>
                  <div className="cart-skeleton-btn"></div>
                </div>
              </div>
              <div className="cart-skeleton-remove"></div>
            </div>
          ))}
        </div>
        <div className="cart-skeleton-summary">
          <div className="cart-skeleton-summary-line"></div>
          <div className="cart-skeleton-summary-line"></div>
          <div className="cart-skeleton-summary-line"></div>
          <div className="cart-skeleton-total"></div>
          <div className="cart-skeleton-button"></div>
        </div>
      </div>
    </div>
  );

  const checkUser = async () => {
    try {
      const userData = await ValidUserData();
      if (userData) {
        setUserDetails(userData);
        setIsLoggedIn(true);
        return true;
      }
      setIsLoggedIn(false);
      return false;
    } catch (error) {
      setIsLoggedIn(false);
      console.error("Error validating user:", error);
      return false;
    }
  };

  const fetchCartData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/api/cart/fetch`, {
        params: { userId: userDetails?._id },
      });

      if (response.data.success) {
        const itemsWithQuantity = response.data.cartItems.map((item) => ({
          ...item,
          quantity: item.quantity || 1, // Changed from [] to 1
        }));
        setCartItems(itemsWithQuantity);
      } else {
        // Empty cart is not an error, just set empty array
        setCartItems([]);
        if (
          response.data.message !== "No items found in the cart for this user."
        ) {
          setError(response.data.message);
        }
      }
    } catch (error) {
      console.error("Error fetching cart data:", error);
      setError("Failed to load cart. Please try again.");
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const isUserValid = await checkUser();
      if (isUserValid) {
        await fetchCartData();
      }
    };
    initialize();
  }, []);

  const handleQuantityChange = async (itemId, change) => {
    const updatedCartItems = cartItems.map((item) =>
      item._id === itemId
        ? { ...item, quantity: Math.max(item.quantity + change, 1) }
        : item
    );
    const updatedItem = updatedCartItems.find((item) => item._id === itemId);

    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/cart/update-quantity`,
        {
          userId: userDetails._id,
          itemId: updatedItem.itemId,
          quantity: updatedItem.quantity,
        }
      );

      if (response.status === 200) {
        setCartItems(updatedCartItems);
        setUpdateMessage(
          `${updatedItem.name} quantity updated to ${updatedItem.quantity}`
        );
        setTimeout(() => setUpdateMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error updating item quantity:", error);
      setError("Failed to update quantity. Please try again.");
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/cart/delete/${itemId}`,
        { data: { userId: userDetails._id } }
      );

      if (response.status === 200) {
        setCartItems(cartItems.filter((item) => item._id !== itemId));
      }
    } catch (error) {
      console.error("Error removing item:", error);
      setError("Failed to remove item. Please try again.");
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal + deliveryfee;
  };

  const handleShopNow = () =>
    navigate("/home", { state: { user: userDetails } });

  const handleCheckOut = () => {
    navigate("/ordercheckout", {
      state: {
        cartItems,
        user: userDetails,
        totalPrice: calculateSubtotal(),
        deliveryfee,
        statePincode: pincode,
        path: "cart",
      },
    });
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
        <Navbar />
      </div>

      {!isLoggedIn ? (
        <AuthRequired message="Please login to view your cart" />
      ) : loading ? (
        <CartSkeletonLoading />
      ) : error ? (
        <div className="cart-error-message">
          <FiAlertCircle /> {error}
          <button onClick={fetchCartData} className="cart-retry-btn">
            Retry
          </button>
        </div>
      ) : (
        <div className="cart-container">
          <motion.h1
            className="cart-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            Your Shopping Cart
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
                    key={item._id}
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
                          onClick={() => handleQuantityChange(item._id, -1)}
                          disabled={item.quantity <= 1}
                          className="cart-quantity-btn"
                        >
                          <FaMinus />
                        </button>
                        <span className="cart-quantity">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item._id, 1)}
                          className="cart-quantity-btn"
                        >
                          <FaPlus />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item._id)}
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
                  <span>Subtotal ({cartItems.length} items)</span>
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
                          Estimated Delivery :
                        </strong>
                        {expectedDeliverydate}
                      </div>
                    )}
                    {deliveryfee && (
                      <div className="cart-delivery-date">
                        <strong className="cart-delivery-address-label">
                          Delivery Fee :
                        </strong>
                        ₹{deliveryfee}
                      </div>
                    )}
                  </div>
                ) : null}

                <div className="cart-summary-total">
                  <span>Total</span>
                  <span>₹{calculateTotal().toLocaleString()}</span>
                </div>
                <button
                  onClick={handleCheckOut}
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
                <h3>Your cart is empty</h3>
                <p>Looks like you haven't added anything to your cart yet</p>
                <button onClick={handleShopNow} className="cart-shop-now-btn">
                  Continue Shopping
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      <BottomNav UserData={userDetails} />
    </div>
  );
};

export default Cart;
