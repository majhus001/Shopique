import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AllProducts.css";
import BottomNav from "../../components/Bottom Navbar/BottomNav";
import Navbar from "../../components/navbar/Navbar";
import axios from "axios";
import API_BASE_URL from "../../api";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import ErrorDisplay from "../../utils/Error/ErrorDisplay";
import normalizeError from "../../utils/Error/NormalizeError";
import { FiX } from "react-icons/fi";
import capitalizeWords from "../../utils/CapitalizeWord";
import HandleProdlistNavigation from "../../utils/Navigation/ProdlistNavigation";
import slugify from "../../utils/SlugifyUrl";

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

const AllProductsSkeleton = () => {
  return (
    <div className="all-prods-container">
      <div className="all-prods-header">
        <div className="all-prods-title-skeleton alp-skeleton"></div>
        <div className="all-prods-filter">
          <div className="all-prods-sort-skeleton alp-skeleton"></div>
        </div>
      </div>

      <div className="all-prods-content">
        <aside className="all-prods-sidebar">
          <div className="all-prods-sidebar-title-skeleton alp-skeleton"></div>
          <div className="all-prods-cat-search-skeleton alp-skeleton"></div>
          <div className="all-prods-category-list">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="all-prods-category-item-skeleton alp-skeleton"
              ></div>
            ))}
          </div>
        </aside>

        <main className="all-prods-main">
          <div className="all-prods-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="all-prods-card-skeleton">
                <div className="all-prods-card-img-skeleton alp-skeleton"></div>
                <div className="all-prods-card-body-skeleton">
                  <div className="all-prods-card-title-skeleton alp-skeleton"></div>
                  <div className="all-prods-card-price-skeleton alp-skeleton"></div>
                  <div className="all-prods-card-rating-skeleton alp-skeleton"></div>
                  <div className="all-prods-add-to-cart-skeleton alp-skeleton"></div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

