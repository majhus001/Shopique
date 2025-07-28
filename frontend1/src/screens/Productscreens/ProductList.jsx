import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FaShoppingCart,
  FaStar,
  FaStarHalf,
  FaRegStar,
  FaTruck,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import normalizeError from "../../utils/Error/NormalizeError";
import ErrorDisplay from "../../utils/Error/ErrorDisplay";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import { RiFlashlightFill } from "react-icons/ri";
import { IoIosArrowForward } from "react-icons/io";
import Navbar from "../../components/navbar/Navbar";
import BottomNav from "../../components/Bottom Navbar/BottomNav";
import API_BASE_URL from "../../api";
import getCoordinates from "../../utils/Geolocation";
import "./ProductList.css";

const useScreenSize = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { isMobile };
};

const SkeletonImageGallery = () => (
  <div className="product-gallery skeleton">
    <div className="main-image-container">
      <div className="skeleton-main-image pulse-animation"></div>
    </div>
    <div className="thumbnail-scroller">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="thumbnail-item">
          <div className="skeleton-thumbnail pulse-animation"></div>
        </div>
      ))}
    </div>
    <div className="action-buttons">
      <div
        className="skeleton-button pulse-animation"
        style={{ width: "45%" }}
      ></div>
      <div
        className="skeleton-button pulse-animation"
        style={{ width: "45%" }}
      ></div>
    </div>
  </div>
);

const SkeletonProductInfo = () => (
  <div className="product-info skeleton">
    <div
      className="skeleton-title pulse-animation"
      style={{ width: "80%", height: "32px" }}
    ></div>
    <div
      className="skeleton-meta pulse-animation"
      style={{ width: "60%", height: "20px", marginTop: "12px" }}
    ></div>

    <div className="price-section">
      <div
        className="skeleton-price pulse-animation"
        style={{ width: "120px", height: "36px" }}
      ></div>
      <div
        className="skeleton-price-meta pulse-animation"
        style={{ width: "150px", height: "16px" }}
      ></div>
    </div>

    <div className="product-highlights">
      <div
        className="skeleton-section-heading pulse-animation"
        style={{ width: "100px", height: "24px" }}
      ></div>
      <div className="skeleton-highlight-list">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="skeleton-highlight-item pulse-animation"
            style={{ width: `${80 + Math.random() * 20}%`, height: "16px" }}
          ></div>
        ))}
      </div>
    </div>

    <div className="delivery-section">
      <div
        className="skeleton-section-heading pulse-animation"
        style={{ width: "120px", height: "24px" }}
      ></div>
      <div
        className="skeleton-stock-status pulse-animation"
        style={{ width: "200px", height: "20px" }}
      ></div>
      <div className="skeleton-delivery-checker">
        <div
          className="skeleton-pincode-input pulse-animation"
          style={{ width: "100%", height: "40px" }}
        ></div>
      </div>
    </div>
  </div>
);

const SkeletonTabs = () => (
  <div className="product-details-tabs skeleton">
    <div className="tab-header">
      <div
        className="skeleton-tab pulse-animation"
        style={{ width: "120px", height: "40px" }}
      ></div>
      <div
        className="skeleton-tab pulse-animation"
        style={{ width: "120px", height: "40px" }}
      ></div>
    </div>
    <div className="tab-content">
      <div className="skeleton-description">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="skeleton-description-line pulse-animation"
            style={{ width: `${70 + Math.random() * 30}%`, height: "16px" }}
          ></div>
        ))}
      </div>
    </div>
  </div>
);

