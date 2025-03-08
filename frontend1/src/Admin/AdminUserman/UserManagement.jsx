import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Adnavbar from "../Adnavbar/Adnavbar";
import API_BASE_URL from "../../api";
import "./Usermanagement.css";

const UserManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const stateUser = location.state?.user || null;
  const stateOrders = location.state?.orders || null;
  
  // State for user and orders
  const [user, setUser] = useState(stateUser);
  const [orders, setOrders] = useState(stateOrders);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const fetchUserData = async () => {
    try {
      console.log("Checking user validity...");
      const response = await axios.get(`${API_BASE_URL}/api/auth/checkvaliduser`, {
        withCredentials: true,
      });

      if (!response.data.user) {
        navigate("/login");
        return;
      }

      const userId = response.data.user.userId;
      const userRes = await axios.get(`${API_BASE_URL}/api/auth/fetch/${userId}`);
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
      const OrdersRes = await axios.get(`${API_BASE_URL}/api/admin/pendingorders`);
      setOrders(OrdersRes.data);
      setUsersPendingOrder(OrdersRes.data.filter((order) => order.OrderStatus === "Pending"));
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


  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().startsWith(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().startsWith(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/fetch`);
        console.log(response.data.message);
        setUsers(response.data.data); // Assuming response.data is an array of users
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleEditClick = (user) => {
    console.log("edit clicked");
    if (!editUser || editUser._id !== user._id) {
      setEditUser({ ...user });
    }
  };

  const handleEditChange = (e) => {
    setEditUser((prevUser) => ({
      ...prevUser,
      [e.target.name]: e.target.value,
    }));
  };

  const handleEditSave = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/auth/update/${editUser._id}`, // Use _id for MongoDB
        editUser
      );
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u._id === editUser._id ? editUser : u))
      );
      setEditUser(null);
      setShowPassword(false);
      alert("User updated successfully!!!");
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeletePopup(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/auth/delete/${userToDelete._id}`); // Use _id for MongoDB
      setUsers((prevUsers) =>
        prevUsers.filter((u) => u._id !== userToDelete._id)
      );
      setShowDeletePopup(false);
      setEditUser(false);
      alert("User deleted successfully!!");
    } catch (error) {
      console.error("Error deleting user:", error);
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
    navigate("/adprodlist", { state: { user, orders }});
  };

  const handleUserclk = (userdata) => {
    console.log(userdata);
    navigate("/aduserhis", { state: { user, orders, userdata } });
  };

  return (
    <div style={{ cursor: loading ? "wait" : "default" }}>
      <div className="ad-nav">
        <Adnavbar user={user} />
      </div>
      <div className="admin-container">
        <div className="admin-sidebar">
          <div className="ad-sb-img-cont">
            {user?.image ? (
              <img src={user.image} alt="admin" className="ad-sb-img" />
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
            <h1>User Management</h1>
            <div className="admin-info">
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </header>

          <div className="user-cont">
            <h2>Registered Users</h2>
            <div className="ad-user-search-count">
              <input
                className="users-se-in"
                type="text"
                placeholder="Search by username or email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <h4>Total users: {users.length}</h4>
            </div>
            <div className="user-list">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <div
                    key={u._id}
                    className="user-det-list-cont"
                    onClick={() => handleUserclk(u)}
                  >
                    <div className="user-det-list">
                      <p>Name: {u.username}</p>
                      <p>Email: {u.email}</p>
                    </div>
                    <div className="user-det-btns">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(u);
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No users found</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {editUser && (
        <div className="edit-popup">
          <h2>Edit User</h2>
          <img src={editUser.image} alt="user" />
          <input
            name="username"
            value={editUser.username}
            onChange={handleEditChange}
          />
          <input
            name="email"
            value={editUser.email}
            onChange={handleEditChange}
          />

          <div className="ad-us-ed-sp">
            <input
              name="password"
              type={showPassword ? "text" : "password"} // Toggle between "text" & "password"
              value={editUser.password}
              placeholder="New Password"
              onChange={handleEditChange}
            />
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <input
            name="mobileno"
            value={editUser.mobile}
            onChange={handleEditChange}
          />
          <input
            name="address"
            value={editUser.address}
            onChange={handleEditChange}
          />
          <button onClick={handleEditSave}>Save</button>
          <button
            onClick={() => {
              setEditUser(null);
              setShowPassword(false);
            }}
          >
            Cancel
          </button>
          <button onClick={() => handleDeleteClick(editUser)}>Delete</button>
        </div>
      )}

      {showDeletePopup && (
        <div className="delete-popup">
          <p>Are you sure you want to delete {userToDelete.username}?</p>
          <button onClick={confirmDelete}>Yes</button>
          <button onClick={() => setShowDeletePopup(false)}>No</button>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
