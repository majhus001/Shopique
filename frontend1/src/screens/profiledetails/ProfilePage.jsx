import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./ProfilePage.css";
import Navbar from "../navbar/Navbar";
import API_BASE_URL from "../../api";
import getCoordinates from "../../utils/Geolocation";

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

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile") {
      const digitsOnly = value.replace(/\D/g, ""); // Only digits
      if (digitsOnly.length <= 10) {
        setUserDetails((prev) => ({ ...prev, [name]: digitsOnly }));
      }
    } else if (name === "pincode") {
      const digitsOnly = value.replace(/\D/g, ""); // Only digits
      if (digitsOnly.length <= 6) {
        setUserDetails((prev) => {
          const updatedDetails = { ...prev, [name]: digitsOnly };

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

  // Handle image change
  const handleImageChange = (e) => {
    setUserDetails({
      ...userDetails,
      image: URL.createObjectURL(e.target.files[0]),
    });
  };

  // Toggle edit/save mode
  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  // Save user details
  const saveDetails = async () => {
    try {
      const formData = new FormData();

      formData.append("name", userDetails.username);
      formData.append("email", userDetails.email);
      formData.append("password", userDetails.password);
      formData.append("mobile", userDetails.mobile);
      formData.append("address", userDetails.address);
      formData.append("pincode", userDetails.pincode);

      // If the user has selected a new image, append it to the FormData
      const imageFile = document.querySelector('input[type="file"]')?.files[0];
      if (imageFile) {
        formData.append("image", imageFile);
      }

      // Send the form data to the server using Axios PUT request
      const response = await axios.put(
        `${API_BASE_URL}/api/auth/update/${user._id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // Handle response from the server
      if (response.status === 200) {
        alert("Profile updated successfully");
        console.log("User details updated successfully:", response.data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating user details:", error);
    }
  };

  const handleOnClickprofile = () => {
    navigate("/profilepage", { state: { user } });
  };
  const handleOnClickwhishlist = () => {
    navigate("/profilepage", { state: { user } });
  };
  const handleOnClickorders = () => {
    navigate("/myorders", { state: { user } });
  };
  const handleOnClicksettings = () => {
    navigate("/myorders", { state: { user } });
  };
  const handleOnClicklogout = () => {
    navigate("/home");
  };

  return (
    <div>
      <div className="prof-nav">
        <Navbar user={user} />
      </div>
      {/* Sidebar */}
      <div className="prof-cont">
        <div className="user-prof-sidebar">
          <div className="ad-sb-img-cont">
            <img src={userDetails.image} alt="admin" className="ad-sb-img" />
            <h4 className="ad-sb-username">{userDetails.username}</h4>
          </div>
          <div className="ad-sb-list-cont">
            <ul className="ad-sb-list-items">
              <li>
                <button className="ad-sb-btns" onClick={handleOnClickprofile}>
                  Profile
                </button>
              </li>
              <li>
                <button className="ad-sb-btns" onClick={handleOnClickwhishlist}>
                  Whislist
                </button>
              </li>
              <li>
                <button className="ad-sb-btns" onClick={handleOnClickorders}>
                  My Orders
                </button>
              </li>
              <li>
                <button className="ad-sb-btns" onClick={handleOnClicksettings}>
                  Settings
                </button>
              </li>
              <li>
                <button className="ad-sb-btns" onClick={handleOnClicklogout}>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Profile Page Content */}
        <div className="profile-page">
          <div className="profile-header">
            <h2>{isEditing ? "Edit Profile" : "View Profile"}</h2>
            <button className="edit-button" onClick={toggleEdit}>
              {isEditing ? "Cancel" : "Edit"}
            </button>
          </div>

          <div className="profile-content">
            <div className="profile-image">
              <img src={userDetails.image} alt="Profile" />
              {isEditing && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              )}
            </div>

            <div className="profile-details">
              <div className="profile-field">
                <label>Name:</label>
                <input
                  type="text"
                  name="username"
                  value={userDetails.username}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="profile-field">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={userDetails.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="profile-field">
                <label>Password:</label>
                <input
                  type="password"
                  name="password"
                  value={userDetails.password}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="profile-field">
                <label>Mobile Number:</label>
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
                />
              </div>

              <div className="profile-field">
                <label>Pincode:</label>
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
                />
              </div>

              <div className="profile-field">
                <label>Delivery Address:</label>
                <textarea
                  name="address"
                  value={userDetails.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {isEditing && (
              <div>
                <button onClick={saveDetails} className="update-btn">
                  Update Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
