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
    user,
    itemId,
    name,
    price,
    brand,
    image,
    rating,
    description,
    stock,
    category,
    deliverytime,
  } = location.state || {};

  const userId = user?._id;
  const [isProdAdded, setProdAdded] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");

  const [review, setReview] = useState("");
  const [urating, setRating] = useState("");
  const [reviews, setReviews] = useState([]);
  const [userImages, setUserImages] = useState({});

  const handleSubmit = async () => {
    if (!review || !rating) {
      alert("Please enter both review and rating");
      return;
    }

    const reviewData = {
      userId,
      itemId,
      review,
      rating: parseInt(urating),
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/${category}/add/review`,
        reviewData
      );
      alert("Review submitted successfully!");
      setReview("");
      setRating("");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Try again later.");
    }
  };

  useEffect(() => {
    const checkIfItemInCart = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/cart/check`, {
          params: { userId, itemId },
        });

        if (response.data.exists) {
          setProdAdded(true);
        } else {
          setProdAdded(false);
        }
      } catch (error) {
        console.error("Error checking item in cart:", error);
      }
    };

    const fetchUserDetails = async (userIds) => {
      try {
        console.log("User IDs:", userIds);
        const response = await axios.get(
          `${API_BASE_URL}/api/auth/users/details`,
          {
            params: { userIds: userIds.join(",") }, // Send IDs as a query string
          }
        );

        const userDetails = response.data; // Expected { userId1: { name, image }, userId2: { name, image } }
        setUserImages(userDetails);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/${category}/fetch/reviews`,
          { params: { itemId } }
        );
        setReviews(response.data.reviews);

        // Extract unique userIds from reviews
        const uniqueUserIds = [
          ...new Set(response.data.reviews.map((r) => r.userId)),
        ];

        if (uniqueUserIds.length > 0) {
          fetchUserDetails(uniqueUserIds);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();

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
    if (!user) {
      alert("Please log in to Add products to Cart.");
      return;
    }
    // handleAddToCart();
    navigate("/buynow", {
      state: {
        user,
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
        stock,
      },
    });
  };

  return (
    <div>
      <div className="pg-navbar">
        <Navbar user={user} />
      </div>
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
                    navigate("/cart", { state: { user: user, stock } });
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
            <div className="ratings-reviews">
              <h4>Ratings and Reviews</h4>
              <div className="us-wr-review">
                <textarea
                  type="text"
                  placeholder="Write a review"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Enter the rating (1-5)"
                  value={urating}
                  onChange={(e) => setRating(e.target.value)}
                  min="1"
                  max="5"
                />
                <button className="check-button" onClick={handleSubmit}>
                  Submit
                </button>
              </div>
              <div className="review-list">
                {reviews.length > 0 ? (
                  reviews.map((r, index) => (
                    <div key={index} className="user-reviews">
                      <div className="us-rw-cont">
                        <div className="us-img-name-rat">
                          <div className="user-img-name">
                            <img
                              src={
                                userImages[r.userId]?.image ||
                                "/default-user.png"
                              }
                              alt="User"
                              className="user-profile-img"
                            />
                            <h5>
                              {userImages[r.userId]?.username || "Anonymous"}
                            </h5>
                          </div>
                          <span>Rating: {r.rating}/5</span>
                        </div>
                        <div>
                          <p>{r.review}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No reviews yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