const SkeletonRelatedProducts = () => (
  <div className="pl-products-section skeleton">
    <div
      className="pl-section-title pulse-animation"
      style={{ width: "200px", height: "28px" }}
    ></div>
    <div className="pl-horizontal-scroll-container">
      <div
        className="pl-scroll-button pulse-animation"
        style={{ width: "40px", height: "40px" }}
      ></div>
      <div className="pl-product-horizontal-scroll">
        {[1, 2, 3, 4, 5].map((i) => (
          <div className="pl-product-card-horizontal" key={i}>
            <div
              className="pl-product-image-container pulse-animation"
              style={{ height: "180px" }}
            ></div>
            <div className="pl-product-details">
              <div
                className="skeleton-line pulse-animation"
                style={{ width: "80%", height: "18px" }}
              ></div>
              <div
                className="skeleton-line pulse-animation"
                style={{ width: "60%", height: "22px", marginTop: "8px" }}
              ></div>
              <div
                className="skeleton-line pulse-animation"
                style={{ width: "40%", height: "16px", marginTop: "8px" }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      <div
        className="pl-scroll-button pulse-animation"
        style={{ width: "40px", height: "40px" }}
      ></div>
    </div>
  </div>
);

const ProductList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const user = useSelector((state) => state.user);

  // State for product data
  const [productData, setProductData] = useState(location.state?.product || {});
  const [relatedProds, setRelatedProds] = useState({});
  const [loading, setLoading] = useState(true);
  const [pincodeload, setPincodeLoad] = useState(false);
  const [pincode, setPincode] = useState(user?.pincode || "");
  const [isPincodeFocused, setIsPincodeFocused] = useState(false);
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [expectedDeliverydist, setExpectedDeliverydist] = useState("");
  const [expectedDeliverydate, setExpectedDeliverydate] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const warehousePincode = "641008";

  const [userId, setUserId] = useState(user?._id || null);
  const [userDetails, setUserDetails] = useState(user || null);
  const [isProdAdded, setProdAdded] = useState(false);
  const [error, setError] = useState(null);

  const [review, setReview] = useState("");
  const [urating, setRating] = useState("");
  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [userImages, setUserImages] = useState({});
  const [activeTab, setActiveTab] = useState("description");
  const [zoomImage, setZoomImage] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 10;
  const [expandedReviews, setExpandedReviews] = useState({});
  const { isMobile } = useScreenSize();

  const getCharacterLimit = () => (isMobile ? 100 : 250);
  const toggleReviewExpand = (reviewId) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  const reviewsWithExpansion = reviews.map((r) => ({
    ...r,
    expanded: expandedReviews[r._id] || false,
  }));

  const productContainerRefs = useRef({});

  const scrollLeft = (product) => {
    const container = productContainerRefs.current[product];
    if (container) {
      container.scrollBy({ left: -500, behavior: "smooth" });
    }
  };

  const scrollRight = (product) => {
    const container = productContainerRefs.current[product];
    if (container) {
      container.scrollBy({ left: 500, behavior: "smooth" });
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!navigator.onLine) {
        throw new Error(
          "You appear to be offline. Please check your internet connection."
        );
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/products/fetch/${id}`
      );

      setProductData(response.data.data);
      setRelatedProds(response.data.relatedProducts);
    } catch (err) {
      console.error("Error fetching product data:", err);
      if (
        err.response &&
        err.response.status >= 400 &&
        err.response.status < 500
      ) {
        toast.error(
          err.response.data.message || "Error fetching Products data"
        );
      } else {
        let errorMessage = normalizeError(err);
        setError(errorMessage);
        setProductsByCategory([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const checkIfItemInCart = async () => {
    if (!user) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/api/cart/check`, {
        params: { userId, productId: id },
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

  const fetchReviews = async (page = 1) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/product/reviews/fetch`,
        {
          params: {
            itemId: id,
            page,
            limit: reviewsPerPage,
          },
        }
      );
      setReviews(response.data.reviews || []);
      setTotalReviews(response.data.total || 0);

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

  useEffect(() => {
    fetchData();
    fetchReviews();
  }, [id, user, navigate]);

  useEffect(() => {
    if (user) {
      checkIfItemInCart();
    }
  }, [id, productData.category]);

  // Handle page change for reviews
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchReviews(newPage);
  };

  const handleSubmit = async () => {
    if (!review || !urating) {
      toast.error("Please enter both review and rating");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/product/reviews/add`, {
        itemId: id,
        userId,
        review,
        rating: parseInt(urating),
      });
      toast.info("Review submitted successfully!");
      setReview("");
      setRating("");
      fetchReviews(1);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review. Try again later.");
    }
  };

  const handleImageSelect = (index) => {
    setSelectedImageIndex(index);
  };

  const handleAddToCart = async () => {
    if (!userId) {
      toast.error("Please log in to add products to cart.");
      return;
    }

    const productDetails = {
      userId,
      productId: id,
      quantity: 1,
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/cart/add`,
        productDetails
      );
      if (response.data.success) {
        toast.success("Product added to the cart!");
        setProdAdded(true);
      } else {
        toast.warn(response.data.message || "Failed to add product to cart.");
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      toast.warn("Something went wrong. Please try again.");
    }
  };

  const handleBuyNow = () => {
    if (!userDetails) {
      toast.warn("Please log in to buy products.");
      return;
    }

    navigate(`/user/${userId}/product/buynow`, {
      state: {
        product: productData,
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
      .map((_, i) => {
        if (i < Math.floor(rating)) {
          return <FaStar key={i} className="star-filled" />;
        }
        if (i < rating) {
          // Handles decimal (e.g., 3.5)
          return <FaStarHalf key={i} className="star-half" />;
        }
        return <FaRegStar key={i} className="star-empty" />;
      });
  };

  // Calculate total pages for reviews
  const totalPages = Math.ceil(totalReviews / reviewsPerPage);

  if (loading) {
    return (
      <div className="product-page-container">
        <Navbar />
        <div className="product-main-content">
          <div className="product-section">
            <SkeletonImageGallery />
            <SkeletonProductInfo />
          </div>
          <SkeletonTabs />
          <SkeletonRelatedProducts />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <ErrorDisplay error={error} onRetry={fetchData} />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="product-page-container">
      <Navbar />
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

      <div className="product-main-content">
        {/* Breadcrumbs */}
        <div className="breadcrumbs">
          <span>Home</span>
          <IoIosArrowForward className="breadcrumb-arrow" />
          <span>{productData.category}</span>
          <IoIosArrowForward className="breadcrumb-arrow" />
          <span>{productData.subCategory}</span>
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

            <div className="action-buttons">
              <button
                className={`pl-cart-btn ${isProdAdded ? "go-to-cart" : ""}`}
                onClick={() => {
                  if (productData.stock <= 0) {
                    toast.error("Sorry, Out of Stock");
                  } else if (isProdAdded) {
                    navigate(`/user/${userId}/cart`);
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
          </div>

          {/* Product Info */}
          <div className="product-info">
            <h1 className="product-title">
              <span className="product-name">{productData.name}</span>
              <span className="pl-brand-name">{productData.brand}</span>
            </h1>

            <div className="pl-product-meta">
              <div className="rating-badge">
                {renderStars(Math.round(productData.rating))}
                <span className="rating-text">
                  {productData.rating?.toFixed(1)} | {totalReviews} Ratings
                </span>
              </div>
              <span className="pl-mv-brand-name">{productData.brand}</span>
            </div>

            <div className="price-section">
              <div>
                <div className="pl-current-price">
                  {productData.offerPrice &&
                  productData.offerPrice !== productData.price ? (
                    <>
                      <span className="pl-offer-price">
                        ₹{productData.offerPrice.toLocaleString()}
                      </span>
                      <span className="pl-original-price">
                        ₹{productData.price.toLocaleString()}
                      </span>
                    </>
                  ) : (
                    <span className="pl-offer-price">
                      ₹{productData.price?.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="price-meta">inclusive of all taxes</div>
            </div>

            <div className="product-highlights">
              <h3 className="section-heading">Highlights</h3>
              <ul className="highlight-list">
                <li>Brand: {productData.brand || "Not specified"}</li>
                <li>Category: {productData.category}</li>
                {productData.description && <li>{productData.description}</li>}
              </ul>

              {productData.specifications && (
                <>
                  <h3 className="section-heading">Specifications</h3>
                  <div className="specifications-cont">
                    {Object.entries(productData.specifications).map(
                      ([key, value]) => (
                        <div key={key} className="pl-spec-item">
                          <span className="pl-spec-label">
                            {key.replace(/-/g, " ")}
                          </span>
                          <span className="pl-spec-value">{value}</span>
                        </div>
                      )
                    )}
                  </div>
                </>
              )}
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
                      placeholder={!pincode ? "Enter Delivery Pincode" : ""}
                      maxLength="6"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      onFocus={() => setIsPincodeFocused(true)}
                      onBlur={() => setIsPincodeFocused(false)}
                      className={
                        !isPincodeFocused && !pincode
                          ? "faded-input"
                          : "normal-input"
                      }
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
              Reviews ({totalReviews})
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
                      {productData.subCategory?.charAt(0).toUpperCase() +
                        productData.subCategory?.slice(1) || "-"}
                    </span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Rating</span>
                    <span className="spec-value">
                      {productData.rating?.toFixed(1)} ({totalReviews} reviews)
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
                    style={{
                      resize: "none",
                      width: "100%",
                      height: "100px",
                      padding: "10px",
                      boxSizing: "border-box",
                    }}
                    onChange={(e) => {
                      if (e.target.value.length <= 500) {
                        setReview(e.target.value);
                      } else toast.warn("Maximum characters reached");
                    }}
                    maxLength={501}
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
                  <>
                    <div className="reviews-list">
                      {reviewsWithExpansion.map((r, index) => {
                        const charLimit = getCharacterLimit();
                        const shouldTruncate =
                          r.review.length > charLimit && !r.expanded;

                        return (
                          <div key={index} className="review-card">
                            <div className="reviewer-info">
                              <img
                                src={
                                  userImages[r.userId]?.image ||
                                  "/default-user.png"
                                }
                                alt="User"
                                className="reviewer-avatar"
                              />
                              <div className="reviewer-details">
                                <h4>
                                  {userImages[r.userId]?.username ||
                                    "Anonymous"}
                                </h4>
                                <div className="review-rating">
                                  {renderStars(r.rating)}
                                </div>
                              </div>
                              <div className="review-date">
                                {new Date(r.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="review-text">
                              <p>
                                {shouldTruncate ? (
                                  <>
                                    {r.review.substring(0, charLimit)}...
                                    <button
                                      className="view-more-btn"
                                      onClick={() => toggleReviewExpand(r._id)}
                                    >
                                      View More
                                    </button>
                                  </>
                                ) : (
                                  r.review
                                )}
                              </p>
                              {r.review.length > charLimit && r.expanded && (
                                <button
                                  className="view-less-btn"
                                  onClick={() => toggleReviewExpand(r._id)}
                                >
                                  View Less
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="pagination-controls">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="pagination-btn"
                        >
                          <FaChevronLeft />
                        </button>

                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`pagination-btn ${
                                  currentPage === pageNum ? "active" : ""
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                        )}

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="pagination-btn"
                        >
                          <FaChevronRight />
                        </button>

                        <span className="pagination-info">
                          Page {currentPage} of {totalPages}
                        </span>
                      </div>
                    )}
                  </>
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

      <section className="pl-products-section">
        {relatedProds.length > 0 ? (
          <div className="pl-related-products-container">
            <span className="pl-section-title">Related products</span>

            <div className="pl-horizontal-scroll-container">
              {relatedProds.length > 5 && (
                <button
                  className="pl-scroll-button pl-left"
                  onClick={() => scrollLeft("related")}
                  aria-label="pl-Scroll pl-left"
                >
                  <FaChevronLeft />
                </button>
              )}

              <div
                className="pl-product-horizontal-scroll"
                ref={(el) => (productContainerRefs.current["related"] = el)}
              >
                {relatedProds.map((item) => (
                  <div
                    className="pl-product-card-horizontal"
                    key={item._id}
                    onClick={() =>
                      navigate(
                        `/products/${item.category}/${item.subCategory}/${item._id}`,
                        {
                          state: { product: item },
                        }
                      )
                    }
                  >
                    <div className="pl-product-image-container">
                      <img
                        src={item.images?.[0] || ""}
                        alt={item.name}
                        className="pl-product-image"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = "";
                          e.target.alt = "Image not available";
                          e.target.className = "product-image-error";
                        }}
                      />
                      {item.offerPrice && item.price > item.offerPrice && (
                        <div className="pl-discount-badge">
                          {Math.round(
                            ((item.price - item.offerPrice) / item.price) * 100
                          )}
                          % OFF
                        </div>
                      )}
                    </div>
                    <div className="pl-product-details">
                      <h4 className="pl-product-name">{item.name}</h4>
                      <div className="pl-price-container">
                        {item.offerPrice ? (
                          <>
                            <span className="pl-rp-offer-price">
                              ₹{item.offerPrice.toLocaleString()}
                            </span>
                            <span className="pl-rp-original-price">
                              ₹{item.price.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className="pl-rp-price">
                            ₹{item.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="pl-product-meta">
                        {item.rating > 0 && (
                          <div className="pl-rating">
                            <FaStar className="pl-star-icon" />
                            <span>{item.rating.toFixed(1)}</span>
                          </div>
                        )}
                        {item.stock > 0 && (
                          <div className="pl-stock-status">
                            <span>{item.stock} in stock</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {relatedProds.length > 5 && (
                <button
                  className="pl-scroll-button pl-right"
                  onClick={() => scrollRight("related")}
                  aria-label="pl-Scroll pl-right"
                >
                  <FaChevronRight />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="pl-empty-state">
            <RiFlashlightFill className="pl-empty-icon" />
            <h3>No related products found</h3>
          </div>
        )}
      </section>

      <BottomNav />
    </div>
  );
};

export default ProductList;
