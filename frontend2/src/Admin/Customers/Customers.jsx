import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Adnavbar from "../Adnavbar/Adnavbar";
import API_BASE_URL from "../../api";
import "./Customers.css";
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
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiShoppingBag,
  FiDollarSign,
  FiCalendar,
  FiClock,
  FiArrowUp,
  FiArrowDown,
  FiUserPlus,
  FiUserCheck,
  FiUserX,
  FiMapPin,
  FiStar,
  FiSliders,
  FiGrid,
  FiList,
  FiPlusCircle,
  FiActivity,
  FiTrendingUp,
  FiTrendingDown,
  FiBarChart2,
  FiPieChart,
  FiShield,
  FiTag,
  FiGlobe,
  FiHeart,
  FiSettings
} from "react-icons/fi";

// Helper function to generate consistent colors from strings
const stringToColor = (str) => {
  if (!str) return '#3498db'; // Default color

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = hash % 360;
  return `hsl(${hue}, 70%, 60%)`;
};

const Customers = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const stateUser = location.state?.user || null;
  const stateOrders = location.state?.orders || null;

  // State for user and orders
  const [user, setUser] = useState(stateUser);
  const [orders, setOrders] = useState(stateOrders);
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Enhanced state variables
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid"); // grid or list view
  const [sortField, setSortField] = useState("username");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterActive, setFilterActive] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    username: "",
    email: "",
    password: "",
    mobile: "",
    address: ""
  });

  // Notification system
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "" // success, error, warning, info
  });

  // Customer statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    new: 0, // new in last 30 days
    withOrders: 0
  });

  const customersPerPage = 12;

  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentUsers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

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

  // Show notification function
  const showNotification = (message, type = "success") => {
    setNotification({
      show: true,
      message,
      type
    });

    // Auto hide after 3 seconds
    setTimeout(() => {
      setNotification({
        show: false,
        message: "",
        type: ""
      });
    }, 3000);
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/customers/fetch`);

        if (response.data.success) {
          const customersData = response.data.data || [];
          setCustomers(customersData);
          setFilteredCustomers(customersData);

          // Calculate statistics
          const now = new Date();
          const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

          setStats({
            total: customersData.length,
            active: customersData.filter(c => c.lastLogin).length,
            new: customersData.filter(c => {
              return c.createdAt && new Date(c.createdAt) >= thirtyDaysAgo;
            }).length,
            withOrders: customersData.filter(c => c.orders && c.orders.length > 0).length
          });

          showNotification("Customers loaded successfully", "success");
        } else {
          showNotification("Failed to load customers", "error");
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
        showNotification("Error loading customers: " + (error.response?.data?.message || error.message), "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleEditClick = (user) => {
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
      setLoading(true);
      const response = await axios.put(
        `${API_BASE_URL}/api/auth/update/${editUser._id}`,
        editUser
      );

      if (response.data.success) {
        // Update local state
        const updatedCustomers = customers.map((u) =>
          u._id === editUser._id ? editUser : u
        );
        setCustomers(updatedCustomers);
        setFilteredCustomers(sortCustomers(updatedCustomers, sortField, sortDirection));

        // Close modal and show success message
        setEditUser(null);
        setShowPassword(false);
        showNotification("Customer updated successfully", "success");
      } else {
        showNotification(response.data.message || "Failed to update customer", "error");
      }
    } catch (error) {
      console.error("Error updating customer:", error);
      showNotification(
        "Error updating customer: " + (error.response?.data?.message || error.message),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeletePopup(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      const response = await axios.delete(`${API_BASE_URL}/api/auth/delete/${userToDelete._id}`);

      if (response.data.success) {
        // Update local state
        const updatedCustomers = customers.filter((u) => u._id !== userToDelete._id);
        setCustomers(updatedCustomers);
        setFilteredCustomers(sortCustomers(updatedCustomers, sortField, sortDirection));

        // Close modal and show success message
        setShowDeletePopup(false);
        if (editUser && editUser._id === userToDelete._id) {
          setEditUser(null);
        }
        showNotification("Customer deleted successfully", "success");
      } else {
        showNotification(response.data.message || "Failed to delete customer", "error");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      showNotification(
        "Error deleting customer: " + (error.response?.data?.message || error.message),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Sort customers function
  const sortCustomers = (data, field, direction) => {
    return [...data].sort((a, b) => {
      // Handle null or undefined values
      if (!a[field] && !b[field]) return 0;
      if (!a[field]) return direction === 'asc' ? 1 : -1;
      if (!b[field]) return direction === 'asc' ? -1 : 1;

      // Sort based on field type
      if (typeof a[field] === 'string') {
        return direction === 'asc'
          ? a[field].localeCompare(b[field])
          : b[field].localeCompare(a[field]);
      } else {
        return direction === 'asc'
          ? a[field] - b[field]
          : b[field] - a[field];
      }
    });
  };

  // Handle sort change
  const handleSortChange = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort customers
  useEffect(() => {
    let result = [...customers];

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter(
        (user) =>
          (user._id && user._id.toLowerCase().includes(query)) ||
          (user.username && user.username.toLowerCase().includes(query)) ||
          (user.email && user.email.toLowerCase().includes(query)) ||
          (user.mobile && user.mobile.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    result = sortCustomers(result, sortField, sortDirection);

    setFilteredCustomers(result);
    setCurrentPage(1); // Reset to first page on new search/sort
  }, [searchQuery, customers, sortField, sortDirection]);

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

  // Handle adding a new customer
  const handleAddCustomer = () => {
    setNewCustomer({
      username: "",
      email: "",
      password: "",
      mobile: "",
      address: ""
    });
    setShowAddCustomer(true);
  };

  // Handle new customer input change
  const handleNewCustomerChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save new customer
  const saveNewCustomer = async () => {
    // Validate required fields
    if (!newCustomer.username || !newCustomer.email || !newCustomer.password) {
      showNotification("Name, email and password are required", "error");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/api/customers/add`,
        newCustomer
      );

      if (response.data.success) {
        // Add to local state
        const createdCustomer = response.data.customer;
        const updatedCustomers = [...customers, createdCustomer];
        setCustomers(updatedCustomers);
        setFilteredCustomers(sortCustomers(updatedCustomers, sortField, sortDirection));

        // Close modal and show success
        setShowAddCustomer(false);
        showNotification("Customer added successfully", "success");
      } else {
        showNotification(response.data.message || "Failed to add customer", "error");
      }
    } catch (error) {
      console.error("Error adding customer:", error);
      showNotification(
        "Error adding customer: " + (error.response?.data?.message || error.message),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ cursor: loading ? "wait" : "default" }}>
      {/* Notification System */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-icon">
            {notification.type === "success" && <FiCheckCircle />}
            {notification.type === "error" && <FiAlertCircle />}
            {notification.type === "warning" && <FiAlertCircle />}
            {notification.type === "info" && <FiInfo />}
          </div>
          <p>{notification.message}</p>
          <button
            className="close-notification"
            onClick={() => setNotification({...notification, show: false})}
          >
            <FiX />
          </button>
        </div>
      )}

      <div className="ad-nav">
        <Adnavbar user={user} />
      </div>
      <div className={`admin-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Sidebar
          user={user}
          orders={orders}
          onCollapsedChange={handleSidebarCollapse}
        />

        <div className="main-content">
          <header className="admin-header">
            <div className="header-greeting">
              <h1><FiUsers className="header-icon" /> Customers Management</h1>
              <p className="subtitle">Manage and monitor customer accounts</p>
            </div>
            <div className="admin-info">
              <button className="logout-btn" onClick={handleLogout}>
                <FiLogOut className="btn-icon" /> Logout
              </button>
            </div>
          </header>

          <div className="user-management-container">
            {/* Statistics Cards */}
            <div className="customer-stats-cards">
              <div className="stat-card total">
                <div className="stat-icon">
                  <FiUsers />
                </div>
                <div className="stat-content">
                  <h3>{stats.total}</h3>
                  <p>Total Customers</p>
                </div>
              </div>

              <div className="stat-card active">
                <div className="stat-icon">
                  <FiUserCheck />
                </div>
                <div className="stat-content">
                  <h3>{stats.active}</h3>
                  <p>Active Customers</p>
                </div>
              </div>

              <div className="stat-card new">
                <div className="stat-icon">
                  <FiUserPlus />
                </div>
                <div className="stat-content">
                  <h3>{stats.new}</h3>
                  <p>New (30 days)</p>
                </div>
              </div>

              <div className="stat-card orders">
                <div className="stat-icon">
                  <FiShoppingBag />
                </div>
                <div className="stat-content">
                  <h3>{stats.withOrders}</h3>
                  <p>With Orders</p>
                </div>
              </div>
            </div>

            <div className="user-management-header">
              <div className="user-stats">
                <h2>Customer Management</h2>
                <button className="add-customer-btn" onClick={handleAddCustomer}>
                  <FiUserPlus /> Add New Customer
                </button>
              </div>

              <div className="search-container">
                <div className="search-input-wrapper">
                  <FiSearch className="search-icon" />
                  <input
                    className="search-input"
                    type="text"
                    placeholder="Search by name, email, ID or mobile"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      className="clear-search"
                      onClick={() => setSearchQuery('')}
                    >
                      <FiX />
                    </button>
                  )}
                </div>

                <div className="view-options">
                  <button
                    className={`view-option ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="Grid View"
                  >
                    <FiGrid />
                  </button>
                  <button
                    className={`view-option ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                    title="List View"
                  >
                    <FiList />
                  </button>
                </div>
              </div>
            </div>

            {/* Sort Controls */}
            <div className="sort-controls">
              <div className="sort-label">
                <FiFilter /> Sort by:
              </div>
              <div className="sort-buttons">
                <button
                  className={`sort-button ${sortField === 'username' ? 'active' : ''}`}
                  onClick={() => handleSortChange('username')}
                >
                  Name
                  {sortField === 'username' && (
                    sortDirection === 'asc' ? <FiArrowUp /> : <FiArrowDown />
                  )}
                </button>

                <button
                  className={`sort-button ${sortField === 'email' ? 'active' : ''}`}
                  onClick={() => handleSortChange('email')}
                >
                  Email
                  {sortField === 'email' && (
                    sortDirection === 'asc' ? <FiArrowUp /> : <FiArrowDown />
                  )}
                </button>

                <button
                  className={`sort-button ${sortField === 'createdAt' ? 'active' : ''}`}
                  onClick={() => handleSortChange('createdAt')}
                >
                  Date Added
                  {sortField === 'createdAt' && (
                    sortDirection === 'asc' ? <FiArrowUp /> : <FiArrowDown />
                  )}
                </button>
              </div>

              <div className="results-count">
                {filteredCustomers.length} {filteredCustomers.length === 1 ? 'result' : 'results'}
              </div>
            </div>

            <div className={`user-list ${viewMode}`}>
              {currentUsers.length > 0 ? (
                currentUsers.map((u) => (
                  <div
                    key={u._id}
                    className={`user-card ${viewMode === 'list' ? 'list-view' : ''}`}
                  >
                    <div className="user-header">
                      <div
                        className="user-avatar"
                        style={{
                          backgroundColor: `hsl(${u.username?.charCodeAt(0) * 10 % 360}, 70%, 60%)`
                        }}
                      >
                        {u.username ? u.username.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="user-name-email">
                        <h3 className="user-name">{u.username}</h3>
                        <p className="user-email">
                          <FiMail className="detail-icon-inline" /> {u.email}
                        </p>
                      </div>
                      {viewMode === 'list' && (
                        <div className="user-mobile">
                          <FiPhone className="detail-icon-inline" /> {u.mobile || "No mobile"}
                        </div>
                      )}
                    </div>

                    <div className="user-details">
                      {viewMode === 'grid' && (
                        <p className="user-detail">
                          <FiPhone className="detail-icon" />
                          {u.mobile || "No mobile"}
                        </p>
                      )}
                      <p className="user-detail address">
                        <FiHome className="detail-icon" />
                        {u.address || "No address"}
                      </p>

                      {viewMode === 'grid' && (
                        <p className="user-detail">
                          <FiInfo className="detail-icon" />
                          ID: {u._id?.substring(0, 8)}...
                        </p>
                      )}

                      {viewMode === 'list' && (
                        <>
                          <p className="user-detail">
                            <FiCalendar className="detail-icon" />
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Unknown date"}
                          </p>
                          <p className="user-detail">
                            <FiShoppingBag className="detail-icon" />
                            {u.orders?.length || 0} orders
                          </p>
                        </>
                      )}
                    </div>

                    <div className="user-actions">
                      <button
                        className="edit-btn"
                        onClick={() => handleEditClick(u)}
                        title="Edit Customer"
                      >
                        <FiEdit2 />
                        {viewMode === 'list' && <span>Edit</span>}
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteClick(u)}
                        title="Delete Customer"
                      >
                        <FiTrash2 />
                        {viewMode === 'list' && <span>Delete</span>}
                      </button>
                      <button
                        className="view-btn"
                        onClick={() => handleUserclk(u)}
                        title="View Details"
                      >
                        <FiEye />
                        {viewMode === 'list' && <span>View</span>}
                      </button>
                    </div>

                    {viewMode === 'list' && (
                      <div className="user-id">
                        <FiInfo className="detail-icon-inline" /> ID: {u._id}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-users">
                  <FiAlertCircle className="no-results-icon" />
                  <p>No customers found matching your search criteria.</p>
                  <button className="reset-search" onClick={() => setSearchQuery('')}>
                    <FiRefreshCw /> Reset Search
                  </button>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="pagination-btn prev-btn"
                >
                  <FiChevronLeft /> Previous
                </button>

                <div className="pagination-info">
                  Page <span className="current-page">{currentPage}</span> of <span className="total-pages">{totalPages}</span>
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="pagination-btn next-btn"
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
              <h2><FiEdit2 className="modal-icon" /> Edit User</h2>
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
                      value={editUser.password || ''}
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
                  <p className="field-hint">Leave blank to keep current password</p>
                </div>

                <div className="form-group">
                  <label htmlFor="mobile">
                    <FiPhone className="field-icon" /> Mobile Number
                  </label>
                  <input
                    id="mobile"
                    name="mobile"
                    value={editUser.mobile || ''}
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
                    value={editUser.address || ''}
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
                <button
                  className="save-btn"
                  onClick={handleEditSave}
                >
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
            <p>Are you sure you want to delete the customer <strong>{userToDelete.username}</strong>?</p>
            <p className="delete-warning">This action cannot be undone.</p>

            <div className="confirmation-actions">
              <button
                className="cancel-delete-btn"
                onClick={() => setShowDeletePopup(false)}
              >
                <FiX /> Cancel
              </button>
              <button
                className="confirm-delete-btn"
                onClick={confirmDelete}
                disabled={loading}
              >
                {loading ? "Deleting..." : <><FiTrash2 /> Delete Customer</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <div className="modal-overlay">
          <div className="add-customer-modal">
            <div className="modal-header">
              <h2><FiUserPlus className="modal-icon" /> Add New Customer</h2>
              <button
                className="close-modal-btn"
                onClick={() => setShowAddCustomer(false)}
              >
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="new-username">
                    <FiUser className="field-icon" /> Full Name *
                  </label>
                  <input
                    id="new-username"
                    name="username"
                    value={newCustomer.username}
                    onChange={handleNewCustomerChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="new-email">
                    <FiMail className="field-icon" /> Email Address *
                  </label>
                  <input
                    id="new-email"
                    name="email"
                    type="email"
                    value={newCustomer.email}
                    onChange={handleNewCustomerChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="new-password">
                    <FiLock className="field-icon" /> Password *
                  </label>
                  <div className="password-input-group">
                    <input
                      id="new-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={newCustomer.password}
                      onChange={handleNewCustomerChange}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="new-mobile">
                    <FiPhone className="field-icon" /> Mobile Number
                  </label>
                  <input
                    id="new-mobile"
                    name="mobile"
                    value={newCustomer.mobile}
                    onChange={handleNewCustomerChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="new-address">
                    <FiHome className="field-icon" /> Address
                  </label>
                  <textarea
                    id="new-address"
                    name="address"
                    value={newCustomer.address}
                    onChange={handleNewCustomerChange}
                    rows="3"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <div className="required-fields-note">
                <span>*</span> Required fields
              </div>
              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={() => setShowAddCustomer(false)}
                >
                  <FiX /> Cancel
                </button>
                <button
                  className="save-btn"
                  onClick={saveNewCustomer}
                  disabled={loading || !newCustomer.username || !newCustomer.email || !newCustomer.password}
                >
                  {loading ? "Saving..." : <><FiSave /> Add Customer</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
