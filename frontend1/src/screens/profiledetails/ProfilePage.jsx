import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./ProfilePage.css";
import Navbar from "../navbar/Navbar";
import API_BASE_URL from "../../api";

const ProfilePage = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Get the navigate function
  const { userId } = location.state || {}; // Fallback if userId is undefined
  console.log(userId);

  const [userDetails, setUserDetails] = useState({
    image: "",
    username: "John Doe",
    email: "john.doe@example.com",
    password: "password123",
    mobile: "+1234567890",
    address: "123 Main St, City, Country",
  });

  const [isEditing, setIsEditing] = useState(false);

  // Fetch user data using userId
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/auth/fetch/${userId}`
        );
        const fetchedData = response.data.data;

        // Fix the image path by replacing backslashes with forward slashes
        const fixedImagePath = fetchedData.image.replace(/\\/g, "/");

        setUserDetails({
          ...fetchedData,
          image: fixedImagePath, // Set the fixed image path
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails({
      ...userDetails,
      [name]: value,
    });
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

      // Append user details to FormData
      formData.append("name", userDetails.username);
      formData.append("email", userDetails.email);
      formData.append("password", userDetails.password);
      formData.append("mobile", userDetails.mobile);
      formData.append("address", userDetails.address);

      // If the user has selected a new image, append it to the FormData
      const imageFile = document.querySelector('input[type="file"]')?.files[0];
      if (imageFile) {
        formData.append("image", imageFile);
      }

      // Send the form data to the server using Axios PUT request
      const response = await axios.put(
        `${API_BASE_URL}/api/auth/update/${userId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // Handle response from the server
      if (response.status === 200) {
        console.log("User details updated successfully:", response.data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating user details:", error);
    }
  };

  // Function to handle button click and navigate to My Orders
  const handleBtnClick = () => {
    navigate("/myorders", { state: { userId } });
  };
  const handleOnClickprofile = () => {
    navigate("/profilepage", { state: { userId } });
  };
  const handleOnClickwhishlist = () => {
    navigate("/profilepage", { state: { userId } });
  };
  const handleOnClickorders = () => {
    navigate("/myorders", { state: { userId } });
  };
  const handleOnClicksettings = () => {
    navigate("/myorders", { state: { userId } });
  };
  const handleOnClicklogout = () => {
    navigate("/home");
  };

  return (
    <div>
      <div className="prof-nav">
        <Navbar userId={userId} />
      </div>
      {/* Sidebar */}
      <div className="prof-cont">
        <div className="user-prof-sidebar">
          <div className="ad-sb-img-cont">
            <img
              src={userDetails.image}
              alt="admin"
              className="ad-sb-img"
            />
            <h4 className="ad-sb-username">{userDetails.username}</h4>
          </div>
          <div className="ad-sb-list-cont">
            <ul className="ad-sb-list-items">
              <li>
                <button className="ad-sb-btns"
                onClick={handleOnClickprofile}>Profile</button>
              </li>
              <li>
                <button className="ad-sb-btns"
                onClick={handleOnClickwhishlist}>Whislist</button>
              </li>
              <li>
                <button className="ad-sb-btns"
                onClick={handleOnClickorders}>My Orders</button>
              </li>
              <li>
                <button className="ad-sb-btns"
                onClick={handleOnClicksettings}>Settings</button>
              </li>
              <li>
                <button className="ad-sb-btns" 
                onClick={handleOnClicklogout}>
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
              <img
                src={userDetails.image}
                alt="Profile"
              />
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
              <div className="save-button">
                <button onClick={saveDetails}>Save</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
