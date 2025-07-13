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
      console.log("nav check");
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
      if (hasCheckedUser.current) return; // prevent double run
      hasCheckedUser.current = true; // set it immediately

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

        await fetchAllProducts();
      } catch (error) {
        console.error("Initialization error:", error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

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
