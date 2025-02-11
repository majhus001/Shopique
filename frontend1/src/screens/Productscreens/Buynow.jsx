import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../navbar/Navbar";
import "./Buynow.css";

const Buynow = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract data from location state
  const {
    userId,
    itemId,
    name,
    price,
    brand,
    quantity,
    description,
    image,
    category,
    deliverytime,
    rating,
  } = location.state || {};

  // Initializing cartItems state
  const [cartItems, setCartItems] = useState([
    {
      userId,
      itemId,
      name,
      price,
      brand,
      quantity,
      description,
      image,
      category,
      deliverytime,
      rating,
    },
  ]);
  
  // Calculate the total price of the cart
  const calculateTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Handle Buy Now
  const handleBuyNow = () => {
    if (userId && cartItems.length > 0) {
      
      const totalPrice = calculateTotalPrice();
      const discount = 0; 
      const platformFee = 50; 
      const deliveryFee = 20; 
  
      navigate("/orderdet", {
        state: {
          cartItems,
          userId,
          totalPrice,
          discount,
          platformFee,
          deliveryFee,
          path:"buynow"
        },
      });
    } else {
      alert("Please log in and add items to the cart to proceed with the purchase.");
    }
  };
  

  // Handle quantity updates
  const updateQuantity = (itemId, action) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.itemId === itemId
          ? {
              ...item,
              quantity: action === "increase" ? item.quantity + 1 : item.quantity - 1,
            }
          : item
      )
    );
  };

  // Handle remove item from cart
  const removeItem = (itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.itemId !== itemId));
  };

  return (
    <div>
      <Navbar userId={userId} />
      <div className="cart-container">
        <h1 className="cart-title">Check Out</h1>
        <div className="cart-prod">
          {userId ? (
            cartItems.length > 0 ? (
              <>
                <div className="cart-items">
                  {cartItems.map((item) => (
                    <div className="cart-item" key={item.itemId}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="cart-item-img"
                      />
                      <div className="cart-item-details">
                        <h3 className="cart-item-name">{item.name}</h3>
                        <p className="cart-item-brand">
                          <strong>Brand:</strong> {item.brand}
                        </p>
                        <p className="cart-item-description">
                          {item.description}
                        </p>
                        <div className="cart-item-price">
                          <strong>Price: </strong> ₹{item.price}
                        </div>
                        <div className="cart-item-quantity">
                          <button
                            onClick={() => updateQuantity(item.itemId, "decrease")}
                            disabled={item.quantity <= 1}
                            className="quantity-btn"
                          >
                            -
                          </button>
                          <span className="quantity-display">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.itemId, "increase")}
                            className="quantity-btn"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="cart-item-actions">
                        <button
                          className="remove-btn"
                          onClick={() => removeItem(item.itemId)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Details Section */}
                <div className="cart-price-details">
                  <h3>Price Details</h3>
                  <div>
                    <h4>Total items: {cartItems.length}</h4>
                    <h4>Discount: ₹0</h4>
                    <h4>Platform Fee: ₹50</h4>
                    <h4>Delivery Fee: ₹20</h4>
                    <h4>Products in Cart:</h4>
                    <ul id="cart-proddet-list">
                      {cartItems.map((item) => (
                        <li key={item.itemId}>
                          <h4>
                            {item.name} - {item.quantity} * ₹{item.price}
                          </h4>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="total-price">
                      <strong>Total Price: ₹{calculateTotalPrice() + 70}</strong> {/* Adding platform + delivery fees */}
                    </div>
                    <button className="buy-now-btn" onClick={handleBuyNow}>
                      Buy Now
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-cart">
                <p>Your cart is empty.</p>
                <button className="shop-now-btn" onClick={() => navigate("/shop")}>
                  Shop Now
                </button>
              </div>
            )
          ) : (
            <div className="us-ct-lg-mg">
              <p>Please log in to view your cart.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Buynow;
