import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "./ProfilePage.css";
import Navbar from "../navbar/Navbar";
import API_BASE_URL from "../../api";
import getCoordinates from "../../utils/Geolocation";
import Sidebar from "../sidebar/Sidebar";

const ProfilePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = location.state || {};

  const [userDetails, setUserDetails] = useState({
    image: user.image,
    username: user.username,
    email: user.email,
    password: user.password,
    mobile: user.mobile,
    address: user.address,
    pincode: user.pincode,
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
  const fetchUpdatedUser = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/fetch/${user._id}`);
      if (response.data.success) {
        console.log(response.data.data)
        setUserDetails(response.data.data); 
      }
    } catch (error) {
      console.log("Error fetching updated user:", error);
    }
  };

  fetchUpdatedUser();
}, [user._id]); 

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
          const updatedDetails = { ...prev, [name]: digitsOnly || null }; // Send null if empty

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
    console.log("edit");
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
        console.log("User details updated successfully:", response.data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating user details:", error);
    }
  };

  return (
    <div className="usprof-container">
      <div className="usprof-nav">
        <Navbar user={user} />
      </div>

      <div className="usprof-main">
        {/* Sidebar */}
        <Sidebar user={user} />

        {/* Profile Content */}
        <div className="usprof-content">
          <div className="usprof-header">
            <h2 className="usprof-title">
              {isEditing ? "Edit Profile" : "My Profile"}
            </h2>
            
            <button
              className={`usprof-edit-btn ${isEditing ? "usprof-cancel" : ""}`}
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

          <div className="usprof-details-container">
            <div className="usprof-image-section">
              <div className="usprof-image-wrapper">
                <img
                  src={userDetails.image}
                  alt="Profile"
                  className="usprof-profile-img"
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
                  <label className="usprof-form-label">Delivery Address</label>
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
    </div>
  );
};

export default ProfilePage;
