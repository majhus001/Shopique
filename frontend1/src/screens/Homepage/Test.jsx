import React, { useState } from 'react';
import './Test.css'; // We'll create this CSS file next

const Test = () => {
  // Sample data - replace with your actual data
  const categories = [
    {
      id: 1,
      name: 'Electronics',
      products: [
        { id: 101, name: 'Smartphones', image: '/images/phones.jpg' },
        { id: 102, name: 'Laptops', image: '/images/laptops.jpg' },
        { id: 103, name: 'Smart Watches', image: '/images/watches.jpg' },
        { id: 104, name: 'Headphones', image: '/images/headphones.jpg' },
      ]
    },
    {
      id: 2,
      name: 'Fashion',
      products: [
        { id: 201, name: "Men's Clothing", image: '/images/men-clothing.jpg' },
        { id: 202, name: "Women's Clothing", image: '/images/women-clothing.jpg' },
        { id: 203, name: 'Footwear', image: '/images/footwear.jpg' },
        { id: 204, name: 'Accessories', image: '/images/accessories.jpg' },
      ]
    },
    {
      id: 3,
      name: 'Home & Kitchen',
      products: [
        { id: 301, name: 'Furniture', image: '/images/furniture.jpg' },
        { id: 302, name: 'Kitchen Appliances', image: '/images/kitchen.jpg' },
        { id: 303, name: 'Home Decor', image: '/images/decor.jpg' },
        { id: 304, name: 'Lighting', image: '/images/lighting.jpg' },
      ]
    },
    {
      id: 4,
      name: 'Beauty',
      products: [
        { id: 401, name: 'Skincare', image: '/images/skincare.jpg' },
        { id: 402, name: 'Makeup', image: '/images/makeup.jpg' },
        { id: 403, name: 'Haircare', image: '/images/haircare.jpg' },
        { id: 404, name: 'Fragrances', image: '/images/fragrances.jpg' },
      ]
    },
    {
      id: 5,
      name: 'Toys & Games',
      products: [
        { id: 501, name: 'Action Figures', image: '/images/action-figures.jpg' },
        { id: 502, name: 'Board Games', image: '/images/board-games.jpg' },
        { id: 503, name: 'Puzzles', image: '/images/puzzles.jpg' },
        { id: 504, name: 'Remote Control', image: '/images/rc-toys.jpg' },
      ]
    },
    {
      id: 6,
      name: 'Sports',
      products: [
        { id: 601, name: 'Fitness Equipment', image: '/images/fitness.jpg' },
        { id: 602, name: 'Team Sports', image: '/images/team-sports.jpg' },
        { id: 603, name: 'Outdoor Recreation', image: '/images/outdoor.jpg' },
        { id: 604, name: 'Cycling', image: '/images/cycling.jpg' },
      ]
    },
    {
      id: 7,
      name: 'Electronics',
      products: [
        { id: 101, name: 'Smartphones', image: '/images/phones.jpg' },
        { id: 102, name: 'Laptops', image: '/images/laptops.jpg' },
        { id: 103, name: 'Smart Watches', image: '/images/watches.jpg' },
        { id: 104, name: 'Headphones', image: '/images/headphones.jpg' },
      ]
    },
    {
      id: 8,
      name: 'Fashion',
      products: [
        { id: 201, name: "Men's Clothing", image: '/images/men-clothing.jpg' },
        { id: 202, name: "Women's Clothing", image: '/images/women-clothing.jpg' },
        { id: 203, name: 'Footwear', image: '/images/footwear.jpg' },
        { id: 204, name: 'Accessories', image: '/images/accessories.jpg' },
      ]
    },
    {
      id: 9,
      name: 'Home & Kitchen',
      products: [
        { id: 301, name: 'Furniture', image: '/images/furniture.jpg' },
        { id: 302, name: 'Kitchen Appliances', image: '/images/kitchen.jpg' },
        { id: 303, name: 'Home Decor', image: '/images/decor.jpg' },
        { id: 304, name: 'Lighting', image: '/images/lighting.jpg' },
      ]
    },
    {
      id: 10,
      name: 'Beauty',
      products: [
        { id: 401, name: 'Skincare', image: '/images/skincare.jpg' },
        { id: 402, name: 'Makeup', image: '/images/makeup.jpg' },
        { id: 403, name: 'Haircare', image: '/images/haircare.jpg' },
        { id: 404, name: 'Fragrances', image: '/images/fragrances.jpg' },
      ]
    },
    {
      id: 11,
      name: 'Toys & Games',
      products: [
        { id: 501, name: 'Action Figures', image: '/images/action-figures.jpg' },
        { id: 502, name: 'Board Games', image: '/images/board-games.jpg' },
        { id: 503, name: 'Puzzles', image: '/images/puzzles.jpg' },
        { id: 504, name: 'Remote Control', image: '/images/rc-toys.jpg' },
      ]
    },
    {
      id: 12,
      name: 'Sports',
      products: [
        { id: 601, name: 'Fitness Equipment', image: '/images/fitness.jpg' },
        { id: 602, name: 'Team Sports', image: '/images/team-sports.jpg' },
        { id: 603, name: 'Outdoor Recreation', image: '/images/outdoor.jpg' },
        { id: 604, name: 'Cycling', image: '/images/cycling.jpg' },
      ]
    },
    {
      id: 13,
      name: 'Sports',
      products: [
        { id: 601, name: 'Fitness Equipment', image: '/images/fitness.jpg' },
        { id: 602, name: 'Team Sports', image: '/images/team-sports.jpg' },
        { id: 603, name: 'Outdoor Recreation', image: '/images/outdoor.jpg' },
        { id: 604, name: 'Cycling', image: '/images/cycling.jpg' },
      ]
    },
    {
      id: 14,
      name: 'Sports',
      products: [
        { id: 601, name: 'Fitness Equipment', image: '/images/fitness.jpg' },
        { id: 602, name: 'Team Sports', image: '/images/team-sports.jpg' },
        { id: 603, name: 'Outdoor Recreation', image: '/images/outdoor.jpg' },
        { id: 604, name: 'Cycling', image: '/images/cycling.jpg' },
      ]
    },
    {
      id: 15,
      name: 'Sports',
      products: [
        { id: 601, name: 'Fitness Equipment', image: '/images/fitness.jpg' },
        { id: 602, name: 'Team Sports', image: '/images/team-sports.jpg' },
        { id: 603, name: 'Outdoor Recreation', image: '/images/outdoor.jpg' },
        { id: 604, name: 'Cycling', image: '/images/cycling.jpg' },
      ]
    },
  ];

  const [activeCategory, setActiveCategory] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState(0);

  const handleCategoryHover = (categoryId, event) => {
    setActiveCategory(categoryId);
    // Calculate position to align dropdown with category
    const categoryElement = event.target;
    const container = categoryElement.parentElement;
    const containerRect = container.getBoundingClientRect();
    const elementRect = categoryElement.getBoundingClientRect();
    setDropdownPosition(elementRect.left - containerRect.left);
  };

  const handleMouseLeave = () => {
    setActiveCategory(null);
  };

  return (
    <div className="featured-products-container">
      <h2 className="section-title">Featured Categories</h2>
      
      <div className="categories-container">
        <div 
          className="categories-scroll"
          onMouseLeave={handleMouseLeave}
        >
          {categories.map(category => (
            <div
              key={category.id}
              className={`category-item ${activeCategory === category.id ? 'active' : ''}`}
              onMouseEnter={(e) => handleCategoryHover(category.id, e)}
            >
              {category.name}
            </div>
          ))}
        </div>
      </div>

      {/* Dropdown for products */}
      {activeCategory && (
        <div 
          className="products-dropdown"
          style={{ left: `${dropdownPosition}px` }}
          onMouseLeave={handleMouseLeave}
        >
          <div className="dropdown-arrow"></div>
          <div className="products-grid">
            {categories.find(c => c.id === activeCategory)?.products.map(product => (
              <div key={product.id} className="product-item">
                <img src={product.image} alt={product.name} className="product-image" />
                <div className="product-name">{product.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div>
        <h2>
            kjkh
        </h2>
        <h2>
            kjkh
        </h2>
        <h2>
            kjkh
        </h2>
        <h2>
            kjkh
        </h2>
        <h2>
            kjkh
        </h2>
        <h2>
            kjkh
        </h2>
        <h2>
            kjkh
        </h2>
        <h2>
            kjkh
        </h2>
      </div>
    </div>
  );
};

export default Test;