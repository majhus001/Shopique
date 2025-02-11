import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Navbar from "../navbar/Navbar";
import axios from "axios";
import "./Orderdetails.css";
import API_BASE_URL from "../../api";

const Orderdetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    cartItems = [],
    userId,
    totalPrice = 0,
    discount = 0,
    platformFee = 50,
    deliveryFee = 20,
    path,
  } = location.state || {};

  // State to manage form inputs
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [userData, setUserDatas] = useState("");

  // State to manage step completion
  const [isMobileDone, setIsMobileDone] = useState(false);
  const [isAddressDone, setIsAddressDone] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        setIsLoggedIn(true);
        try {
          const userDataRes = await axios.get(`${API_BASE_URL}/api/auth/fetch/${userId}`);
          if (userDataRes.data.data) {
            setUserDatas(userDataRes.data.data);
            setMobileNumber(userDataRes.data.data.mobile || ""); // Set fetched mobile or keep it empty
            setDeliveryAddress(userDataRes.data.data.address || ""); // Set fetched address or keep it empty
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
  
    fetchUserData();
  }, [userId]);
  

  const handlePlaceOrder = async () => {
    if (!mobileNumber || !deliveryAddress) {
      alert("Please fill in all the details.");
      return;
    }

    const orderData = {
      userId,
      cartItems,
      totalPrice: totalPrice + platformFee + deliveryFee - discount,
      mobileNumber,
      deliveryAddress,
      paymentMethod,
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/api/orders/add`, {
        userId,
        cartItems,
        totalPrice: totalPrice + platformFee + deliveryFee - discount,
        mobileNumber,
        deliveryAddress,
        paymentMethod,
      });

      if (response.data) {
        const result = response.data;
        alert(result.message); 
        if(path == "cart"){
          await clearCart();
        }
        navigate("/home", { state: { userId: userId } }); 
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
      const response = await axios.delete(`${API_BASE_URL}/api/cart/clear/${userId}`);
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
      <Navbar userId={userId} pageno="123" />
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
                  placeholder="Enter your mobile number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  disabled={isMobileDone} // Disable input if "Done" is clicked
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

          {/* Delivery Address Section */}
          <div className="input-group">
            <h4>3. Delivery Address</h4>
            {isMobileDone ? (
              <>
                <textarea
                  placeholder="Enter your delivery address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  disabled={isAddressDone} // Disable input if "Done" is clicked
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
            <h4>4. Payment Method</h4>
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
              disabled={!isAddressDone} // Disable button until all steps are done
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