const AllProducts = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialCategory = location?.state?.category || "";
  const user = useSelector((state) => state.user);

  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalProducts, setTotalProducts] = useState([]);
  const [sortOption, setSortOption] = useState("featured");
  const [error, setError] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(
        `${API_BASE_URL}/api/products/fetchby/category/${selectedCategory}`,
        { signal: AbortSignal.timeout(8000) }
      );

      setProducts(response.data.products || []);
      setCategories(response.data.categories || []);
      setTotalProducts(response.data.totalProducts || []);
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
      setIsLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const sortProducts = (products) => {
    switch (sortOption) {
      case "price-low-high":
        return [...products].sort((a, b) => a.offerPrice - b.offerPrice);
      case "price-high-low":
        return [...products].sort((a, b) => b.offerPrice - a.offerPrice);
      case "rating":
        return [...products].sort((a, b) => b.rating - a.rating);
      default:
        return products;
    }
  };

  const filteredSuggestions = categories.filter((cat) => {
    const query = searchQuery.toLowerCase();

    const matchesCategory = cat.name.toLowerCase().includes(query);

    const matchesSubCategory = cat.subCategories?.some((sub) =>
      sub.name.toLowerCase().includes(query)
    );

    return matchesCategory || matchesSubCategory;
  });

  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const sortedProducts = sortProducts(products);

  const handlecategoryClick = (subCategory) => {
    let prodCategory = null;
    let prodSubCategory = null;
    let prodname = null;
    let productId = null;
    products.forEach((item) => {
      if (item.subCategory === subCategory) {
        console.log(item);
        prodSubCategory = slugify(item.subCategory);
        prodCategory = slugify(item.category);
        prodname = slugify(item.name);
        productId = item._id;
      }
    });
    navigate(
      `/products/search/${prodCategory}/${prodSubCategory}/${prodname}/${productId}`,
      {
        state: {
          user,
          productCategory: prodCategory,
          productSubCategory: prodSubCategory,
        },
      }
    );
  };

 
  if (error) {
    return (
      <div className="usprof-container">
        <div className="usprof-nav">
          <Navbar />
        </div>
        <ErrorDisplay error={error} onRetry={fetchData} />
        <BottomNav />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="app">
        <Navbar />
        <div className="main-container">
          <AllProductsSkeleton />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="app">
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
      <div className="main-container">
        <div className="all-prods-container">
          <div className="all-prods-header">
            <h1 className="all-prods-title">All Products</h1>
            <div className="all-prods-filter">
              <button
                className="all-prods-mobile-filter-btn"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
              >
                {showMobileFilters ? "Hide Filters" : "Show Filters"}
              </button>
              <select
                className="all-prods-sort"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="featured">Sort by: Featured</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
              </select>
            </div>
          </div>

          <div className="all-prods-content">
            <aside
              className={`all-prods-sidebar ${
                showMobileFilters ? "all-prods-sidebar-mobile-active" : ""
              }`}
            >
              <div className="all-prods-sidebar-header">
                <h2 className="all-prods-sidebar-title">Categories </h2>
                {showMobileFilters && (
                  <button
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    className="all-prods-sidebar-close-btn"
                  >
                    <FiX />
                  </button>
                )}
              </div>

              <div
                className="all-prods-cat-search-container"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  className="all-prods-cat-search-box"
                  placeholder="Search categories"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                />

                {showSuggestions &&
                  searchQuery &&
                  filteredSuggestions.length > 0 && (
                    <ul className="all-prods-cat-suggestions">
                      {filteredSuggestions.map((cat) => (
                        <li
                          key={cat._id || cat.name}
                          onClick={() => {
                            setSelectedCategory(cat.name);
                            setSearchQuery("");
                            setShowSuggestions(false);
                          }}
                          className="all-prods-cat-suggestion-item"
                        >
                          <span>{capitalizeWords(cat.name)}</span>
                          <span>({cat.count})</span>
                        </li>
                      ))}
                    </ul>
                  )}
              </div>

              <ul className="all-prods-category-list">
                <li
                  className={`all-prods-category-item ${
                    !selectedCategory ? "all-prods-category-active" : ""
                  }`}
                  onClick={() => {
                    setSelectedCategory("");
                    setShowMobileFilters(false);
                  }}
                >
                  All Categories
                  <span className="all-prods-category-count">
                    {totalProducts}
                  </span>
                </li>
                {categories.map((category) => (
                  <li
                    key={category._id || category.name}
                    className={`all-prods-category-item ${
                      selectedCategory === category.name
                        ? "all-prods-category-active"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedCategory(category.name);
                      setShowMobileFilters(false);
                    }}
                  >
                    {capitalizeWords(category.name)}
                    <span className="all-prods-category-count">
                      {category.count}
                    </span>
                  </li>
                ))}
              </ul>
            </aside>

            <main className="all-prods-main">
              {sortedProducts.length > 0 ? (
                <div className="all-prods-grid">
                  {sortedProducts.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => handlecategoryClick(product.subCategory)}
                      className="all-prods-card"
                    >
                      <div className="all-prods-card-img-container">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="all-prods-card-img"
                          loading="lazy"
                        />
                        {product.offerPrice && (
                          <div className="discount-badge">
                            {Math.round(
                              ((product.price - product.offerPrice) /
                                product.price) *
                                100
                            )}
                            % OFF
                          </div>
                        )}
                      </div>
                      <div className="all-prods-card-body">
                        <h3 className="all-prods-card-title">{product.name}</h3>
                        <div className="sp-prod-prices">
                          {product.offerPrice ? (
                            <>
                              <span className="sp-current-price">
                                ₹{product.offerPrice}
                              </span>
                              <span className="sp-original-price">
                                ₹{product.price}
                              </span>
                            </>
                          ) : (
                            <span className="current-price">
                              ₹{product.price}
                            </span>
                          )}
                        </div>
                        <div className="all-prods-card-rating">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={`all-prods-star ${
                                i < Math.floor(product.rating)
                                  ? "all-prods-star-filled"
                                  : ""
                              }`}
                            >
                              {i < Math.floor(product.rating) ? "★" : "☆"}
                            </span>
                          ))}
                          <span className="all-prods-rating-count">
                            ({product.rating})
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            HandleProdlistNavigation(product, navigate);
                          }}
                          className="all-prods-add-to-cart"
                        >
                          Buy now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="all-prods-empty">
                  No products found in this category
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default AllProducts;
