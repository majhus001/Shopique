import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import API_BASE_URL from "../../api";
import Adnavbar from "../Adnavbar/Adnavbar";
import Sidebar from "../sidebar/Sidebar";
import "./AddCategoryList.css";

const AddCategoryList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, orders } = location.state || {};

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [categorySearchResults, setCategorySearchResults] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState(null);
  const [formData, setFormData] = useState({
    category: "",
    subCategory: "",
    displayName: "",
    priority: 0,
    isActive: true,
    featuredProducts: [],
  });

  // Search for existing categories
  const handleCategorySearch = async (e) => {
    e.preventDefault();
    if (!categorySearchQuery.trim()) return;

    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/categorylist`, {
        params: {
          query: categorySearchQuery,
        },
      });
      setCategorySearchResults(response.data);
    } catch (error) {
      console.error("Error searching categories:", error);
      alert("Failed to search categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Close category search results
  const closeCategorySearchResults = () => {
    setCategorySearchResults([]);
    setCategorySearchQuery("");
  };

  // Close product search results
  const closeProductSearchResults = () => {
    setSearchResults([]);
    setSearchQuery("");
  };

  // Load category data into form for editing
  const loadCategoryForEdit = (category) => {
    setIsEditing(true);
    setCurrentCategoryId(category._id);
    setFormData({
      category: category.category || "",
      subCategory: category.subCategory || "",
      displayName: category.displayName || "",
      priority: category.priority || 0,
      isActive: category.isActive ?? true,
      featuredProducts: category.featuredProducts || [],
    });
    setSelectedProducts(category.featuredProducts || []);
    setCategorySearchQuery("");
    setCategorySearchResults([]);
  };

  // Clear form and reset to add mode
  const resetForm = () => {
    setIsEditing(false);
    setCurrentCategoryId(null);
    setFormData({
      category: "",
      subCategory: "",
      displayName: "",
      priority: 0,
      isActive: true,
      featuredProducts: [],
    });
    setSelectedProducts([]);
    setSearchQuery("");
    setSearchResults([]);
    setCategorySearchQuery("");
    setCategorySearchResults([]);
  };

  // Delete category
  const handleDeleteCategory = async () => {
    if (!currentCategoryId) return;
    
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.delete(
        `${API_BASE_URL}/api/categorylist/${currentCategoryId}`
      );
      
      if (response.data.message === "Category deleted successfully") {
        alert("Category deleted successfully");
        resetForm();
        setCategorySearchResults(
          categorySearchResults.filter(cat => cat._id !== currentCategoryId)
        );
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/categorylist/products/search?query=${searchQuery}`
      );
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error searching products:", error);
      alert("Failed to search products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press for both search inputs
  const handleKeyPress = (e, searchType) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchType === 'product') {
        handleSearch(e);
      } else if (searchType === 'category') {
        handleCategorySearch(e);
      }
    }
  };

  const handleAddProduct = (product) => {
    if (!selectedProducts.some((p) => p._id === product._id)) {
      const updatedProducts = [...selectedProducts, product];
      setSelectedProducts(updatedProducts);
      setFormData({
        ...formData,
        featuredProducts: updatedProducts.map((p) => p._id),
      });
    }
  };

  const handleRemoveProduct = (productId) => {
    const updatedProducts = selectedProducts.filter((p) => p._id !== productId);
    setSelectedProducts(updatedProducts);
    setFormData({
      ...formData,
      featuredProducts: updatedProducts.map((p) => p._id),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.subCategory || !formData.displayName) {
      alert("Category, Sub Category and Display Name are required");
      return;
    }

    try {
      setLoading(true);
      let response;

      if (isEditing) {
        response = await axios.put(
          `${API_BASE_URL}/api/categorylist/${currentCategoryId}`,
          formData
        );
        if (response.data.success) {
          alert("Category updated successfully");
          resetForm();
        }
      } else {
        response = await axios.post(
          `${API_BASE_URL}/api/categorylist/add`,
          formData
        );
        if (response.data.success) {
          alert("Category created successfully");
          resetForm();
        }
      }

    } catch (error) {
      console.error("Error saving category:", error);
      let errorMessage = "Failed to save category";
      if (error.response) {
        if (error.response.status === 409) {
          errorMessage = "Category name already exists";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ cursor: loading ? "wait" : "default" }}>
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
      <div className="ad-nav">
        <Adnavbar user={user} />
      </div>
      <div
        className={`admin-container ${
          sidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        <Sidebar
          user={user}
          orders={orders}
          onCollapsedChange={handleSidebarCollapse}
        />
        <div className="main-content">
          <div className="ad-catlist-container">
            <div className="ad-catlist-header">
              <h1 className="ad-catlist-title">
                {isEditing ? "Edit Category List" : "Add New Category List"}
              </h1>
              {isEditing && (
                <div className="ad-catlist-header-buttons">
                  <button
                    onClick={resetForm}
                    className="ad-catlist-new-btn"
                    disabled={loading}
                  >
                    + New Category
                  </button>
                  <button
                    onClick={handleDeleteCategory}
                    className="ad-catlist-delete-btn"
                    disabled={loading}
                  >
                    Delete Category
                  </button>
                </div>
              )}
            </div>

            {/* Category Search Section */}
            <div className="ad-catlist-category-search">
              <form
                onSubmit={handleCategorySearch}
                className="ad-catlist-search-form"
              >
                <input
                  type="text"
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'category')}
                  className="ad-catlist-search-input"
                  placeholder="Search existing categories..."
                  disabled={loading}
                />
                <button
                  type="submit"
                  className="ad-catlist-search-btn"
                  disabled={loading || !categorySearchQuery.trim()}
                >
                  {loading ? "Searching..." : "Search"}
                </button>
              </form>

              {categorySearchResults.length > 0 && (
                <div className="ad-catlist-category-results">
                  <div className="ad-catlist-results-header">
                    <span>Search Results</span>
                    <button 
                      onClick={closeCategorySearchResults}
                      className="ad-catlist-close-results"
                    >
                      × Close
                    </button>
                  </div>
                  {categorySearchResults.map((category) => (
                    <div
                      key={category._id}
                      className="ad-catlist-category-item"
                      onClick={() => loadCategoryForEdit(category)}
                    >
                      <span>{category.subCategory || category.name}</span>
                      <span className="ad-catlist-category-products">
                        {category.featuredProducts?.length || 0} featured
                        products
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="ad-catlist-form">
              <div className="ad-catlist-form-group">
                <label className="ad-catlist-label">Category*</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="ad-catlist-input"
                  required
                  disabled={loading}
                />
              </div>

              <div className="ad-catlist-form-group">
                <label className="ad-catlist-label">Sub Category*</label>
                <input
                  type="text"
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleInputChange}
                  className="ad-catlist-input"
                  required
                  disabled={loading}
                />
              </div>

              <div className="ad-catlist-form-group">
                <label className="ad-catlist-label">Display Name*</label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className="ad-catlist-input"
                  required
                  disabled={loading}
                />
              </div>

              <div className="ad-catlist-form-group">
                <label className="ad-catlist-label">Priority</label>
                <input
                  type="number"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="ad-catlist-input"
                  min="0"
                  disabled={loading}
                />
              </div>

              <div className="ad-catlist-form-group ad-catlist-checkbox-group">
                <label className="ad-catlist-label">Active</label>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="ad-catlist-checkbox"
                  disabled={loading}
                />
              </div>

              <div className="ad-catlist-form-group">
                <label className="ad-catlist-label">Featured Products</label>
                <div className="ad-catlist-product-search">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, 'product')}
                    className="ad-catlist-search-input"
                    placeholder="Search products to feature..."
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="ad-catlist-search-btn"
                    disabled={loading || !searchQuery.trim()}
                  >
                    {loading ? "Searching..." : "Search"}
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <div className="ad-catlist-search-results">
                    <div className="ad-catlist-results-header">
                      <span>Search Results</span>
                      <button 
                        onClick={closeProductSearchResults}
                        className="ad-catlist-close-results"
                      >
                        × Close
                      </button>
                    </div>
                    {searchResults.map((product) => (
                      <div key={product._id} className="ad-catlist-search-item">
                        <span>{product.name}</span>
                        <button
                          type="button"
                          onClick={() => handleAddProduct(product)}
                          className="ad-catlist-add-btn"
                          disabled={
                            selectedProducts.some(
                              (p) => p._id === product._id
                            ) || loading
                          }
                        >
                          {selectedProducts.some((p) => p._id === product._id)
                            ? "Added"
                            : "Add"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {selectedProducts.length > 0 && (
                  <div className="ad-catlist-selected-products">
                    <h4 className="ad-catlist-selected-title">
                      Featured Products ({selectedProducts.length})
                    </h4>
                    <ul className="ad-catlist-product-list">
                      {selectedProducts.map((product) => (
                        <li
                          key={product._id}
                          className="ad-catlist-product-item"
                        >
                          <div className="ad-catlist-product-info">
                            <span className="ad-catlist-product-name">
                              {product.name}
                            </span>
                            {product.price && (
                              <span className="ad-catlist-product-price">
                                ${product.price.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveProduct(product._id)}
                            className="ad-catlist-remove-btn"
                            disabled={loading}
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="ad-catlist-form-actions">
                <button
                  type="button"
                  onClick={() =>
                    navigate("/adhome", { state: { user, orders } })
                  }
                  className="ad-catlist-cancel-btn"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ad-catlist-submit-btn"
                  disabled={
                    loading || 
                    !formData.category || 
                    !formData.subCategory || 
                    !formData.displayName
                  }
                >
                  {loading
                    ? "Saving..."
                    : isEditing
                    ? "Update Category"
                    : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCategoryList;