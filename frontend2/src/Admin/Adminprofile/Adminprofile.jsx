import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./Adminprofile.css";
import Adnavbar from "../Adnavbar/Adnavbar";
import API_BASE_URL from "../../api";
import Sidebar from "../sidebar/Sidebar";
import getCoordinates from "../../utils/Geolocation";
import {
  FiUser,
  FiMail,
  FiLock,
  FiPhone,
  FiMapPin,
  FiHome,
  FiEdit,
  FiSave,
  FiLogOut,
  FiX,
  FiUpload
} from "react-icons/fi";

const Adminprofile = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const stateUser = location.state?.user || null;
  const stateOrders = location.state?.orders || null;

  // State for user and orders
  const [user, setUser] = useState(stateUser);
  const [orders, setOrders] = useState(stateOrders);
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      console.log("Checking user validity...");
      const response = await axios.get(
        `${API_BASE_URL}/api/auth/checkvaliduser`,
        {
          withCredentials: true,
        }
      );

      if (!response.data.user) {
        navigate("/login");
        return;
      }

      const userId = response.data.user.userId;
      const userRes = await axios.get(
        `${API_BASE_URL}/api/auth/fetch/${userId}`
      );
      setUser(userRes.data.data);
     } catch (error) {
      console.error("Error fetching user:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch order data from backend if not available in state
  const fetchOrderData = async () => {
    try {
      setLoading(true);
      const OrdersRes = await axios.get(
        `${API_BASE_URL}/api/admin/pendingorders`
      );
      setOrders(OrdersRes.data);
      setUsersPendingOrder(
        OrdersRes.data.filter((order) => order.OrderStatus === "Pending")
      );
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      fetchUserData();
    }
  }, [user]);

  useEffect(() => {
    if (!orders) {
      fetchOrderData();
    }
  }, [orders]);

  const [adminData, setAdminData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    password: "",
    mobile: user?.mobile || "",
    address: user?.address || "",
    pincode: user?.pincode || "",
    image: user?.image || null,
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile") {
      const digitsOnly = value.replace(/\D/g, ""); // Only digits
      if (digitsOnly.length <= 10) {
        setAdminData((prev) => ({ ...prev, [name]: digitsOnly }));
      }
    } else if (name === "pincode") {
      const digitsOnly = value.replace(/\D/g, ""); // Only digits
      if (digitsOnly.length <= 6) {
        setAdminData((prev) => {
          const updatedData = { ...prev, [name]: digitsOnly };

          if (digitsOnly.length === 6) {
            getCoordinates(digitsOnly).then((coordinates) => {
              if (coordinates) {
                setAdminData((prev) => ({
                  ...prev,
                  address: coordinates.address,
                }));
              }
            });
          }

          return updatedData;
        });
      }
    } else {
      setAdminData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAdminData({
        ...adminData,
        image: file, // Store the actual file for upload
      });
      setPreviewImage(URL.createObjectURL(file)); // Preview the selected image
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("username", adminData.username);
    formData.append("email", adminData.email);
    if (adminData.password) formData.append("password", adminData.password);
    formData.append("mobile", adminData.mobile);
    formData.append("address", adminData.address);
    formData.append("pincode", adminData.pincode);
    if (adminData.image instanceof File) {
      formData.append("image", adminData.image);
    }

    try {
      setLoading(true);
      const response = await axios.put(
        `${API_BASE_URL}/api/auth/update/${user._id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setIsEditing(false);

      if (response.data.success) {
        alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      console.log(response.data.message);
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Handle sidebar collapse state change
  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  return (
    <div style={{ cursor: loading ? "wait" : "default" }}>
      <div className="ad-nav">
        <Adnavbar user={user} />
      </div>
      <div className={`admin-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Sidebar
          user={user}
          orders={orders}
          onCollapsedChange={handleSidebarCollapse}
        />

        <div className="main-content">
          <header className="admin-header">
            <div className="header-greeting">
              <h1>Admin Profile</h1>
              <p className="subtitle">Manage your personal information</p>
            </div>
            <div className="admin-info">
              <button className="logout-btn" onClick={handleLogout}>
                <FiLogOut className="btn-icon" /> Logout
              </button>
            </div>
          </header>

          <div className="profile-container">
            <div className="profile-card">
              <div className="profile-sidebar">
                <div className="profile-image-container">
                  {previewImage || user?.image ? (
                    <img
                      src={previewImage || user.image}
                      alt="Admin"
                      className="profile-avatar"
                    />
                  ) : (
                    <div className="profile-avatar placeholder-avatar">
                      <FiUser className="placeholder-icon" />
                    </div>
                  )}

                  {isEditing && (
                    <div className="image-upload-overlay">
                      <label htmlFor="profile-image-upload" className="upload-label">
                        <FiUpload className="upload-icon" />
                        <span>Upload</span>
                      </label>
                      <input
                        id="profile-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="file-input"
                      />
                    </div>
                  )}
                </div>

                <div className="profile-info">
                  <h2 className="profile-name">{user?.username || "Admin User"}</h2>
                  <p className="profile-role">Administrator</p>
                </div>

                <button
                  type="button"
                  className={`edit-profile-btn ${isEditing ? 'cancel' : ''}`}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? (
                    <>
                      <FiX className="btn-icon" /> Cancel
                    </>
                  ) : (
                    <>
                      <FiEdit className="btn-icon" /> Edit Profile
                    </>
                  )}
                </button>
              </div>

              <div className="profile-content">
                <h3 className="section-title">Personal Information</h3>

                <form onSubmit={handleUpdate} className="profile-form">
                  <div className="form-group">
                    <label htmlFor="username">
                      <FiUser className="field-icon" /> Full Name
                    </label>
                    <input
                      id="username"
                      type="text"
                      name="username"
                      value={adminData.username}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={isEditing ? 'editable' : ''}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">
                      <FiMail className="field-icon" /> Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={adminData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={isEditing ? 'editable' : ''}
                    />
                  </div>

                  {isEditing && (
                    <div className="form-group">
                      <label htmlFor="password">
                        <FiLock className="field-icon" /> Password
                      </label>
                      <input
                        id="password"
                        type="password"
                        name="password"
                        value={adminData.password}
                        onChange={handleChange}
                        placeholder="Enter new password"
                        className="editable"
                      />
                      <p className="field-hint">Leave blank to keep current password</p>
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="mobile">
                      <FiPhone className="field-icon" /> Mobile Number
                    </label>
                    <input
                      id="mobile"
                      type="text"
                      name="mobile"
                      value={adminData.mobile}
                      onChange={handleChange}
                      disabled={!isEditing}
                      maxLength={10}
                      pattern="\d*"
                      inputMode="numeric"
                      placeholder="Enter 10-digit number"
                      className={isEditing ? 'editable' : ''}
                    />
                  </div>

                  <h3 className="section-title address-title">Address Information</h3>

                  <div className="form-group">
                    <label htmlFor="pincode">
                      <FiMapPin className="field-icon" /> Pincode
                    </label>
                    <input
                      id="pincode"
                      type="text"
                      name="pincode"
                      value={adminData.pincode}
                      onChange={handleChange}
                      disabled={!isEditing}
                      maxLength={6}
                      pattern="\d*"
                      inputMode="numeric"
                      placeholder="Enter 6-digit Pincode"
                      className={isEditing ? 'editable' : ''}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="address">
                      <FiHome className="field-icon" /> Address
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      value={adminData.address}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={isEditing ? 'editable' : ''}
                      rows="3"
                    />
                  </div>

                  {isEditing && (
                    <div className="form-actions">
                      <button type="submit" className="update-btn">
                        <FiSave className="btn-icon" /> <span>Save Changes</span>
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Adminprofile;
