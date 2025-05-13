import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Adnavbar from "../Adnavbar/Adnavbar";
import API_BASE_URL from "../../api";
import "./Usermanagement.css";
import Sidebar from "../sidebar/Sidebar";
import {
  FiUsers,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiSave,
  FiX,
  FiEye,
  FiEyeOff,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
  FiMail,
  FiPhone,
  FiHome,
  FiLock,
  FiInfo,
} from "react-icons/fi";

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [filteredUsers, setfilteredUsers] = useState(users);
  const [editUser, setEditUser] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 12;

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredUsers.length / ordersPerPage);

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

  // Filter users based on search query

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/fetch`);
        console.log(response.data.message);
        setUsers(response.data.data);
        setfilteredUsers(response.data.data);
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

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setfilteredUsers(users); // Show all if empty
    } else {
      const searchUsers = users.filter(
        (user) =>
          user._id.toLowerCase().startsWith(searchQuery.trim().toLowerCase()) ||
          user.username
            ?.toLowerCase()
            .startsWith(searchQuery.trim().toLowerCase()) ||
          user.email?.toLowerCase().startsWith(searchQuery.trim().toLowerCase())
      );
      setfilteredUsers(searchUsers);
      setCurrentPage(1); // Reset to first page on new search
    }
  }, [searchQuery, users]);

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

  const handleUserclk = (userdata) => {
    console.log(userdata);
    navigate("/aduserhis", { state: { user, orders, userdata } });
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
          <header className="admin-header-box">
            <div className="header-greeting">
              <h1>
                <FiUsers className="header-icon" /> Online Users Management
              </h1>
              <p className="subtitle">Manage and monitor user accounts</p>
            </div>
            <div className="admin-info">
              <button className="logout-btn" onClick={handleLogout}>
                <FiLogOut /> Logout
              </button>
            </div>
          </header>

          <div className="user-management-container">
            <div className="user-management-header">
              <div className="user-stats">
                <h2>Registered Users</h2>
                <div className="user-count">
                  <span className="count-number">{users.length}</span>
                  <span className="count-label">Total Users</span>
                </div>
              </div>

              <div className="search-container">
                <div className="search-input-wrapper">
                  <FiSearch className="search-icon" />
                  <input
                    className="search-input"
                    type="text"
                    placeholder="Search by username, email or ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      className="clear-search"
                      onClick={() => setSearchQuery("")}
                    >
                      <FiX />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="user-list">
              {currentUsers.length > 0 ? (
                currentUsers.map((u) => (
                  <div
                    key={u._id}
                    className="user-man-card"
                    onClick={() => handleUserclk(u)}
                  >
                    <div className="user-card-header">
                      <div className="user-avatar">
                        {u.image ? (
                          <img src={u.image} alt={u.username} />
                        ) : (
                          <div className="avatar-placeholder">
                            <FiUser style={{color: '#fff'}}/>
                          </div>
                        )}
                      </div>
                      <h3 className="user-name">{u.username}</h3>
                    </div>

                      <div className="user-card-info">
                        <div className="info-item">
                          <FiMail className="us-info-icon" />
                          <span>{u.email}</span>
                        </div>
                        {u.mobile && (
                          <div className="info-item">
                            <FiPhone className="us-info-icon" />
                            <span>{u.mobile}</span>
                          </div>
                        )}
                    </div>

                    <div className="user-man-actions">
                      <button
                        className="us-action-btn us-edit-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(u);
                        }}
                        title="Edit User"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className="us-action-btn us-view-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUserclk(u);
                        }}
                        title="View Details"
                      >
                        <FiInfo />
                      </button>
                      <button
                        className="us-action-btn us-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(u);
                        }}
                        title="Delete User"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  <FiUsers className="no-results-icon" />
                  <p>No users found</p>
                  {searchQuery && (
                    <button
                      className="clear-search-btn"
                      onClick={() => setSearchQuery("")}
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="us-pagination-btn prev-btn"
                >
                  <FiChevronLeft /> Previous
                </button>

                <div className="pagination-info">
                  Page <span className="current-page">{currentPage}</span> of{" "}
                  <span className="total-pages">{totalPages}</span>
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="us-pagination-btn next-btn"
                >
                  Next <FiChevronRight />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {editUser && (
        <div className="modal-overlay">
          <div className="edit-user-modal">
            <div className="modal-header">
              <h2>
                <FiEdit2 className="modal-icon" /> Edit User
              </h2>
              <button
                className="close-modal-btn"
                onClick={() => {
                  setEditUser(null);
                  setShowPassword(false);
                }}
              >
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              <div className="user-avatar-edit">
                {editUser.image ? (
                  <img src={editUser.image} alt={editUser.username} />
                ) : (
                  <div className="avatar-placeholder large">
                    <FiUser />
                  </div>
                )}
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="username">
                    <FiUser className="field-icon" /> Full Name
                  </label>
                  <input
                    id="username"
                    name="username"
                    value={editUser.username}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    <FiMail className="field-icon" /> Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={editUser.email}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">
                    <FiLock className="field-icon" /> Password
                  </label>
                  <div className="password-input-group">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={editUser.password || ""}
                      placeholder="New Password"
                      onChange={handleEditChange}
                    />
                    <button
                      type="button"
                      className="toggle-password-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  <p className="field-hint">
                    Leave blank to keep current password
                  </p>
                </div>

                <div className="form-group">
                  <label htmlFor="mobile">
                    <FiPhone className="field-icon" /> Mobile Number
                  </label>
                  <input
                    id="mobile"
                    name="mobile"
                    value={editUser.mobile || ""}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="address">
                    <FiHome className="field-icon" /> Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={editUser.address || ""}
                    onChange={handleEditChange}
                    rows="3"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="delete-user-btn"
                onClick={() => handleDeleteClick(editUser)}
              >
                <FiTrash2 /> Delete User
              </button>
              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setEditUser(null);
                    setShowPassword(false);
                  }}
                >
                  <FiX /> Cancel
                </button>
                <button className="save-btn" onClick={handleEditSave}>
                  <FiSave /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeletePopup && (
        <div className="modal-overlay">
          <div className="delete-confirmation-modal">
            <div className="delete-icon">
              <FiTrash2 />
            </div>
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to delete the user{" "}
              <strong>{userToDelete.username}</strong>?
            </p>
            <p className="delete-warning">This action cannot be undone.</p>

            <div className="confirmation-actions">
              <button
                className="cancel-delete-btn"
                onClick={() => setShowDeletePopup(false)}
              >
                <FiX /> Cancel
              </button>
              <button className="confirm-delete-btn" onClick={confirmDelete}>
                <FiTrash2 /> Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
