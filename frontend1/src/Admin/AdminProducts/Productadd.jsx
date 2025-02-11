import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./Productadd.css";
import API_BASE_URL from "../../api";

const ProductAddPage = () => {
  
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, user } = location.state || {};
  const [product, setProduct] = useState({
    _id:"",
    name: "",
    price: "",
    brand: "",
    rating: "",
    description: "",
    stock: "",
    route: "",
    category: "mobiles",
    deliverytime: "", 
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [sugclick, setSugclick] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("price", product.price);
    formData.append("brand", product.brand);
    formData.append("rating", product.rating);
    formData.append("description", product.description);
    formData.append("stock", product.stock);
    formData.append("route", product.route);
    formData.append("category", product.category);
    formData.append("deliverytime", product.deliverytime);
    formData.append("image", imageFile);

    let apiEndpoint;
    if (product.category === "mobiles") {
      apiEndpoint = `${API_BASE_URL}/api/mobiles/prod`;
    } else if (product.category === "clothings") {
      apiEndpoint = `${API_BASE_URL}/api/clothings/prod`;
    } else if (product.category === "homeappli") {
      apiEndpoint = `${API_BASE_URL}/api/hoappliances/prod`;
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
        brand: "",
        rating: "",
        description: "",
        stock: "",
        route: "",
        category: "mobiles",
        deliverytime: "", 
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

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length >= 1) {
      setLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/${product.category}/search?query=${query}`
        );
        setSuggestions(response.data);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleDelete = async () => {
    if (!product.name) {
      alert("Please select a product to delete.");
      return;
    }

    try {
      setLoading(true);
      await axios.delete(
        `${API_BASE_URL}/api/${product.category}/${product._id}`
      );
      alert("Product deleted successfullyy!");
      setProduct({
        name: "",
        price: "",
        brand: "",
        rating: "",
        description: "",
        stock: "",
        route: "",
        category: "mobiles",
        deliverytime: "", 
      });
      setImageFile(null);
      setImagePreview(null); // Clear image preview
      setSugclick(false);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error deleting product:", error);
      alert("Failed to delete product.");
    }
  };

  const handleUpdate = async () => {
    if (!product.name) {
      alert("Please select a product to update.");
      return;
    }
  
    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("price", product.price);
    formData.append("brand", product.brand);
    formData.append("rating", product.rating);
    formData.append("description", product.description);
    formData.append("stock", product.stock);
    formData.append("route", product.route);
    formData.append("category", product.category);
    formData.append("deliverytime", product.deliverytime);
  
    if (imageFile) {
      formData.append("image", imageFile); // Add the new image if uploaded
    }
    console.log("bfapi")
    console.log(product.category)
    let apiEndpoint = `${API_BASE_URL}/api/${product.category}/update/${product._id}`;
  
    try {
      setLoading(true);
      const response = await axios.put(apiEndpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Product updated successfully!");
      setProduct({
        name: "",
        price: "",
        brand: "",
        rating: "",
        description: "",
        stock: "",
        route: "",
        category: "mobiles",
        deliverytime: "",
      });
      setImageFile(null);
      setImagePreview(null); // Clear the image preview
      setSugclick(false);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error updating product:", error);
      alert("Failed to update product.");
    }
  };
  

  const handleSuggestionClick = (suggestion) => {
    setSugclick(true);
    setProduct({
      _id: suggestion._id,
      name: suggestion.name,
      price: suggestion.price,
      brand: suggestion.brand,
      rating: suggestion.rating,
      description: suggestion.description,
      stock: suggestion.stock,
      route: suggestion.route,
      category: suggestion.category, 
      deliverytime: suggestion.deliverytime,
    });
    console.log(suggestion.category)
    setImagePreview(suggestion.image);
    setSuggestions([]);
  };

  return (
    <div className="outer">
  <div className="product-add-page">
    <h2>Add Products</h2>
    <form onSubmit={handleSubmit} className="product-add-form">
      {/* Move Category to the Top */}
      <div className="ad-se-group">
        <label>Category:</label>
        <select
          className="delivery-time"
          name="category"
          value={product.category}
          onChange={handleChange}
          required
        >
          <option value="mobiles">Mobiles</option>
          <option value="clothings">Clothings</option>
          <option value="hoappliances">Home Appliances</option>
        </select>
      </div>

      <div className="adprod-search-bar ad-se-group">
        <label>Search Products:</label>
        <br />
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

      <div className="ad-se-group">
        <label>Product Name:</label>
        <input
          type="text"
          name="name"
          value={product.name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="ad-se-group">
        <label>Price:</label>
        <input
          type="number"
          name="price"
          value={product.price}
          onChange={handleChange}
          required
        />
      </div>

      <div className="ad-se-group">
        <label>Image:</label>
        <input
          className="ad-image-input"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          required
        />
        {imagePreview && !sugclick && (
          <div className="ad-image-preview">
            <img
              className="ad-image-preview-img"
              src={imagePreview}
              alt="Product Preview"
            />
          </div>
        )}
        {sugclick && imagePreview && (
          <div className="ad-image-preview">
            <img
              className="ad-image-preview-img"
              src={imagePreview}
              alt="Product Preview"
            />
          </div>
        )}
      </div>

      <div className="ad-se-group">
        <label>Brand:</label>
        <input
          type="text"
          name="brand"
          value={product.brand}
          onChange={handleChange}
          required
        />
      </div>

      <div className="ad-se-group">
        <label>Ratings:</label>
        <input
          type="number"
          name="rating"
          value={product.rating}
          onChange={handleChange}
          required
        />
      </div>

      <div className="ad-se-group">
        <label>Delivery Time:</label>
        <br />
        <select
          className="delivery-time"
          name="deliverytime"
          value={product.deliverytime}
          onChange={handleChange}
          required
        >
          <option value="fast">Fast Delivery</option>
          <option value="normal">Normal Delivery</option>
          <option value="premium">Premium Delivery</option>
        </select>
      </div>

      <div className="ad-se-group">
        <label>Stock:</label>
        <input
          type="number"
          name="stock"
          value={product.stock}
          onChange={handleChange}
          required
        />
      </div>
      <div className="ad-se-group">
        <label>Description:</label>
        <textarea
          name="description"
          value={product.description}
          onChange={handleChange}
          required
        ></textarea>
      </div>
      <div className="ad-se-group">
        <label>Route Name:</label>
        <input
          type="text"
          name="route"
          value={product.route}
          onChange={handleChange}
          required
        />
      </div>

      <div className="addprod-btn">
        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: "5px",
            marginLeft: "15px",
            backgroundColor: "rgb(26, 219, 26)",
            color: "white",
          }}
        >
          Add Product
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          style={{
            marginTop: "5px",
            marginLeft: "15px",
            backgroundColor: "red",
            color: "white",
          }}
        >
          Delete Product
        </button>
        <button
          type="button"
          onClick={handleUpdate}
          style={{
            marginTop: "5px",
            marginLeft: "15px",
            backgroundColor: "#007bff",
            color: "white",
          }}
        >
          Update Product
        </button>
      </div>
    </form>
  </div>
</div>

  );
};

export default ProductAddPage;
