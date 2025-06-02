import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Navbar from "../navbar/Navbar";
import axios from "axios";
import "./Orderdetails.css";
import API_BASE_URL from "../../api";
import getCoordinates from "../../utils/Geolocation";

const Orderdetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    cartItems = [],
    totalPrice = 0,
    discount = 0,
    platformFee = 50,
    deliveryFee = 20,
    path,
  } = location.state || {};
  const stateUser = location.state?.user || null;

  const [user, setUser] = useState(stateUser);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileNumber, setMobileNumber] = useState(user.mobile || "");
  const [pincode, setPincode] = useState(user.pincode || "");
  const [deliveryAddress, setDeliveryAddress] = useState(user.address || "");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [isMobileDone, setIsMobileDone] = useState(false);
  const [isAddressDone, setIsAddressDone] = useState(false);
  const [isPincodeDone, setIsPincodeDone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setIsLoggedIn(true);
    }
  });

  const checkvaliduser = async () => {
    try {
      setLoading(true);
      console.log("Checking user validity...");
      const response = await axios.get(
        `${API_BASE_URL}/api/auth/checkvaliduser`,
        {
          withCredentials: true,
        }
      );
      if (!response.data.user) {
        navigate("/login");
        return;
      }

      const userId = response.data.user.userId;
      const userRes = await axios.get(
        `${API_BASE_URL}/api/auth/fetch/${userId}`
      );
      setUser(userRes.data.data);
    } catch (error) {
      console.error("Error fetching user:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkvaliduser();
  }, []);

  // Separate handlers for each field
  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // digits only
    if (value.length <= 10) {
      setMobileNumber(value);
    }
  };

  const handlePincodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // digits only
    if (value.length <= 6) {
      setPincode(value);
      if (value.length === 6) {
        getCoordinates(value).then((coordinates) => {
          if (coordinates && coordinates.address) {
            setDeliveryAddress(coordinates.address);
            setIsPincodeDone(true);
          }else{
            alert("Invalid Pincode");
            return;
          }
        });
      }
    }
  };

  const handleAddressChange = (e) => {
    setDeliveryAddress(e.target.value);
  };

  const handlePlaceOrder = async () => {
    if (!mobileNumber || !deliveryAddress) {
      alert("Please fill in all the details.");
      return;
    }

    if (!user.pincode || !user.address) {
      alert("Please fill in your pincode and address in your profile.");
      navigate("/profilepage", { state: { user: user } });
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/orders/add`, {
        userId: user._id,
        cartItems,
        totalPrice: totalPrice + platformFee + deliveryFee - discount,
        mobileNumber,
        pincode,
        deliveryAddress,
        paymentMethod,
      });

      if (response.data) {
        const result = response.data;
        alert(result.message);
        if (path == "cart") {
          await clearCart();
        }
        try {
          if (cartItems.length > 0) {
            const StockUpdate = await axios.put(
              `${API_BASE_URL}/api/orders/stockupdate/`,
              { cartItems }
            );
          } else {
            console.error("Cart is empty");
          }
        } catch (error) {
          console.error("Error updating stock:", error);
          alert("An error occurred. Please try again.");
        }

        try {
          const recActivity = await axios.post(
            `${API_BASE_URL}/api/user/reactivity/add`,
            { name: user.username, activity: "has Placed an order" }
          );
          console.log("placed an order");
        } catch (error) {
          console.error("Error updating Recent Activity:", error);
        }

        navigate("/home", { state: { user: user } });
      } else {
        const error = await response.json();
        alert(error.message || "Failed to place order.");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const clearCart = async () => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/cart/clear/${user._id}`
      );
      if (response.data.success) {
        console.log("Cart cleared successfully!");
      } else {
        console.error("Failed to clear cart.");
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  return (
    <div>
      <Navbar user={user} pageno="123" />
      <div className="order-details-container">
        {/* Address Details Section */}
        <div className="address-details">
          <h3>Address Details</h3>

          {/* User Login Section */}
          <div className="input-group">
            {isLoggedIn ? (
              <div>
                <h4>1. User Login ✅</h4>
              </div>
            ) : (
              <div>
                <h4>1. User Login ❌</h4>
                <h5>
                  You are not logged in. Please log in to place an order.
                  <Link to="/login">
                    <button className="ord-login">Login</button>
                  </Link>
                </h5>
              </div>
            )}
          </div>

          {/* Mobile Number Section */}
          <div className="input-group">
            <h4>2. Mobile Number</h4>
            {isLoggedIn ? (
              <>
                <input
                  type="text"
                  name="mobile"
                  placeholder="Enter your mobile number"
                  value={mobileNumber}
                  onChange={handleMobileChange}
                />
                {!isMobileDone && mobileNumber.length === 10 && (
                  <button
                    className="done-button"
                    onClick={() => setIsMobileDone(true)}
                  >
                    Done
                  </button>
                )}
              </>
            ) : (
              <p>Please log in to enter your mobile number.</p>
            )}
          </div>

          {/* Pincode Section */}
          <div className="input-group">
            <h4>3. Pincode</h4>
            {isMobileDone ? (
              <>
                <input
                  type="text"
                  name="pincode"
                  placeholder="Enter your pincode"
                  value={pincode}
                  onChange={handlePincodeChange}
                  // disabled={isPincodeDone}
                />
                {!isPincodeDone && pincode.length === 6 && (
                  <button
                    className="done-button"
                    onClick={handlePincodeChange}
                  >
                    Done
                  </button>
                )}
              </>
            ) : null}
          </div>

          {/* Delivery Address Section */}
          <div className="input-group">
            <h4>4. Delivery Address</h4>
            {isPincodeDone ? (
              <>
                <textarea
                  name="address"
                  placeholder="Enter your delivery address"
                  value={deliveryAddress}
                  onChange={handleAddressChange}
                  // disabled={isAddressDone}
                />
                {!isAddressDone && deliveryAddress.trim() && (
                  <button
                    className="done-button"
                    onClick={() => setIsAddressDone(true)}
                  >
                    Done
                  </button>
                )}
              </>
            ) : (
              <p></p>
            )}
          </div>

          {/* Payment Method Section */}
          <div className="input-group">
            <h4>5. Payment Method</h4>
            {isAddressDone ? (
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="Cash on Delivery">Cash on Delivery</option>
                <option value="Credit/Debit Card">Credit/Debit Card</option>
                <option value="UPI">UPI</option>
              </select>
            ) : (
              <p> </p>
            )}
          </div>
        </div>

        {/* Cart Price Details Section */}
        <div className="order-price-details">
          <h3>Price Details</h3>
          <div>
            <h4>Total items: {cartItems.length}</h4>
            <h4>Discount: ₹{discount}</h4>
            <h4>Platform Fee: ₹{platformFee}</h4>
            <h4>Delivery Fee: ₹{deliveryFee}</h4>
            <h4>Products in Cart:</h4>
            <ul id="cart-proddet-list">
              {cartItems.map((item) => (
                <li key={item._id}>
                  <h4>
                    {item.name} - {item.quantity} * ₹{item.price}
                  </h4>
                </li>
              ))}
            </ul>
          </div>
          <div>
            {cartItems.length > 0 && (
              <div className="total-price">
                <strong>
                  Total Price: ₹
                  {totalPrice + platformFee + deliveryFee - discount}
                </strong>
              </div>
            )}
            <button
              className="buy-now-btn"
              onClick={handlePlaceOrder}
              disabled={!isAddressDone}
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orderdetails;
