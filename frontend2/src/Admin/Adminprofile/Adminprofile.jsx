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
  FiUpload,
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
  const [isEmployee, setisEmployee] = useState(false);

  useEffect(() => {
    if (user.role == "Employee") {
      setisEmployee(true);
    }
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/auth/checkvaliduser`,
        {
          withCredentials: true,
        }
      );

      const loggedInUser = response.data.user;
      if (!loggedInUser) {
        navigate("/login");
        return;
      }

      const isEmp = loggedInUser.role === "Employee";
      setisEmployee(isEmp);

      const userId = isEmp ? loggedInUser.employeeId : loggedInUser.userId;

      const userRes = await axios.get(
        isEmp
          ? `${API_BASE_URL}/api/employees/fetch/${userId}`
          : `${API_BASE_URL}/api/auth/fetch/${userId}`
      );

      setUser(userRes.data.data);
    } catch (error) {
      console.error("Error fetching user:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      fetchUserData();
    }
  }, [user]);

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
    if(!isEmployee){
      formData.append("pincode", adminData.pincode);
    }
    if (adminData.image instanceof File) {
      formData.append("image", adminData.image);
    }

    try {
      setLoading(true);
      console.log(user.employeeId);
      const userRes = await axios.put(
        isEmployee
          ? `${API_BASE_URL}/api/auth/employees/update/${user.employeeId}`
          : `${API_BASE_URL}/api/auth/update/${user._id}`
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
      const empId = user._id;
      console.log(empId)
      if (isEmployee) {
        await axios.post(
          `${API_BASE_URL}/api/auth/employee/logout/${empId}`,
          {},
          { withCredentials: true }
        );
      } else {
        await axios.post(
          `${API_BASE_URL}/api/auth/logout`,
          {},
          { withCredentials: true }
        );
      }
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
                      <label
                        htmlFor="profile-image-upload"
                        className="upload-label"
                      >
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
                  <h2 className="profile-name">
                    {user?.username ||
                      user?.fullName ||
                      (isEmployee ? "Employee" : "Admin")}
                  </h2>
                  <p className="profile-role">
                    {isEmployee ? "Employee" : "Administrator"}
                  </p>
                </div>

                <button
                  type="button"
                  className={`edit-profile-btn ${isEditing ? "cancel" : ""}`}
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
                <form onSubmit={handleUpdate} className="profile-form">
                  <h3 className="section-title">Personal Information</h3>
                  <div className="form-group">
                    <label htmlFor="username">
                      <FiUser className="field-icon" /> Full Name
                    </label>
                    <input
                      id="username"
                      type="text"
                      name="username"
                      value={adminData.username || user?.fullName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={isEditing ? "editable" : ""}
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
                      className={isEditing ? "editable" : ""}
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
                      <p className="field-hint">
                        Leave blank to keep current password
                      </p>
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
                      className={isEditing ? "editable" : ""}
                    />
                  </div>

                  <h3 className="section-title address-title">
                    Address Information
                  </h3>

                  {!isEmployee && (
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
                        pattern="\d{6}"
                        inputMode="numeric"
                        placeholder="Enter 6-digit Pincode"
                        className={`form-control ${
                          isEditing ? "editable" : ""
                        }`}
                      />
                    </div>
                  )}

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
                      className={isEditing ? "editable" : ""}
                      rows="3"
                    />
                  </div>

                  {isEditing && (
                    <div className="form-actions">
                      <button type="submit" className="update-btn">
                        <FiSave className="btn-icon" />{" "}
                        <span>Save Changes</span>
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
