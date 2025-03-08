import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./Adminprofile.css";
import Adnavbar from "../Adnavbar/Adnavbar";
import API_BASE_URL from "../../api";

const Adminprofile = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const stateUser = location.state?.user || null;
  const stateOrders = location.state?.orders || null;

  // State for user and orders
  const [user, setUser] = useState(stateUser);
  const [orders, setOrders] = useState(stateOrders);

  const fetchUserData = async () => {
    try {
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
      console.log("User fetched from backend:", userRes.data.data);
    } catch (error) {
      console.error("Error fetching user:", error);
      navigate("/login");
    }
  };

  // Function to fetch order data from backend if not available in state
  const fetchOrderData = async () => {
    try {
      const OrdersRes = await axios.get(
        `${API_BASE_URL}/api/admin/pendingorders`
      );
      setOrders(OrdersRes.data);
      setUsersPendingOrder(
        OrdersRes.data.filter((order) => order.OrderStatus === "Pending")
      );
    } catch (error) {
      console.error("Error fetching orders:", error);
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
    image: user?.image || null,
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdminData({ ...adminData, [name]: value });
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
    if (adminData.image instanceof File) {
      formData.append("image", adminData.image);
    }

    try {
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
      navigate("/home");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleDashclk = () => {
    navigate("/adhome", { state: { user, orders } });
  };
  const handleprofileclk = () => {
    navigate("/adprof", { state: { user, orders } });
  };
  const handleUsemanclk = () => {
    navigate("/userman", { state: { user, orders } });
  };

  const handleOrderclk = () => {
    navigate("/adorders", { state: { user, orders } });
  };

  const handleProdclk = () => {
    navigate("/adprodlist", { state: { user, orders } });
  };

  return (
    <div>
      <div className="ad-nav">
        <Adnavbar user={user} />
      </div>
      <div className="admin-container">
        <div className="admin-sidebar">
          <div className="ad-sb-img-cont">
            {user?.image ? (
              <img
                src={previewImage || user.image}
                alt="admin"
                className="ad-sb-img"
              />
            ) : (
              <div className="placeholder-img">No Image</div>
            )}
            <h4 className="ad-sb-username">{user?.username || "Admin"}</h4>
          </div>
          <div className="ad-sb-list-cont">
            <ul className="ad-sb-list-items">
              <li>
                <button className="ad-sb-btns" onClick={handleDashclk}>
                  Dashboard
                </button>
              </li>
              <li>
                <button className="ad-sb-btns" onClick={handleprofileclk}>
                  Profile
                </button>
              </li>
              <li>
                <button className="ad-sb-btns" onClick={handleUsemanclk}>
                  User Management
                </button>
              </li>
              <li>
                <button className="ad-sb-btns" onClick={handleOrderclk}>
                  Orders
                </button>
              </li>
              <li>
                <button className="ad-sb-btns" onClick={handleProdclk}>
                  Products
                </button>
              </li>
              <li>
                <button className="ad-sb-btns">Settings</button>
              </li>
            </ul>
          </div>
        </div>

        <div className="main-content">
          <header className="admin-header">
            <h1>Admin Profile</h1>
            <div className="admin-info">
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </header>

          <div>
            <div className="profile-container">
              <div className="profile-card">
                <div className="profile-header">
                  <div className="profile-image">
                    {previewImage || user?.image ? (
                      <img src={previewImage || user.image} alt="Admin" />
                    ) : (
                      <div className="placeholder-img">No Image</div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>
                  <button
                    className="edit-btn"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? "Cancel" : "Edit"}
                  </button>
                </div>
                <form onSubmit={handleUpdate} className="profile-form">
                  <label>Name:</label>
                  <input
                    type="text"
                    name="username"
                    value={user?.username || " "}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                  <label>Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={user?.email || " "}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                  <label>Password:</label>
                  <input
                    type="password"
                    name="password"
                    value={user?.password || " "}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    disabled={!isEditing}
                  />
                  <label>Mobile:</label>
                  <input
                    type="text"
                    name="mobile"
                    value={user?.mobile || " "}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                  <label>Address:</label>
                  <input
                    type="text"
                    name="address"
                    value={user?.address || " "}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                  {isEditing && (
                    <>
                      <button type="submit" className="update-btn">
                        Update Profile
                      </button>
                    </>
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
