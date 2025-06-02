import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Navbar.css";
import API_BASE_URL from "../../api";

export default function Navbar({ user, pageno = null }) {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOrderPage, setIsOrderPage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [cartlength, setCartLength] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [allProducts, setAllProducts] = useState([]);

  const debounceTimeout = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    if (user) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }

    setIsOrderPage(pageno === "123");
  }, [user, pageno]);

  useEffect(() => {
    // Fetch all products once when component mounts
    const fetchAllProducts = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/products/fetchAll`);
        if (response.data.success) {
          setAllProducts(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching all products:", error);
      }
    };

    fetchAllProducts();
  }, []);

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/cart/fetch`, {
          params: { userId: user?._id },
        });
        if (response.data.success) {
          setCartLength(response.data.cartItems.length);
        }
      } catch (error) {
        console.error("Error fetching cart data:", error);
      }
    };

    if (user) {
      fetchCartData();
    }
  }, [user]);

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

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      if (e.target.value.trim().length > 0) {
        filterProducts(e.target.value.trim());
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
    const filtered = allProducts.filter(product => 
      product.name.toLowerCase().includes(lowerCaseQuery) ||
      (product.description && product.description.toLowerCase().includes(lowerCaseQuery)) ||
      (product.category && product.category.toLowerCase().includes(lowerCaseQuery)) ||
      (product.subCategory && product.subCategory.toLowerCase().includes(lowerCaseQuery))
    );

    setSearchResults(filtered.slice(0, 5)); // Show top 5 results
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleProductClick = (product) => {
    // Find all products in the same category as the clicked product
    const categoryProducts = allProducts.filter(
      p => p.category === product.category
    );

    console.log(product.category)
    navigate("/seprodlist", {
      state: { 
        user, 
        categoryData: categoryProducts,
        clickedProduct: product 
      }
    });
    
    // Reset search
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <>
      <nav className="hm-navbar">
        <div className="nav-logo" onClick={() => navigate("/home", { state: { user } })}>
          <h2>ShopiQue</h2>
        </div>

        <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </div>

        <div className={`nav-content ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
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
                        src={product.images?.[0] || ''} 
                        alt={product.name}
                        onError={(e) => {
                          e.target.src = '';
                          e.target.alt = 'Image not available';
                        }}
                      />
                      <div>
                        <p>{product.name}</p>
                        <span>
                          {product.offerPrice ? 
                            `₹${product.offerPrice}` : 
                            `₹${product.price}`}
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
                onClick={() => navigate("/cart", { state: { user } })}
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
                onClick={() => navigate("/profilepage", { state: { user } })}
              >
                <i className="fas fa-user"></i>
                <span className="btn-text">{user.username}</span>
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
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={toggleMobileMenu}></div>
      )}
    </>
  );
}