import React, { useState } from "react";
import axios from "axios";
import "./Productadd.css";

const ProductAddPage = () => {
  const [product, setProduct] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
    route: "",
    category: "mobiles", // Default category
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [sugclick, setSugclick] = useState(false);
  const [loading, setLoading] = useState(false);

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("price", product.price);
    formData.append("stock", product.stock);
    formData.append("description", product.description);
    formData.append("route", product.route);
    formData.append("image", imageFile);

    // Determine API endpoint based on category
    let apiEndpoint;
    if(product.category === "mobiles"){
      apiEndpoint = "http://localhost:5000/api/mobiles/prod";
    }else if(product.category === "clothings"){
      apiEndpoint = "http://localhost:5000/api/clothings/prod";
    }else if(product.category === "homeappli"){
      apiEndpoint = "http://localhost:5000/api/hoappliances/prod";
    }

    try {
      setLoading(true);
      const response = await axios.post(apiEndpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Product added successfully!");
      setProduct({
        name: "",
        price: "",
        stock: "",
        description: "",
        route: "",
        category: "mobiles", // Reset category to default
      });
      setImageFile(null);
      setImagePreview(null); // Clear image preview
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error adding product:", error);
      alert("Failed to add product.");
    }
  };

  


  return (
    <div className="product-add-page">
      <h2>Add Product</h2>
      
      <form onSubmit={handleSubmit} className="product-add-form">
      <div>
          <label>Category:</label>
          <select
            name="category"
            value={product.category}
            onChange={handleChange}
            required
          >
            <option value="mobiles">Mobiles</option>
            <option value="clothings">Clothings</option>
            <option value="homeappli">HomeAppliances</option>
          </select>
        </div>
        <div className="search-bar">
          <label>Search Products:</label>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search products"
          />
          {loading && <div>Loading...</div>}
          {suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label>Product Name:</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Price:</label>
          <input
            type="number"
            name="price"
            value={product.price}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
          {imagePreview && !sugclick && (
            <div className="image-preview">
              <img
                src={imagePreview}
                alt="Product Preview"
                style={{ maxWidth: "200px", maxHeight: "200px" }}
              />
            </div>
          )}
          {sugclick && imagePreview && (
            <div className="image-preview">
              <img
                src={`http://localhost:5000${imagePreview}`}
                alt="Product Preview"
                style={{ maxWidth: "200px", maxHeight: "200px" }}
              />
            </div>
          )}
        </div>
        <div>
          <label>Stock:</label>
          <input
            type="number"
            name="stock"
            value={product.stock}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        <div>
          <label>Route Name:</label>
          <input
            type="text"
            name="route"
            value={product.route}
            onChange={handleChange}
            required
          />
        </div>
        

        <button type="submit" disabled={loading}>
          Add Product
        </button>
        
      </form>
    </div>
  );
};

export default ProductAddPage;


