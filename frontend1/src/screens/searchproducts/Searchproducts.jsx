import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../navbar/Navbar";
import "./Searchproducts.css";
import axios from "axios";
import API_BASE_URL from "../../api";
import {
  FiShoppingCart,
  FiShoppingBag,
  FiChevronLeft,
  FiChevronRight,
  FiStar,
} from "react-icons/fi";

export default function Searchproducts() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, clickedProduct, productCategory, productSubCategory } =
    location.state || {};

  const userId = user?._id;
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [groupedProducts, setGroupedProducts] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 100000]); // Default range
  const [maxPrice, setMaxPrice] = useState(100000);
  const [cartStatus, setCartStatus] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;
  const [loading, setLoading] = useState(true);

  // Fetch products of the clicked category and organize by subCategory
  useEffect(() => {
    // In the fetchProducts function within useEffect:
    // In the fetchProducts function within useEffect:
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let categoryToFetch;
        let priorityProduct = null;
        let prioritySubCategory = null;

        // Scenario 1: We have a clickedProduct
        if (clickedProduct?.category) {
          categoryToFetch = clickedProduct.category;
          priorityProduct = clickedProduct;
          prioritySubCategory = clickedProduct.subCategory;
        } else if (productCategory) {
          categoryToFetch = productCategory;
          const response = await axios.get(
            `${API_BASE_URL}/api/products/fetchbycategory/${productCategory}`
          );
          response.data.data.forEach((item) => {
            if (item.subCategory == productSubCategory) {
              priorityProduct = item;
              prioritySubCategory = productSubCategory;
            }
          });
        }
        // Scenario 3: We only have an ID (from params)
        else if (id) {
          const response = await axios.get(
            `${API_BASE_URL}/api/products/fetch/${id}`
          );
          priorityProduct = response.data.data;
          categoryToFetch = priorityProduct.category;
          prioritySubCategory = priorityProduct.subCategory;
        } else {
          console.error("No product information available");
          return;
        }

        let productsArray = [];
        if(!productSubCategory){
          const response = await axios.get(
            `${API_BASE_URL}/api/products/fetchbycategory/${categoryToFetch}`
          );
          productsArray = response.data.data || [];
        }else{
          console.log("kkkk")
          const response = await axios.get(
            `${API_BASE_URL}/api/products/fetchbysubCategory/${productSubCategory}`
          );
          productsArray = response.data.data || [];
        }


        if (priorityProduct) {
          productsArray = productsArray.filter(
            (p) => p._id !== priorityProduct._id
          );

          productsArray = [priorityProduct, ...productsArray];
        }

        const calculatedMaxPrice = productsArray.reduce(
          (max, item) => Math.max(max, item.price),
          0
        );

        setCategoryProducts(productsArray);
        setMaxPrice(calculatedMaxPrice);
        setPriceRange([0, calculatedMaxPrice]);

        // Group by subCategory
        const grouped = {};
        productsArray.forEach((product) => {
          const subCat = product.subCategory || "Other";
          if (!grouped[subCat]) {
            grouped[subCat] = [];
          }
          grouped[subCat].push(product);
        });

        // Determine subCategory order - priority first if exists
        const subCategories = Object.keys(grouped);
        let orderedSubCategories = subCategories;

        if (
          prioritySubCategory &&
          subCategories.includes(prioritySubCategory)
        ) {
          orderedSubCategories = [
            prioritySubCategory,
            ...subCategories.filter((sc) => sc !== prioritySubCategory),
          ];
        }

        // Create final grouped products array
        const orderedGroupedProducts = orderedSubCategories.map((subCat) => ({
          subCategory: subCat,
          products: grouped[subCat],
        }));

        setGroupedProducts(orderedGroupedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [clickedProduct, productCategory, id]);

  // Fetch cart status
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

  const handlePriceChange = (event) => {
    setPriceRange([0, Number(event.target.value)]);
    setCurrentPage(1);
  };

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
    navigate("/buynow", {
      state: {
        user,
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
        stock: item.stock,
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

  // Filter products by price range
  const filterProductsByPrice = (products) => {
    return products.filter(
      (item) => item.price >= priceRange[0] && item.price <= priceRange[1]
    );
  };

  // Get paginated products from all groups
  const getPaginatedProducts = () => {
    let allFilteredProducts = [];
    groupedProducts.forEach((group) => {
      const filtered = filterProductsByPrice(group.products);
      if (filtered.length > 0) {
        allFilteredProducts = [...allFilteredProducts, ...filtered];
      }
    });

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    return {
      paginatedProducts: allFilteredProducts.slice(
        indexOfFirstProduct,
        indexOfLastProduct
      ),
      totalPages: Math.ceil(allFilteredProducts.length / productsPerPage),
      allFilteredProducts,
    };
  };

  const { paginatedProducts, totalPages, allFilteredProducts } =
    getPaginatedProducts();

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Truncate description to 2 lines
  const truncateDescription = (text) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length > 10) {
      return words.slice(0, 10).join(" ") + "...";
    }
    return text;
  };

  return (
    <div className="sp-search-page-container">
      <Navbar user={user} />

      <div className="sp-search-content-container">
        {/* Filter Section */}
        <div className="sp-filter-sidebar">
          <div className="sp-filter-card">
            <h3 className="sp-filter-title">Filters</h3>
            <div className="sp-price-filter-section">
              <h4>Price Range</h4>
              <div className="sp-price-range-display">
                ₹{priceRange[0]} - ₹{Math.min(priceRange[1], maxPrice)}
              </div>
              <input
                type="range"
                min="0"
                max={maxPrice}
                step="1000"
                value={priceRange[1]}
                onChange={handlePriceChange}
                className="sp-price-slider"
              />
              <div className="sp-price-limits">
                <span>₹0</span>
                <span>₹{maxPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Listing */}
        <div className="sp-product-results-container">
          {loading ? (
            <div className="sp-loading-overlay">
              <div className="sp-spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : paginatedProducts.length > 0 ? (
            <>
              <div className="sp-product-grid">
                {paginatedProducts.map((item) => (
                  <div key={item._id} className="sp-product-card">
                    <div
                      className="sp-product-image-container"
                      onClick={() => handleOnclknav(item)}
                    >
                      <img
                        src={item.images?.[0] || "/placeholder-product.jpg"}
                        alt={item.name}
                        onError={(e) => {
                          e.target.src = "/placeholder-product.jpg";
                        }}
                      />
                      {item.offerPrice && (
                        <div className="sp-discount-badge">
                          {Math.round(
                            ((item.price - item.offerPrice) / item.price) * 100
                          )}
                          % OFF
                        </div>
                      )}
                    </div>
                    <div className="sp-product-details">
                      <h3 onClick={() => handleOnclknav(item)}>{item.name}</h3>
                      <div
                        className="sp-product-description"
                        title={item.description}
                      >
                        {truncateDescription(item.description)}
                      </div>
                      <div className="sp-price-rating-container">
                        <div className="sp-price-container">
                          {item.offerPrice ? (
                            <>
                              <span className="sp-offer-price">
                                ₹{item.offerPrice}
                              </span>
                              <span className="sp-original-price">
                                ₹{item.price}
                              </span>
                            </>
                          ) : (
                            <span className="sp-price">₹{item.price}</span>
                          )}
                        </div>
                        {item.rating > 0 && (
                          <div className="sp-rating">
                            <FiStar className="sp-star-icon" />
                            <span>{item.rating?.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <div className="sp-product-actions">
                        {cartStatus[item._id] ? (
                          <button
                            className="sp-cart-btn sp-added-to-cart"
                            onClick={handleGoToCart}
                          >
                            <FiShoppingCart /> Go to Cart
                          </button>
                        ) : (
                          <button
                            className="sp-cart-btn"
                            onClick={() => handleAddToCart(item)}
                          >
                            <FiShoppingCart /> Add to Cart
                          </button>
                        )}
                        <button
                          className="sp-buy-now-btn"
                          onClick={() => handleBuyNow(item)}
                        >
                          <FiShoppingBag /> Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="sp-pagination-container">
                <button
                  className="sp-pagination-btn"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  <FiChevronLeft /> Previous
                </button>
                <span className="sp-page-indicator">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="sp-pagination-btn"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next <FiChevronRight />
                </button>
              </div>
            </>
          ) : (
            <div className="sp-no-products-found">
              <img src="/no-products.svg" alt="No products" />
              <h3>No products available in this price range</h3>
              <p>Try adjusting your price filter</p>
              <button
                className="sp-reset-filter-btn"
                onClick={() => {
                  setPriceRange([0, maxPrice]);
                  setCurrentPage(1);
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
