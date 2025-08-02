import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import normalizeError from "../../utils/Error/NormalizeError";
import ErrorDisplay from "../../utils/Error/ErrorDisplay";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import API_BASE_URL from "../../api";
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
import AuthRequired from "../../components/Authentication/AuthRequired";
import "./Cart.css";
import HandleCheckDelivery from "../../utils/DeliveryPincodeCheck/DeliveryCheck";
import HandleProdlistNavigation from "../../utils/Navigation/ProdlistNavigation";

const Cart = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  const [userDetails, setUserDetails] = useState(user || null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pincode, setPincode] = useState(user?.pincode || "");

  const [isPincodeTouched, setIsPincodeTouched] = useState(false);
  const [pincodeload, setPincodeLoad] = useState(false);
  const [deliveryfee, setDeliveryFee] = useState(0);

  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [expectedDeliverydate, setExpectedDeliverydate] = useState("");
  const [isPincodeDone, setIsPincodeDone] = useState(false);

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

  const fetchCartData = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_BASE_URL}/api/cart/fetch`, {
        params: { userId: userId },
      });

      if (response.data.success) {
        const itemsWithDetails = response.data.cart.items.map((item) => {
          const product = item.productId;

          return {
            ...product,
            image: product?.images?.[0] || "/placeholder.jpg",
            cartItemId: item._id,
            quantity: item.quantity,
          };
        });

        setCartItems(itemsWithDetails);
      }
    } catch (err) {
      console.error("Error fetching cart data:", err);
      setCartItems([]);
      if (
        err?.response &&
        err?.response?.status >= 400 &&
        err?.response?.status < 500
      ) {
        toast.error(err.response.data.message || "Error fetching cart data");
      } else {
        let errorMessage = normalizeError(err);
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      if (user?._id) {
        setIsLoggedIn(true);
        await fetchCartData(user._id);
        setLoading(false);
      } else {
        setIsLoggedIn(false);
        toast.error("Please login to view your Cart");
      }
    };

    initialize();
  }, [user]);

  const handleQuantityChange = async (cartItemId, change) => {
    const updatedCartItems = cartItems.map((item) =>
      item.cartItemId === cartItemId
        ? { ...item, quantity: Math.max(item.quantity + change, 1) }
        : item
    );
    const updatedItem = updatedCartItems.find(
      (item) => item.cartItemId === cartItemId
    );

    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/cart/update-quantity`,
        {
          userId: userDetails._id,
          productId: updatedItem._id,
          quantity: updatedItem.quantity,
        }
      );

      if (response.status === 200) {
        setCartItems(updatedCartItems);
        toast.success(
          `${updatedItem.name} quantity updated to ${updatedItem.quantity}`
        );
      }
    } catch (error) {
      toast.warn("Failed to update quantity. Please try again.");
      console.error("Error updating item quantity:", error);
    }
  };

  const handleRemoveItem = async (cartItemId, productId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/cart/delete/${userDetails._id}/${productId}`
      );

      if (response.status === 200) {
        setCartItems(
          cartItems.filter((item) => item.cartItemId !== cartItemId)
        );
        toast.success("Item removed from cart");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item. Please try again.");
    }
  };

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

  const handleShopNow = () => navigate("/home");

  const handleCheckOut = () => {
    navigate(`/user/${user._id}/order/checkout`, {
      state: {
        cartItems,
        user: userDetails,
        totalPrice: calculateSubtotal(),
        deliveryfee: deliveryfee,
        statePincode: pincode,
        path: "cart",
      },
    });
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

  if (error) {
    return (
      <div className="usprof-container">
        <ErrorDisplay
          error={error}
          onRetry={() => user?._id && fetchCartData(user._id)}
        />
      </div>
    );
  }

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
        <AuthRequired message="Please login to view your cart" />
      ) : loading ? (
        <CartSkeletonLoading />
      ) : (
        <div className="cart-container">
          <motion.div
            className="cart-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="cart-title">
              <FaShoppingBag className="cart-title-icon" /> Your Shopping Cart
            </h1>
            {cartItems.length > 0 && (
              <div className="cart-item-count">
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
              </div>
            )}
          </motion.div>

          {cartItems.length > 0 ? (
            <div className="cart-content">
              <div className="cart-items-container">
                {cartItems.map((item) => (
                  <motion.div
                    key={item.cartItemId}
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
                        src={item.images[0]}
                        alt={item.name}
                        className="cart-item-img"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/150?text=No+Image";
                        }}
                        onClick={() => HandleProdlistNavigation(item, navigate)}
                      />
                    </div>
                    <div className="cart-item-details">
                      <h3
                        className="cart-item-name"
                        onClick={() => HandleProdlistNavigation(item, navigate)}
                      >
                        {item.name}
                      </h3>
                      <p className="cart-item-brand">{item.brand}</p>
                      <p className="cart-item-price">
                        ₹{item.offerPrice.toLocaleString()}
                      </p>
                      <div className="cart-quantity-controls">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.cartItemId, -1)
                          }
                          disabled={item.quantity <= 1}
                          className="cart-quantity-btn minus"
                          aria-label="Decrease quantity"
                        >
                          <FaMinus size={12} />
                        </button>
                        <span className="cart-quantity">{item.quantity}</span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.cartItemId, 1)
                          }
                          className="cart-quantity-btn plus"
                          aria-label="Increase quantity"
                        >
                          <FaPlus size={12} />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleRemoveItem(item.cartItemId, item._id)
                      }
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
                  <span>Subtotal ({cartItems.length} items)</span>
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
                  onClick={handleCheckOut}
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
    </div>
  );
};

export default Cart;
