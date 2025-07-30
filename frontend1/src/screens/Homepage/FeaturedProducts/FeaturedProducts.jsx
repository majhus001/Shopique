import { useNavigate } from "react-router-dom";
import "../HomeStyle.css";
import { FiChevronRight } from "react-icons/fi";
import { motion } from "framer-motion";
import capitalizeWords from "../../../utils/CapitalizeWord";
import slugify from "../../../utils/SlugifyUrl";

const FeaturedProducts = ({ featuredProducts, userDetails }) => {
  const navigate = useNavigate();
  const handlecategoryClick = (subCategory) => {
    let prodCategory = null;
    let prodSubCategory = null;
    let prodname = null;
    let productId = null;

    featuredProducts.forEach((item) => {
      if (item.subCategory === subCategory) {
        item.products.forEach((el) => {
          prodSubCategory = slugify(el.subCategory);
          prodCategory = slugify(el.category);
          prodname = slugify(el.name);
          productId = el._id;
        });
      }
    });
    navigate(
      `/products/search/${prodCategory}/${prodSubCategory}/${prodname}/${productId}`,
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
