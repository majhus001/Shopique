import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./HomeStyle.css";
import axios from "axios";
import normalizeError from "../../utils/Error/NormalizeError";
import ErrorDisplay from "../../utils/Error/ErrorDisplay";
import bannerImage from "../../assets/banner1.jpeg";
import bannerImage1 from "../../assets/banner2.jpeg";
import bannerImage2 from "../../assets/banner3.jpeg";
import Navbar from "../../components/navbar/Navbar";
import API_BASE_URL from "../../api";
import {
  FiClock,
  FiShoppingBag,
  FiStar,
  FiChevronRight,
  FiChevronLeft,
} from "react-icons/fi";
import BottomNav from "../../components/Bottom Navbar/BottomNav";

// Add timeout utility for fetch
AbortSignal.timeout = function (ms) {
  const controller = new AbortController();
  setTimeout(
    () =>
      controller.abort(
        new DOMException("TimeoutError", "The operation timed out")
      ),
    ms
  );
  return controller.signal;
};

const capitalizeWords = (string) => {
  if (!string) return "";
  return string
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const SkeletonLoading = () => {
  return (
    <div className="skeleton-loading-container">
      {/* Banner skeleton */}
      <div className="skeleton-banner"></div>

      {/* Countdown skeleton */}
      <div className="skeleton-countdown"></div>

      {/* Featured categories skeleton */}
      <div className="skeleton-section">
        <div className="skeleton-header"></div>
        <div className="skeleton-featured-categories">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton-featured-card"></div>
          ))}
        </div>
      </div>

      {/* Product categories skeleton */}
      {[...Array(3)].map((_, catIndex) => (
        <div key={catIndex} className="skeleton-section">
          <div className="skeleton-category-header">
            <div className="skeleton-title"></div>
            <div className="skeleton-view-all"></div>
          </div>
          <div className="skeleton-products-container">
            <div className="skeleton-scroll-button left"></div>
            <div className="skeleton-products-scroll">
              {[...Array(5)].map((_, prodIndex) => (
                <div key={prodIndex} className="skeleton-product-card">
                  <div className="skeleton-product-image"></div>
                  <div className="skeleton-product-details">
                    <div className="skeleton-product-name"></div>
                    <div className="skeleton-price-container">
                      <div className="skeleton-price"></div>
                    </div>
                    <div className="skeleton-product-meta">
                      <div className="skeleton-rating"></div>
                      <div className="skeleton-sales"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="skeleton-scroll-button right"></div>
          </div>
        </div>
      ))}

      {/* Newsletter skeleton */}
      <div className="skeleton-newsletter"></div>
    </div>
  );
};

const HomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(location.state?.user || null);
  const [productsByCategory, setProductsByCategory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);
  // const bannerImages = [bannerImage, bannerImage1, bannerImage2];
  const [bannerImages, setBannerImages] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const productContainerRefs = useRef({});

  const scrollLeft = (subCategory) => {
    const container = productContainerRefs.current[subCategory];
    if (container) {
      container.scrollBy({ left: -500, behavior: "smooth" });
    }
  };

  const scrollRight = (subCategory) => {
    const container = productContainerRefs.current[subCategory];
    if (container) {
      container.scrollBy({ left: 500, behavior: "smooth" });
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!navigator.onLine) {
        throw new Error(
          "You appear to be offline. Please check your internet connection."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/api/products/fetchByCategories`,
        { signal: AbortSignal.timeout(8000) }
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const responseData = await response.json();

      if (!responseData.success || !Array.isArray(responseData.data)) {
        throw new Error("Invalid data received from server");
      }

      const processedData = responseData.data.map((category) => ({
        ...category,
        subCategory:
          category.subCategory || capitalizeWords(category.subCategory || ""),
      }));

      setProductsByCategory(processedData);
    } catch (err) {
      console.error("Error fetching data:", err);
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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const bannerfetch = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/banners/fetchimages`
        );
        if (response.data.success) {
          setBannerImages(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    bannerfetch();
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (bannerImages.length === 0) return;

    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % bannerImages.length);
    }, 3000); // changes every 3 seconds

    return () => clearInterval(interval); // clean up on unmount
  }, [bannerImages]);

  useEffect(() => {
    const targetDate = new Date("2025-07-30T00:00:00");
    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetDate - now;

      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handlecategoryClick = (subCategory) => {
    let prodCategory = null;
    let prodSubCategory = null;
    let productId = null;
    productsByCategory.forEach((item) => {
      if (item.subCategory === subCategory) {
        item.products.forEach((el) => {
          prodSubCategory = el.subCategory;
          prodCategory = el.category;
          productId = el._id;
        });
      }
    });
    navigate(
      `/products/search/${prodCategory}/${prodSubCategory}/${productId}`,
      {
        state: {
          user: userDetails,
          productCategory: prodCategory,
          productSubCategory: prodSubCategory,
        },
      }
    );
  };

  useEffect(() => {
    const handleScroll = () => {
      const nav = document.querySelector(".usprof-nav");
      if (window.scrollY > 50) {
        nav.classList.add("scrolled");
      } else {
        nav.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleprodlistnavigation = (item) => {
    navigate(`/products/${item.category}/${item.subCategory}/${item._id}`, {
      state: {
        product: item,
      },
    });
  };

  if (loading) {
    return (
      <div className="app">
        <Navbar />
        <div className="main-container">
          <div className="content">
            <SkeletonLoading />
          </div>
        </div>
        <BottomNav />
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
    <div className="app">
      <Navbar />
      <div className="main-container">
        <div className="content">
          <section className="hero-section">
            <div className="hero-banner">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="banner-image-container"
                >
                  <img
                    src={bannerImages[currentImage]}
                    alt={`Banner ${currentImage + 1}`}
                    className="banner-image"
                    loading="lazy"
                  />
                  <div className="banner-overlay"></div>
                  <div className="banner-content">
                    <motion.h2
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="ad-ban-disount-heading"
                    >
                      Summer Collection 2025
                    </motion.h2>
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      Up to 50% off on selected items!
                    </motion.p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="ban-shop-now-btn"
                      onClick={() => navigate("/products")}
                    >
                      Shop Now
                    </motion.button>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Indicator buttons */}
              <div className="banner-indicators">
                {bannerImages.map((_, index) => (
                  <button
                    key={`banner-${index}`}
                    className={`indicator ${
                      index === currentImage ? "active" : ""
                    }`}
                    onClick={() => setCurrentImage(index)}
                    aria-label={`Go to banner ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <motion.div
              className="countdown-card"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="countdown-content">
                <div className="countdown-title-timer-cont">
                  <div className="countdown-header">
                    <FiClock className="countdown-icon" />
                    <h3>Limited Time Offer</h3>
                  </div>
                  <div className="timer-grid">
                    <motion.div
                      className="timer-block"
                      whileHover={{ scale: 1.05 }}
                    >
                      <span className="timer-value">{timeLeft.days}</span>
                      <span className="timer-label">Days</span>
                    </motion.div>
                    <motion.div
                      className="timer-block"
                      whileHover={{ scale: 1.05 }}
                    >
                      <span className="timer-value">{timeLeft.hours}</span>
                      <span className="timer-label">Hours</span>
                    </motion.div>
                    <motion.div
                      className="timer-block"
                      whileHover={{ scale: 1.05 }}
                    >
                      <span className="timer-value">{timeLeft.minutes}</span>
                      <span className="timer-label">Minutes</span>
                    </motion.div>
                    <motion.div
                      className="timer-block"
                      whileHover={{ scale: 1.05 }}
                    >
                      <span className="timer-value">{timeLeft.seconds}</span>
                      <span className="timer-label">Seconds</span>
                    </motion.div>
                  </div>
                </div>
                <motion.button
                  className="deal-btn"
                  onClick={() => navigate("/products")}
                  aria-label="Grab the deal"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiShoppingBag className="deal-icon" />
                  <span>Grab the Deal</span>
                </motion.button>
              </div>
            </motion.div>
          </section>

          <section className="featured-section">
            <div className="featured-scroll-wrapper">
              <div className="featured-category-cont">
                {productsByCategory.slice(0, 8).map((category) => (
                  <motion.div
                    key={category._id}
                    className="featured-category-card"
                    onClick={() => handlecategoryClick(category.subCategory)}
                    transition={{ duration: 0.3 }}
                    whileHover={{ zIndex: 10 }}
                  >
                    <div className="category-image-container">
                      <img
                        src={
                          category.products[0]?.images[0] ||
                          "/placeholder-category.jpg"
                        }
                        alt={category.displayName || category.subCategory}
                        className="category-image"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = "/placeholder-category.jpg";
                        }}
                      />
                    </div>
                    <div className="category-info">
                      <span>
                        {capitalizeWords(category.subCategory)}
                        <FiChevronRight />
                      </span>
                    </div>

                    <div className="category-dropdown">
                      {category.products.slice(0, 5).map((item) => (
                        <div
                          key={item._id}
                          className="dropdown-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleprodlistnavigation(item);
                          }}
                        >
                          <img
                            className="dropdown-img"
                            src={item.images[0]}
                            alt={item.name}
                          />
                          <span className="dropdown-item-name">
                            {item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section className="products-section">
            {productsByCategory.length > 0 ? (
              productsByCategory.map(
                ({ displayName, subCategory, products: categoryProducts }) => (
                  <div className="product-category" key={subCategory}>
                    <motion.div
                      className="category-header"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                    >
                      <h4>{capitalizeWords(subCategory)}</h4>
                      <span
                        onClick={() => handlecategoryClick(subCategory)}
                        className="view-all-link"
                      >
                        View All <FiChevronRight />
                      </span>
                    </motion.div>

                    <div className="horizontal-scroll-container">
                      <motion.button
                        className="scroll-button left"
                        onClick={() => scrollLeft(subCategory)}
                        aria-label="Scroll left"
                      >
                        <FiChevronLeft />
                      </motion.button>

                      <div
                        className="product-horizontal-scroll"
                        ref={(el) =>
                          (productContainerRefs.current[subCategory] = el)
                        }
                      >
                        {categoryProducts.map((item) => (
                          <motion.div
                            className="product-card-horizontal"
                            key={item._id}
                            whileHover={{
                              boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                              y: -5,
                            }}
                            transition={{ duration: 0.3 }}
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                          >
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                handleprodlistnavigation(item);
                              }}
                            >
                              <div className="product-image-container">
                                <motion.img
                                  src={item.images?.[0] || ""}
                                  alt={item.name}
                                  className="product-image"
                                  loading="lazy"
                                  onError={(e) => {
                                    e.target.src = "";
                                    e.target.alt = "Image not available";
                                    e.target.className = "product-image-error";
                                  }}
                                />
                                {item.offerPrice && (
                                  <motion.div
                                    className="discount-badge"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.3 }}
                                  >
                                    {Math.round(
                                      ((item.price - item.offerPrice) /
                                        item.price) *
                                        100
                                    )}
                                    % OFF
                                  </motion.div>
                                )}
                              </div>
                              <div className="product-details">
                                <h4 className="product-name">{item.name}</h4>
                                <div className="price-container">
                                  {item.offerPrice ? (
                                    <>
                                      <span className="offer-price">
                                        ₹{item.offerPrice}
                                      </span>
                                      <span className="original-price">
                                        ₹{item.price}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="price">₹{item.price}</span>
                                  )}
                                </div>
                                <div className="product-meta">
                                  {item.rating > 0 && (
                                    <div className="rating">
                                      <FiStar className="star-icon" />
                                      <span>{item.rating.toFixed(1)}</span>
                                    </div>
                                  )}
                                  {item.salesCount > 0 && (
                                    <div className="sales-count">
                                      <FiShoppingBag />
                                      <span>{item.salesCount + 50} sold</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <motion.button
                        className="scroll-button right"
                        onClick={() => scrollRight(subCategory)}
                        aria-label="Scroll right"
                      >
                        <FiChevronRight />
                      </motion.button>
                    </div>
                  </div>
                )
              )
            ) : (
              <motion.div
                className="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <img
                  src="/empty-state.svg"
                  alt="No products available"
                  loading="lazy"
                />
                <h3>No products available</h3>
                <p>Check back later for new arrivals</p>
                <button onClick={fetchData}>Refresh</button>
              </motion.div>
            )}
          </section>

          <motion.section
            className="newsletter-section"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="newsletter-container">
              <div className="newsletter-content">
                <h2>Subscribe to Our Newsletter</h2>
                <p>Get the latest updates on new products and upcoming sales</p>
                <form className="newsletter-form">
                  <motion.input
                    type="email"
                    placeholder="Your email address"
                    required
                    aria-label="Email address for newsletter"
                    whileFocus={{
                      boxShadow: "0 0 0 2px var(--primary-color)",
                    }}
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Subscribe
                  </motion.button>
                </form>
              </div>
            </div>
          </motion.section>
        </div>
      </div>

      <motion.footer
        className="modern-footer"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="footer-container">
          <div className="footer-grid">
            <motion.div
              className="footer-column"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h4>Shop</h4>
              <ul>
                <li>
                  <Link to="/products">All Products</Link>
                </li>
                <li>
                  <Link to="/products?filter=featured">Featured</Link>
                </li>
                <li>
                  <Link to="/products?filter=new">New Arrivals</Link>
                </li>
                <li>
                  <Link to="/products?filter=sale">Sale Items</Link>
                </li>
              </ul>
            </motion.div>
            <motion.div
              className="footer-column"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h4>Customer Service</h4>
              <ul>
                <li>
                  <Link to="/contact">Contact Us</Link>
                </li>
                <li>
                  <Link to="/faq">FAQs</Link>
                </li>
                <li>
                  <Link to="/shipping">Shipping Policy</Link>
                </li>
                <li>
                  <Link to="/returns">Returns & Exchanges</Link>
                </li>
              </ul>
            </motion.div>
            <motion.div
              className="footer-column"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h4>About Us</h4>
              <ul>
                <li>
                  <Link to="/about">Our Story</Link>
                </li>
                <li>
                  <Link to="/careers">Careers</Link>
                </li>
                <li>
                  <Link to="/blog">Blog</Link>
                </li>
                <li>
                  <Link to="/press">Press</Link>
                </li>
              </ul>
            </motion.div>
            <motion.div
              className="footer-column"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h4>Connect With Us</h4>
              <div className="social-links">
                <motion.a href="#" aria-label="Facebook" whileHover={{ y: -3 }}>
                  <i className="fab fa-facebook"></i>
                </motion.a>
                <motion.a
                  href="#"
                  aria-label="Instagram"
                  whileHover={{ y: -3 }}
                >
                  <i className="fab fa-instagram"></i>
                </motion.a>
                <motion.a href="#" aria-label="Twitter" whileHover={{ y: -3 }}>
                  <i className="fab fa-twitter"></i>
                </motion.a>
                <motion.a
                  href="#"
                  aria-label="Pinterest"
                  whileHover={{ y: -3 }}
                >
                  <i className="fab fa-pinterest"></i>
                </motion.a>
              </div>
              <div className="payment-methods">
                <i className="fab fa-cc-visa" aria-label="Visa"></i>
                <i className="fab fa-cc-mastercard" aria-label="Mastercard"></i>
                <i className="fab fa-cc-paypal" aria-label="PayPal"></i>
                <i className="fab fa-cc-apple-pay" aria-label="Apple Pay"></i>
              </div>
            </motion.div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 E-Commerce Website. All rights reserved.</p>
            <div className="legal-links">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
            </div>
          </div>
        </div>
      </motion.footer>

      <BottomNav />
    </div>
  );
};

export default HomePage;
