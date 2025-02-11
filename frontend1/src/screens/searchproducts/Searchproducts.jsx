import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../navbar/Navbar";
import "./Searchproducts.css";
import API_BASE_URL from "../../api";

export default function Searchproducts() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, product, categoryData } = location.state || {};

  const [priceRange, setPriceRange] = useState([0, 100000]);

  if (!categoryData || categoryData.length === 0) {
    return <h2>No Products Found</h2>;
  }

  // Function to handle price range change
  const handlePriceChange = (event) => {
    setPriceRange([0, event.target.value]);
  };

  // Filter products based on price range
  const filteredProducts = categoryData.filter(
    (item) => item.price >= priceRange[0] && item.price <= priceRange[1]
  );

  // Updated onClick handler to pass the product details
  const handleOnclknav = (item) => {
    navigate("/prodlist", {
      state: {
        userId,
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

  return (
    <div className="search-prod-cont">
      <div className="se-nav-bar">
        <Navbar />
      </div>
      <div className="se-pg-cont">
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
                value={priceRange[1]} // Adjusted from priceRange[100000] to priceRange[1]
                onChange={handlePriceChange}
              />
            </div>
            <button> Brand </button>
            <button> Delivery </button>
          </div>
        </div>
        <div className="se-re-cont">
          <div className="">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((item) => (
                <div
                  key={item._id}
                  className="se-prod-item"
                  onClick={() => handleOnclknav(item)} // Pass item to the handler
                >
                  <img
                    src={item.image}
                    alt={item.name}
                  />
                  <div className="se-item-det">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <h4>Price: ₹ {item.price}</h4>
                    <button className="se-item-ac-btn">
                      <i className="fas fa-shopping-cart"></i>
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <h3>No products available in this price range</h3>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
