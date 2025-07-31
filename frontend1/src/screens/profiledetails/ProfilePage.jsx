import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./ProfilePage.css";
import Navbar from "../../components/navbar/Navbar";
import normalizeError from "../../utils/Error/NormalizeError";
import ErrorDisplay from "../../utils/Error/ErrorDisplay";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../../Redux/slices/userSlice";
import API_BASE_URL from "../../api";
import getCoordinates from "../../utils/DeliveryPincodeCheck/Geolocation";
import Sidebar from "../../components/sidebar/Sidebar";
import "../../App.css";
import userimg from "../../assets/users/user.png";
import {
  FaSignOutAlt,
  FaEdit,
  FaTimes,
  FaCamera,
  FaSave,
} from "react-icons/fa";
import { IoMdLock } from "react-icons/io";
import { MdEmail, MdPhone, MdLocationOn, MdPerson } from "react-icons/md";
import handleLogout from "../../utils/Logout";
import BottomNav from "../../components/Bottom Navbar/BottomNav";
import AuthRequired from "../../components/Authentication/AuthRequired";

const PfSkeletonSidebar = () => (
  <div className="sidebar-cont pf-skeleton">
    <div className="pf-sidebar pf-pulse-animation"></div>
  </div>
);

const PfSkeletonProfile = () => (
  <div className="usprof-content pf-skeleton">
    <div className="usprof-header">
      <div
        className="pf-title pf-pulse-animation"
        style={{ width: "200px", height: "32px" }}
      ></div>
      <div className="usprof-header-btns">
        <div
          className="pf-btn pf-pulse-animation"
          style={{ width: "100px", height: "40px" }}
        ></div>
        <div
          className="pf-btn pf-pulse-animation"
          style={{ width: "120px", height: "40px" }}
        ></div>
      </div>
    </div>

    <div className="usprof-details-container">
      <div className="usprof-image-section">
        <div className="pf-profile-image pf-pulse-animation"></div>
        <div
          className="pf-upload-btn pf-pulse-animation"
          style={{ width: "150px", height: "40px" }}
        ></div>
      </div>

      <div className="usprof-form-section">
        <div
          className="pf-form-header pf-pulse-animation"
          style={{ width: "180px", height: "24px", marginBottom: "20px" }}
        ></div>

        <div className="usprof-form-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="usprof-form-group">
              <div
                className="pf-label pf-pulse-animation"
                style={{ width: "100px", height: "16px", marginBottom: "8px" }}
              ></div>
              <div
                className="pf-input pf-pulse-animation"
                style={{ width: "100%", height: "40px" }}
              ></div>
            </div>
          ))}
        </div>

        <div className="pf-textarea-container">
          <div
            className="pf-label pf-pulse-animation"
            style={{ width: "120px", height: "16px", marginBottom: "8px" }}
          ></div>
          <div
            className="pf-textarea pf-pulse-animation"
            style={{ width: "100%", height: "80px" }}
          ></div>
        </div>

        <div
          className="pf-save-btn pf-pulse-animation"
          style={{ width: "160px", height: "45px", marginTop: "30px" }}
        ></div>
      </div>
    </div>
  </div>
);

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userId } = useParams();
  const user = useSelector((state) => state.user);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(user?.isLoggedIn);
  const [userDetails, setUserDetails] = useState({
    image: user?.image?.trim() ? user?.image : userimg,
    username: user?.username || " ",
    email: user?.email || " ",
    password: " ",
    mobile: user?.mobile || " ",
    address: user?.address || " ",
    pincode: user?.pincode || " ",
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      if (user?._id) {
        setIsLoggedIn(true);
        await fetchUserData(user._id);
        setLoading(false);
      } else {
        setIsLoggedIn(false);
        toast.error("Please login to view your profile");
      }
    };

    initialize();
  }, [user]);

  const fetchUserData = async (userId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/auth/profile/${userId}`
      );
      if (response.data.success) {
        const userData = response.data.user;
        setUserDetails({
          image: userData.image || userimg,
          username: userData.username,
          email: userData.email,
          password: "",
          mobile: userData.mobile || "",
          address: userData.address || "",
          pincode: userData.pincode || "",
        });
      }
    } catch (err) {
      console.error("Error fetching profile details:", err);

      if (err?.response) {
        if (err.response.status === 401) {
          toast.error("Session expired. Please login again.");
        } else {
          toast.error(
            err.response.data.message || "Error fetching profile data"
          );
        }
      } else {
        let errorMessage = normalizeError(err);
        setError(errorMessage);
      }
    }
  };

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
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserDetails({
          ...userDetails,
          image: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const saveDetails = async () => {
    try {
      const formData = new FormData();
      formData.append("name", userDetails.username || "");
      formData.append("email", userDetails.email || "");
      formData.append("password", userDetails.password || "");
      formData.append("mobile", userDetails.mobile || "");
      formData.append("address", userDetails.address || "");
      formData.append("pincode", userDetails.pincode || " ");


      console.log(userDetails);
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
        toast.success("Profile updated successfully");
        setIsEditing(false);
        const data = response.data.user;

        dispatch(
          setUserData({
            _id: data._id,
            username: data.username,
            email: data.email,
            image: data.image,
            pincode: data.pincode,
          })
        );
      }
    } catch (error) {
      console.error("Error updating user details:", error);
      if (error.response && error.response.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to update profile. Please try again.");
      }
    }
  };

  const handleLogoutUser = async () => {
    const logout = await handleLogout(dispatch);
    if (logout) {
      navigate("/home");
    } else {
      toast.error("Unable to logout");
    }
  };

  if (error) {
    return (
      <div className="usprof-container">
        <div className="usprof-nav">
          <Navbar />
        </div>
        <ErrorDisplay
          error={error}
          onRetry={() => user?._id && fetchUserData(user._id)}
        />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="usprof-container">
      <div className="usprof-nav">
        <Navbar />
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />

      {!isLoggedIn ? (
        <AuthRequired message="Please login to view your profile" />
      ) : loading ? (
        <>
          <PfSkeletonSidebar />
          <PfSkeletonProfile />
        </>
      ) : (
        <div className="usprof-main">
          <div className="sidebar-cont">
            <Sidebar />
          </div>
          <div className="usprof-content">
            <div className="usprof-header">
              <div className="usprof-title-container">
                <h2 className="usprof-title">
                  {isEditing ? "Edit Your Profile" : "My Profile"}
                </h2>
              </div>

              <div className="usprof-header-btns">
                <button className="usprof-logout" onClick={handleLogoutUser}>
                  <FaSignOutAlt className="btn-icon" />
                  <span>Logout</span>
                </button>
                <button
                  className={`usprof-edit-btn ${
                    isEditing ? "usprof-cancel" : ""
                  }`}
                  onClick={toggleEdit}
                >
                  {isEditing ? (
                    <>
                      <FaTimes className="btn-icon" />
                      <span>Cancel</span>
                    </>
                  ) : (
                    <>
                      <FaEdit className="btn-icon" />
                      <span>Edit Profile</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="usprof-details-container">
              <div className="usprof-image-section">
                <div className="profile-image-container">
                  <img
                    src={userDetails.image}
                    alt="Profile"
                    className="usprof-profile-img"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = userimg;
                    }}
                  />
                  {isEditing && (
                    <div className="image-overlay">
                      <label htmlFor="profile-image" className="upload-label">
                        <FaCamera className="camera-icon" />
                        <span>Change Photo</span>
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
                <div className="profile-name">
                  <h3>{userDetails.username}</h3>
                  <p>{userDetails.email}</p>
                </div>
              </div>

              <div className="usprof-form-section">
                <div className="form-section-header">
                  <h3>Personal Information</h3>
                  <p>Update your personal details and preferences</p>
                </div>
                <div className="usprof-form-section">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (isEditing) saveDetails();
                    }}
                  >
                    <div className="usprof-form-grid">
                      <div className="usprof-form-group">
                        <label className="usprof-form-label">Full Name</label>
                        <div className="input-with-icon">
                          <MdPerson className="input-icon" />
                          <input
                            type="text"
                            name="username"
                            value={userDetails.username}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="usprof-form-input"
                            placeholder="Enter your full name"
                          />
                        </div>
                      </div>

                      <div className="usprof-form-group">
                        <label className="usprof-form-label">
                          Email Address
                        </label>
                        <div className="input-with-icon">
                          <MdEmail className="input-icon" />
                          <input
                            type="email"
                            name="email"
                            value={userDetails.email}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="usprof-form-input"
                            placeholder="Enter your email"
                          />
                        </div>
                      </div>

                      <div className="usprof-form-group">
                        <label className="usprof-form-label">Password</label>
                        <div className="input-with-icon">
                          <IoMdLock className="input-icon" />
                          <input
                            type="password"
                            name="password"
                            value={userDetails.password}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="usprof-form-input"
                            placeholder="Enter your password"
                          />
                        </div>
                      </div>

                      <div className="usprof-form-group">
                        <label className="usprof-form-label">
                          Mobile Number
                        </label>
                        <div className="input-with-icon">
                          <MdPhone className="input-icon" />
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
                      </div>

                      <div className="usprof-form-group">
                        <label className="usprof-form-label">Pincode</label>
                        <div className="input-with-icon">
                          <MdLocationOn className="input-icon" />
                          <input
                            type="text"
                            name="pincode"
                            value={userDetails.pincode}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            maxLength={6}
                            pattern="\d*"
                            inputMode="numeric"
                            placeholder="Enter 6-digit pincode"
                            className="usprof-form-input"
                          />
                        </div>
                      </div>

                      <div className="usprof-form-group usprof-full-width">
                        <label className="usprof-form-label">
                          Delivery Address
                        </label>
                        <div className="input-with-icon">
                          <MdLocationOn className="input-icon textarea-icon" />
                          <textarea
                            name="address"
                            value={userDetails.address}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="usprof-form-textarea"
                            rows="4"
                            placeholder="Enter your complete address"
                          />
                        </div>
                      </div>
                    </div>
                  </form>
                </div>

                {isEditing && (
                  <div className="usprof-action-btns">
                    <button onClick={saveDetails} className="usprof-save-btn">
                      <FaSave className="btn-icon" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default ProfilePage;
