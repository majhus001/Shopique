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

  // Handle sidebar collapse state change
  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };
  const [product, setProduct] = useState({
    name: "",
    price: "",
    brand: "",
    images: [""],
    category: "",
    subCategory: "",
    description: "",
    stock: "",
    rating: "",
    deliveryTime: "",
    offerPrice: "",
    isFeatured: false,
    tags: [""],
    specifications: {},
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [specifications, setSpecifications] = useState([
    { key: "", value: "" },
  ]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [savedProduct, setSavedProduct] = useState(null);
  const fileInputRef = useRef(null);
  const searchRef = useRef(null);

  // Handle image preview when files are selected
  useEffect(() => {
    if (selectedImages.length > 0) {
      const newPreviewUrls = [];

      selectedImages.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviewUrls.push(reader.result);
          if (newPreviewUrls.length === selectedImages.length) {
            // Replace existing preview URLs with new ones from selected files
            setImagePreviewUrls(newPreviewUrls);
          }
        };
        reader.readAsDataURL(file);
      });
    }
    // We don't clear imagePreviewUrls here when selectedImages is empty
    // because we might have existing image URLs from a product
  }, [selectedImages]);

  // Log imagePreviewUrls whenever it changes
  useEffect(() => {
    console.log("imagePreviewUrls updated:", imagePreviewUrls);
  }, [imagePreviewUrls]);

  // Handle editProduct data from navigation state
  useEffect(() => {
    if (editProduct) {
      console.log("Edit product data received:", editProduct);
      setCurrentProductId(editProduct._id);
      setIsEditMode(true);
      handleSelectProduct(editProduct);
    }
  }, [editProduct]);

  // Handle click outside search suggestions
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

  // Search products as user types
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

  // Fill form with selected product data
  const handleSelectProduct = async (selectedProduct) => {
    console.log("Selected product:", selectedProduct);
    setCurrentProductId(selectedProduct._id);
    setIsEditMode(true);

    // Convert specifications object to array format for the form
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

    // Check if product has images
    console.log("Product images:", selectedProduct.images);

    const productData = {
      name: selectedProduct.name || "",
      price: selectedProduct.price || "",
      brand: selectedProduct.brand || "",
      images: selectedProduct.images || [""],
      category: selectedProduct.category || "",
      subCategory: selectedProduct.subCategory || "",
      description: selectedProduct.description || "",
      stock: selectedProduct.stock || "",
      rating: selectedProduct.rating || "",
      deliveryTime: selectedProduct.deliveryTime || "",
      offerPrice: selectedProduct.offerPrice || "",
      isFeatured: selectedProduct.isFeatured || false,
      tags: selectedProduct.tags || [""],
      specifications: selectedProduct.specifications || {},
    };

    console.log("Setting product data:", productData);
    setProduct(productData);

    // Clear search
    setSearchQuery("");
    setShowSuggestions(false);

    // Handle image previews for existing images
    if (selectedProduct.images && selectedProduct.images.length > 0) {
      try {
        // Create preview URLs for existing images
        const previewUrls = [];

        // For each image URL, create a preview
        for (const imageUrl of selectedProduct.images) {
          if (imageUrl) {
            previewUrls.push(imageUrl);
            console.log("Added image URL to previews:", imageUrl);
          }
        }

        console.log("Setting image preview URLs:", previewUrls);

        // Update image preview URLs
        setImagePreviewUrls(previewUrls);

        // We don't have the actual file objects for existing images,
        // so we'll leave selectedImages empty
        setSelectedImages([]);

        console.log(`Loaded ${previewUrls.length} image previews for product`);

        // Force a re-render after a short delay to ensure state updates are applied
        setTimeout(() => {
          console.log("Current image preview URLs:", imagePreviewUrls);
        }, 100);
      } catch (error) {
        console.error("Error loading image previews:", error);
      }
    } else {
      // Clear image previews if no images
      console.log("No images found, clearing previews");
      setImagePreviewUrls([]);
      setSelectedImages([]);
    }

    // Show success message
    setMessage({
      text: "Product loaded for editing",
      type: "success",
    });
  };

  // Reset form to add new product
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
      description: "",
      stock: "",
      rating: "",
      deliveryTime: "",
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

  // Handle QR code modal close
  const handleQRModalClose = () => {
    setShowQRModal(false);
    handleResetForm(); // Reset the form after closing the QR modal
  };

  // Handle QR code scan result
  const handleQRScan = (productData) => {
    console.log("QR scan result received:", productData);

    if (productData && productData.id) {
      setMessage({
        text: "Fetching product data...",
        type: "info",
      });

      // Fetch the complete product data using the ID
      const fetchProductById = async () => {
        try {
          console.log(`Fetching product with ID: ${productData.id}`);

          // Make the API call to fetch product data
          const response = await axios.get(
            `${API_BASE_URL}/api/products/fetch/${productData.id}`
          );

          console.log("API response:", response.data);

          if (response.data.success && response.data.data) {
            // Successfully fetched product data
            console.log(
              "Product data fetched successfully:",
              response.data.data
            );
            handleSelectProduct(response.data.data);
          } else {
            // API returned success: false or no data
            console.error(
              "API returned success: false or no data",
              response.data
            );
            setMessage({
              text: "Could not find product with the scanned ID",
              type: "error",
            });
          }
        } catch (error) {
          // API call failed
          console.error("Error fetching product by ID:", error);
          setMessage({
            text: `Error loading product: ${
              error.response?.data?.error || error.message
            }`,
            type: "error",
          });
        }
      };

      // Execute the fetch function
      fetchProductById();
    } else {
      // Invalid QR code data
      console.error("Invalid QR code data:", productData);
      setMessage({
        text: "Invalid QR code data. Please try again.",
        type: "error",
      });
    }
  };

  // Delete product
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

    // Update product specifications object
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

      // Update product specifications object
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

  const handleTagsChange = (e) => {
    const tagsArray = e.target.value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    setProduct({ ...product, tags: tagsArray });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      console.log(`Selected ${e.target.files.length} files`);
      const files = Array.from(e.target.files);
      setSelectedImages(files);
    } else {
      console.log("No files selected");
    }
  };

  const removeImage = (index) => {
    // Remove from preview URLs
    const newPreviewUrls = [...imagePreviewUrls];
    newPreviewUrls.splice(index, 1);
    setImagePreviewUrls(newPreviewUrls);

    // If we have selected images (new uploads), remove from there too
    if (selectedImages.length > 0) {
      const newSelectedImages = [...selectedImages];
      newSelectedImages.splice(index, 1);
      setSelectedImages(newSelectedImages);
    }

    // If in edit mode and we've removed all images, update the product state
    if (isEditMode && newPreviewUrls.length === 0) {
      setProduct({
        ...product,
        images: [""],
      });
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
        } else {
          formData.append(key, product[key]);
        }
      });

      // Add multiple image files if selected
      if (selectedImages.length > 0) {
        // If we have new files selected, use those
        selectedImages.forEach((file) => {
          formData.append("images", file);
        });
        console.log(
          `Appended ${selectedImages.length} new images to form data`
        );
      } else if (isEditMode && imagePreviewUrls.length > 0) {
        formData.append("keepExistingImages", "true");
        console.log("Keeping existing images");
      }

      let res;

      if (isEditMode && currentProductId) {
        // Update existing product
        try {
          res = await axios.put(
            `${API_BASE_URL}/api/products/update/${currentProductId}`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          // Check if the update was successful
          if (res.data && res.data.success !== false) {
            setMessage({
              text: "Product updated successfully!",
              type: "success",
            });

            // Save the updated product data for QR code generation
            console.log("Updated product data:", res.data);
            setSavedProduct(res.data.data || res.data.product);

            // Only show QR modal after successful update
            setShowQRModal(true);
          } else {
            // Handle case where API returns success: false
            throw new Error(res.data.message || "Update failed");
          }
        } catch (updateError) {
          console.error("Error updating product:", updateError);
          setMessage({
            text: `Error updating product: ${
              updateError.response?.data?.error || updateError.message
            }`,
            type: "error",
          });
          // Don't show QR modal if update failed
        }
      } else {
        // Add new product
        try {
          res = await axios.post(`${API_BASE_URL}/api/products/add`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          // Check if the add was successful
          if (res.data && res.data.success !== false) {
            setMessage({
              text: "Product added successfully!",
              type: "success",
            });

            // Save the new product data for QR code generation
            console.log("New product data:", res.data);
            setSavedProduct(res.data.product || res.data.data);

            // Only show QR modal after successful add
            setShowQRModal(true);
          } else {
            // Handle case where API returns success: false
            throw new Error(res.data.message || "Add failed");
          }
        } catch (addError) {
          console.error("Error adding product:", addError);
          setMessage({
            text: `Error adding product: ${
              addError.response?.data?.error || addError.message
            }`,
            type: "error",
          });
          // Don't show QR modal if add failed
        }
      }

      // Don't reset the form immediately, wait until QR code modal is closed

      // Log response data if available
      if (res && res.data) {
        console.log("API response data:", res.data);
      }
    } catch (error) {
      console.error(error);
      // Only set error message if it wasn't already set in the try block
      if (!message.text || message.type !== "error") {
        const action = isEditMode ? "updating" : "adding";
        setMessage({
          text: `Error ${action} product: ${
            error.response?.data?.error || error.message
          }`,
          type: "error",
        });
      }
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
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="search-input"
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
                      // Only generate QR code if we have valid product data
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
                      // Show error message if product data is incomplete
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

            <form onSubmit={handleSubmit} className="product-form">
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
                  <label htmlFor="stock">Stock</label>
                  <input
                    id="stock"
                    name="stock"
                    type="number"
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
                  <label htmlFor="deliveryTime">Delivery Time</label>
                  <input
                    id="deliveryTime"
                    name="deliveryTime"
                    value={product.deliveryTime}
                    onChange={handleChange}
                    placeholder="e.g. 2-3 days"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="offerPrice">Offer Price</label>
                  <input
                    id="offerPrice"
                    name="offerPrice"
                    type="number"
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
                    value={product.tags.join(",")}
                    onChange={handleTagsChange}
                    placeholder="e.g. bestseller, eco-friendly"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="images">Product Images </label>
                  <input
                    id="images"
                    name="images"
                    type="file"
                    accept="image/*"
                    multiple="multiple"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                  />
                  <small className="helper-text">
                    You can select multiple images by holding Ctrl (Windows) or
                    Command (Mac) while clicking on files.
                    {isEditMode && imagePreviewUrls.length > 0 && (
                      <span className="edit-mode-note">
                        <br />
                        Note: If you don't select new images, the existing ones
                        will be kept.
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
                              console.error(`Failed to load image: ${url}`);
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
                        handleSpecificationChange(index, "key", e.target.value)
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
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeSpecificationField(index)}
                    >
                      ✕
                    </button>
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
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading
                    ? isEditMode
                      ? "Updating Product..."
                      : "Adding Product..."
                    : isEditMode
                    ? "Update Product"
                    : "Add Product"}
                </button>
              </div>
            </form>

            {/* QR Code Modal */}
            {showQRModal && savedProduct && (
              <QRCodeModal
                isOpen={showQRModal}
                onClose={handleQRModalClose}
                product={savedProduct}
              />
            )}

            {/* QR Code Scanner */}
            {showQRScanner && (
              <QRCodeScanner
                onScan={handleQRScan}
                onClose={() => {
                  console.log("Closing QR scanner");
                  // Use a longer delay to ensure camera cleanup completes before unmounting
                  setTimeout(() => {
                    console.log("Setting showQRScanner to false");
                    setShowQRScanner(false);
                  }, 500);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProducts;
