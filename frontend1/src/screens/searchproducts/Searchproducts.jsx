import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../navbar/Navbar";
import "./Searchproducts.css";
import axios from "axios";
import ValidUserData from "../../utils/ValidUserData";
import API_BASE_URL from "../../api";
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
import BottomNav from "../Bottom Navbar/BottomNav";

export default function Searchproducts() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { clickedProduct, productCategory, productSubCategory } =
    location.state || {};

  const [userDetails, setUserDetails] = useState(location.state?.user || null);
  const [userId, setUserId] = useState(location.state?.user?._id || null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [brands, setBrands] = useState([]);
  const [selectedbrands, setSelectedBrands] = useState([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [sliderValue, setSliderValue] = useState(130000);
  const [appliedPriceRange, setAppliedPriceRange] = useState([0, 130000]);

  const [loading, setLoading] = useState(true);

  const [showPriceFilter, setShowPriceFilter] = useState(true);
  const [showBrandFilter, setShowBrandFilter] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 5;

  const checkUser = async () => {
    try {
      const userData = await ValidUserData();
      if (userData) {
        setUserDetails(userData);
        setUserId(userData._id);
      }
    } catch (error) {
      console.error("Error validating user:", error);
    }
  };

  const fetchPaginatedProducts = async () => {
    setLoading(true);
    try {
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
    } catch (error) {
      console.error("Error fetching paginated products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!location.state?.user) {
      checkUser();
    }
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
      alert("Please log in to add products to cart.");
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
      alert("Something went wrong. Please try again.");
    }
  };

  const handleBuyNow = (item) => {
    if (!userDetails) {
      alert("Please log in to buy products.");
      return;
    }

    navigate("/buynow", {
      state: {
        user: userDetails,
        ...item,
        quantity: 1,
      },
    });
  };

  const handleGoToCart = () => {
    navigate("/cart", { state: { user: userDetails } });
  };

  const handleprodlistnavigation = (item) => {
    console.log(item)
    navigate(`/prodlist/${item._id}`, {
      state: {
        user: userDetails,
        product: item,
      },
    });
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


  return (
    <div className="search-page">
      <Navbar />

      <div className="search-container">
        {/* Mobile Filter Toggle */}
        <button
          className="mobile-filter-toggle"
          onClick={() => setMobileFiltersOpen(true)}
        >
          <FiFilter /> Filters
        </button>

        {/* Filter Sidebar */}
        <div
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
            <div className="loading-overlay">
              <div className="spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : categoryProducts.length > 0 ? (
            <>
              <div className="product-grid">
                {categoryProducts.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => handleprodlistnavigation(item)}
                    className="product-card"
                  >
                    <div className="product-image">
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
                    <div className="product-info">
                      <h3 onClick={() => handleprodlistnavigation(item)}>
                        {item.name}
                      </h3>
                      <div className="price-section">
                        {item.offerPrice ? (
                          <>
                            <span className="current-price">
                              ₹{item.offerPrice}
                            </span>
                            <span className="original-price">
                              ₹{item.price}
                            </span>
                          </>
                        ) : (
                          <span className="current-price">₹{item.price}</span>
                        )}
                        {item.rating > 0 && (
                          <div className="rating">
                            <FiStar className="star-icon" />
                            <span>{item.rating?.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <div className="product-actions">
                        {item.isAddedToCart ? (
                          <button
                            className="action-btn go-to-cart"
                            onClick={handleGoToCart}
                          >
                            <FiShoppingCart /> Go to Cart
                          </button>
                        ) : (
                          <button
                            className="action-btn add-to-cart"
                            onClick={() => handleAddToCart(item)}
                          >
                            <FiShoppingCart /> Add to Cart
                          </button>
                        )}
                        <button
                          className="action-btn buy-now"
                          onClick={() => handleBuyNow(item)}
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
              <img src="/no-products.svg" alt="No products found" />
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
      <BottomNav UserData={userDetails} />
    </div>
  );
}
