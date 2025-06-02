import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "./ProductList.css";
import Navbar from "../navbar/Navbar";
import API_BASE_URL from "../../api";
import getCoordinates from "../../utils/Geolocation";

const ProductList = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [pincode, setPincode] = useState("");
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [expectedDeliverydist, setExpectedDeliverydist] = useState("");
  const [expectedDeliverydate, setExpectedDeliverydate] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const warehousePincode = "641008";

  const {
    user,
    itemId,
    name,
    price,
    brand,
    images,
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
  const [loading, setLoading] = useState(false);

  const handleImageSelect = (index) => {
    setSelectedImageIndex(index);
  };

  const handleSubmit = async () => {
    if (!review || !rating) {
      alert("Please enter both review and rating");
      return;
    }

    const reviewData = {
      itemId,
      userId,
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
            params: { userIds: userIds.join(",") },
          }
        );

        const userDetails = response.data;
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
      image: images[0],
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
        setUpdateMessage("Product successfully added to the cart!");
        setProdAdded(true);
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

    navigate("/buynow", {
      state: {
        user,
        itemId,
        name,
        price,
        brand,
        quantity: 1,
        description,
        images,
        category,
        deliverytime,
        rating,
        stock,
      },
    });
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;

    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance.toFixed(2);
  };

  const handleCheckDelivery = async () => {
    if (pincode.length !== 6) {
      setExpectedDelivery("Please enter a valid 6-digit pincode.");
      return;
    }

    const warehouseCoords = await getCoordinates(warehousePincode, setLoading);
    const userCoords = await getCoordinates(pincode, setLoading);

    if (warehouseCoords && userCoords) {
      const distanceKm = calculateDistance(
        warehouseCoords.lat,
        warehouseCoords.lon,
        userCoords.lat,
        userCoords.lon
      );

      let deliveryDays = 0;

      if (distanceKm > 500) {
        deliveryDays = 6;
      } else if (distanceKm > 400 && distanceKm <= 500) {
        deliveryDays = 5;
      } else if (distanceKm > 300 && distanceKm <= 400) {
        deliveryDays = 4;
      } else if (distanceKm > 200 && distanceKm <= 300) {
        deliveryDays = 3;
      } else if (distanceKm > 100 && distanceKm <= 200) {
        deliveryDays = 2;
      } else {
        deliveryDays = 1;
      }

      const today = new Date();
      const deliveryDate = new Date(today);
      deliveryDate.setDate(today.getDate() + deliveryDays);

      const options = { year: "numeric", month: "long", day: "numeric" };
      const formattedDate = deliveryDate.toLocaleDateString(undefined, options);

      setExpectedDelivery(`📍 Customer Location: ${userCoords.address}`);
      setExpectedDeliverydist(`📦 Distance: ${distanceKm} km`);
      setExpectedDeliverydate(
        `🚚 Delivery in ${deliveryDays} day(s) (Expected: ${formattedDate})`
      );
    } else {
      setExpectedDelivery("Unable to check delivery for this pincode.");
      setExpectedDeliverydist("");
      setExpectedDeliverydate("");
    }
  };

  return (
    <div className="pl-container">
      <div className="pl-navbar">
        <Navbar user={user} />
      </div>
      {updateMessage && <div className="pl-update-message">{updateMessage}</div>}
      <div className="pl-page">
        <div className="pl-main-container">
          {/* Image Gallery Section */}
          <div className="pl-gallery-section">
            <div className="pl-main-image-container">
              {images && images.length > 0 ? (
                <img 
                  src={images[selectedImageIndex]} 
                  alt={name} 
                  className="pl-main-image"
                />
              ) : (
                <div className="pl-no-image">No image available</div>
              )}
            </div>
            
            <div className="pl-thumbnail-container">
              {images && images.map((img, index) => (
                <div 
                  key={index} 
                  className={`pl-thumbnail ${index === selectedImageIndex ? 'pl-thumbnail-active' : ''}`}
                  onClick={() => handleImageSelect(index)}
                >
                  <img src={img} alt={`Thumbnail ${index}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info Section */}
          <div className="pl-info-section">
            <h1 className="pl-product-title">{name || "Product Name"}</h1>
            <div className="pl-rating-badge">
              <span className="pl-rating-star">★ {rating || "N/A"}</span>
              <span className="pl-rating-count">| {reviews.length} Ratings</span>
            </div>
            
            <div className="pl-price-section">
              <span className="pl-price">₹{price || "N/A"}</span>
              <span className="pl-price-offer">inclusive of all taxes</span>
            </div>
            
            <div className="pl-highlights">
              <h3 className="pl-section-title">Highlights</h3>
              <ul className="pl-highlight-list">
                <li>{brand || "Brand not specified"}</li>
                <li>{description || "No description available"}</li>
              </ul>
            </div>
            
            <div className="pl-delivery-section">
              <h3 className="pl-section-title">Delivery Options</h3>
              <div className="pl-stock-status">
                {stock > 0 ? (
                  <span className="pl-in-stock">In Stock ({stock} available)</span>
                ) : (
                  <span className="pl-out-stock">Out of Stock</span>
                )}
              </div>
              
              <div className="pl-delivery-checker">
                <div className="pl-delivery-input-group">
                  <input
                    type="text"
                    placeholder="Enter Pincode"
                    className="pl-delivery-input"
                    maxLength="6"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                  />
                  <button
                    className="pl-check-button"
                    onClick={handleCheckDelivery}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="pl-loader"></span>
                    ) : (
                      "Check"
                    )}
                  </button>
                </div>
                
                {expectedDelivery && (
                  <div className="pl-delivery-info">
                    <div className="pl-delivery-message">{expectedDelivery}</div>
                    <div className="pl-delivery-distance">{expectedDeliverydist}</div>
                    <div className="pl-delivery-date">{expectedDeliverydate}</div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="pl-action-buttons">
              <button
                className={`pl-cart-button ${isProdAdded ? 'pl-go-to-cart' : ''}`}
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
                <i className="fas fa-shopping-cart pl-button-icon"></i>
                {isProdAdded
                  ? "Go to Cart"
                  : stock > 0
                  ? "Add to Cart"
                  : "Out of Stock"}
              </button>

              <button
                className="pl-buy-button"
                onClick={handleBuyNow}
                disabled={stock <= 0}
              >
                {stock > 0 ? "Buy Now" : "Out of Stock"}
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="pl-reviews-section">
          <div className="pl-reviews-container">
            <h2 className="pl-reviews-title">Customer Reviews</h2>
            
            <div className="pl-review-form">
              <h3 className="pl-review-form-title">Write a Review</h3>
              <textarea
                className="pl-review-textarea"
                placeholder="Share your experience with this product..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />
              <div className="pl-rating-input-group">
                <input
                  type="number"
                  className="pl-rating-input"
                  placeholder="Rating (1-5)"
                  value={urating}
                  onChange={(e) => setRating(e.target.value)}
                  min="1"
                  max="5"
                />
                <button className="pl-submit-review" onClick={handleSubmit}>
                  Submit Review
                </button>
              </div>
            </div>
            
            <div className="pl-reviews-list">
              {reviews.length > 0 ? (
                reviews.map((r, index) => (
                  <div key={index} className="pl-review-card">
                    <div className="pl-review-header">
                      <div className="pl-reviewer-info">
                        <img
                          src={
                            userImages[r.userId]?.image ||
                            "/default-user.png"
                          }
                          alt="User"
                          className="pl-reviewer-avatar"
                        />
                        <div className="pl-reviewer-details">
                          <h4>{userImages[r.userId]?.username || "Anonymous"}</h4>
                          <div className="pl-review-rating">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span 
                                key={i} 
                                className={`pl-review-star ${i < r.rating ? 'pl-star-filled' : 'pl-star-empty'}`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pl-review-content">
                      <p>{r.review}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="pl-no-reviews">No reviews yet. Be the first to review!</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;