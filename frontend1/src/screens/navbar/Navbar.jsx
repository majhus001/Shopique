import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Navbar.css";
import API_BASE_URL from "../../api";
import Sidebar from "../sidebar/Sidebar";
import ValidUserData from "../../utils/ValidUserData";

export default function Navbar() {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null means not determined yet
  const [isOrderPage, setIsOrderPage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [cartlength, setCartLength] = useState(0);
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
        params: { userId: userDetails?._id },
      });
      if (response.data.success) {
        setCartLength(response.data.cartItems.length);
      }
    } catch (error) {
      console.error("Error fetching cart data:", error);
    }
  }, [userDetails?._id]);

  const checkUser = useCallback(async () => {
    try {
      const userData = await ValidUserData();
      if (userData) {
        setUserDetails(userData);
        setIsLoggedIn(true);
        return true;
      }
      setIsLoggedIn(false);
      return false;
    } catch (error) {
      setIsLoggedIn(false);
      console.error("Error validating user:", error);
      return false;
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        const isUserValid = await checkUser();
        if (isUserValid) {
          await fetchCartData();
        }
        await fetchAllProducts();
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
  }, [checkUser, fetchAllProducts, fetchCartData]);

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
    navigate(`/seprodlist/${product._id}`, {
      state: {
        user: userDetails,
        clickedProduct: product,
      },
    });

    setSearchQuery("");
    setSearchResults([]);
  };

  // Don't render anything until we know the auth state
  if (isLoading || isLoggedIn === null) {
    return (
      <nav className="hm-navbar">
        <div className="mobile-view-header">
          <div className="nav-logo">
            <h2>ShopiQue</h2>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="hm-navbar">
      {/* Mobile header row */}
      <div className="mobile-view-header">
        <div
          className="nav-logo"
          onClick={() => navigate("/home", { state: { user: userDetails } })}
        >
          <h2>ShopiQue</h2>
        </div>

        <div className="mobile-nav-actions">
          {isLoggedIn ? (
            <button
              className="nav-btns profile-btn"
              onClick={() =>
                navigate("/profilepage", { state: { user: userDetails } })
              }
              aria-label="Profile"
            >
              <i className="fas fa-user"></i>
              <span>{userDetails?.username || " "}</span>
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
          onClick={() => navigate("/home", { state: { user: userDetails } })}
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
              onClick={() => navigate("/cart", { state: { user: userDetails } })}
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
                navigate("/profilepage", { state: { user: userDetails } })
              }
            >
              <i className="fas fa-user"></i>
              <span className="btn-text">{userDetails?.username}</span>
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
  );
}