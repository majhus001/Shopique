import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Navbar.css";
import { useDispatch, useSelector } from "react-redux";
import API_BASE_URL from "../../api";
import ValidUserData from "../../utils/ValidUserData";

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const [username, setUsername] = useState(user?.username || "");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOrderPage, setIsOrderPage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [cartlength, setCartLength] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimeout = useRef(null);
  const searchRef = useRef(null);

  const fetchCartData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/cart/fetch/count`, {
        params: { userId: user?._id },
      });
      if (response.data.success) {
        setCartLength(response.data.cartLength);
      }
    } catch (error) {
      console.error("Error fetching cart data:", error);
    }
  }, [user?._id]);

  const checkUser = useCallback(async () => {
    try {
      const userData = await ValidUserData(dispatch);
      if (userData) {
        setUsername(userData.username);
        setIsLoggedIn(true);
        return true;
      }
      setIsLoggedIn(false);
      return false;
    } catch (error) {
      console.error("Error validating users:", error);
      setIsLoggedIn(false);
      return false;
    }
  }, [dispatch]);

  useEffect(() => {
    const path = window.location.pathname;
    setIsOrderPage(path.includes("/orders") || path.includes("/checkout"));
  }, []);

  const hasCheckedUser = useRef(false);

  useEffect(() => {
    const initialize = async () => {
      if (hasCheckedUser.current) return; 
      hasCheckedUser.current = true; 

      setIsLoading(true);

      try {
        let shouldFetchCart = false;

        if (!user || !user?._id) {
          const isUserValid = await checkUser();
          shouldFetchCart = isUserValid;
        } else {
          setIsLoggedIn(true);
          shouldFetchCart = true;
        }

        if (shouldFetchCart) {
          await fetchCartData();
        }
      } catch (error) {
        console.error("Initialization error:", error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [checkUser, fetchCartData, user]);

  const searchProducts = useCallback(async (query) => {
    if (!query || query.trim().length < 1) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const response = await axios.get(`${API_BASE_URL}/api/products/search`, {
        params: { query: query.trim() }
      });
      
      if (response.data.success) {
        setSearchResults(response.data.data.slice(0, 5)); // Limit to 5 results
      }
    } catch (error) {
      console.error("Error searching products:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear previous timeout if it exists
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set new timeout
    debounceTimeout.current = setTimeout(() => {
      searchProducts(value);
    }, 300); // 300ms debounce delay
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      // If user presses Enter with a search query, navigate to search page
      e.preventDefault();
      navigate(`/products/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  const handleProductClick = (product) => {
    navigate(
      `/products/search/${product.category}/${product.subCategory}/${product._id}`,
      {
        state: {
          clickedProduct: product,
        },
      }
    );
    setSearchQuery("");
    setSearchResults([]);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
        <div className="nav-logo" onClick={() => navigate("/home")}>
          <h2>ShopiQue</h2>
        </div>

        <div className="mobile-nav-actions">
          {isLoggedIn ? (
            <button
              className="nav-btns profile-btn"
              onClick={() =>
                navigate(`/user/${user?._id || "unauthorized"}/profile`)
              }
              aria-label="Profile"
            >
              <i className="fas fa-user"></i>
              <span>{username?.split(" ")[0] || "User"}</span>
            </button>
          ) : (
            <button
              className="nav-btns profile-btn"
              onClick={() => navigate("/auth/login")}
              aria-label="Login"
            >
              <i className="fas fa-user"></i>
              <span>Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Search bar - always visible in mobile */}
      <div className="mobile-search-container">
        <div className="nav-search-bar" ref={searchRef}>
          <input
            type="text"
            placeholder="Search for products..."
            className="nav-searchbar"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
          />
          {isSearching && (
            <div className="search-loading">Searching...</div>
          )}
          {searchResults.length > 0 && !isSearching && (
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
              <div 
                className="search-view-all"
                onClick={() => {
                  navigate(`/products/search?query=${encodeURIComponent(searchQuery)}`);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
              >
                View all results for "{searchQuery}"
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop layout */}
      <div className="desktop-content">
        <div className="nav-logo" onClick={() => navigate("/home")}>
          <h2>ShopiQue</h2>
        </div>
        <div className="nav-search-bar" ref={searchRef}>
          <input
            type="text"
            placeholder="Search for products..."
            className="nav-searchbar"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
          />
          {isSearching && (
            <div className="search-loading">Searching...</div>
          )}
          {searchResults.length > 0 && !isSearching && (
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
              <div 
                className="search-view-all"
                onClick={() => {
                  navigate(`/products/search?query=${encodeURIComponent(searchQuery)}`);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
              >
                View all results for "{searchQuery}"
              </div>
            </div>
          )}
        </div>

        <div className="nav-actions">
          {!isOrderPage && (
            <button
              className="nav-btns cart-btn"
              onClick={() =>
                navigate(`/user/${user?._id || "unauthorized"}/cart`)
              }
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
                navigate(`/user/${user?._id || "unauthorized"}/profile`)
              }
            >
              <i className="fas fa-user"></i>
              <span>{username?.split(" ")[0] || " "}</span>
            </button>
          ) : (
            <button
              className="nav-btns login-btn"
              onClick={() => navigate("/auth/login")}
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