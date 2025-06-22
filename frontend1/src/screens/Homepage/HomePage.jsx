import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./HomeStyle.css";
import bannerImage from "../../assets/banner1.jpeg";
import bannerImage1 from "../../assets/banner2.jpeg";
import bannerImage2 from "../../assets/banner3.jpeg";
import Navbar from "../navbar/Navbar";
import API_BASE_URL from "../../api";
import { FiClock, FiShoppingBag, FiStar, FiChevronRight } from "react-icons/fi";
import ValidUserData from "../../utils/ValidUserData";

const capitalizeWords = (string) => {
  if (!string) return "";
  return string
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const HomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [UserData, setUserData] = useState(location.state?.user || null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const bannerImages = [bannerImage, bannerImage1, bannerImage2];
  const [currentImage, setCurrentImage] = useState(0);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/products/fetchAll`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      if (responseData.success && Array.isArray(responseData.data)) {
        setProducts(responseData.data);
      } else {
        throw new Error("Invalid data format received from server");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again later.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const userData = await ValidUserData();
        setUserData(prev => JSON.stringify(prev) !== JSON.stringify(userData) ? userData : prev);
      } catch (error) {
        console.error("User validation error:", error);
      }
    };

    initializeUser();
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [bannerImages.length]);

  useEffect(() => {
    const targetDate = new Date("2025-06-30T00:00:00");
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

  const subCategories = [...new Set(products.map((product) => product.subCategory))].filter(Boolean);

  return (
    <div className="app" style={{ cursor: loading ? "wait" : "default" }}>
      <div className="usprof-nav">
        <Navbar user={UserData} />
      </div>

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
                      className="shop-now-btn"
                      onClick={() => navigate('/products')}
                    >
                      Shop Now
                    </motion.button>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="banner-indicators">
                {bannerImages.map((_, index) => (
                  <button
                    key={index}
                    className={`indicator ${index === currentImage ? "active" : ""}`}
                    onClick={() => setCurrentImage(index)}
                  />
                ))}
              </div>
            </div>

            <div className="countdown-card">
              <div className="countdown-header">
                <FiClock className="countdown-icon" />
                <h3>Limited Time Offer</h3>
              </div>
              <div className="timer-grid">
                <div className="timer-block">
                  <span className="timer-value">{timeLeft.days}</span>
                  <span className="timer-label">Days</span>
                </div>
                <div className="timer-block">
                  <span className="timer-value">{timeLeft.hours}</span>
                  <span className="timer-label">Hours</span>
                </div>
                <div className="timer-block">
                  <span className="timer-value">{timeLeft.minutes}</span>
                  <span className="timer-label">Minutes</span>
                </div>
                <div className="timer-block">
                  <span className="timer-value">{timeLeft.seconds}</span>
                  <span className="timer-label">Seconds</span>
                </div>
              </div>
              <button className="deal-btn" onClick={() => navigate('/products')}>
                <FiShoppingBag className="deal-icon" />
                Grab the Deal
              </button>
            </div>
          </section>

          <section className="featured-section">
            <h2 className="section-title">Shop by Category</h2>
            <div className="category-grid">
              {subCategories.slice(0, 4).map((subCategory) => (
                <motion.div
                  key={subCategory}
                  whileHover={{ y: -5 }}
                  className="category-card"
                >
                  <div className="category-image">
                    <div className="category-image-placeholder">
                      {subCategory.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <h3>{capitalizeWords(subCategory)}</h3>
                  <Link
                    to={`/subcategory/${encodeURIComponent(subCategory)}`}
                    className="category-link"
                  >
                    Explore <FiChevronRight />
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="products-section">
            {error && (
              <div className="error-message">
                <p>{error}</p>
                <button onClick={fetchData}>Retry</button>
              </div>
            )}

            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading products...</p>
              </div>
            ) : subCategories.length > 0 ? (
              subCategories.map((subCategory) => {
                const categoryProducts = products.filter(
                  (product) => product.subCategory === subCategory
                );

                return (
                  <div className="product-category" key={subCategory}>
                    <div className="category-header">
                      <h3>{capitalizeWords(subCategory)}</h3>
                      {categoryProducts.length > 4 && (
                        <Link
                          to={`/subcategory/${encodeURIComponent(subCategory)}`}
                          className="view-all-link"
                        >
                          View All <FiChevronRight />
                        </Link>
                      )}
                    </div>

                    <div className="product-grid">
                      {categoryProducts.slice(0, 4).map((item) => (
                        <motion.div
                          className="product-card"
                          key={item._id}
                          whileHover={{
                            boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                            y: -5,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <Link
                            to={`/prodlist/${item._id}`}
                            state={{
                              user: UserData,
                              name: item.name,
                              price: item.price,
                              brand: item.brand,
                              images: item.images,
                              rating: item.rating,
                              description: item.description,
                              stock: item.stock,
                              category: item.category,
                              deliverytime: item.deliverytime,
                            }}
                          >
                            <div className="product-image-container">
                              <img
                                src={item.images?.[0] || ""}
                                alt={item.name}
                                className="product-image"
                                onError={(e) => {
                                  e.target.src = "";
                                  e.target.alt = "Image not available";
                                  e.target.className = "product-image-error";
                                }}
                              />
                              {item.offerPrice && (
                                <div className="discount-badge">
                                  {Math.round(
                                    ((item.price - item.offerPrice) / item.price) * 100
                                  )}
                                  % OFF
                                </div>
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
                              {item.rating > 0 && (
                                <div className="rating">
                                  <FiStar className="star-icon" />
                                  <span>{item.rating.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <img src="/empty-state.svg" alt="No products" />
                <h3>No products available</h3>
                <p>Check back later for new arrivals</p>
              </div>
            )}
          </section>

          <section className="newsletter-section">
            <div className="newsletter-container">
              <div className="newsletter-content">
                <h2>Subscribe to Our Newsletter</h2>
                <p>Get the latest updates on new products and upcoming sales</p>
                <form className="newsletter-form">
                  <input
                    type="email"
                    placeholder="Your email address"
                    required
                  />
                  <button type="submit">Subscribe</button>
                </form>
              </div>
            </div>
          </section>
        </div>
      </div>

      <footer className="modern-footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-column">
              <h4>Shop</h4>
              <ul>
                <li><Link to="/products">All Products</Link></li>
                <li><Link to="/products?filter=featured">Featured</Link></li>
                <li><Link to="/products?filter=new">New Arrivals</Link></li>
                <li><Link to="/products?filter=sale">Sale Items</Link></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Customer Service</h4>
              <ul>
                <li><Link to="/contact">Contact Us</Link></li>
                <li><Link to="/faq">FAQs</Link></li>
                <li><Link to="/shipping">Shipping Policy</Link></li>
                <li><Link to="/returns">Returns & Exchanges</Link></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>About Us</h4>
              <ul>
                <li><Link to="/about">Our Story</Link></li>
                <li><Link to="/careers">Careers</Link></li>
                <li><Link to="/blog">Blog</Link></li>
                <li><Link to="/press">Press</Link></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Connect With Us</h4>
              <div className="social-links">
                <a href="#"><i className="fab fa-facebook"></i></a>
                <a href="#"><i className="fab fa-instagram"></i></a>
                <a href="#"><i className="fab fa-twitter"></i></a>
                <a href="#"><i className="fab fa-pinterest"></i></a>
              </div>
              <div className="payment-methods">
                <i className="fab fa-cc-visa"></i>
                <i className="fab fa-cc-mastercard"></i>
                <i className="fab fa-cc-paypal"></i>
                <i className="fab fa-cc-apple-pay"></i>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 E-Commerce Website. All rights reserved.</p>
            <div className="legal-links">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;