import { useNavigate } from "react-router-dom";
import "./CategoryList.css";
import capitalizeWords from "../../../utils/CapitalizeWord";

const CategoryList = ({ categories }) => {
  const navigate = useNavigate();

  const handleCategoryNav = (category) => {
    navigate("/allproducts", { state: { category } });
  };

  return (
    <section className="cat-list-container">
      <h2 className="cat-list-title">Shop by Categories</h2>
      <p className="cat-list-subtitle">
        Discover products in popular categories
      </p>

      <div className="cat-list-grid">
        {categories.map((category) => (
          <article
            key={category.id}
            onClick={() => handleCategoryNav(category.category)}
            className="cat-list-card"
          >
            <div className="cat-list-image-container">
              <img
                src={category.image}
                alt={category.category}
                className="cat-list-image"
                loading="lazy"
              />
              <div className="cat-list-overlay">
                <h3 className="cat-list-category-name">{capitalizeWords(category.category)}</h3>
              </div>
            </div>

            <div className="cat-list-info">
              <span className="cat-list-product-count">
                {category.count}+ products
              </span>
              <button className="cat-list-shop-btn">
                Shop Now
                <svg className="cat-list-arrow-icon" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="cat-list-footer">
        <button 
        onClick={()=>handleCategoryNav()}
        className="cat-list-view-all-btn">View All Categories</button>
      </div>
    </section>
  );
};

export default CategoryList;
