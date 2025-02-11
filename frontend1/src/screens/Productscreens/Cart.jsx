import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../navbar/Navbar";
import API_BASE_URL from "../../api";
import "./Cart.css";

export default function Cart() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = location.state || {};
  const [cartItems, setCartItems] = useState([]);
  const [updateMessage, setUpdateMessage] = useState("");

  useEffect(() => {
    if (userId) {
      const fetchCartData = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/cart/fetch`, {
            params: { userId },
          });
          if (response.data.success) {
            const itemsWithQuantity = response.data.cartItems.map((item) => ({
              ...item,
              quantity: item.quantity || 1,
            }));
            setCartItems(itemsWithQuantity);
          } else {
            alert(response.data.message || "Failed to fetch cart data.");
          }
        } catch (error) {
          console.error("Error fetching cart data:", error);
        }
      };

      fetchCartData();
    }
  }, [userId]);

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
          userId: userId,
          itemId: updatedItem.itemId,
          quantity: updatedItem.quantity,
        }
      );

      if (response.status === 200) {
        setCartItems(updatedCartItems);
        setUpdateMessage(
          `${updatedItem.name} quantity updated to ${updatedItem.quantity}`
        );
        setTimeout(() => {
          setUpdateMessage("");
        }, 5000);
      } else {
        console.error("Failed to update item quantity in the database");
      }
    } catch (error) {
      console.error("Error updating item quantity:", error);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/cart/delete/${itemId}`
      );

      if (response.status === 200) {
        setCartItems(cartItems.filter((item) => item._id !== itemId));
      } else {
        console.error("Failed to remove item from the cart");
      }
    } catch (error) {
      alert("Error deleting cart items....");
      console.error("Error removing item:", error.message);
    }
  };

  const calculateTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const HandleShopNow = () => {
    navigate("/home", { state: { userId } });
  };

  const handleBuyNow = () => {
    const totItems = cartItems.length;
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
        path: "cart"
      },
    });
  };

  return (
    <div>
      <Navbar userId={userId} />
      <div className="cart-container">
        <h1 className="cart-title">Your Cart</h1>
        {updateMessage && <div className="update-message">{updateMessage}</div>}
        <div className="cart-prod">
          {userId ? (
            cartItems.length > 0 ? (
              <>
                <div className="cart-items">
                  {cartItems.map((item) => (
                    <div className="cart-item" key={item._id}>
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
                            onClick={() => handleQuantityChange(item._id, -1)}
                            disabled={item.quantity <= 1}
                            className="quantity-btn"
                          >
                            -
                          </button>
                          <span className="quantity-display">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item._id, 1)}
                            className="quantity-btn"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="cart-item-actions">
                        <button
                          className="remove-btn"
                          onClick={() => handleRemoveItem(item._id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  {/* <button id="cart-prodlist-buy" onClick={handleBuyNow}>
                    Check Out
                  </button> */}
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
                        <strong>Total Price: ₹{calculateTotalPrice()}</strong>
                      </div>
                    )}
                    <button className="buy-now-btn" onClick={handleBuyNow}>
                      Buy Now
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-cart">
                <p>Your cart is empty.</p>
                <button className="shop-now-btn" onClick={HandleShopNow}>
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
}
