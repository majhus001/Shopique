import React, { useEffect, useState } from "react";
import axios from "axios";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import "./ProductList.css";
import Navbar from "../navbar/Navbar";
import API_BASE_URL from "../../api";

const ProductList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    userId,
    itemId,
    name,
    price,
    brand,
    stock,
    description,
    image,
    rating,
    category,
    deliverytime,
  } = location.state || {};
  const [isProdAdded, setProdAdded] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");

  useEffect(() => {
    const checkIfItemInCart = async () => {
      try {
        console.log("f b a");
        const response = await axios.get(`${API_BASE_URL}/api/cart/check`, {
          params: { userId, itemId },
        });
        console.log("f a a");

        if (response.data.exists) {
          setProdAdded(true);
        } else {
          setProdAdded(false);
        }
      } catch (error) {
        console.error("Error checking item in cart:", error);
      }
    };

    checkIfItemInCart();
  }, [userId, itemId]);

  const handleAddToCart = async () => {
    if (!userId) {
      alert("Please log in to Add products to Cart.");
      return;
    }

    const productDetails = {
      userId,
      itemId,
      name,
      price,
      brand,
      quantity: 1,
      description,
      image,
      category,
      deliverytime,
      rating,
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/cart/add`,
        productDetails
      );

      if (response.data.success) {
        // Update the message and set product added flag
        setUpdateMessage("Product successfully added to the cart!");
        setProdAdded(true);

        // Optionally clear the message after some time
        setTimeout(() => {
          setUpdateMessage("");
        }, 3000);
      } else {
        alert(response.data.message || "Failed to add product to cart.");
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  const handleBuyNow = () => {
    if (!userId) {
      alert("Please log in to Add products to Cart.");
      return;
    }
    // handleAddToCart();
    navigate("/buynow", {
      state: {
        userId,
        itemId,
        name,
        price,
        brand,
        quantity: 1,
        description,
        image,
        category,
        deliverytime,
        rating,
      },
    });
  };

  return (
    <div>
      <Navbar userId={userId} />
      {updateMessage && <div className="update-message">{updateMessage}</div>}
      <div className="productlist-page">
        <div className="productlist-container">
          <div className="prod-img-btn-cont">
            <div className="productlist-image">
              {image ? (
                <img src={image} alt={name} />
              ) : (
                <p>No image available</p>
              )}
            </div>
            <div className="prod-img-btn">
              <button
                className="add-to-cart-btn"
                onClick={() => {
                  if (stock <= 0) {
                    alert("Sorry, Out of Stock");
                  } else if (isProdAdded) {
                    navigate("/cart", { state: { userId: userId } });
                  } else {
                    handleAddToCart();
                  }
                }}
                disabled={stock <= 0 && !isProdAdded}
              >
                <i className="fas fa-shopping-cart"></i>
                {isProdAdded
                  ? " Go to Cart "
                  : stock > 0
                  ? "Add to Cart"
                  : "Out of Stock"}
              </button>

              <button
                className="add-to-cart-btn"
                onClick={handleBuyNow}
                disabled={stock <= 0}
              >
                {stock > 0 ? "Buy now" : "Out of Stock"}
              </button>
            </div>
          </div>

          {/* Product Details */}
          <div className="prodlist-rat">
            <div className="product-details">
              <h2 className="product-name">{name || "Product Name"}</h2>
              <p className="product-description">
                {description || "No description available"}
              </p>
              <p className="prodlist-price">
                <strong>Price:</strong> ₹ {price || "N/A"}
              </p>
              <p className="product-brand">
                <strong>Brand:</strong> {brand || "N/A"}
              </p>
              <p className="product-stock">
                <strong>Stock:</strong>{" "}
                {stock > 0 ? `${stock} available` : "Out of stock"}
              </p>
              <p className="product-delivery-time">
                <strong>Delivery Type:</strong> {deliverytime || "N/A"}
              </p>
              <div className="delivery-checker">
                <p className="delivery-checker-title">
                  <strong>Delivery Check:</strong>
                </p>
                <input
                  type="text"
                  placeholder="Enter Pincode"
                  className="delivery-input"
                  maxLength="6"
                />
                <button className="check-button">Check</button>
              </div>
            </div>
            <div className="ratings-reviews">Ratings and Reviews</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
