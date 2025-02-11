import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Adnavbar from "../Adnavbar/Adnavbar";
import API_BASE_URL from "../../api";
import "./Usermanagement.css";

const UserManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, user, orders } = location.state || {};
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().startsWith(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().startsWith(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/fetch`);
        console.log(response.data.message);
        setUsers(response.data.data); // Assuming response.data is an array of users
      } catch (error) {
        console.error("Error fetching users:", error);
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
      console.log(editUser._id);
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

  const handleDashclk = () => {
    navigate("/adhome", { state: { userId, user, orders } });
  };
  const handleprofileclk = () => {
    navigate("/adprof", { state: { userId, user, orders } });
  };
  const handleUsemanclk = () => {
    navigate("/userman", { state: { userId, user, orders } });
  };
  const handleOrderclk = () => {
    navigate("/adorders", { state: { userId, user, orders } });
  };
  const handleProdclk = () => {
    navigate("/adprodlist", { state: { userId, user, orders } });
  };
  const handleLogout = () => {
     navigate("/home");
  };

  const handleUserclk = (userdata) => {
    console.log(userdata)
    navigate('/aduserhis',{ state: { userId, user, orders, userdata  } })
  };



  return (
    <div>
      <div className="ad-nav">
        <Adnavbar userId={userId} user={user} />
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
            <input
              className="users-se-in"
              type="text"
              placeholder="Search by username or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
