import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import "./Searchproducts.css";
import axios from "axios";
import ErrorDisplay from "../../utils/Error/ErrorDisplay";
import normalizeError from "../../utils/Error/NormalizeError";
import { useSelector } from "react-redux";
import API_BASE_URL from "../../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FiShoppingCart,
  FiShoppingBag,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiChevronDown,
  FiStar,
  FiFilter,
  FiX,
} from "react-icons/fi";
import BottomNav from "../../components/Bottom Navbar/BottomNav";
import HandleProdlistNavigation from "../../utils/Navigation/ProdlistNavigation";

export default function Searchproducts() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { clickedProduct, productCategory, productSubCategory } =
    location.state || {};
    
  const user = useSelector((state) => state.user);

  const [userId, setUserId] = useState(user?._id || null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [brands, setBrands] = useState([]);
  const [selectedbrands, setSelectedBrands] = useState([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [error, setError] = useState(false);

  const [sliderValue, setSliderValue] = useState(1000000);
  const [appliedPriceRange, setAppliedPriceRange] = useState([0, 1000000]);

  const [loading, setLoading] = useState(true);

  const [showPriceFilter, setShowPriceFilter] = useState(true);
  const [showBrandFilter, setShowBrandFilter] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 5;

  // Refs for click-outside functionality
  const filterSidebarRef = useRef(null);
  const mobileFilterToggleRef = useRef(null);

  // Click outside and ESC key handlers
  useEffect(() => {
    const handleOutsideInteraction = (event) => {
      if (
        event.type === "mousedown" &&
        mobileFiltersOpen &&
        filterSidebarRef.current &&
        !filterSidebarRef.current.contains(event.target) &&
        mobileFilterToggleRef.current &&
        !mobileFilterToggleRef.current.contains(event.target)
      ) {
        setMobileFiltersOpen(false);
      }

      // ESC key logic
      if (
        event.type === "keydown" &&
        event.key === "Escape" &&
        mobileFiltersOpen
      ) {
        setMobileFiltersOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideInteraction);
    document.addEventListener("keydown", handleOutsideInteraction);

    return () => {
      document.removeEventListener("mousedown", handleOutsideInteraction);
      document.removeEventListener("keydown", handleOutsideInteraction);
    };
  }, [mobileFiltersOpen]);

  const fetchPaginatedProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!navigator.onLine) {
        throw new Error(
          "You appear to be offline. Please check your internet connection."
        );
      }

      const productId = id;
      const category = clickedProduct?.category || productCategory || "default";
      const subCategory =
        clickedProduct?.subCategory || productSubCategory || "default";

      const response = await axios.get(
        `${API_BASE_URL}/api/products/paginated`,
        {
          params: {
            userId,
            productId,
            category,
            subCategory,
            page: currentPage,
            limit: productsPerPage,
            minPrice: appliedPriceRange[0],
            maxPrice: appliedPriceRange[1],
            selectedbrands,
          },
        }
      );

      const { data, totalPages, maxPrice, Uniquebrands } = response.data;

      setCategoryProducts(data);
      setTotalPages(totalPages);
      setMaxPrice(maxPrice);

      if (sliderValue > maxPrice) {
        setSliderValue(maxPrice);
      }

      setBrands(Uniquebrands);
    } catch (err) {
      console.error("Error fetching paginated products:", err);
      if (
        err?.response &&
        err?.response?.status >= 400 &&
        err?.response?.status < 500
      ) {
        toast.error(err.response.data.message || "Error fetching product data");
      } else {
        let errorMessage = normalizeError(err);
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaginatedProducts();
  }, [
    id,
    clickedProduct,
    productCategory,
    productSubCategory,
    currentPage,
    appliedPriceRange,
  ]);

  const handleAddToCart = async (item) => {
    if (!userId) {
      toast.warn("Please log in to add products to cart.");
      return;
    }

    const productDetails = {
      userId,
      productId: item._id,
      quantity: 1,
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/cart/add`,
        productDetails
      );
      if (response.data.success) {
        await fetchPaginatedProducts();
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleBuyNow = (item) => {
    if (!user) {
      toast.warn("Please log in to buy products.");
      return;
    }

    navigate(`/user/${userId}/product/buynow`, {
      state: {
        product: item,
      },
    });
  };

  const handleGoToCart = () => {
    navigate(`/user/${userId}/cart`);
  };

  const handlePriceApply = () => {
    setAppliedPriceRange([0, sliderValue]);
    setCurrentPage(1);
    setMobileFiltersOpen(false);
  };

  const handlePriceSlideChange = (event) => {
    setSliderValue(Number(event.target.value));
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (error) {
    return (
      <div className="usprof-container">
        <div className="usprof-nav">
          <Navbar />
        </div>
        <ErrorDisplay error={error} onRetry={fetchPaginatedProducts} />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="search-page">
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
      {/* Overlay for mobile filters */}
      {mobileFiltersOpen && (
        <div
          className="filter-overlay"
          onClick={() => setMobileFiltersOpen(false)}
        />
      )}

      <div className="search-container">
        {/* Mobile Filter Toggle */}
        <button
          ref={mobileFilterToggleRef}
          className="mobile-filter-toggle"
          onClick={() => setMobileFiltersOpen(true)}
        >
          <FiFilter /> Filters
        </button>

        {/* Filter Sidebar */}
        <div
          ref={filterSidebarRef}
          className={`filter-sidebar ${mobileFiltersOpen ? "mobile-open" : ""}`}
        >
          <div className="sidebar-header">
            <h3>Filters</h3>
            <button
              className="close-filters"
              onClick={() => setMobileFiltersOpen(false)}
            >
              <FiX />
            </button>
          </div>

          <div className="filter-section">
            <div
              className="filter-title"
              onClick={() => setShowPriceFilter(!showPriceFilter)}
            >
              <h4>Price Range</h4>
              <span className="toggle-icon">
                {showPriceFilter ? <FiChevronUp /> : <FiChevronDown />}
              </span>
            </div>
            {showPriceFilter && (
              <div className="price-filter-content">
                <div className="price-range-display">
                  <span>₹0 - ₹{sliderValue.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  step="1"
                  value={sliderValue}
                  onChange={handlePriceSlideChange}
                  className="price-slider"
                />
                <div className="price-limits">
                  <span>₹0</span>
                  <span>₹{maxPrice.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          <div className="filter-section">
            <div
              className="filter-title"
              onClick={() => setShowBrandFilter(!showBrandFilter)}
            >
              <h4>Brand</h4>
              <span className="toggle-icon">
                {showBrandFilter ? <FiChevronUp /> : <FiChevronDown />}
              </span>
            </div>
            {showBrandFilter && (
              <div className="brand-filter-content">
                {brands.map((brand, index) => (
                  <div
                    key={index}
                    className={`brand-item ${
                      selectedbrands.includes(brand) ? "selected" : ""
                    }`}
                    onClick={() => {
                      const newSelectedBrands = selectedbrands.includes(brand)
                        ? selectedbrands.filter((b) => b !== brand)
                        : [...selectedbrands, brand];
                      setSelectedBrands(newSelectedBrands);
                      setCurrentPage(1);
                    }}
                  >
                    {brand.toUpperCase()}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="apply-filters-btn" onClick={handlePriceApply}>
            Apply Filters
          </button>
        </div>

        {/* Product Listing */}
        <div className="product-results">
          {loading ? (
            <div className="sp-skeleton-loading">
              <div className="sp-skeleton-filter-toggle"></div>
              <div className="sp-skeleton-product-grid">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="sp-skeleton-product-card">
                    <div className="sp-skeleton-product-image"></div>
                    <div className="sp-skeleton-product-info">
                      <div className="sp-skeleton-title"></div>
                      <div className="sp-skeleton-price"></div>
                      <div className="sp-skeleton-rating"></div>
                      <div className="sp-skeleton-buttons">
                        <div className="sp-skeleton-button"></div>
                        <div className="sp-skeleton-button"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="sp-skeleton-pagination">
                <div className="sp-skeleton-pagination-button"></div>
                <div className="sp-skeleton-page-numbers">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="sp-skeleton-page-btn"></div>
                  ))}
                </div>
                <div className="sp-skeleton-pagination-button"></div>
              </div>
            </div>
          ) : categoryProducts.length > 0 ? (
            <>
              {clickedProduct ? (
                <span className="sp-show-results">
                  Showing results for {clickedProduct.name}
                </span>
              ) : (
                categoryProducts.length > 0 && (
                  <span
                    className="sp-show-results"
                    key={categoryProducts[0]._id}
                  >
                    Showing results for {categoryProducts[0].subCategory}
                  </span>
                )
              )}

              <div className="product-grid">
                {categoryProducts.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => HandleProdlistNavigation(item, navigate)}
                    className="product-card"
                  >
                    <div className="sp-product-image">
                      <img
                        src={item.images?.[0] || "/placeholder-product.jpg"}
                        alt={item.name}
                        onError={(e) => {
                          e.target.src = "/placeholder-product.jpg";
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
                    <div className="sp-product-info">
                      <h3>{item.name}</h3>
                      <div className="sp-price-section">
                        <div className="sp-prod-prices">
                          {item.offerPrice ? (
                            <>
                              <span className="sp-current-price">
                                ₹{item.offerPrice}
                              </span>
                              <span className="sp-original-price">
                                ₹{item.price}
                              </span>
                            </>
                          ) : (
                            <span className="current-price">₹{item.price}</span>
                          )}
                        </div>
                        {item.rating > 0 && (
                          <div className="all-prods-card-rating">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className={`all-prods-star ${
                                  i < Math.floor(item.rating)
                                    ? "all-prods-star-filled"
                                    : ""
                                }`}
                              >
                                {i < Math.floor(item.rating) ? "★" : "☆"}
                              </span>
                            ))}
                            <span className="all-prods-rating-count">
                              ({item.rating})
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="product-actions">
                        {item.isAddedToCart ? (
                          <button
                            className="action-btn sp-go-to-cart"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGoToCart();
                            }}
                          >
                            <FiShoppingCart /> Go to Cart
                          </button>
                        ) : (
                          <button
                            className="action-btn sp-add-to-cart"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(item);
                            }}
                          >
                            <FiShoppingCart /> Add to Cart
                          </button>
                        )}
                        <button
                          className="action-btn sp-buy-now"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBuyNow(item);
                          }}
                        >
                          <FiShoppingBag /> Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  <FiChevronLeft /> Previous
                </button>
                <div className="page-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (num) => (
                      <button
                        key={num}
                        className={`page-btn ${
                          currentPage === num ? "active" : ""
                        }`}
                        onClick={() => {
                          setCurrentPage(num);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        {num}
                      </button>
                    )
                  )}
                </div>
                <button
                  className="pagination-btn"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next <FiChevronRight />
                </button>
              </div>
            </>
          ) : (
            <div className="no-products">
              <img
                src="https://cdn-icons-png.flaticon.com/512/5089/5089733.png"
                alt="No products found"
              />
              <h3>No products found</h3>
              <p>Try adjusting your filters or search criteria</p>
              <button
                className="reset-filters"
                onClick={() => {
                  setSliderValue(maxPrice);
                  setAppliedPriceRange([0, maxPrice]);
                  setSelectedBrands([]);
                  setCurrentPage(1);
                }}
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>
      <BottomNav UserData={user} />
    </div>
  );
}
