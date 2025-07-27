import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import API_BASE_URL from "../../../api";
import Adnavbar from "../../Adnavbar/Adnavbar";
import Sidebar from "../../sidebar/Sidebar";
import "./AddCategoryList.css";

const AddCategoryList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, orders } = location.state || {};

  // State for tabs
  const [activeTab, setActiveTab] = useState("view");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: null });

  // Form state
  const [formData, setFormData] = useState({
    category: "",
    subCategory: "",
    displayName: "",
    priority: 0,
    isActive: true,
    featuredProducts: [],
  });
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [categorySearchResults, setCategorySearchResults] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState(null);

  // Clear status messages after 5 seconds
  useEffect(() => {
    if (status.type) {
      const timer = setTimeout(() => {
        setStatus({ type: null, message: null });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/categorylist`);
      setCategories(response.data);
      response.data.map((item) => {
        // item.featuredProducts.map((el) => {
        console.log(item.featuredProducts[0].images[0]);
        // });
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
      setStatus({ type: "error", message: "Failed to load categories" });
    } finally {
      setLoading(false);
    }
  };

  // Search for existing categories
  const handleCategorySearch = async (e) => {
    e.preventDefault();
    if (!categorySearchQuery.trim()) return;

    try {
      setLoading(true);
      console.log(categorySearchQuery);
      const response = await axios.get(`${API_BASE_URL}/api/categorylist`, {
        params: {
          query: categorySearchQuery,
        },
      });
      setCategorySearchResults(response.data);
    } catch (error) {
      console.error("Error searching categories:", error);
      setStatus({ type: "error", message: "Failed to search categories" });
    } finally {
      setLoading(false);
    }
  };

  // Close category search results
  const closeCategorySearchResults = () => {
    setCategorySearchResults([]);
    setCategorySearchQuery("");
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
    setStatus({ type: "info", message: `Editing ${category.displayName}` });
    closeCategorySearchResults();
  };

  // Reset form to add new category
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
  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/api/categorylist/${id}`);
      setStatus({ type: "success", message: "Category deleted successfully" });
      fetchCategories();
      if (id === currentCategoryId) resetForm();
    } catch (error) {
      console.error("Error deleting category:", error);
      setStatus({ type: "error", message: "Failed to delete category" });
    } finally {
      setLoading(false);
    }
  };

  // Search products
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
      setStatus({ type: "error", message: "Failed to search products" });
    } finally {
      setLoading(false);
    }
  };

  // Add product to featured list
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

  // Remove product from featured list
  const handleRemoveProduct = (productId) => {
    const updatedProducts = selectedProducts.filter((p) => p._id !== productId);
    setSelectedProducts(updatedProducts);
    setFormData({
      ...formData,
      featuredProducts: updatedProducts.map((p) => p._id),
    });
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.subCategory || !formData.displayName) {
      setStatus({ type: "error", message: "Required fields are missing" });
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
        setStatus({
          type: "success",
          message: "Category updated successfully",
        });
      } else {
        response = await axios.post(
          `${API_BASE_URL}/api/categorylist/add`,
          formData
        );
        setStatus({
          type: "success",
          message: "Category created successfully",
        });
      }

      fetchCategories();
      resetForm();
      setActiveTab("view");
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
      setStatus({ type: "error", message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div style={{ cursor: loading ? "wait" : "default" }}>
      <div className="ad-nav">
        <Adnavbar user={user} />
      </div>
      <div className="admin-container">
        <Sidebar user={user} orders={orders} />
        <div className="main-content">
          <div className="ad-category-container">
            <h1 className="ad-category-heading">Category Management</h1>

            {/* Status Message */}
            {status.type && (
              <div className={`status-message ${status.type}`}>
                {status.message}
                <button
                  className="status-close"
                  onClick={() => setStatus({ type: null, message: null })}
                >
                  &times;
                </button>
              </div>
            )}

            {/* Tabs */}
            <div className="ad-category-tabs">
              <button
                className={`ad-category-tab ${
                  activeTab === "view" ? "active" : ""
                }`}
                onClick={() => setActiveTab("view")}
              >
                View Categories
              </button>
              <button
                className={`ad-category-tab ${
                  activeTab === "add" ? "active" : ""
                }`}
                onClick={() => {
                  setActiveTab("add");
                  resetForm();
                }}
              >
                {isEditing ? "Edit Category" : "Add New Category"}
              </button>
            </div>

            {activeTab === "view" ? (
              <div className="ad-category-list">
                {loading && !categories.length ? (
                  <div className="ad-category-loading">
                    Loading categories...
                  </div>
                ) : categories.length === 0 ? (
                  <div className="ad-category-empty">No categories found</div>
                ) : (
                  <div className="ad-category-grid">
                    {categories.map((category) => (
                      <div key={category._id} className="ad-category-card">
                        <div className="ad-category-header">
                          <h3 className="ad-category-title">
                            {category.displayName}
                          </h3>
                          <span
                            className={`ad-category-status ${
                              category.isActive ? "active" : "inactive"
                            }`}
                          >
                            {category.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="ad-categorylist-details-container">
                          <div className="ad-category-details">
                            <p className="ad-category-path">
                              {category.category} &gt; {category.subCategory}
                            </p>
                            <p className="ad-category-products">
                              Featured Products:{" "}
                              {category.featuredProducts?.length || 0}
                            </p>
                            <p className="ad-category-priority">
                              Priority: {category.priority || 0}
                            </p>
                          </div>
                          <div className="ad-categorylist-images">
                            <img
                              src={
                                category.featuredProducts[0]?.images[0] || ""
                              }
                              alt={category.displayName}
                              className="ad-categorylist-image"
                            />
                          </div>
                        </div>
                        <div className="ad-category-actions">
                          <button
                            className="ad-category-edit"
                            onClick={() => {
                              setActiveTab("add");
                              loadCategoryForEdit(category);
                            }}
                            disabled={loading}
                          >
                            Edit
                          </button>
                          <button
                            className="ad-category-delete"
                            onClick={() => handleDeleteCategory(category._id)}
                            disabled={loading}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="ad-category-form-container">
                <form onSubmit={handleSubmit} className="ad-category-form">
                  {/* Category Search Section - Now in Add/Edit Tab */}
                  <div className="ad-category-form-group">
                    <label className="ad-category-label">
                      {isEditing
                        ? "Editing Category"
                        : "Find Existing Category"}
                    </label>
                    <div className="ad-category-product-search">
                      <input
                        type="text"
                        value={categorySearchQuery}
                        onChange={(e) => setCategorySearchQuery(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleCategorySearch(e)
                        }
                        className="ad-category-search-input"
                        placeholder="Search categories to edit..."
                        disabled={loading || isEditing}
                      />
                      <button
                        type="button"
                        onClick={handleCategorySearch}
                        className="ad-category-search-btn"
                        disabled={
                          loading || !categorySearchQuery.trim() || isEditing
                        }
                      >
                        {loading ? "Searching..." : "Search"}
                      </button>
                    </div>

                    {categorySearchResults.length > 0 && (
                      <div className="ad-category-search-results">
                        <div className="ad-category-results-header">
                          <span>Search Results</span>
                          <button
                            onClick={closeCategorySearchResults}
                            className="ad-category-close-results"
                          >
                            × Close
                          </button>
                        </div>
                        {categorySearchResults.map((category) => (
                          <div
                            key={category._id}
                            className="ad-category-search-item"
                            onClick={() => loadCategoryForEdit(category)}
                          >
                            <div className="ad-category-search-item-info">
                              <img
                                src={category.featuredProducts[0]?.images[0]}
                                alt={category.displayName}
                                className="ad-categorylist-search-item-image"
                              />
                              <span className="ad-category-search-item-name">
                                {category.displayName ||
                                  category.subCategory ||
                                  category.category}{" "}
                                -
                              </span>
                              <span className="ad-category-search-item-products">
                                ({category.featuredProducts?.length || 0}{" "}
                                featured products)
                              </span>
                            </div>
                            <button
                              className="ad-category-search-item-edit"
                              onClick={(e) => {
                                e.stopPropagation();
                                loadCategoryForEdit(category);
                              }}
                            >
                              Load
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="ad-category-form-group">
                    <label className="ad-category-label">Category*</label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="ad-category-input"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="ad-category-form-group">
                    <label className="ad-category-label">Sub Category*</label>
                    <input
                      type="text"
                      name="subCategory"
                      value={formData.subCategory}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subCategory: e.target.value,
                        })
                      }
                      className="ad-category-input"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="ad-category-form-group">
                    <label className="ad-category-label">Display Name*</label>
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          displayName: e.target.value,
                        })
                      }
                      className="ad-category-input"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="ad-category-form-group">
                    <label className="ad-category-label">Priority</label>
                    <input
                      type="number"
                      name="priority"
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          priority: parseInt(e.target.value) || 0,
                        })
                      }
                      className="ad-category-input"
                      min="0"
                      disabled={loading}
                    />
                  </div>

                  <div className="ad-category-form-group ad-category-checkbox-group">
                    <label className="ad-category-label">Active</label>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="ad-category-checkbox"
                      disabled={loading}
                    />
                  </div>

                  <div className="ad-category-form-group">
                    <label className="ad-category-label">
                      Featured Products
                    </label>
                    <div className="ad-category-product-search">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSearch(e)}
                        className="ad-category-search-input"
                        placeholder="Search products to feature..."
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={handleSearch}
                        className="ad-category-search-btn"
                        disabled={loading || !searchQuery.trim()}
                      >
                        {loading ? "Searching..." : "Search"}
                      </button>
                    </div>

                    {searchResults.length > 0 && (
                      <div className="ad-category-search-results">
                        <div className="ad-category-results-header">
                          <span>Search Results</span>
                          <button
                            onClick={() => setSearchResults([])}
                            className="ad-category-close-results"
                          >
                            × Close
                          </button>
                        </div>
                        {searchResults.map((product) => (
                          <div
                            key={product._id}
                            className="ad-category-search-item"
                          >
                            <div className="ad-category-search-item-info">
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="ad-categorylist-search-item-image"
                            />
                            <span>{product.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAddProduct(product)}
                              className="ad-category-add-btn"
                              disabled={
                                selectedProducts.some(
                                  (p) => p._id === product._id
                                ) || loading
                              }
                            >
                              {selectedProducts.some(
                                (p) => p._id === product._id
                              )
                                ? "Added"
                                : "Add"}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedProducts.length > 0 && (
                      <div className="ad-category-selected-products">
                        <h4 className="ad-category-selected-title">
                          Featured Products ({selectedProducts.length})
                        </h4>
                        <ul className="ad-category-product-list">
                          {selectedProducts.map((product) => (
                            <li
                              key={product._id}
                              className="ad-category-featured-product-item"
                            >
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="ad-categorylist-search-item-image ad-catlist-featured-images"
                              />
                              <div className="ad-category-product-info">
                                <span className="ad-category-product-name">
                                  {product.name}
                                </span>
                                {product.price && (
                                  <span className="ad-category-product-price">
                                    ${product.price.toFixed(2)}
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveProduct(product._id)}
                                className="ad-category-remove-btn"
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

                  <div className="ad-category-form-actions">
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setActiveTab("view");
                      }}
                      className="ad-category-cancel-btn"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="ad-category-submit-btn"
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCategoryList;
