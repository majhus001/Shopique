import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../navbar/Navbar";
import "./Searchproducts.css";
import axios from "axios";
import API_BASE_URL from "../../api";

export default function Searchproducts() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, categoryData, clickedProduct } = location.state || {};

  const userId = user?._id;
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [cartStatus, setCartStatus] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;
  const [loading, setLoading] = useState(true); // ✅ Loader state

  // ✅ Fetch products of the clicked category
  useEffect(() => {
    if (!clickedProduct || !clickedProduct.category) return;

    const fetchCategoryProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/${clickedProduct.category}/fetch/searchprod`
        );
        if (response) {
          const products = response.data.products || [];

          // Combine all products
          const allProducts = [clickedProduct, ...categoryData, ...products];

          // Remove duplicates by _id
          const uniqueProductsMap = new Map();
          allProducts.forEach((prod) => {
            uniqueProductsMap.set(prod._id, prod);
          });

          const reorderedProducts = Array.from(uniqueProductsMap.values());
          setCategoryProducts(reorderedProducts);
        } else {
          console.log(response.data.message);
        }
      } catch (error) {
        console.error("Error fetching category products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [clickedProduct]);

  // ✅ Fetch cart status
  useEffect(() => {
    if (!userId || categoryProducts.length === 0) return;

    const fetchCartStatus = async () => {
      setLoading(true);
      try {
        const itemIds = categoryProducts.map((item) => item._id);
        const statusObject = {};

        for (const itemId of itemIds) {
          const response = await axios.get(`${API_BASE_URL}/api/cart/check`, {
            params: { userId, itemId },
          });
          statusObject[itemId] = response.data.exists;
        }

        setCartStatus(statusObject);
      } catch (error) {
        console.error("Error checking cart status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartStatus();
  }, [userId, categoryProducts]);

  // ✅ Price range filter handler
  const handlePriceChange = (event) => {
    setPriceRange([0, Number(event.target.value)]);
    setCurrentPage(1);
  };

  // ✅ Add to Cart handler
  const handleAddToCart = async (item) => {
    if (!userId) {
      alert("Please log in to add products to Cart.");
      return;
    }

    const productDetails = {
      userId,
      itemId: item._id,
      name: item.name,
      price: item.price,
      brand: item.brand,
      quantity: 1,
      description: item.description,
      image: item.image,
      category: item.category,
      deliverytime: item.deliverytime,
      rating: item.rating,
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/cart/add`,
        productDetails
      );
      if (response.data.success) {
        setCartStatus((prev) => ({
          ...prev,
          [item._id]: true,
        }));
      } else {
        alert(response.data.message || "Failed to add product to cart.");
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  const handleGoToCart = () => {
    navigate("/cart", { state: { user } });
  };

  const handleBuyNow = (item) => {
    if (!user) {
      alert("Please log in to Add products to Cart.");
      return;
    }
console.log("hiiii")
    navigate("/buynow", {
      state: {
        user,
        itemId:item._id,
        name:item.name,
        price:item.price,
        brand:item.brand,
        quantity: 1,
        description:item.description,
        image:item.image,
        category:item.category,
        deliverytime:item.deliverytime,
        rating:item.rating,
        stock:item.stock,
      },
    });
  };

  const handleOnclknav = (item) => {
    navigate("/prodlist", {
      state: {
        user,
        itemId: item._id,
        name: item.name,
        price: item.price,
        brand: item.brand,
        stock: item.stock,
        description: item.description,
        image: item.image,
        rating: item.rating,
        category: item.category,
        deliverytime: item.deliverytime,
      },
    });
  };

  // ✅ Filtered & Paginated Products
  const filteredProducts = categoryProducts.filter(
    (item) => item.price >= priceRange[0] && item.price <= priceRange[1]
  );

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // ✅ Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="search-prod-cont">
      <div className="se-nav-bar">
        <Navbar user={user} />
      </div>

      <div className="se-pg-cont">
        {/* Filter Section */}
        <div className="se-filter-cont">
          <div className="se-fil-btns">
            <h4>Filter</h4>
            <div className="price-filter-bar">
              <label>
                Price: ₹{priceRange[0]} - ₹{priceRange[1]}
              </label>
              <input
                type="range"
                min="0"
                max="100000"
                value={priceRange[1]}
                onChange={handlePriceChange}
              />
            </div>
          </div>
        </div>

        {/* Product Listing */}
        <div className="se-re-cont">
          {loading ? ( // ✅ Loader condition
            <div className="loader-container">
              <div className="loader-big"></div>
            </div>
          ) : currentProducts.length > 0 ? (
            <>
              {currentProducts.map((item) => (
                <div key={item._id} className="se-prod-item">
                  <img
                    src={item.image}
                    alt={item.name}
                    onClick={() => handleOnclknav(item)}
                    style={{ cursor: "pointer" }}
                  />
                  <div className="se-item-det">
                    <h3 onClick={() => handleOnclknav(item)}>{item.name}</h3>
                    <p>{item.description}</p>
                    <h4>Price: ₹ {item.price}</h4>
                    <div className="se-item-btn-cont">
                      {cartStatus[item._id] ? (
                        <button
                          className="se-item-ac-btn"
                          onClick={handleGoToCart}
                        >
                          <i className="fas fa-shopping-cart"></i> Go to Cart
                        </button>
                      ) : (
                        <button
                          className="se-item-ac-btn"
                          onClick={() => handleAddToCart(item)}
                        >
                          <i className="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                      )}
                      <button
                        className="se-item-ac-btn"
                        onClick={() => handleBuyNow(item)}
                      >
                        <i className="fas fa-shopping-bag"></i> Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* ✅ Pagination Buttons (Placed outside map) */}
              <div className="pagination-buttons">
                <button
                  className="ad-or-d-btn"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span style={{ padding: "0 10px" }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="ad-or-d-btn"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <h3>No products available in this price range</h3>
          )}
        </div>
      </div>
    </div>
  );
}
