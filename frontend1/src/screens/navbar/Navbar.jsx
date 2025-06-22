import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Navbar.css";
import API_BASE_URL from "../../api";
import Sidebar from "../sidebar/Sidebar";
import ValidUserData from "../../utils/ValidUserData";

export default function Navbar({ user: propUser, pageno = null }) {
  const navigate = useNavigate();
  const [UserData, setUserData] = useState(propUser || null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOrderPage, setIsOrderPage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [cartlength, setCartLength] = useState(0);
  const [allProducts, setAllProducts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const debounceTimeout = useRef(null);
  const searchRef = useRef(null);

  // Memoized fetch functions to prevent unnecessary recreations
  const fetchAllProducts = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products/fetchAll`);
      if (response.data.success) {
        setAllProducts(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching all products:", error);
    }
  }, []);

  const fetchCartData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/cart/fetch`, {
        params: { userId: UserData?._id },
      });
      if (response.data.success) {
        setCartLength(response.data.cartItems.length);
      }
    } catch (error) {
      console.error("Error fetching cart data:", error);
    }
  }, [UserData?._id]);

  // Check user authentication and fetch data
  useEffect(() => {
    let isMounted = true;

    const checkUser = async () => {
      try {
        const userData = await ValidUserData();
        if (isMounted) {
          setUserData(prevUser => {
            // Only update if the user data has actually changed
            return JSON.stringify(prevUser) !== JSON.stringify(userData) ? userData : prevUser;
          });
          setIsLoggedIn(!!userData);
        }
      } catch (error) {
        if (isMounted) {
          setIsLoggedIn(false);
        }
        console.error("Error validating user:", error);
      }
    };

    if (!propUser) {
      checkUser();
    } else {
      setIsLoggedIn(true);
    }

    return () => {
      isMounted = false;
    };
  }, [propUser]);

  // Fetch products and cart data
  useEffect(() => {
    fetchAllProducts();
    if (UserData) {
      fetchCartData();
    }
  }, [UserData, fetchAllProducts, fetchCartData]);

  // Debounced search handler
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      if (value.trim().length > 0) {
        filterProducts(value.trim());
      } else {
        setSearchResults([]);
      }
    }, 300);
  };

  const filterProducts = (query) => {
    if (!query || query.length < 1) {
      setSearchResults([]);
      return;
    }

    const lowerCaseQuery = query.toLowerCase();
    const filtered = allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerCaseQuery) ||
        (product.description &&
          product.description.toLowerCase().includes(lowerCaseQuery)) ||
        (product.category &&
          product.category.toLowerCase().includes(lowerCaseQuery)) ||
        (product.subCategory &&
          product.subCategory.toLowerCase().includes(lowerCaseQuery))
    );

    setSearchResults(filtered.slice(0, 5));
  };

  const handleProductClick = (product) => {
    console.log(product)
    const categoryProducts = allProducts.filter(
      (p) => p.category === product.category
    );

    navigate("/seprodlist", {
      state: {
        user: UserData,
        categoryData: categoryProducts,
        clickedProduct: product,
      },
    });

    setSearchQuery("");
    setSearchResults([]);
  };

  const handlesidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div>
      <nav className="hm-navbar">
        {/* Mobile header row */}
        <div className="mobile-header-row">
          <button
            className="mobile-menu-toggle"
            onClick={handlesidebar}
            aria-label="Menu"
          >
            {sidebarOpen ? (
              <i className="fas fa-times"></i>
            ) : (
              <i className="fas fa-bars"></i>
            )}
          </button>
          <div className="nav-logo-nav-actions">
            <div
              className="nav-logo"
              onClick={() => navigate("/home", { state: { user: UserData } })}
            >
              <h2>ShopiQue</h2>
            </div>

            <div className="mobile-nav-actions">
              {!isOrderPage && (
                <button
                  className="nav-btns cart-btn"
                  onClick={() =>
                    navigate("/cart", { state: { user: UserData } })
                  }
                  aria-label="Cart"
                >
                  <i className="fas fa-shopping-cart"></i>
                  {cartlength > 0 && (
                    <span className="cart-pro-num">{cartlength}</span>
                  )}
                </button>
              )}

              {isLoggedIn ? (
                <button
                  className="nav-btns profile-btn"
                  onClick={() =>
                    navigate("/profilepage", { state: { user: UserData } })
                  }
                  aria-label="Profile"
                >
                  <i className="fas fa-user"></i>
                  <span>{UserData?.username || " "}</span>
                </button>
              ) : (
                <button
                  className="nav-btns profile-btn"
                  onClick={() => navigate("/login")}
                  aria-label="Login"
                >
                  <i className="fas fa-user"></i>
                  <span>Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Search bar - always visible in mobile */}
        {!isOrderPage && (
          <div className="mobile-search-container">
            <div className="nav-search-bar" ref={searchRef}>
              <input
                type="text"
                placeholder="Search for products..."
                className="nav-searchbar"
                value={searchQuery}
                onChange={handleSearchChange}
              />

              {searchResults.length > 0 && (
                <div className="search-results-dropdown">
                  {searchResults.map((product) => (
                    <div
                      key={product._id}
                      className="search-result-item"
                      onClick={() => handleProductClick(product)}
                    >
                      <img
                        src={product.images?.[0] || ""}
                        alt={product.name}
                        onError={(e) => {
                          e.target.src = "";
                          e.target.alt = "Image not available";
                        }}
                      />
                      <div>
                        <p>{product.name}</p>
                        <span>
                          {product.offerPrice
                            ? `₹${product.offerPrice}`
                            : `₹${product.price}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Desktop layout */}
        <div className="desktop-content">
          <div
            className="nav-logo"
            onClick={() => navigate("/home", { state: { user: UserData } })}
          >
            <h2>ShopiQue</h2>
          </div>
          {!isOrderPage && (
            <div className="nav-search-bar" ref={searchRef}>
              <input
                type="text"
                placeholder="Search for products..."
                className="nav-searchbar"
                value={searchQuery}
                onChange={handleSearchChange}
              />

              {searchResults.length > 0 && (
                <div className="search-results-dropdown">
                  {searchResults.map((product) => (
                    <div
                      key={product._id}
                      className="search-result-item"
                      onClick={() => handleProductClick(product)}
                    >
                      <img
                        src={product.images?.[0] || ""}
                        alt={product.name}
                        onError={(e) => {
                          e.target.src = "";
                          e.target.alt = "Image not available";
                        }}
                      />
                      <div>
                        <p>{product.name}</p>
                        <span>
                          {product.offerPrice
                            ? `₹${product.offerPrice}`
                            : `₹${product.price}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="nav-actions">
            {!isOrderPage && (
              <button
                className="nav-btns cart-btn"
                onClick={() => navigate("/cart", { state: { user: UserData } })}
              >
                <i className="fas fa-shopping-cart"></i>
                <span className="btn-text">Cart</span>
                {cartlength > 0 && (
                  <span className="cart-pro-num">{cartlength}</span>
                )}
              </button>
            )}

            {isLoggedIn ? (
              <button
                className="nav-btns profile-btn"
                onClick={() =>
                  navigate("/profilepage", { state: { user: UserData } })
                }
              >
                <i className="fas fa-user"></i>
                <span className="btn-text">{UserData?.username}</span>
              </button>
            ) : (
              <button
                className="nav-btns login-btn"
                onClick={() => navigate("/login")}
              >
                <i className="fas fa-user"></i>
                <span className="btn-text">Login</span>
              </button>
            )}
          </div>
        </div>
      </nav>
      {sidebarOpen && (
        <div
          className={`nav-sidebar-cont ${sidebarOpen ? "sidebar-open" : ""}`}
          onClick={closeSidebar}
        >
          <Sidebar user={UserData} />
        </div>
      )}
    </div>
  );
}