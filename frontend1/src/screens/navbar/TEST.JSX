import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Navbar.css";

export default function Navbar({ userId, pageno = null }) {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOrderPage, setIsOrderPage] = useState(false);
  const [username, setUsername] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchmobResults, setSearchmobileResults] = useState([]);
  const [searchclothResults, setSearchclothResults] = useState([]);
  const [searchhomeappResults, setSearchhomeappResults] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/auth/fetch/${userId}`
        );
        const user = response.data.data;
        setUsername(user.username);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (userId) {
      fetchUserData();
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }

    setIsOrderPage(pageno === "123");
  }, [userId, pageno]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length > 0) {
      fetchSearchResults(e.target.value);
    } else {
      setSearchmobileResults([]);
      setSearchclothResults([]);
      setSearchhomeappResults([]);
    }
  };

  // Fetch search results from different collections
  const fetchSearchResults = async (query) => {
    try {
      const [mobileRes, clothRes, homeappliRes] = await Promise.all([
        axios.get(
          `http://localhost:5000/api/mobiles/search/prod?query=${query}`
        ),
        axios.get(
          `http://localhost:5000/api/clothings/search/prod?query=${query}`
        ),
        axios.get(
          `http://localhost:5000/api/hoappliances/search/prod?query=${query}`
        ),
      ]);

      setSearchmobileResults(mobileRes.data.data || []);
      setSearchclothResults(clothRes.data.data || []);
      setSearchhomeappResults(homeappliRes.data.data || []);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  return (
    <nav className="hm-navbar">
      <div className="nav-logo">
        <h2 onClick={() => navigate("/home")}>SHOPIQUE</h2>
      </div>

      {!isOrderPage ? (
        <>
          <div className="nav-search-bar">
            <input
              type="text"
              placeholder="Search for products..."
              className="nav-searchbar"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <button className="nav-btns">
              <i className="fas fa-search"></i> Search
            </button>

            {/* Search Results Dropdown */}
            {(searchmobResults.length > 0 ||
              searchclothResults.length > 0 ||
              searchhomeappResults.length > 0) && (
              <div className="search-results-dropdown">
                {[
                  ...searchmobResults,
                  ...searchclothResults,
                  ...searchhomeappResults,
                ]
                  .slice(0, 5)
                  .map((product) => {
                    let categoryData = [];

                    // Identify which category the selected product belongs to
                    if (searchmobResults.includes(product)) {
                      categoryData = searchmobResults;
                    } else if (searchclothResults.includes(product)) {
                      categoryData = searchclothResults;
                    } else if (searchhomeappResults.includes(product)) {
                      categoryData = searchhomeappResults;
                    }

                    return (
                      <div
                        key={product._id}
                        className="search-result-item"
                        onClick={() =>
                          navigate("/seprodlist", {
                            state: { userId, product, categoryData },
                          })
                        }
                      >
                        <img
                          src={`http://localhost:5000${product.image}`}
                          alt={product.name}
                        />
                        <div>
                          <p>{product.name}</p>
                          <span>${product.price}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          <div className="nav-actions">
            <button
              className="nav-btns"
              onClick={() => navigate("/cart", { state: { userId } })}
            >
              <i className="fas fa-shopping-cart"></i> Cart
            </button>

            {isLoggedIn ? (
              <button
                className="nav-btns my-prof-btn"
                onClick={() => navigate("/profilepage", { state: { userId } })}
              >
                <i className="fas fa-user"></i> {username}
              </button>
            ) : (
              <button className="nav-btns" onClick={() => navigate("/login")}>
                <i className="fas fa-user"></i> Login
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="nav-actions">
          {isLoggedIn ? (
            <button
              className="nav-btns"
              onClick={() => navigate("/profilepage", { state: { userId } })}
            >
              <i className="fas fa-user"></i> {username}
            </button>
          ) : (
            <button className="nav-btns" onClick={() => navigate("/login")}>
              <i className="fas fa-user"></i> Login
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
