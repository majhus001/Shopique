import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./AdproductsList.css";
import Adnavbar from "../Adnavbar/Adnavbar";
import API_BASE_URL from "../../api";
import Sidebar from "../sidebar/Sidebar";
import { FiUsers, FiLogOut, FiEdit } from "react-icons/fi";

const AdproductsList = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const stateUser = location.state?.user || null;
  const stateOrders = location.state?.orders || null;

  // State for user and orders
  const [user, setUser] = useState(stateUser);
  const [orders, setOrders] = useState(stateOrders);
  const [products, setProducts] = useState([]); // All products in a single array
  const [categories, setCategories] = useState([]); // Available categories
  const [categoryMetadata, setCategoryMetadata] = useState({}); // Store metadata for each category
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all"); // Default to show all products
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState({}); // Track expanded state for each product
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    limit: 12,
  });

  const [isEmployee, setIsEmployee] = useState(false);

  useEffect(() => {
    if (user?.role === "Employee") {
      setIsEmployee(true);
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      console.log("Checking user validity...");
      const response = await axios.get(
        `${API_BASE_URL}/api/auth/checkvaliduser`,
        {
          withCredentials: true,
        }
      );

      if (!response.data.user) {
        navigate("/login");
        return;
      }

      const userId = response.data.user.userId;
      const userRes = await axios.get(
        `${API_BASE_URL}/api/auth/fetch/${userId}`
      );
      setUser(userRes.data.data);
      console.log("User fetched from backend:", userRes.data.data);
    } catch (error) {
      console.error("Error fetching user:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch order data from backend if not available in state
  const fetchOrderData = async () => {
    try {
      const OrdersRes = await axios.get(
        `${API_BASE_URL}/api/admin/pendingorders`
      );
      setOrders(OrdersRes.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    if (!user) {
      fetchUserData();
    }
  }, [user]);

  useEffect(() => {
    if (!orders) {
      fetchOrderData();
    }
  }, [orders]);

  // Function to get unique categories from products
  const getUniqueCategories = (products) => {
    const categorySet = new Set(
      products.map((product) => product.category).filter(Boolean)
    );
    return Array.from(categorySet);
  };

  // Fetch paginated products
  const fetchProducts = async (
    page = 1,
    limit = 12,
    category = "all",
    searchQuery = ""
  ) => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/api/products/admin/paginated?page=${page}&limit=${limit}`;

      // Add category filter if not "all"
      if (category !== "all") {
        url += `&category=${category}`;
      }

      // Add search query if provided
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }

      const response = await axios.get(url);

      if (response.data.success) {
        const {
          products,
          totalPages,
          page: currentPage,
          total: totalProducts,
          hasNextPage,
          hasPrevPage,
        } = response.data;

        setProducts(products);
        setPagination({
          currentPage,
          totalPages,
          totalProducts,
          limit,
          hasNextPage,
          hasPrevPage,
        });

        // Only update categories if not searching (to maintain all categories)
        if (!searchQuery) {
          const uniqueCategories = getUniqueCategories(products);
          setCategories(uniqueCategories);
        }

        return products;
      } else {
        console.error("Failed to fetch products:", response.data);
        setProducts([]);
        return [];
      }
    } catch (err) {
      console.error("Error fetching product data:", err);
      setProducts([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchProducts(
        newPage,
        pagination.limit,
        selectedCategory === "all" ? "all" : selectedCategory
      );
    }
  };

  useEffect(() => {
    fetchProducts(1, 12);
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchProducts(
        1,
        pagination.limit,
        selectedCategory === "all" ? "all" : selectedCategory
      );
    }
  }, [selectedCategory]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setExpandedProducts({}); // Reset expanded products when changing category
  };

  // Handle sidebar collapse state change
  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  // Handle search functionality
  const handleSearch = async (e) => {
    const query = e.target.value.toLowerCase().trim();
    setSearchQuery(e.target.value);

    if (query === "") {
      console.log("Empty query, clearing search results");
      setIsSearching(false);
      setSearchResults([]);
      setExpandedProducts({}); // Reset expanded products when clearing search
      return;
    }

    setIsSearching(true);

    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/products/admin/search?query=${query}`
      );

      setSearchResults(res.data.data);
      setExpandedProducts({}); // Reset expanded products when searching
    } catch (error) {
      console.error("Error during search:", error);
      setSearchResults([]);
    }
  };

  const clearSearch = () => {
    console.log("Clearing search");
    setSearchQuery("");
    setIsSearching(false);
    setSearchResults([]);
    setExpandedProducts({}); // Reset expanded products when clearing search

    // Focus back on the search input after clearing
    setTimeout(() => {
      const searchInput = document.getElementById("product-search");
      if (searchInput) {
        searchInput.focus();
      }
    }, 100);
  };

  const handleLogout = async () => {
    try {
      const empId = user._id;
      if (isEmployee) {
        await axios.post(
          `${API_BASE_URL}/api/auth/employee/logout/${empId}`,
          {},
          { withCredentials: true }
        );
      } else {
        await axios.post(
          `${API_BASE_URL}/api/auth/logout`,
          {},
          { withCredentials: true }
        );
      }
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Toggle product details expansion for a specific product
  const toggleProductExpansion = (productId) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId], // Toggle only the clicked product's state
    }));
  };

  const handleAddBannerNav = () => {
    try {
      navigate("/banner", { state: { user, orders } });
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };
  const handleAddCatListNav = () => {
    try {
      navigate("/addcategorylist", { state: { user, orders } });
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  const handleAddProdNav = () => {
    try {
      navigate("/addproducts", { state: { user, orders } });
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  return (
    <div style={{ cursor: loading ? "wait" : "default" }}>
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
      <div className="ad-nav">
        <Adnavbar user={user} />
      </div>
      <div
        className={`admin-container ${
          sidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        <Sidebar
          user={user}
          orders={orders}
          onCollapsedChange={handleSidebarCollapse}
        />
        <div className="main-content">
          <header className="admin-header-box">
            <div className="header-greeting">
              <h1>Product Management</h1>
              <p className="subtitle">Manage and monitor Inventory Products</p>
            </div>
            <div className="admin-info">
              <button
                className="ad-add-product-btn"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddBannerNav();
                }}
              >
                <i className="fas fa-plus-circle"></i>
                <span> New Banners</span>
              </button>
              <button
                className="ad-add-product-btn"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddCatListNav();
                }}
              >
                <i className="fas fa-plus-circle"></i>
                <span> New Categories</span>
              </button>
              <button
                className="ad-add-product-btn"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddProdNav();
                }}
              >
                <i className="fas fa-plus-circle"></i>
                <span> New Product</span>
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                <FiLogOut /> Logout
              </button>
            </div>
          </header>

          <div className="search-container">
            <div className="search-input-wrapper">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                placeholder="Search products by name, brand, or description..."
                value={searchQuery}
                onChange={handleSearch}
                className="search-input"
                id="product-search"
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  className="clear-search-btn"
                  onClick={clearSearch}
                  type="button"
                  aria-label="Clear search"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>

          <div className="category-selector">
            <h2>Select Category</h2>
            <div className="category-tabs">
              {/* Always show "All Products" tab */}
              <button
                className={`category-tab ${
                  selectedCategory === "all" ? "active" : ""
                }`}
                onClick={() => handleCategoryChange("all")}
              >
                <i className="fas fa-boxes"></i> All Products (
                {pagination.totalProducts})
              </button>

              {categories.map((category) => {
                const categoryCount = products.filter(
                  (p) => p.category === category
                ).length;

                return (
                  <button
                    key={category}
                    className={`category-tab ${
                      selectedCategory === category ? "active" : ""
                    }`}
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)} (
                    {categoryCount})
                  </button>
                );
              })}
            </div>
          </div>

          <div className="product-display">
            <h2>
              <i className="fas fa-list"></i>{" "}
              {isSearching ? "Search Results" : "Product List"}
            </h2>

            {isSearching && (
              <div className="ad-search-results">
                {searchResults.length > 0 ? (
                  <div className="ad-prod-list">
                    {searchResults.map((product, index) => (
                      <div
                        key={product._id || product.id}
                        className="product-card"
                        style={{ "--animation-order": index }}
                      >
                        <div
                          className="product-summary"
                          onClick={() =>
                            toggleProductExpansion(product._id || product.id)
                          }
                        >
                          <div className="ad-prodlist-img-cat">
                            <div className="product-thumbnail">
                              {product.images && product.images.length > 0 ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="thumbnail-image"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                      "https://via.placeholder.com/150?text=No+Image";
                                  }}
                                />
                              ) : product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="thumbnail-image"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                      "https://via.placeholder.com/150?text=No+Image";
                                  }}
                                />
                              ) : (
                                <div className="thumbnail-placeholder">
                                  <i
                                    className={`fas ${
                                      product.category &&
                                      categoryMetadata[product.category]
                                        ? categoryMetadata[product.category].icon
                                        : "fa-box"
                                    }`}
                                  ></i>
                                </div>
                              )}
                            </div>
                            <div className="category-badge">
                              {product.category
                                ? categoryMetadata[product.category]
                                  ? categoryMetadata[product.category].label
                                  : product.category.charAt(0).toUpperCase() +
                                    product.category.slice(1)
                                : "Unknown"}
                            </div>
                          </div>
                          <div className="product-brief">
                            <h3 className="product-name">{product.name}</h3>
                            <div className="product-brief-info">
                              <span className="brief-brand">
                                {product.brand}
                              </span>
                              <span className="brief-price">
                                ₹{product.price}
                              </span>
                              <span className="brief-stock">
                                Stock: {product.stock}
                              </span>
                            </div>
                          </div>
                          <div className="expand-toggle">
                            <i
                              className={`fas ${
                                expandedProducts[product._id || product.id]
                                  ? "fa-chevron-up"
                                  : "fa-chevron-down"
                              }`}
                            ></i>
                          </div>
                        </div>

                        {expandedProducts[product._id || product.id] && (
                          <div className="product-details">
                            <div className="details-grid">
                              <div className="detail-column">
                                <div className="detail-item">
                                  <span className="detail-label">
                                    <i className="fas fa-tag"></i> Brand:
                                  </span>
                                  <span className="detail-value">
                                    {product.brand}
                                  </span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">
                                    <i className="fas fa-rupee-sign"></i> Price:
                                  </span>
                                  <span className="detail-value price">
                                    ₹{product.price}
                                  </span>
                                </div>
                              </div>
                              <div className="detail-column">
                                <div className="detail-item">
                                  <span className="detail-label">
                                    <i className="fas fa-cubes"></i> Stock:
                                  </span>
                                  <span className="detail-value">
                                    {product.stock}
                                  </span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">
                                    <i className="fas fa-star"></i> Rating:
                                  </span>
                                  <span className="detail-value">
                                    {product.rating}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {product.description && (
                              <div className="product-description">
                                <span className="description-label">
                                  <i className="fas fa-info-circle"></i>{" "}
                                  Description:
                                </span>
                                <p className="description-text">
                                  {product.description}
                                </p>
                              </div>
                            )}
                            <div className="product-actions">
                              <button
                                className="ad-prodlist-edit"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate("/addproducts", {
                                    state: {
                                      user,
                                      orders,
                                      editProduct: product,
                                    },
                                  });
                                }}
                              >
                                <FiEdit />
                                Edit
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-results">
                    <i className="fas fa-search"></i>
                    <p>
                      No products found matching "<strong>{searchQuery}</strong>"
                    </p>
                    <p className="search-tips">
                      Try checking your spelling or using more general terms.
                    </p>
                    <button
                      className="ad-clear-search-btn"
                      onClick={clearSearch}
                    >
                      Clear Search
                    </button>
                  </div>
                )}
              </div>
            )}

            {!isSearching && (
              <>
                <div className="ad-prod-list">
                  {products.length === 0 ? (
                    <p>No products available in this category.</p>
                  ) : (
                    products.map((product, index) => {
                      const categoryIcon =
                        product.category && categoryMetadata[product.category]
                          ? categoryMetadata[product.category].icon
                          : "fa-box";

                      return (
                        <div
                          key={product._id || product.id}
                          className="product-card"
                          style={{ "--animation-order": index }}
                        >
                          <div
                            className="product-summary"
                            onClick={() =>
                              toggleProductExpansion(product._id || product.id)
                            }
                          >
                            <div className="ad-prodlist-img-cat">
                              <div className="product-thumbnail">
                                {product.images && product.images.length > 0 ? (
                                  <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="thumbnail-image"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src =
                                        "https://via.placeholder.com/150?text=No+Image";
                                    }}
                                  />
                                ) : product.image ? (
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="thumbnail-image"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src =
                                        "https://via.placeholder.com/150?text=No+Image";
                                    }}
                                  />
                                ) : (
                                  <div className="thumbnail-placeholder">
                                    <i className={`fas ${categoryIcon}`}></i>
                                  </div>
                                )}
                              </div>
                              {selectedCategory === "all" && (
                                <div className="category-badge">
                                  {product.category
                                    ? categoryMetadata[product.category]
                                      ? categoryMetadata[product.category].label
                                      : product.category
                                          .charAt(0)
                                          .toUpperCase() +
                                        product.category.slice(1)
                                    : "Unknown"}
                                </div>
                              )}
                            </div>
                            <div className="product-brief">
                              <h3 className="product-name">{product.name}</h3>
                              <div className="product-brief-info">
                                <span className="brief-brand">
                                  {product.brand}
                                </span>
                                <span className="brief-price">
                                  ₹{product.price}
                                </span>
                                <span className="brief-stock">
                                  Stock: {product.stock}
                                </span>
                              </div>
                            </div>
                            <div className="expand-toggle">
                              <i
                                className={`fas ${
                                  expandedProducts[product._id || product.id]
                                    ? "fa-chevron-up"
                                    : "fa-chevron-down"
                                }`}
                              ></i>
                            </div>
                          </div>

                          {expandedProducts[product._id || product.id] && (
                            <div className="product-details">
                              <div className="details-grid">
                                <div className="detail-column">
                                  <div className="detail-item">
                                    <span className="detail-label">
                                      <i className="fas fa-tag"></i> Brand:
                                    </span>
                                    <span className="detail-value">
                                      {product.brand}
                                    </span>
                                  </div>
                                  <div className="detail-item">
                                    <span className="detail-label">
                                      <i className="fas fa-rupee-sign"></i>{" "}
                                      Price:
                                    </span>
                                    <span className="detail-value price">
                                      ₹{product.price}
                                    </span>
                                  </div>
                                </div>
                                <div className="detail-column">
                                  <div className="detail-item">
                                    <span className="detail-label">
                                      <i className="fas fa-cubes"></i> Stock:
                                    </span>
                                    <span className="detail-value">
                                      {product.stock}
                                    </span>
                                  </div>
                                  <div className="detail-item">
                                    <span className="detail-label">
                                      <i className="fas fa-star"></i> Rating:
                                    </span>
                                    <span className="detail-value">
                                      {product.rating}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {product.description && (
                                <div className="product-description">
                                  <span className="description-label">
                                    <i className="fas fa-info-circle"></i>{" "}
                                    Description:
                                  </span>
                                  <p className="description-text">
                                    {product.description}
                                  </p>
                                </div>
                              )}
                              <div className="product-actions">
                                <button
                                  className="ad-prodlist-edit"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate("/addproducts", {
                                      state: {
                                        user,
                                        orders,
                                        editProduct: product,
                                      },
                                    });
                                  }}
                                >
                                  <FiEdit />
                                  Edit
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {products.length > 0 && (
                  <div className="ad-prodlist-pagination">
                    <button
                      className="ad-prodlist-pagination-btn ad-prodlist-pagination-prev"
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                      disabled={pagination.currentPage === 1}
                    >
                      <i className="fas fa-chevron-left"></i>
                      Previous
                    </button>

                    <span className="ad-prodlist-pagination-info">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>

                    <button
                      className="ad-prodlist-pagination-btn ad-prodlist-pagination-next"
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                      disabled={
                        pagination.currentPage === pagination.totalPages
                      }
                    >
                      Next
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdproductsList;