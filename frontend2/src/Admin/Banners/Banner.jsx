import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Adnavbar from "../Adnavbar/Adnavbar";
import Sidebar from "../sidebar/Sidebar";
import API_BASE_URL from "../../api";
import "./Banner.css";

const Banner = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const stateUser = location.state?.user || null;
  const stateOrders = location.state?.orders || null;

  const [user, setUser] = useState(stateUser);
  const [orders, setOrders] = useState(stateOrders);
  const [activeTab, setActiveTab] = useState("view");
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    link: "",
    position: 1,
    isActive: true,
    image: null
  });
  const [editForm, setEditForm] = useState({
    title: "",
    link: "",
    position: 1,
    isActive: true,
    image: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [editPreviewImage, setEditPreviewImage] = useState(null);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [status, setStatus] = useState({ type: null, message: null });

  // Clear status messages after 5 seconds
  useEffect(() => {
    if (status.type) {
      const timer = setTimeout(() => {
        setStatus({ type: null, message: null });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Check valid user
  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/auth/checkvaliduser`,
        { withCredentials: true }
      );

      if (!response.data.user) {
        navigate("/login");
        return;
      }

      const userId = response.data.user.userId;
      const userRes = await axios.get(`${API_BASE_URL}/api/auth/fetch/${userId}`);
      setUser(userRes.data.data);
    } catch (error) {
      console.error("Error fetching user:", error);
      navigate("/login");
    }
  };

  // Fetch banners
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/banners`);
      setBanners(response.data);
    } catch (error) {
      console.error("Error fetching banners:", error);
      setStatus({ type: "error", message: "Failed to load banners" });
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  // Handle edit form input changes
  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm({
      ...editForm,
      [name]: type === "checkbox" ? checked : value
    });
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Handle edit image upload
  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditForm({ ...editForm, image: file });
      setEditPreviewImage(URL.createObjectURL(file));
    }
  };

  // Submit new banner
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("link", formData.link);
      formDataToSend.append("position", formData.position);
      formDataToSend.append("isActive", formData.isActive);
      formDataToSend.append("image", formData.image);

      await axios.post(`${API_BASE_URL}/api/banners/add`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setFormData({
        title: "",
        link: "",
        position: 1,
        isActive: true,
        image: null
      });
      setPreviewImage(null);
      fetchBanners();
      setActiveTab("view");
      setStatus({ type: "success", message: "Banner added successfully!" });
    } catch (error) {
      console.error("Error adding banner:", error);
      setStatus({ 
        type: "error", 
        message: error.response?.data?.message || "Failed to add banner" 
      });
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal
  const openEditModal = (banner) => {
    setSelectedBanner(banner);
    setEditForm({
      title: banner.title,
      link: banner.link,
      position: banner.position,
      isActive: banner.isActive,
      image: null
    });
    setEditPreviewImage(banner.imageUrl);
    setIsEditModalOpen(true);
  };

  // Update banner
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append("title", editForm.title);
      formDataToSend.append("link", editForm.link);
      formDataToSend.append("position", editForm.position);
      formDataToSend.append("isActive", editForm.isActive);
      if (editForm.image) {
        formDataToSend.append("image", editForm.image);
      }

      await axios.put(`${API_BASE_URL}/api/banners/${selectedBanner._id}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setIsEditModalOpen(false);
      fetchBanners();
      setStatus({ type: "success", message: "Banner updated successfully!" });
    } catch (error) {
      console.error("Error updating banner:", error);
      setStatus({ 
        type: "error", 
        message: error.response?.data?.message || "Failed to update banner" 
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete banner
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/api/banners/delete/${id}`);
      fetchBanners();
      setStatus({ type: "success", message: "Banner deleted successfully!" });
    } catch (error) {
      console.error("Error deleting banner:", error);
      setStatus({ 
        type: "error", 
        message: error.response?.data?.message || "Failed to delete banner" 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchBanners();
  }, []);

  return (
    <div style={{ cursor: loading ? "wait" : "default" }}>
      <div className="ad-nav">
        <Adnavbar user={user} />
      </div>
      <div className="admin-container">
        <Sidebar user={user} orders={orders} />
        <div className="main-content">
          <div className="ad-banner-container">
            <h1 className="ad-banner-heading">Banner Management</h1>
            
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
            
            <div className="ad-banner-tabs">
              <button
                className={`ad-banner-tab ${activeTab === "view" ? "active" : ""}`}
                onClick={() => setActiveTab("view")}
              >
                View Banners
              </button>
              <button
                className={`ad-banner-tab ${activeTab === "add" ? "active" : ""}`}
                onClick={() => setActiveTab("add")}
              >
                Add New Banner
              </button>
            </div>

            {activeTab === "view" ? (
              <div className="ad-banner-list">
                {loading && <div className="ad-banner-loading">Loading...</div>}
                {banners.length === 0 && !loading ? (
                  <div className="ad-banner-empty">No banners found</div>
                ) : (
                  <div className="ad-banner-grid">
                    {banners.map((banner) => (
                      <div key={banner._id} className="ad-banner-card">
                        <div className="ad-banner-image-container">
                          <img 
                            src={banner.image} 
                            alt={banner.title} 
                            className="ad-banner-image"
                          />
                        </div>
                        <div className="ad-banner-details">
                          <h3 className="ad-banner-title">{banner.title}</h3>
                          <p className="ad-banner-link">Link: {banner.link}</p>
                          <p className="ad-banner-position">Position: {banner.position}</p>
                          <p className={`ad-banner-status ${banner.isActive ? "active" : "inactive"}`}>
                            {banner.isActive ? "Active" : "Inactive"}
                          </p>
                          <div className="ad-banner-actions">
                            <button
                              className="ad-banner-edit"
                              onClick={() => openEditModal(banner)}
                              disabled={loading}
                            >
                              Edit
                            </button>
                            <button
                              className="ad-banner-delete"
                              onClick={() => handleDelete(banner._id)}
                              disabled={loading}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="ad-banner-form-container">
                <form onSubmit={handleSubmit} className="ad-banner-form">
                  <div className="ad-banner-form-group">
                    <label htmlFor="title" className="ad-banner-label">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="ad-banner-input"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="ad-banner-form-group">
                    <label htmlFor="link" className="ad-banner-label">
                      Link URL
                    </label>
                    <input
                      type="text"
                      id="link"
                      name="link"
                      value={formData.link}
                      onChange={handleInputChange}
                      className="ad-banner-input"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="ad-banner-form-group">
                    <label htmlFor="position" className="ad-banner-label">
                      Position
                    </label>
                    <input
                      type="number"
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className="ad-banner-input"
                      min="1"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="ad-banner-form-group">
                    <label htmlFor="isActive" className="ad-banner-label">
                      Active
                    </label>
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="ad-banner-checkbox"
                      disabled={loading}
                    />
                  </div>

                  <div className="ad-banner-form-group">
                    <label htmlFor="image" className="ad-banner-label">
                      Banner Image
                    </label>
                    <input
                      type="file"
                      id="image"
                      name="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="ad-banner-file-input"
                      required={activeTab === "add"}
                      disabled={loading}
                    />
                    {previewImage && (
                      <div className="ad-banner-preview">
                        <img 
                          src={previewImage} 
                          alt="Preview" 
                          className="ad-banner-preview-image"
                        />
                      </div>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    className="ad-banner-submit"
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Add Banner"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="ad-banner-modal-overlay">
          <div className="ad-banner-modal">
            <div className="ad-banner-modal-header">
              <h2>Edit Banner</h2>
              <button 
                className="ad-banner-modal-close"
                onClick={() => setIsEditModalOpen(false)}
                disabled={loading}
              >
                &times;
              </button>
            </div>
            <div className="ad-banner-modal-body">
              <form onSubmit={handleUpdate} className="ad-banner-form">
                <div className="ad-banner-form-group">
                  <label htmlFor="edit-title" className="ad-banner-label">
                    Title
                  </label>
                  <input
                    type="text"
                    id="edit-title"
                    name="title"
                    value={editForm.title}
                    onChange={handleEditInputChange}
                    className="ad-banner-input"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="ad-banner-form-group">
                  <label htmlFor="edit-link" className="ad-banner-label">
                    Link URL
                  </label>
                  <input
                    type="text"
                    id="edit-link"
                    name="link"
                    value={editForm.link}
                    onChange={handleEditInputChange}
                    className="ad-banner-input"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="ad-banner-form-group">
                  <label htmlFor="edit-position" className="ad-banner-label">
                    Position
                  </label>
                  <input
                    type="number"
                    id="edit-position"
                    name="position"
                    value={editForm.position}
                    onChange={handleEditInputChange}
                    className="ad-banner-input"
                    min="1"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="ad-banner-form-group">
                  <label htmlFor="edit-isActive" className="ad-banner-label">
                    Active
                  </label>
                  <input
                    type="checkbox"
                    id="edit-isActive"
                    name="isActive"
                    checked={editForm.isActive}
                    onChange={handleEditInputChange}
                    className="ad-banner-checkbox"
                    disabled={loading}
                  />
                </div>

                <div className="ad-banner-form-group">
                  <label htmlFor="edit-image" className="ad-banner-label">
                    Banner Image (Leave empty to keep current)
                  </label>
                  <input
                    type="file"
                    id="edit-image"
                    name="image"
                    accept="image/*"
                    onChange={handleEditImageChange}
                    className="ad-banner-file-input"
                    disabled={loading}
                  />
                  {editPreviewImage && (
                    <div className="ad-banner-preview">
                      <img 
                        src={editPreviewImage} 
                        alt="Preview" 
                        className="ad-banner-preview-image"
                      />
                    </div>
                  )}
                </div>

                <div className="ad-banner-modal-actions">
                  <button 
                    type="button"
                    className="ad-banner-modal-cancel"
                    onClick={() => setIsEditModalOpen(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="ad-banner-submit"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Banner"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banner;