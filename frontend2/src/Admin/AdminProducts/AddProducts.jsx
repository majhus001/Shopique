import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import API_BASE_URL from "../../api";
import QRCodeModal from "../Qrcode/QRCodeModal";
import QRCodeScanner from "../Qrcode/QRCodeScanner";
import Adnavbar from "../Adnavbar/Adnavbar";
import Sidebar from "../sidebar/Sidebar";
import "./AddProducts.css";

const AddProducts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, orders, editProduct } = location.state || {};

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("product");

  // Product state
  const [product, setProduct] = useState({
    name: "",
    price: "",
    brand: "",
    images: [""],
    category: "",
    subCategory: "",
    displayName: "",
    description: "",
    stock: "",
    rating: "",
    offerPrice: "",
    isFeatured: false,
    tags: [""],
    specifications: {},
  });

  // Seller state
  const [seller, setSeller] = useState({
    sellername: "",
    companyname: "",
    sellermobile: "",
    selleremail: "",
    selleraddress: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [specifications, setSpecifications] = useState([
    { key: "", value: "" },
  ]);
  const [products, setProducts] = useState([{ key: "", value: "" }]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [savedProduct, setSavedProduct] = useState(null);
  const [sellersDatas, setSellersDatas] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [sellerId, setSellerId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  const fileInputRef = useRef(null);
  const searchRef = useRef(null);

  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  const fetchseller = async () => {
    try {
      const sellerRes = await axios.get(`${API_BASE_URL}/api/sellers/fetch`);
      setSellersDatas(sellerRes.data.data);
    } catch {
      console.log("error on sellers");
    }
  };

  useEffect(() => {
    fetchseller();
  }, [user]);

  useEffect(() => {
    if (!searchInput || !sellersDatas) {
      setSuggestions([]);
      return;
    }
    const filtered = sellersDatas.filter((seller) =>
      seller.companyname?.toLowerCase().includes(searchInput.toLowerCase())
    );
    setSuggestions(filtered);
  }, [searchInput, sellersDatas]);

  useEffect(() => {
    if (selectedImages.length > 0) {
      const newPreviewUrls = [];
      selectedImages.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviewUrls.push(reader.result);
          if (newPreviewUrls.length === selectedImages.length) {
            setImagePreviewUrls(newPreviewUrls);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  }, [selectedImages]);

  useEffect(() => {
    if (editProduct) {
      setCurrentProductId(editProduct._id);
      setIsEditMode(true);
      handleSelectProduct(editProduct);
    }
  }, [editProduct]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/products/search?query=${query}`
      );
      setSearchResults(response.data.data || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error searching products:", error);
      setSearchResults([]);
    }
  };

  const handleSelectProduct = async (selectedProduct) => {
    const specsArray = [];
    if (selectedProduct.specifications) {
      Object.entries(selectedProduct.specifications).forEach(([key, value]) => {
        specsArray.push({ key, value });
      });
    }

    if (specsArray.length === 0) {
      specsArray.push({ key: "", value: "" });
    }
    setSpecifications(specsArray);

    const productData = {
      name: selectedProduct.name || "",
      price: selectedProduct.price || "",
      brand: selectedProduct.brand || "",
      images: selectedProduct.images || [""],
      category: selectedProduct.category || "",
      subCategory: selectedProduct.subCategory || "",
      displayName: selectedProduct.displayName || "",
      description: selectedProduct.description || "",
      stock: selectedProduct.stock || "",
      rating: selectedProduct.rating || "",
      offerPrice: selectedProduct.offerPrice || "",
      isFeatured: selectedProduct.isFeatured || false,
      tags: selectedProduct.tags || [""],
      specifications: selectedProduct.specifications || {},
    };

    setTagInput(selectedProduct.tags || " ")
    setProduct(productData);
    setCurrentProductId(selectedProduct._id);
    setIsEditMode(true);
    setSearchQuery("");
    setShowSuggestions(false);

    if (selectedProduct.images && selectedProduct.images.length > 0) {
      setImagePreviewUrls(selectedProduct.images.filter((img) => img));
      setSelectedImages([]);
    } else {
      setImagePreviewUrls([]);
      setSelectedImages([]);
    }

    setMessage({
      text: "Product loaded for editing",
      type: "success",
    });
  };

  const handleResetForm = () => {
    setCurrentProductId(null);
    setIsEditMode(false);
    setProduct({
      name: "",
      price: "",
      brand: "",
      images: [""],
      category: "",
      subCategory: "",
      displayName: "",
      description: "",
      stock: "",
      rating: "",
      offerPrice: "",
      isFeatured: false,
      tags: [""],
      specifications: {},
    });
    setSpecifications([{ key: "", value: "" }]);
    setSelectedImages([]);
    setImagePreviewUrls([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setMessage({ text: "", type: "" });
  };

  const handleQRModalClose = () => {
    setShowQRModal(false);
    handleResetForm();
  };

  const handleQRScan = (productData) => {
    if (productData && productData.id) {
      setMessage({
        text: "Fetching product data...",
        type: "info",
      });

      const fetchProductById = async () => {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/products/fetch/${productData.id}`
          );

          if (response.data.success && response.data.data) {
            handleSelectProduct(response.data.data);
          } else {
            setMessage({
              text: "Could not find product with the scanned ID",
              type: "error",
            });
          }
        } catch (error) {
          setMessage({
            text: `Error loading product: ${
              error.response?.data?.error || error.message
            }`,
            type: "error",
          });
        }
      };

      fetchProductById();
    } else {
      setMessage({
        text: "Invalid QR code data. Please try again.",
        type: "error",
      });
    }
  };

  const handleDeleteProduct = async () => {
    if (!currentProductId) return;

    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    setLoading(true);

    try {
      await axios.delete(
        `${API_BASE_URL}/api/products/delete/${currentProductId}`
      );

      setMessage({
        text: "Product deleted successfully",
        type: "success",
      });

      handleResetForm();
    } catch (error) {
      console.error("Error deleting product:", error);
      setMessage({
        text: `Error deleting product: ${
          error.response?.data?.error || error.message
        }`,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct({
      ...product,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSpecificationChange = (index, field, value) => {
    const updatedSpecs = [...specifications];
    updatedSpecs[index][field] = value;
    setSpecifications(updatedSpecs);

    const specsObject = {};
    updatedSpecs.forEach((spec) => {
      if (spec.key && spec.value) {
        specsObject[spec.key] = spec.value;
      }
    });

    setProduct({
      ...product,
      specifications: specsObject,
    });
  };

  const addSpecificationField = () => {
    setSpecifications([...specifications, { key: "", value: "" }]);
  };

  const removeSpecificationField = (index) => {
    if (specifications.length > 1) {
      const updatedSpecs = specifications.filter((_, i) => i !== index);
      setSpecifications(updatedSpecs);

      const specsObject = {};
      updatedSpecs.forEach((spec) => {
        if (spec.key && spec.value) {
          specsObject[spec.key] = spec.value;
        }
      });

      setProduct({
        ...product,
        specifications: specsObject,
      });
    }
  };

  const handlesellerChange = (e) => {
    const { name, value } = e.target;
    setSeller({
      ...seller,
      [name]: value,
    });
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value,
    };
    setProducts(updatedProducts);

    const productsObject = {};
    updatedProducts.forEach((prod) => {
      if (prod.key && prod.value) {
        productsObject[prod.key] = prod.value;
      }
    });

    setSeller({
      ...seller,
      products: productsObject,
    });
  };

  const addProductField = () => {
    setProducts([...products, { key: "", value: "" }]);
  };

  const removeProductField = (index) => {
    if (products.length > 1) {
      const updatedProducts = products.filter((_, i) => i !== index);
      setProducts(updatedProducts);

      const productsObject = {};
      updatedProducts.forEach((prod) => {
        if (prod.key && prod.value) {
          productsObject[prod.key] = prod.value;
        }
      });

      setSeller({
        ...seller,
        products: productsObject,
      });
    }
  };

  const handleTagsChange = (e) => {
    const value = e.target.value;
    setTagInput(value);
    const tagsArray = value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    setProduct({ ...product, tags: tagsArray });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setSelectedImages(files);
    }
  };

  const removeImage = (index) => {
    const newPreviewUrls = [...imagePreviewUrls];
    newPreviewUrls.splice(index, 1);
    setImagePreviewUrls(newPreviewUrls);

    if (selectedImages.length > 0) {
      const newSelectedImages = [...selectedImages];
      newSelectedImages.splice(index, 1);
      setSelectedImages(newSelectedImages);
    }

    if (isEditMode && newPreviewUrls.length === 0) {
      setProduct({
        ...product,
        images: [""],
      });
    }
  };

  const handleSaveSeller = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/sellers/add`,
        seller
      );

      if (response.data.success) {
        setMessage({
          text: "Seller details saved successfully!",
          type: "success",
        });
        setSeller(null);
      } else {
        throw new Error(response.data.message || "Failed to save seller");
      }
    } catch (error) {
      setMessage({
        text: `Error saving seller: ${
          error.response?.data?.error || error.message
        }`,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const formData = new FormData();

      Object.keys(product).forEach((key) => {
        if (key === "specifications") {
          formData.append(key, JSON.stringify(product[key]));
        } else if (key === "tags") {
          formData.append(key, product[key].join(","));
        } else if (key !== "images") {
          formData.append(key, product[key]);
        }
      });

      if (selectedImages.length > 0) {
        selectedImages.forEach((file) => {
          formData.append("images", file);
        });
      } else if (isEditMode && imagePreviewUrls.length > 0) {
        formData.append("keepExistingImages", "true");
      }

      formData.append("sellerId", sellerId);

      let endpoint =
        isEditMode && currentProductId
          ? `${API_BASE_URL}/api/products/update/${currentProductId}`
          : `${API_BASE_URL}/api/products/add`;

      const method = isEditMode ? "put" : "post";

      const response = await axios[method](endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        if (method == "post") {
          const sellerRes = await axios.put(
            `${API_BASE_URL}/api/sellers/update`,
            {
              sellerId,
              products,
            }
          );
        }
        setMessage({
          text: `Product ${isEditMode ? "updated" : "added"} successfully!`,
          type: "success",
        });

        setSavedProduct(response.data.data || response.data.product);
        setShowQRModal(true);
      } else {
        throw new Error(response.data.message || "Operation failed");
      }
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "adding"} product:`,
        error
      );
      setMessage({
        text: `Error ${isEditMode ? "updating" : "adding"} product: ${
          error.response?.data?.error || error.message
        }`,
        type: "error",
      });
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
          <div className="test-add-products-container">
            <div className="header-section">
              <h2>{isEditMode ? "Edit Product" : "Add New Product"}</h2>

              <div className="header-actions">
                <button
                  type="button"
                  className="scan-qr-btn"
                  onClick={() => setShowQRScanner(true)}
                >
                  <span className="scan-icon">📷</span> Scan QR Code
                </button>

                <div className="search-container" ref={searchRef}>
                  <input
                    type="text"
                    placeholder={
                      activeTab === "product"
                        ? "Search products..."
                        : "Search for seller details..."
                    }
                    value={searchQuery}
                    onChange={
                      activeTab === "product" ? handleSearch : undefined
                    }
                    className="ad-prod-search-input"
                  />

                  {showSuggestions && searchResults.length > 0 && (
                    <div className="search-results">
                      {searchResults.map((item) => (
                        <div
                          key={item._id}
                          className="search-result-item"
                          onClick={() => handleSelectProduct(item)}
                        >
                          <div className="search-result-image">
                            {item.images && item.images.length > 0 ? (
                              <img src={item.images[0]} alt={item.name} />
                            ) : (
                              <div className="no-image">No Image</div>
                            )}
                          </div>
                          <div className="search-result-details">
                            <div className="search-result-name">
                              {item.name}
                            </div>
                            <div className="search-result-price">
                              ₹{item.price}
                            </div>
                            <div className="search-result-category">
                              {item.category}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isEditMode && (
              <div className="action-buttons">
                <button
                  type="button"
                  className="reset-btn"
                  onClick={handleResetForm}
                >
                  Cancel Edit
                </button>
                <button
                  type="button"
                  className="ad-delete-btn"
                  onClick={handleDeleteProduct}
                >
                  Delete Product
                </button>
                <button
                  type="button"
                  className="qr-btn"
                  onClick={() => {
                    if (currentProductId && product.name && product.price) {
                      setSavedProduct({
                        _id: currentProductId,
                        name: product.name,
                        price: product.price,
                        brand: product.brand || "",
                        category: product.category || "",
                        subCategory: product.subCategory || "",
                      });
                      setShowQRModal(true);
                    } else {
                      setMessage({
                        text: "Cannot generate QR code: Product data is incomplete",
                        type: "error",
                      });
                    }
                  }}
                >
                  Generate QR Code
                </button>
              </div>
            )}

            {message.text && (
              <div className={`message ${message.type}`}>{message.text}</div>
            )}

            <div className="product-tabs-cont">
              <button
                type="button"
                className={`prod-tab-btn ${
                  activeTab === "product" ? "active" : ""
                }`}
                onClick={() => setActiveTab("product")}
              >
                Product Details
              </button>
              <button
                type="button"
                className={`prod-tab-btn ${
                  activeTab === "seller" ? "active" : ""
                }`}
                onClick={() => setActiveTab("seller")}
              >
                Seller Details
              </button>
            </div>

            {activeTab === "product" ? (
              <form
                id="productForm"
                onSubmit={handleSubmit}
                className="product-form"
              >
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">Product Name</label>
                    <input
                      id="name"
                      name="name"
                      value={product.name}
                      onChange={handleChange}
                      placeholder="Product Name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="price">Price</label>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={product.price}
                      onChange={handleChange}
                      placeholder="Price"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="brand">Brand</label>
                    <input
                      id="brand"
                      name="brand"
                      value={product.brand}
                      onChange={handleChange}
                      placeholder="Brand"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select
                      id="category"
                      name="category"
                      value={product.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="electronics">Electronics</option>
                      <option value="clothing">Clothing</option>
                      <option value="home">Home & Kitchen</option>
                      <option value="beauty">Beauty & Personal Care</option>
                      <option value="sports">Sports & Outdoors</option>
                      <option value="Stationaries">Stationaries</option>
                      <option value="toys">Toys & Games</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="subCategory">Sub Category</label>
                    <input
                      id="subCategory"
                      name="subCategory"
                      value={product.subCategory}
                      onChange={handleChange}
                      placeholder="Sub Category"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="subCategory">DisplayName</label>
                    <input
                      id="displayName"
                      name="displayName"
                      value={product.displayName}
                      onChange={handleChange}
                      placeholder="DisplayName"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="stock">Stock</label>
                    <input
                      id="stock"
                      name="stock"
                      type="number"
                      min="0"
                      value={product.stock}
                      onChange={handleChange}
                      placeholder="Stock"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="rating">Rating (1-5)</label>
                    <input
                      id="rating"
                      name="rating"
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={product.rating}
                      onChange={handleChange}
                      placeholder="Rating (1-5)"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="offerPrice">Offer Price</label>
                    <input
                      id="offerPrice"
                      name="offerPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={product.offerPrice}
                      onChange={handleChange}
                      placeholder="Offer Price (optional)"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="tags">Tags (comma-separated)</label>
                    <input
                      id="tags"
                      name="tags"
                      value={tagInput}
                      onChange={handleTagsChange}
                      placeholder="e.g. bestseller, eco-friendly"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="images">Product Images</label>
                    <input
                      id="images"
                      name="images"
                      type="file"
                      accept="image/*"
                      multiple
                      ref={fileInputRef}
                      onChange={handleImageChange}
                    />
                    <small className="helper-text">
                      You can select multiple images by holding Ctrl (Windows)
                      or Command (Mac) while clicking on files.
                      {isEditMode && imagePreviewUrls.length > 0 && (
                        <span className="edit-mode-note">
                          <br />
                          Note: If you don't select new images, the existing
                          ones will be kept.
                        </span>
                      )}
                    </small>

                    {imagePreviewUrls.length > 0 && (
                      <div className="image-preview-container">
                        {imagePreviewUrls.map((url, index) => (
                          <div
                            key={`preview-${index}-${url.substring(0, 10)}`}
                            className="image-preview"
                          >
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/100x100?text=Image+Error";
                              }}
                            />
                            <button
                              type="button"
                              className="remove-image-btn"
                              onClick={() => removeImage(index)}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="isFeatured"
                        checked={product.isFeatured}
                        onChange={handleChange}
                      />
                      Featured Product
                    </label>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={product.description}
                    onChange={handleChange}
                    placeholder="Product Description"
                    rows="4"
                    required
                  />
                </div>

                <div className="specifications-section">
                  <h3>Specifications</h3>
                  {specifications.map((spec, index) => (
                    <div key={index} className="specification-row">
                      <input
                        placeholder="Key (e.g. Size)"
                        value={spec.key}
                        onChange={(e) =>
                          handleSpecificationChange(
                            index,
                            "key",
                            e.target.value
                          )
                        }
                      />
                      <input
                        placeholder="Value (e.g. Large)"
                        value={spec.value}
                        onChange={(e) =>
                          handleSpecificationChange(
                            index,
                            "value",
                            e.target.value
                          )
                        }
                      />
                      {specifications.length > 1 && (
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => removeSpecificationField(index)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="add-spec-btn"
                    onClick={addSpecificationField}
                  >
                    + Add Specification
                  </button>
                </div>

                <div className="specifications-section">
                  <h3>Seller Details</h3>
                  <input
                    className="seller-search-input"
                    placeholder="Search for seller company"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />

                  {suggestions.length > 0 && (
                    <div className="seller-suggestions-container">
                      {suggestions.map((seller, index) => (
                        <div
                          key={index}
                          className="seller-suggestion-item"
                          onClick={() => {
                            setSearchInput(seller.companyname);
                            setSellerId(seller._id);
                            setSuggestions([]);
                          }}
                        >
                          {seller.companyname}
                        </div>
                      ))}
                    </div>
                  )}
                  {products.map((product, index) => (
                    <div key={index} className="specification-row">
                      <input
                        placeholder="Product Name"
                        value={product.key}
                        onChange={(e) =>
                          handleProductChange(index, "key", e.target.value)
                        }
                      />
                      <input
                        placeholder="Quantity"
                        type="number"
                        min="0"
                        value={product.value}
                        onChange={(e) =>
                          handleProductChange(index, "value", e.target.value)
                        }
                      />
                      {products.length > 1 && (
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => removeProductField(index)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="add-spec-btn"
                    onClick={addProductField}
                  >
                    + Add Product
                  </button>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="back-btn"
                    onClick={() =>
                      navigate("/adprodlist", { state: { user, orders } })
                    }
                  >
                    Back to Products
                  </button>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={loading}
                  >
                    {loading
                      ? isEditMode
                        ? "Updating..."
                        : "Adding..."
                      : isEditMode
                      ? "Update Product"
                      : "Add Product"}
                  </button>
                </div>
              </form>
            ) : (
              <form id="sellerForm" onSubmit={handleSaveSeller}>
                <div className="ad-seller-header">
                  <h2>Seller Details</h2>
                </div>
                <div className="form-group">
                  <label htmlFor="sellername">Seller Name</label>
                  <input
                    id="sellername"
                    name="sellername"
                    value={seller.sellername}
                    onChange={handlesellerChange}
                    placeholder="Seller Name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="companyname">Company Name</label>
                  <input
                    id="companyname"
                    name="companyname"
                    value={seller.companyname}
                    onChange={handlesellerChange}
                    placeholder="Company Name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="sellermobile">Mobile number</label>
                  <input
                    id="sellermobile"
                    name="sellermobile"
                    type="tel"
                    value={seller.sellermobile}
                    onChange={handlesellerChange}
                    placeholder="Mobile Number"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="selleremail">Email</label>
                  <input
                    id="selleremail"
                    name="selleremail"
                    type="email"
                    value={seller.selleremail}
                    onChange={handlesellerChange}
                    placeholder="Seller Email"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="selleraddress">Address</label>
                  <textarea
                    id="selleraddress"
                    name="selleraddress"
                    value={seller.selleraddress}
                    onChange={handlesellerChange}
                    placeholder="Seller Address"
                    rows="3"
                    required
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="back-btn"
                    onClick={() =>
                      navigate("/adprodlist", { state: { user, orders } })
                    }
                  >
                    Back to Products
                  </button>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Seller Details"}
                  </button>
                </div>
              </form>
            )}

            {showQRModal && savedProduct && (
              <QRCodeModal
                isOpen={showQRModal}
                onClose={handleQRModalClose}
                product={savedProduct}
              />
            )}

            {showQRScanner && (
              <QRCodeScanner
                onScan={handleQRScan}
                onClose={() => setShowQRScanner(false)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProducts;
