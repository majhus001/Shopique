import { useNavigate } from "react-router-dom";
import "./FeaturedProducts.css";
import { FiChevronRight } from "react-icons/fi";
import { motion } from "framer-motion";
import capitalizeWords from "../../../utils/CapitalizeWord";
import HandleProdlistNavigation from "../../../utils/Navigation/ProdlistNavigation";
import HandleCategoryClick from "../../../utils/Navigation/CategoryListNavigation";

const FeaturedProducts = ({ featuredProducts }) => {
  const navigate = useNavigate();
  
  return (
    <section className="featured-section">
      <div className="featured-scroll-wrapper">
        <div className="featured-category-cont">
          {featuredProducts.slice(0, 8).map((category) => (
            <motion.div
              key={category._id}
              className="featured-category-card"
              onClick={() => HandleCategoryClick(category.products[0], navigate)}
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
                  className="featured-category-image"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = "/placeholder-category.jpg";
                  }}
                />
              </div>
              <div className="featured-category-info">
                <span>
                  {capitalizeWords(category.subCategory)}
                  <FiChevronRight />
                </span>
              </div>

              <div className="featured-category-dropdown">
                {category.products.slice(0, 5).map((item) => (
                  <div
                    key={item._id}
                    className="featured-category-dropdown-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      HandleProdlistNavigation(item, navigate);
                    }}
                  >
                    <img
                      className="featured-category-dropdown-img"
                      src={item.images[0]}
                      alt={item.name}
                    />
                    <span className="featured-category-dropdown-item-name">{item.name}</span>
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
