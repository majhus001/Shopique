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
  const [expandedProducts, setExpandedProducts] = useState({});

  const [isEmployee, setisEmployee] = useState(false);

  useEffect(() => {
    if (user.role == "Employee") {
      setisEmployee(true);
    }
  }, []);
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

  const generateCategoryMetadata = (categories) => {
    const metadata = {};

    const iconMap = {
      mobile: "fa-mobile-alt",
      phone: "fa-mobile-alt",
      smartphone: "fa-mobile-alt",
      clothing: "fa-tshirt",
      apparel: "fa-tshirt",
      fashion: "fa-tshirt",
      appliance: "fa-blender",
      electronic: "fa-tv",
      computer: "fa-laptop",
      laptop: "fa-laptop",
      accessory: "fa-headphones",
      furniture: "fa-couch",
      book: "fa-book",
      toy: "fa-gamepad",
      food: "fa-utensils",
      grocery: "fa-shopping-basket",
      beauty: "fa-spa",
      health: "fa-heartbeat",
      sport: "fa-running",
      outdoor: "fa-hiking",
      tool: "fa-tools",
      home: "fa-home",
      garden: "fa-leaf",
      pet: "fa-paw",
      jewelry: "fa-gem",
      watch: "fa-clock",
      gift: "fa-gift",
      art: "fa-paint-brush",
      music: "fa-music",
      instrument: "fa-guitar",
      camera: "fa-camera",
      video: "fa-video",
      game: "fa-gamepad",
      software: "fa-code",
      office: "fa-briefcase",
      stationery: "fa-pen",
      travel: "fa-plane",
      luggage: "fa-suitcase",
      car: "fa-car",
      motorcycle: "fa-motorcycle",
      bicycle: "fa-bicycle",
      baby: "fa-baby",
      kid: "fa-child",
    };

    // Process each category
    categories.forEach((category) => {
      // Default values
      let icon = "fa-box";
      let label = category.charAt(0).toUpperCase() + category.slice(1);

      // Try to find a matching icon based on category name
      const lowerCategory = category.toLowerCase();

      // Check if the category name contains any of the keys in our icon map
      for (const [key, value] of Object.entries(iconMap)) {
        if (lowerCategory.includes(key)) {
          icon = value;
          break;
        }
      }

      // Special case handling for legacy categories
      if (category === "mobiles") {
        icon = "fa-mobile-alt";
        label = "Mobiles";
      } else if (category === "clothings") {
        icon = "fa-tshirt";
        label = "Clothing";
      } else if (category === "hoappliances") {
        icon = "fa-blender";
        label = "Home Appliances";
      }

      // Store the metadata
      metadata[category] = {
        icon,
        label,
      };
    });

    return metadata;
  };

  // Fetch all products using the unified API endpoint
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log("Fetching products from API...");
        // Use the unified products API endpoint
        const response = await axios.get(
          `${API_BASE_URL}/api/products/fetchAll`
        );

        console.log("API response:", response.data);

        if (response.data.success && response.data.data) {
          const allProducts = response.data.data;

          // Log a sample product to see its structure
          if (allProducts.length > 0) {
            console.log("Sample product structure:", allProducts[0]);
          }

          setProducts(allProducts);

          // Extract unique categories from products
          const uniqueCategories = getUniqueCategories(allProducts);
          console.log("Unique categories:", uniqueCategories);
          setCategories(uniqueCategories);

          // Generate and set category metadata
          if (uniqueCategories.length > 0) {
            const metadata = generateCategoryMetadata(uniqueCategories);
            console.log("Generated category metadata:", metadata);
            setCategoryMetadata(metadata);
          } else {
            setCategoryMetadata({});
          }

          console.log(
            `Fetched ${allProducts.length} products with ${uniqueCategories.length} categories`
          );
        } else {
          console.error("Failed to fetch products:", response.data);
          setProducts([]);
          setCategories([]);
          setCategoryMetadata({});
        }
      } catch (err) {
        console.error("Error fetching product data:", err);
        setProducts([]);
        setCategories([]);
        setCategoryMetadata({});
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category); // Set the selected category on toggle
  };

  // Handle sidebar collapse state change
  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  // Handle search functionality
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase().trim();
    setSearchQuery(e.target.value);

    if (query === "") {
      console.log("Empty query, clearing search results");
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const filteredResults = products.filter((product) => {
        const name = (product.name || "").toLowerCase();
        const brand = (product.brand || "").toLowerCase();
        const description = (product.description || "").toLowerCase();
        const category = (product.category || "").toLowerCase();

        const categoryLabel =
          product.category && categoryMetadata[product.category]
            ? categoryMetadata[product.category].label.toLowerCase()
            : "";

        const nameMatch = name.startsWith(query) || name.includes(query);
        const brandMatch = brand.startsWith(query) || brand.includes(query);
        const descMatch =
          description.startsWith(query) || description.includes(query);
        const catMatch = category.startsWith(query) || category.includes(query);
        const labelMatch =
          categoryLabel.startsWith(query) || categoryLabel.includes(query);

        return nameMatch || brandMatch || descMatch || catMatch || labelMatch;
      });
      setSearchResults(filteredResults);
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

  // Toggle product details expansion
  const toggleProductExpansion = (productId) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const handleaddcatlistnav = () => {
    try {
      navigate("/addcategorylist", { state: { user, orders } });
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };
  const handleaddprodnav = () => {
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
              <h1>
                 Product Management
              </h1>
              <p className="subtitle">Manage and monitor Inventory Products</p>
            </div>
            <div className="admin-info">
              <button
                className="ad-add-product-btn"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleaddcatlistnav();
                }}
              >
                <i className="fas fa-plus-circle"></i>
                <span>Add New Categories</span>
              </button>
              <button
                className="ad-add-product-btn"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleaddprodnav();
                }}
              >
                <i className="fas fa-plus-circle"></i>
                <span>Add New Product</span>
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
                <i className="fas fa-boxes"></i> All Products ({products.length}
                )
              </button>

              {categories.map((category) => {
                const metadata = categoryMetadata[category] || {
                  icon: "fa-box",
                  label: category.charAt(0).toUpperCase() + category.slice(1),
                };

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
                    <i className={`fas ${metadata.icon}`}></i> {metadata.label}{" "}
                    ({categoryCount})
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
                                        ? categoryMetadata[product.category]
                                            .icon
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
                      No products found matching "<strong>{searchQuery}</strong>
                      "
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
              <div className="ad-prod-list">
                {(() => {
                  const filteredProducts =
                    selectedCategory === "all"
                      ? products
                      : products.filter((p) => p.category === selectedCategory);

                  if (filteredProducts.length === 0) {
                    return <p>No products available in this category.</p>;
                  }

                  return filteredProducts.map((product, index) => {
                    // Get icon from category metadata
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
                                    : product.category.charAt(0).toUpperCase() +
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
                    );
                  });
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdproductsList;
