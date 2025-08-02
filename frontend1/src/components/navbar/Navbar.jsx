import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Navbar.css";
import { useDispatch, useSelector } from "react-redux";
import API_BASE_URL from "../../api";
import { setCartCount } from "../../Redux/slices/cartSlice";
import HandleCategoryClick from "../../utils/Navigation/CategoryListNavigation";

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { _id, username, isLoggedIn } = useSelector((state) => state.user);
  const cartCount = useSelector((state) => state.cart.cartCount);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [focusedResultIndex, setFocusedResultIndex] = useState(-1);

  const debounceTimeout = useRef(null);
  const mobileSearchRef = useRef(null);
  const desktopSearchRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchResultsRef = useRef([]);

  // Update search results ref whenever searchResults change
  useEffect(() => {
    searchResultsRef.current = searchResults;
  }, [searchResults]);

  // Memoize user display name
  const displayName = useMemo(() => {
    return username?.split(" ")[0] || "User";
  }, [username]);

  const fetchCartData = useCallback(async () => {
    if (!_id) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/api/cart/fetch/count`, {
        params: { userId: _id },
      });
      if (response.data.success) {
        dispatch(setCartCount(response.data.cartLength));
      }
    } catch (error) {
      console.error("Error fetching cart data:", error);
    }
  }, [_id, dispatch]);

  useEffect(() => {
    fetchCartData();
  }, [fetchCartData]);

  const searchProducts = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      setFocusedResultIndex(-1);
      return;
    }

    try {
      setIsSearching(true);
      const response = await axios.get(`${API_BASE_URL}/api/products/search`, {
        params: { query: query.trim() },
      });

      if (response.data.success) {
        const results = response.data.data.slice(0, 5);
        setSearchResults(results);
        setShowSearchResults(results.length > 0);
        setFocusedResultIndex(-1); // Reset focus when new results come
      }
    } catch (error) {
      console.error("Error searching products:", error);
      setSearchResults([]);
      setShowSearchResults(false);
      setFocusedResultIndex(-1);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchChange = useCallback(
    (e) => {
      const value = e.target.value;
      setSearchQuery(value);
      setFocusedResultIndex(-1); // Reset focus when typing

      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      debounceTimeout.current = setTimeout(() => {
        searchProducts(value);
      }, 300);
    },
    [searchProducts]
  );

  const handleProductClick = useCallback(
    (product) => {
      setSearchQuery("");
      setSearchResults([]);
      setShowSearchResults(false);
      HandleCategoryClick(product, navigate);
    },
    [navigate]
  );

  const handleSearchSubmit = useCallback(() => {
    if (searchQuery.trim()) {
      navigate(
        `/products/search?query=${encodeURIComponent(searchQuery.trim())}`
      );
      setSearchQuery("");
      setSearchResults([]);
      setShowSearchResults(false);
      searchInputRef.current?.blur();
    }
  }, [searchQuery, navigate]);

  const handleKeyDown = useCallback(
    (e) => {
      const { key } = e;

      // Handle Enter key press
      if (key === "Enter") {
        e.preventDefault();

        // If search results are shown and there are results
        if (showSearchResults && searchResults.length > 0) {
          // If no specific result is focused, use the first result
          const productToSelect =
            focusedResultIndex >= 0
              ? searchResultsRef.current[focusedResultIndex]
              : searchResultsRef.current[0];

          if (productToSelect) {
            handleProductClick(productToSelect);
          }
        }
        // If no search results or they're not shown, submit the search query
        else if (searchQuery.trim()) {
          handleSearchSubmit();
        }
        return;
      }

      // Handle arrow keys only when search results are shown
      if (!showSearchResults) return;

      const resultsCount = searchResultsRef.current.length;

      // Arrow down - move focus to next result
      if (key === "ArrowDown") {
        e.preventDefault();
        const nextIndex =
          focusedResultIndex < resultsCount - 1 ? focusedResultIndex + 1 : 0;
        setFocusedResultIndex(nextIndex);
      }
      // Arrow up - move focus to previous result
      else if (key === "ArrowUp") {
        e.preventDefault();
        const prevIndex =
          focusedResultIndex > 0 ? focusedResultIndex - 1 : resultsCount - 1;
        setFocusedResultIndex(prevIndex);
      }
      // Escape - close results
      else if (key === "Escape") {
        e.preventDefault();
        setShowSearchResults(false);
        searchInputRef.current?.blur();
      }
    },
    [
      showSearchResults,
      focusedResultIndex,
      handleProductClick,
      handleSearchSubmit,
      searchQuery,
      searchResults.length,
    ]
  );

  const handleViewAllResults = useCallback(() => {
    if (searchQuery.trim()) {
      navigate(
        `/products/search?query=${encodeURIComponent(searchQuery.trim())}`
      );
      setSearchQuery("");
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery, navigate]);

  const handleImageError = useCallback((e) => {
    e.target.src =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='10' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";
    e.target.alt = "Product image not available";
  }, []);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (mobileSearchRef.current &&
          mobileSearchRef.current.contains(event.target)) ||
        (desktopSearchRef.current &&
          desktopSearchRef.current.contains(event.target))
      ) {
        return;
      }
      setShowSearchResults(false);
      setFocusedResultIndex(-1);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  // Here's the updated renderSearchResults function in your Navbar.jsx:
  const renderSearchResults = () => {
    if (!showSearchResults) return null;

    if (isSearching) {
      return (
        <div className="nav-search-results">
          <div className="nav-search-loading">Searching...</div>
        </div>
      );
    }

    if (searchResults.length === 0) return null;

    return (
      <div className="nav-search-results">
        {searchResults.map((product, index) => (
          <div
            key={product._id}
            className={`nav-search-result-item ${
              focusedResultIndex === index ? "nav-search-result-focused" : ""
            }`}
            onClick={() => handleProductClick(product)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleProductClick(product);
            }}
            ref={(el) => {
              if (el && focusedResultIndex === index) {
                el.scrollIntoView({ block: "nearest" });
              }
            }}
          >
            <img
              src={product.images?.[0] || ""}
              alt={product.name}
              loading="lazy"
              onError={handleImageError}
            />
            <div style={{ minWidth: 0 }}>
              {" "}
              {/* Add this wrapper div */}
              <p>{product.name}</p>
              <span>
                {product.offerPrice
                  ? `₹${product.offerPrice.toLocaleString()}`
                  : `₹${product.price.toLocaleString()}`}
              </span>
            </div>
          </div>
        ))}
        <div
          className={`nav-search-view-all ${
            focusedResultIndex === searchResults.length
              ? "nav-search-result-focused"
              : ""
          }`}
          onClick={handleViewAllResults}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleViewAllResults();
          }}
        >
          View all results for "{searchQuery}"
        </div>
      </div>
    );
  };

  const renderSearchBar = (isMobile = false) => (
    <div
      className="nav-search-bar"
      ref={isMobile ? mobileSearchRef : desktopSearchRef}
    >
      <input
        ref={!isMobile ? searchInputRef : null}
        type="text"
        placeholder="Search for products, brands and more..."
        className="nav-search-input"
        value={searchQuery}
        onChange={handleSearchChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (searchResults.length > 0) {
            setShowSearchResults(true);
          }
        }}
        autoComplete="off"
        spellCheck="false"
      />
      {renderSearchResults()}
    </div>
  );

  return (
    <nav
      className="nav-container"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Mobile Header */}
      <div className="nav-mobile-header">
        <div
          className="nav-logo"
          onClick={() => navigate("/home")}
          role="button"
          tabIndex={0}
        >
          <h2>ShopiQue</h2>
        </div>

        <div className="nav-mobile-actions">
          {isLoggedIn ? (
            <button
              className="nav-btn nav-profile-btn"
              onClick={() => navigate("/user/profile")}
              aria-label={`Profile - ${displayName}`}
            >
              <i className="fas fa-user" aria-hidden="true"></i>
              <span>{displayName}</span>
            </button>
          ) : (
            <button
              className="nav-btn nav-login-btn"
              onClick={() => navigate("/auth/login")}
              aria-label="Login"
            >
              <i className="fas fa-user" aria-hidden="true"></i>
              <span>Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Search */}
      <div className="nav-mobile-search-container">{renderSearchBar(true)}</div>

      {/* Desktop Layout */}
      <div className="nav-desktop-content">
        <div
          className="nav-logo"
          onClick={() => navigate("/home")}
          role="button"
          tabIndex={0}
        >
          <h2>ShopiQue</h2>
        </div>

        {renderSearchBar(false)}

        <div className="nav-actions">
          <button
            className="nav-btn nav-cart-btn"
            onClick={() => navigate("/user/cart")}
            aria-label={`Cart ${cartCount > 0 ? `(${cartCount} items)` : "(empty)"}`}
          >
            <i className="fas fa-shopping-cart" aria-hidden="true"></i>
            <span className="nav-btn-text">Cart</span>
            {cartCount > 0 && (
              <span
                className="nav-cart-count"
                aria-label={`${cartCount} items in cart`}
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </button>

          {isLoggedIn ? (
            <button
              className="nav-btn nav-profile-btn"
              onClick={() => navigate("/user/profile")}
              aria-label={`Profile - ${displayName}`}
            >
              <i className="fas fa-user" aria-hidden="true"></i>
              <span>{displayName}</span>
            </button>
          ) : (
            <button
              className="nav-btn nav-login-btn"
              onClick={() => navigate("/auth/login")}
              aria-label="Login"
            >
              <i className="fas fa-user" aria-hidden="true"></i>
              <span className="nav-btn-text">Login</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
