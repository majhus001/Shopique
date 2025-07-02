import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "./ProfilePage.css";
import Navbar from "../navbar/Navbar";
import API_BASE_URL from "../../api";
import getCoordinates from "../../utils/Geolocation";
import Sidebar from "../sidebar/Sidebar";
import "../../App.css";
import ValidUserData from "../../utils/ValidUserData";
import {

  FaSignOutAlt,
} from "react-icons/fa";
import handleLogout from "../../utils/Logout";
import BottomNav from "../Bottom Navbar/BottomNav";
import AuthRequired from "../Authentication/AuthRequired";

const ProfilePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = location.state || " ";
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDetails, setUserDetails] = useState({
    image: user?.image || " ",
    username: user?.username || " ",
    email: user?.email || " ",
    password: user?.password || " ",
    mobile: user?.mobile || " ",
    address: user?.address || " ",
    pincode: user?.pincode || " ",
  });
  const [isEditing, setIsEditing] = useState(false);

  const checkUser = async () => {
    try {
      const userData = await ValidUserData();
      if (userData) {
        setUserDetails(userData);
      }
      setIsLoggedIn(true);
    } catch (error) {
      setIsLoggedIn(false);
      console.error("Error validating user:", error);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile") {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length <= 10) {
        setUserDetails((prev) => ({ ...prev, [name]: digitsOnly }));
      }
    } else if (name === "pincode") {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length <= 6) {
        setUserDetails((prev) => {
          const updatedDetails = { ...prev, [name]: digitsOnly || null };

          if (digitsOnly.length === 6) {
            getCoordinates(digitsOnly).then((coordinates) => {
              if (coordinates) {
                setUserDetails((prev) => ({
                  ...prev,
                  address: coordinates.address,
                }));
              }
            });
          }
          return updatedDetails;
        });
      }
    } else {
      setUserDetails((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    setUserDetails({
      ...userDetails,
      image: URL.createObjectURL(e.target.files[0]),
    });
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const saveDetails = async () => {
    try {
      const formData = new FormData();
      formData.append("name", userDetails.username);
      formData.append("email", userDetails.email);
      formData.append("password", userDetails.password);
      formData.append("mobile", userDetails.mobile);
      formData.append("address", userDetails.address);
      formData.append("pincode", userDetails.pincode);

      const imageFile = document.querySelector('input[type="file"]')?.files[0];
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/auth/update/${user._id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.status === 200) {
        alert("Profile updated successfully");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating user details:", error);
    }
  };

  const handleLogoutUser = async () => {
    const logout = await handleLogout();
    if (logout) {
      navigate("/home", { state: { user: userDetails } });
    } else {
      alert("unable to logout");
    }
  };

  return (
    <div className="usprof-container">
      <div className="usprof-nav">
        <Navbar />
      </div>

      {!isLoggedIn ? (
        <AuthRequired message="Please login to view your order history" />
      ) : (
        <div className="usprof-main">
          <div className="sidebar-cont">
            <Sidebar user={userDetails} />
          </div>
          <div className="usprof-content">
            <div className="usprof-header">
              <h2 className="usprof-title">
                {isEditing ? "Edit Profile" : "My Profile"}
              </h2>

              <div className="usprof-header-btns">
                <button className="usprof-logout" onClick={handleLogoutUser}>
                  <FaSignOutAlt />
                  Logout
                </button>
                <button
                  className={`usprof-edit-btn ${
                    isEditing ? "usprof-cancel" : ""
                  }`}
                  onClick={toggleEdit}
                >
                  {isEditing ? (
                    <>
                      <i className="fas fa-times"></i> Cancel
                    </>
                  ) : (
                    <>
                      <i className="fas fa-edit"></i> Edit
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="usprof-details-container">
              <div className="usprof-image-section">
                <div className="usprof-image-wrapper">
                  <img
                    src={userDetails.image}
                    alt="Profile"
                    className="usprof-profile-img"
                    loading="lazy"
                  />
                </div>
                {isEditing && (
                  <div className="usprof-image-upload">
                    <label
                      htmlFor="profile-image"
                      className="usprof-upload-label"
                    >
                      <i className="fas fa-camera"></i> Change Photo
                    </label>
                    <input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="usprof-file-input"
                    />
                  </div>
                )}
              </div>

              <div className="usprof-form-section">
                <div className="usprof-form-grid">
                  <div className="usprof-form-group">
                    <label className="usprof-form-label">Full Name</label>
                    <input
                      type="text"
                      name="username"
                      value={userDetails.username}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="usprof-form-input"
                    />
                  </div>

                  <div className="usprof-form-group">
                    <label className="usprof-form-label">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={userDetails.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="usprof-form-input"
                    />
                  </div>

                  <div className="usprof-form-group">
                    <label className="usprof-form-label">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={userDetails.password}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="usprof-form-input"
                    />
                  </div>

                  <div className="usprof-form-group">
                    <label className="usprof-form-label">Mobile Number</label>
                    <input
                      type="text"
                      name="mobile"
                      value={userDetails.mobile}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      maxLength={10}
                      pattern="\d*"
                      inputMode="numeric"
                      placeholder="Enter 10-digit number"
                      className="usprof-form-input"
                    />
                  </div>

                  <div className="usprof-form-group">
                    <label className="usprof-form-label">Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      value={userDetails.pincode}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      maxLength={6}
                      pattern="\d*"
                      inputMode="numeric"
                      placeholder="Enter 6-digit Pincode"
                      className="usprof-form-input"
                    />
                  </div>

                  <div className="usprof-form-group usprof-full-width">
                    <label className="usprof-form-label">
                      Delivery Address
                    </label>
                    <textarea
                      name="address"
                      value={userDetails.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="usprof-form-textarea"
                      rows="4"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="usprof-action-btns">
                    <button onClick={saveDetails} className="usprof-save-btn">
                      <i className="fas fa-save"></i> Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav UserData={userDetails} />
    </div>
  );
};

export default ProfilePage;
