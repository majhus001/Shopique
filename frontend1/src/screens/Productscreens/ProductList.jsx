import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./ProductList.css";
import Navbar from "../navbar/Navbar";
import API_BASE_URL from "../../api";
import getCoordinates from "../../utils/Geolocation";

const ProductList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  // State for product data
  const [productData, setProductData] = useState({
    name: "",
    price: 0,
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

  // Fetch product data if not in location state
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (location.state) {
          // Use data from location state if available
          setProductData({
            name: location.state.name || "",
            price: location.state.price || 0,
            brand: location.state.brand || "",
            images: location.state.images || [],
            rating: location.state.rating || 0,
            description: location.state.description || "",
            stock: location.state.stock || 0,
            category: location.state.category || "",
            deliverytime: location.state.deliverytime || "",
          });
        } else {
          // Fetch from backend if no location state
          const response = await axios.get(
            `${API_BASE_URL}/api/products/fetch/${id}`
          );
          setProductData(response.data.data);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product data:", error);
        setLoading(false);
        navigate("/not-found"); // Or handle error appropriately
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
      // Refresh reviews
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

        setExpectedDelivery(`📍 Customer Location: ${userCoords.address}`);
        setExpectedDeliverydist(`📦 Distance: ${distanceKm} km`);
        setExpectedDeliverydate(
          `🚚 Delivery in ${deliveryDays} day(s) (Expected: ${deliveryDate.toLocaleDateString()})`
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

  if (loading) {
    return (
      <div className="pl-container">
        <div className="pl-navbar">
          <Navbar user={user} />
        </div>
        <div className="pl-loading">Loading product details...</div>
      </div>
    );
  }

  return (
    <div className="pl-container">
      <div className="pl-navbar">
        <Navbar user={user} />
      </div>
      {updateMessage && (
        <div className="pl-update-message">{updateMessage}</div>
      )}
      <div className="pl-page">
        <div className="pl-main-container">
          {/* Image Gallery Section */}
          <div className="pl-gallery-section">
            <div className="pl-main-image-container">
              {productData.images?.length > 0 ? (
                <img
                  src={productData.images[selectedImageIndex]}
                  alt={productData.name}
                  className="pl-main-image"
                />
              ) : (
                <div className="pl-no-image">No image available</div>
              )}
            </div>

            <div className="pl-thumbnail-container">
              {productData.images?.map((img, index) => (
                <div
                  key={index}
                  className={`pl-thumbnail ${
                    index === selectedImageIndex ? "pl-thumbnail-active" : ""
                  }`}
                  onClick={() => handleImageSelect(index)}
                >
                  <img src={img} alt={`Thumbnail ${index}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info Section */}
          <div className="pl-info-section">
            <h1 className="pl-product-title">
              {productData.name || "Product Name"}
            </h1>
            <div className="pl-rating-badge">
              <span className="pl-rating-star">
                ★ {productData.rating || "N/A"}
              </span>
              <span className="pl-rating-count">
                | {reviews.length} Ratings
              </span>
            </div>

            <div className="pl-price-section">
              <span className="pl-price">₹{productData.price || "N/A"}</span>
              <span className="pl-price-offer">inclusive of all taxes</span>
            </div>

            <div className="pl-highlights">
              <h3 className="pl-section-title">Highlights</h3>
              <ul className="pl-highlight-list">
                <li>{productData.brand || "Brand not specified"}</li>
                <li>{productData.description || "No description available"}</li>
              </ul>
            </div>

            <div className="pl-delivery-section">
              <h3 className="pl-section-title">Delivery Options</h3>
              <div className="pl-stock-status">
                {productData.stock > 0 ? (
                  <span className="pl-in-stock">
                    In Stock ({productData.stock} available)
                  </span>
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
                    disabled={pincodeload}
                  >
                    {pincodeload ? <span className="pl-loader"></span> : "Check"}
                  </button>
                </div>

                {expectedDelivery && (
                  <div className="pl-delivery-info">
                    <div className="pl-delivery-message">
                      {expectedDelivery}
                    </div>
                    <div className="pl-delivery-distance">
                      {expectedDeliverydist}
                    </div>
                    <div className="pl-delivery-date">
                      {expectedDeliverydate}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pl-action-buttons">
              <button
                className={`pl-cart-button ${
                  isProdAdded ? "pl-go-to-cart" : ""
                }`}
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
                <i className="fas fa-shopping-cart pl-button-icon"></i>
                {isProdAdded
                  ? "Go to Cart"
                  : productData.stock > 0
                  ? "Add to Cart"
                  : "Out of Stock"}
              </button>

              <button
                className="pl-buy-button"
                onClick={handleBuyNow}
                disabled={productData.stock <= 0}
              >
                {productData.stock > 0 ? "Buy Now" : "Out of Stock"}
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
                            userImages[r.userId]?.image || "/default-user.png"
                          }
                          alt="User"
                          className="pl-reviewer-avatar"
                        />
                        <div className="pl-reviewer-details">
                          <h4>
                            {userImages[r.userId]?.username || "Anonymous"}
                          </h4>
                          <div className="pl-review-rating">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className={`pl-review-star ${
                                  i < r.rating
                                    ? "pl-star-filled"
                                    : "pl-star-empty"
                                }`}
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
                <div className="pl-no-reviews">
                  No reviews yet. Be the first to review!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
