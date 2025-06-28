import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FaShoppingCart,
  FaStar,
  FaRegStar,
  FaTruck,
  FaMapMarkerAlt,
  FaCalendarAlt,
} from "react-icons/fa";
import { RiFlashlightFill } from "react-icons/ri";
import { IoIosArrowForward } from "react-icons/io";
import Navbar from "../navbar/Navbar";
import API_BASE_URL from "../../api";
import getCoordinates from "../../utils/Geolocation";
import "./ProductList.css";

const ProductList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  // State for product data
  const [productData, setProductData] = useState({
    name: "",
    price: 0,
    offerprice: 0,
    brand: "",
    images: [],
    rating: 0,
    description: "",
    stock: 0,
    category: "",
    deliverytime: "",
  });

  const [loading, setLoading] = useState(true);
  const [pincodeload, setPincodeLoad] = useState(false);
  const [pincode, setPincode] = useState("");
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [expectedDeliverydist, setExpectedDeliverydist] = useState("");
  const [expectedDeliverydate, setExpectedDeliverydate] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const warehousePincode = "641008";

  // User data from location or local storage
  const user = location.state?.user || null;
  const userId = user?._id;

  const [isProdAdded, setProdAdded] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [review, setReview] = useState("");
  const [urating, setRating] = useState("");
  const [reviews, setReviews] = useState([]);
  const [userImages, setUserImages] = useState({});
  const [activeTab, setActiveTab] = useState("description");
  const [zoomImage, setZoomImage] = useState(false);

  // Fetch product data if not in location state
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/products/fetch/${id}`
        );
        setProductData(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product data:", error);
        setLoading(false);
        navigate("/not-found");
      }
    };

    fetchData();
  }, [id, location.state, navigate]);

  // Other effects and handlers
  useEffect(() => {
    const checkIfItemInCart = async () => {
      if (!userId) return;

      try {
        const response = await axios.get(`${API_BASE_URL}/api/cart/check`, {
          params: { userId, itemId: id },
        });
        setProdAdded(response.data.exists);
      } catch (error) {
        console.error("Error checking item in cart:", error);
      }
    };

    const fetchUserDetails = async (userIds) => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/auth/users/details`,
          {
            params: { userIds: userIds.join(",") },
          }
        );
        setUserImages(response.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/${productData.category}/fetch/reviews`,
          {
            params: { itemId: id },
          }
        );
        setReviews(response.data.reviews || []);

        const uniqueUserIds = [
          ...new Set(response.data.reviews?.map((r) => r.userId) || []),
        ];
        if (uniqueUserIds.length > 0) {
          fetchUserDetails(uniqueUserIds);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    if (productData.category) {
      fetchReviews();
      if (userId) checkIfItemInCart();
    }
  }, [userId, id, productData.category]);

  const handleSubmit = async () => {
    if (!review || !urating) {
      alert("Please enter both review and rating");
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/api/${productData.category}/add/review`,
        {
          itemId: id,
          userId,
          review,
          rating: parseInt(urating),
        }
      );
      alert("Review submitted successfully!");
      setReview("");
      setRating("");
      
      const response = await axios.get(
        `${API_BASE_URL}/api/${productData.category}/fetch/reviews`,
        {
          params: { itemId: id },
        }
      );

      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Try again later.");
    }
  };

  const handleImageSelect = (index) => {
    setSelectedImageIndex(index);
  };

  const handleAddToCart = async () => {
    if (!userId) {
      alert("Please log in to add products to cart.");
      return;
    }

    const productDetails = {
      userId,
      itemId: id,
      name: productData.name,
      price: productData.price,
      brand: productData.brand,
      quantity: 1,
      description: productData.description,
      image: productData.images[0] || "",
      category: productData.category,
      deliverytime: productData.deliverytime,
      rating: productData.rating,
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/cart/add`,
        productDetails
      );
      if (response.data.success) {
        setUpdateMessage("Product successfully added to the cart!");
        setProdAdded(true);
        setTimeout(() => setUpdateMessage(""), 3000);
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
      alert("Please log in to proceed to checkout.");
      return;
    }

    navigate("/buynow", {
      state: {
        user,
        itemId: id,
        name: productData.name,
        price: productData.price,
        brand: productData.brand,
        quantity: 1,
        description: productData.description,
        images: productData.images,
        category: productData.category,
        deliverytime: productData.deliverytime,
        rating: productData.rating,
        stock: productData.stock,
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
    return (R * c).toFixed(2);
  };

  const handleCheckDelivery = async () => {
    if (pincode.length !== 6) {
      setExpectedDelivery("Please enter a valid 6-digit pincode.");
      return;
    }
    setPincodeLoad(true);
    try {
      const warehouseCoords = await getCoordinates(warehousePincode);
      const userCoords = await getCoordinates(pincode);

      if (warehouseCoords && userCoords) {
        const distanceKm = calculateDistance(
          warehouseCoords.lat,
          warehouseCoords.lon,
          userCoords.lat,
          userCoords.lon
        );

        let deliveryDays = Math.min(Math.ceil(distanceKm / 100) + 1, 6);
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);

        setExpectedDelivery(`Customer Location: ${userCoords.address}`);
        setExpectedDeliverydist(`Distance: ${distanceKm} km`);
        setExpectedDeliverydate(
          `Delivery in ${deliveryDays} day(s) (Expected: ${deliveryDate.toLocaleDateString()})`
        );
      } else {
        setExpectedDelivery("Unable to check delivery for this pincode.");
        setExpectedDeliverydist("");
        setExpectedDeliverydate("");
      }
    } catch (error) {
      console.error("Error checking delivery:", error);
      setExpectedDelivery("Error checking delivery. Please try again.");
    } finally {
      setPincodeLoad(false);
    }
  };

  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) =>
        i < rating ? (
          <FaStar key={i} className="star-filled" />
        ) : (
          <FaRegStar key={i} className="star-empty" />
        )
      );
  };

  if (loading) {
    return (
      <div className="product-page-container">
        <Navbar user={user} />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-page-container">
      <Navbar user={user} />

      {updateMessage && (
        <div className="notification-banner success">
          {updateMessage}
          <span className="close-btn" onClick={() => setUpdateMessage("")}>
            &times;
          </span>
        </div>
      )}

      <div className="product-main-content">
        {/* Breadcrumbs */}
        <div className="breadcrumbs">
          <span>Home</span>
          <IoIosArrowForward className="breadcrumb-arrow" />
          <span>{productData.category}</span>
          <IoIosArrowForward className="breadcrumb-arrow" />
          <span className="current">{productData.name}</span>
        </div>

        {/* Product Section */}
        <div className="product-section">
          {/* Image Gallery */}
          <div className="product-gallery">
            <div
              className={`main-image-container ${zoomImage ? "zoomed" : ""}`}
              onClick={() => setZoomImage(!zoomImage)}
            >
              {productData.images?.length > 0 ? (
                <img
                  src={productData.images[selectedImageIndex]}
                  alt={productData.name}
                  className="main-product-image"
                />
              ) : (
                <div className="no-image-placeholder">
                  <RiFlashlightFill className="placeholder-icon" />
                  <p>No image available</p>
                </div>
              )}
            </div>

            <div className="thumbnail-scroller">
              {productData.images?.map((img, index) => (
                <div
                  key={index}
                  className={`thumbnail-item ${
                    index === selectedImageIndex ? "active" : ""
                  }`}
                  onClick={() => handleImageSelect(index)}
                >
                  <img src={img} alt={`Thumbnail ${index}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="product-info">
            <h1 className="product-title">{productData.name}</h1>

            <div className="product-meta">
              <div className="rating-badge">
                {renderStars(Math.round(productData.rating))}
                <span className="rating-text">
                  {productData.rating.toFixed(1)} | {reviews.length} Ratings
                </span>
              </div>
              <span className="brand-name">{productData.brand}</span>
            </div>

            <div className="price-section">
              <div>
                <div className="current-price">
                  ₹{productData.price.toLocaleString()}
                </div>
                <span></span>
              </div>
              <div className="price-meta">inclusive of all taxes</div>
            </div>

            <div className="delivery-section">
              <h3 className="section-heading">
                <FaTruck className="section-icon" />
                Delivery Options
              </h3>

              <div
                className={`stock-status ${
                  productData.stock > 0 ? "in-stock" : "out-stock"
                }`}
              >
                {productData.stock > 0 ? (
                  <>
                    <span className="status-badge available">In Stock</span>
                    <span className="stock-text">
                      {productData.stock} units available
                    </span>
                  </>
                ) : (
                  <span className="status-badge unavailable">Out of Stock</span>
                )}
              </div>

              <div className="delivery-checker">
                <div className="pincode-input-group">
                  <div className="input-with-icon">
                    <FaMapMarkerAlt className="input-icon" />
                    <input
                      type="text"
                      placeholder="Enter Delivery Pincode"
                      maxLength="6"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                    />
                  </div>
                  <button
                    className="check-btn"
                    onClick={handleCheckDelivery}
                    disabled={pincodeload}
                  >
                    {pincodeload ? "Checking..." : "Check"}
                  </button>
                </div>

                {expectedDelivery && (
                  <div className="delivery-info-card">
                    <div className="info-row">
                      <FaMapMarkerAlt className="info-icon" />
                      <span>{expectedDelivery}</span>
                    </div>
                    <div className="info-row">
                      <FaTruck className="info-icon" />
                      <span>{expectedDeliverydist}</span>
                    </div>
                    <div className="info-row">
                      <FaCalendarAlt className="info-icon" />
                      <span>{expectedDeliverydate}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="action-buttons">
              <button
                className={`pl-cart-btn ${isProdAdded ? "go-to-cart" : ""}`}
                onClick={() => {
                  if (productData.stock <= 0) {
                    alert("Sorry, Out of Stock");
                  } else if (isProdAdded) {
                    navigate("/cart", {
                      state: { user, stock: productData.stock },
                    });
                  } else {
                    handleAddToCart();
                  }
                }}
                disabled={productData.stock <= 0 && !isProdAdded}
              >
                <FaShoppingCart className="btn-icon" />
                {isProdAdded
                  ? "Go to Cart"
                  : productData.stock > 0
                  ? "Add to Cart"
                  : "Out of Stock"}
              </button>

              <button
                className="buy-btn"
                onClick={handleBuyNow}
                disabled={productData.stock <= 0}
              >
                {productData.stock > 0 ? "Buy Now" : "Out of Stock"}
              </button>
            </div>

            <div className="product-highlights">
              <h3 className="section-heading">Highlights</h3>
              <ul className="highlight-list">
                <li>Brand: {productData.brand || "Not specified"}</li>
                <li>Category: {productData.category}</li>
                {productData.description && <li>{productData.description}</li>}
              </ul>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="product-details-tabs">
          <div className="tab-header">
            <button
              className={`tab-btn ${
                activeTab === "description" ? "active" : ""
              }`}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>
            <button
              className={`tab-btn ${activeTab === "reviews" ? "active" : ""}`}
              onClick={() => setActiveTab("reviews")}
            >
              Reviews ({reviews.length})
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "description" ? (
              <div className="description-content">
                <h3>Product Details</h3>
                <p>
                  {productData.description ||
                    "No detailed description available for this product."}
                </p>
                <div className="specs-grid">
                  <div className="spec-item">
                    <span className="spec-label">Brand</span>
                    <span className="spec-value">
                      {productData.brand || "-"}
                    </span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Category</span>
                    <span className="spec-value">
                      {productData.category || "-"}
                    </span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Rating</span>
                    <span className="spec-value">
                      {productData.rating.toFixed(1)} ({reviews.length} reviews)
                    </span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Delivery Time</span>
                    <span className="spec-value">
                      {productData.deliverytime || "Standard delivery"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="reviews-content">
                <div className="review-form-card">
                  <h3>Write a Review</h3>
                  <textarea
                    placeholder="Share your experience with this product..."
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                  />
                  <div className="rating-input-container">
                    <span>Your Rating:</span>
                    <div className="star-rating-input">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`rating-star ${
                            star <= urating ? "selected" : ""
                          }`}
                          onClick={() => setRating(star)}
                        />
                      ))}
                    </div>
                    <button
                      className="submit-review-btn"
                      onClick={handleSubmit}
                    >
                      Submit Review
                    </button>
                  </div>
                </div>

                {reviews.length > 0 ? (
                  <div className="reviews-list">
                    {reviews.map((r, index) => (
                      <div key={index} className="review-card">
                        <div className="reviewer-info">
                          <img
                            src={
                              userImages[r.userId]?.image || "/default-user.png"
                            }
                            alt="User"
                            className="reviewer-avatar"
                          />
                          <div className="reviewer-details">
                            <h4>
                              {userImages[r.userId]?.username || "Anonymous"}
                            </h4>
                            <div className="review-rating">
                              {renderStars(r.rating)}
                            </div>
                          </div>
                        </div>
                        <div className="review-text">
                          <p>{r.review}</p>
                        </div>
                        <div className="review-date">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-reviews">
                    <p>No reviews yet. Be the first to review this product!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
