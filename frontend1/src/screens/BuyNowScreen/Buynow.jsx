import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";
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
      toast.error("please login to continue");
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
      console.log(user);
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
      item.itemId === itemId
        ? { ...item, quantity: Math.max(item.quantity + change, 1) }
        : item
    );
    setCartItems(updatedCartItems);
    toast.success(
      `Quantity updated to ${
        updatedCartItems.find((item) => item.itemId === itemId).quantity
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
        <AuthRequired message="Please login to view your cart" />
      ) : loading ? (
        <div className="cart-skeleton">
          <div className="cart-skeleton-header"></div>
          <div className="cart-skeleton-content"></div>
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

          {cartItems?.length > 0 ? (
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
                        ₹{item.offerPrice.toLocaleString()}
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
                      if (!isPincodeTouched) {
                        setIsPincodeTouched(true);
                      }
                    }}
                    onFocus={() => {
                      if (!isPincodeTouched) {
                        setIsPincodeTouched(true);
                      }
                    }}
                    maxLength={6}
                    style={{ color: isPincodeTouched ? "inherit" : "#aaa" }}
                  />
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
                  <span>Enter Pincode to check Delivery fee</span>
                )}

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

                    {deliveryfee > 0 && (
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
