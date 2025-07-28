import React from "react";
import { useNavigate } from "react-router-dom";
import "../HomeStyle.css";
import { FiChevronRight } from "react-icons/fi";
import { motion } from "framer-motion";

const capitalizeWords = (string) => {
  if (!string) return "";
  return string
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const FeaturedProducts = ({ featuredProducts, userDetails }) => {
  const navigate = useNavigate();
  const handlecategoryClick = (subCategory) => {
    let prodCategory = null;
    let prodSubCategory = null;
    let productId = null;
    featuredProducts.forEach((item) => {
      if (item.subCategory === subCategory) {
        item.products.forEach((el) => {
          prodSubCategory = el.subCategory;
          prodCategory = el.category;
          productId = el._id;
        });
      }
    });
    navigate(
      `/products/search/${prodCategory}/${prodSubCategory}/${productId}`,
      {
        state: {
          user: userDetails,
          productCategory: prodCategory,
          productSubCategory: prodSubCategory,
        },
      }
    );
  };

  const handleprodlistnavigation = (item) => {
    navigate(`/products/${item.category}/${item.subCategory}/${item._id}`, {
      state: {
        product: item,
      },
    });
  };
  return (
    <section className="featured-section">
     <div className="featured-scroll-wrapper">
        <div className="featured-category-cont">
          {featuredProducts.slice(0, 8).map((category) => (
            <motion.div
              key={category._id}
              className="featured-category-card"
              onClick={() => handlecategoryClick(category.subCategory)}
              transition={{ duration: 0.3 }}
              whileHover={{ zIndex: 10 }}
            >
              <div className="category-image-container">
                <img
                  src={
                    category.products[0]?.images[0] ||
                    "/placeholder-category.jpg"
                  }
                  alt={category.displayName || category.subCategory}
                  className="category-image"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = "/placeholder-category.jpg";
                  }}
                />
              </div>
              <div className="category-info">
                <span>
                  {capitalizeWords(category.subCategory)}
                  <FiChevronRight />
                </span>
              </div>

              <div className="category-dropdown">
                {category.products.slice(0, 5).map((item) => (
                  <div
                    key={item._id}
                    className="dropdown-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleprodlistnavigation(item);
                    }}
                  >
                    <img
                      className="dropdown-img"
                      src={item.images[0]}
                      alt={item.name}
                    />
                    <span className="dropdown-item-name">{item.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
