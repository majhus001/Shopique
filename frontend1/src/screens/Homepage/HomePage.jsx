import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import "./HomeStyle.css";
import axios from "axios";
import normalizeError from "../../utils/Error/NormalizeError";
import ErrorDisplay from "../../utils/Error/ErrorDisplay";
import Navbar from "../../components/navbar/Navbar";
import API_BASE_URL from "../../api";
import HandleProdlistNavigation from "../../utils/Navigation/ProdlistNavigation";
import HandleCategoryClick from "../../utils/Navigation/CategoryListNavigation";
import {
  FiShoppingBag,
  FiStar,
  FiChevronRight,
  FiChevronLeft,
} from "react-icons/fi";
import BottomNav from "../../components/Bottom Navbar/BottomNav";
import HeroSection from "./HeroSection/HeroSection";
import TrendingProducts from "./TrendingSection/TrendingProducts";
import FeaturedProducts from "./FeaturedProducts/FeaturedProducts";
import NewArrival from "./NewArrival/NewArrival";
import RecentlyViewed from "./RecentProducts/RecentlyViewed";
import CategoryList from "./CategoryList/CategoryList";
import Footer from "./Footer/Footer";
import capitalizeWords from "../../utils/CapitalizeWord";
import NewsLetter from "./NewsLetter/NewsLetter";

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
          {[...Array(10)].map((_, i) => (
            <div key={i} className="skeleton-featured-card"></div>
          ))}
        </div>
      </div>

      {/* Product categories skeleton */}
      {[...Array(6)].map((_, catIndex) => (
        <div key={catIndex} className="skeleton-section">
          <div className="skeleton-category-header">
            <div className="skeleton-title"></div>
            <div className="skeleton-view-all"></div>
          </div>
          <div className="skeleton-products-container">
            <div className="skeleton-scroll-button left"></div>
            <div className="skeleton-products-scroll">
              {[...Array(6)].map((_, prodIndex) => (
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
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [newArrivalProducts, setNewArrivalProducts] = useState([]);
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState([]);
  const [categoriesGridProducts, setCategoriesGridProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

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

      const viewedProducts =
        JSON.parse(localStorage.getItem("viewedProducts")) || [];

      const response = await axios.post(
        `${API_BASE_URL}/api/products/fetchBySpecified`,
        { viewedProducts },
        { signal: AbortSignal.timeout(8000) }
      );

      console.log(response.data);

      if (!response.data.success) {
        throw new Error("Invalid data received from server");
      }

      setCategoriesGridProducts(response.data.categoriesgridProducts || []);
      setFilteredProducts(response.data.filteredproducts || []);
      setFeaturedProducts(response.data.filteredCategories || []);
      setTrendingProducts(response.data.trending || []);
      setNewArrivalProducts(response.data.newArrivals || []);
      setRecentlyViewedProducts(response.data.recentlyViewedProducts || []);
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
        setFeaturedProducts([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="app">
        <div className="main-container">
          <div className="content">
            <SkeletonLoading />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <ErrorDisplay error={error} onRetry={fetchData} />
      </div>
    );
  }

  return (
    <div className="app">
      <div className="main-container">
        <div className="content">
          <HeroSection />

          {featuredProducts.length > 0 && (
            <FeaturedProducts
              featuredProducts={featuredProducts}
              userDetails={userDetails}
            />
          )}

          {categoriesGridProducts.length > 0 && (
            <CategoryList categories={categoriesGridProducts} />
          )}

          {trendingProducts.length > 0 && (
            <TrendingProducts trendingProducts={trendingProducts} />
          )}

          {newArrivalProducts.length > 0 && (
            <NewArrival newProducts={newArrivalProducts} />
          )}

          {recentlyViewedProducts.length > 0 && (
            <RecentlyViewed recentProducts={recentlyViewedProducts} />
          )}

          <section className="products-section">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(
                ({ subCategory, products: categoryProducts }) => (
                  <div className="product-category" key={subCategory}>
                    <motion.div
                      className="category-header"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                    >
                      <h4 className="products-category-title">
                        {capitalizeWords(subCategory)}
                      </h4>
                      <span
                        onClick={() =>
                          HandleCategoryClick(
                            categoryProducts[0],
                            filteredProducts,
                            navigate
                          )
                        }
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
                                HandleProdlistNavigation(item, navigate);
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

          <NewsLetter />
        </div>
      </div>

      {/* <Footer /> */}

      {/* <BottomNav /> */}
    </div>
  );
};

export default HomePage;
