import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Navbar.css";
import { useDispatch, useSelector } from "react-redux";
import API_BASE_URL from "../../api";
import ValidUserData from "../../utils/ValidUserData";
import slugify from "../../utils/SlugifyUrl";

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const [username, setUsername] = useState(user?.username || "");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [cartlength, setCartLength] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimeout = useRef(null);

  // Separate refs for mobile and desktop search bars
  const mobileSearchRef = useRef(null);
  const desktopSearchRef = useRef(null);

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
        params: { query: query.trim() },
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
    if (e.key === "Enter" && searchQuery.trim()) {
      // If user presses Enter with a search query, navigate to search page
      e.preventDefault();
      navigate(`/products/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  const handleProductClick = (product) => {
    const prodSubCategory = slugify(product.subCategory);
    const prodCategory = slugify(product.category);
    const prodname = slugify(product.name);
    const productId = product._id;
    navigate(
      `/products/search/${prodCategory}/${prodSubCategory}/${prodname}/${productId}`,
      {
        state: {
          clickedProduct: product,
        },
      }
    );
    setSearchQuery("");
    setSearchResults([]);
  };

  // Close search results when clicking outside both search bars
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (mobileSearchRef.current &&
          mobileSearchRef.current.contains(event.target)) ||
        (desktopSearchRef.current &&
          desktopSearchRef.current.contains(event.target))
      ) {
        // Click inside either search bar, do nothing
        return;
      }
      setSearchResults([]);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (isLoading || isLoggedIn === null) {
    return (
      <nav className="nav-container">
        <div className="nav-mobile-header">
          <div className="nav-logo">
            <h2>ShopiQue</h2>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="nav-container">
      {/* Mobile header row */}
      <div className="nav-mobile-header">
        <div className="nav-logo" onClick={() => navigate("/home")}>
          <h2>ShopiQue</h2>
        </div>

        <div className="nav-mobile-actions">
          {isLoggedIn ? (
            <button
              className="nav-btn nav-profile-btn"
              onClick={() => navigate(`/user/profile`)}
              aria-label="Profile"
            >
              <i className="fas fa-user"></i>
              <span>{username?.split(" ")[0] || "User"}</span>
            </button>
          ) : (
            <button
              className="nav-btn nav-profile-btn"
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
      <div className="nav-mobile-search-container">
        <div className="nav-search-bar" ref={mobileSearchRef}>
          <input
            type="text"
            placeholder="Search for products..."
            className="nav-search-input"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
          />
          {searchResults.length > 0 && !isSearching && (
            <div className="nav-search-results">
              {searchResults.map((product) => (
                <div
                  key={product._id}
                  className="nav-search-result-item"
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
                className="nav-search-view-all"
                onClick={() => handleProductClick(searchResults[0])}
              >
                View all results for "{searchQuery}"
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop layout */}
      <div className="nav-desktop-content">
        <div className="nav-logo" onClick={() => navigate("/home")}>
          <h2>ShopiQue</h2>
        </div>
        <div className="nav-search-bar" ref={desktopSearchRef}>
          <input
            type="text"
            placeholder="Search for products..."
            className="nav-search-input"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
          />
          {searchResults.length > 0 && !isSearching && (
            <div className="nav-search-results">
              {searchResults.map((product) => (
                <div
                  key={product._id}
                  className="nav-search-result-item"
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
                className="nav-search-view-all"
                onClick={() => handleProductClick(searchResults[0])}
              >
                View all results for "{searchQuery}"
              </div>
            </div>
          )}
        </div>

        <div className="nav-actions">
          <button
            className="nav-btn nav-cart-btn"
            onClick={() => navigate(`/user/cart`)}
          >
            <i className="fas fa-shopping-cart"></i>
            <span className="nav-btn-text">Cart</span>
            {cartlength > 0 && (
              <span className="nav-cart-count">{cartlength}</span>
            )}
          </button>

          {isLoggedIn ? (
            <button
              className="nav-btn nav-profile-btn"
              onClick={() => navigate(`/user/profile`)}
            >
              <i className="fas fa-user"></i>
              <span>{username?.split(" ")[0] || " "}</span>
            </button>
          ) : (
            <button
              className="nav-btn nav-login-btn"
              onClick={() => navigate("/auth/login")}
            >
              <i className="fas fa-user"></i>
              <span className="nav-btn-text">Login</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
