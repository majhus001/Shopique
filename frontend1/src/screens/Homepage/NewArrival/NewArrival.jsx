import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../HomeStyle.css";
import {
  FiShoppingBag,
  FiStar,
  FiChevronRight,
  FiChevronLeft,
} from "react-icons/fi";
import slugify from "../../../utils/SlugifyUrl";
import { motion } from "framer-motion";
const NewArrival = ({ newProducts }) => {
  const navigate = useNavigate();
  const newproductContainerRefs = useRef({});
  const scrollLeft = (subCategory) => {
    const container = newproductContainerRefs.current[subCategory];
    if (container) {
      container.scrollBy({ left: -500, behavior: "smooth" });
    }
  };

  const scrollRight = (subCategory) => {
    const container = newproductContainerRefs.current[subCategory];
    if (container) {
      container.scrollBy({ left: 500, behavior: "smooth" });
    }
  };

  const handleprodlistnavigation = (item) => {
    const prodSubCategory = slugify(item.subCategory);
    const prodCategory = slugify(item.category);
    const prodname = slugify(item.name);
    const productId = item._id;
    navigate(
      `/products/${prodCategory}/${prodSubCategory}/${prodname}/${productId}`,
      {
        state: {
          product: item,
        },
      }
    );
  };

  return (
    <section className="products-section">
      {newProducts.length > 0 ? (
        <div className="product-category">
          {/* Header */}
          <motion.div
            className="category-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h4 className="products-category-title">New Arrivals</h4>
            <span
              className="view-all-link"
              onClick={() => navigate("/products/trending")}
            >
              View All <FiChevronRight />
            </span>
          </motion.div>

          {/* Scroll Container */}
          <div className="horizontal-scroll-container">
            {newProducts.length > 5 && (
              <motion.button
                className="scroll-button left"
                onClick={() => scrollLeft("newarrivals")}
                aria-label="Scroll left"
              >
                <FiChevronLeft />
              </motion.button>
            )}

            <div
              className="product-horizontal-scroll"
              ref={(el) =>
                (newproductContainerRefs.current["newarrivals"] = el)
              }
            >
              {newProducts.map((item) => (
                <motion.div
                  className="product-card-horizontal"
                  key={item._id}
                  whileHover={{
                    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                    y: -5,
                  }}
                  transition={{ duration: 0.3 }}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  onClick={() => handleprodlistnavigation(item)}
                >
                  {/* Product Image */}
                  <div className="product-image-container">
                    <motion.img
                      src={item.images?.[0] || "/fallback.jpg"}
                      alt={item.name}
                      className="product-image"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = "/fallback.jpg";
                        e.target.alt = "Image not available";
                        e.target.className = "product-image-error";
                      }}
                    />
                    {item.offerPrice && (
                      <motion.div
                        className="discount-badge"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        {Math.round(
                          ((item.price - item.offerPrice) / item.price) * 100
                        )}
                        % OFF
                      </motion.div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="product-details">
                    <h4 className="product-name">{item.name}</h4>
                    <div className="price-container">
                      {item.offerPrice ? (
                        <>
                          <span className="offer-price">
                            ₹{item.offerPrice}
                          </span>
                          <span className="original-price">₹{item.price}</span>
                        </>
                      ) : (
                        <span className="price">₹{item.price}</span>
                      )}
                    </div>

                    {/* Ratings and Sales Count */}
                    <div className="product-meta">
                      {item.rating > 0 && (
                        <div className="rating">
                          <FiStar className="star-icon" />
                          <span>{item.rating.toFixed(1)}</span>
                        </div>
                      )}
                      {item.salesCount > 0 && (
                        <div className="sales-count">
                          <FiShoppingBag />
                          <span>{item.salesCount + 50} sold</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {newProducts.length > 5 && (
              <motion.button
                className="scroll-button right"
                onClick={() => scrollRight("newarrivals")}
                aria-label="Scroll right"
              >
                <FiChevronRight />
              </motion.button>
            )}
          </div>
        </div>
      ) : (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <img
            src="/empty-state.svg"
            alt="No products available"
            loading="lazy"
          />
          <h3>No products available</h3>
          <p>Check back later for new arrivals</p>
          <button
          //   onClick={fetchData}
          >
            Refresh
          </button>
        </motion.div>
      )}
    </section>
  );
};

export default NewArrival;
