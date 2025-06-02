import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Adnavbar from "../Adnavbar/Adnavbar";
import API_BASE_URL from "../../api";
import "./ViewCustomers.css";
import Sidebar from "../sidebar/Sidebar";
import {
  FiUser,
  FiMail,
  FiHome,
  FiPhone,
  FiCalendar,
  FiClock,
  FiShoppingBag,
  FiDollarSign,
  FiArrowLeft,
  FiLogOut,
  FiInfo,
  FiPackage,
  FiTag,
  FiFilter
} from "react-icons/fi";

const ViewCustomers = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const stateUser = location.state?.user || null;
  const stateCustData = location.state?.custData || null;

  // State for user and customer data
  const [user, setUser] = useState(stateUser);
  const [custData, setCustdata] = useState(stateCustData);
  const [purchasedbills, setCustpurchasedata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isEmployee, setisEmployee] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Filter states
  const [dateFilter, setDateFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [filteredBills, setFilteredBills] = useState([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Apply filters function
  const applyFilters = () => {
    if (!purchasedbills.length) {
      setFilteredBills([]);
      return;
    }

    const now = new Date();
    let filtered = [...purchasedbills];

    switch (dateFilter) {
      case "today":
        filtered = purchasedbills.filter(bill => {
          const billDate = new Date(bill.createdAt);
          return (
            billDate.getDate() === now.getDate() &&
            billDate.getMonth() === now.getMonth() &&
            billDate.getFullYear() === now.getFullYear()
          );
        });
        break;

      case "week":
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        filtered = purchasedbills.filter(bill => {
          const billDate = new Date(bill.createdAt);
          return billDate >= oneWeekAgo;
        });
        break;

      case "month":
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);
        filtered = purchasedbills.filter(bill => {
          const billDate = new Date(bill.createdAt);
          return billDate >= oneMonthAgo;
        });
        break;

      case "year":
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        filtered = purchasedbills.filter(bill => {
          const billDate = new Date(bill.createdAt);
          return billDate >= oneYearAgo;
        });
        break;

      case "custom":
        if (customStartDate && customEndDate) {
          const startDate = new Date(customStartDate);
          const endDate = new Date(customEndDate);
          endDate.setHours(23, 59, 59, 999);

          filtered = purchasedbills.filter(bill => {
            const billDate = new Date(bill.createdAt);
            return billDate >= startDate && billDate <= endDate;
          });
        }
        break;

      default:
        break;
    }

    setFilteredBills(filtered);
    setShowFilterPanel(false);
  };

  // Reset filters
  const resetFilters = () => {
    setDateFilter("all");
    setCustomStartDate("");
    setCustomEndDate("");
    setFilteredBills(purchasedbills);
    setShowFilterPanel(false);
  };

  // Initialize filtered bills
  useEffect(() => {
    if (purchasedbills.length) {
      setFilteredBills(purchasedbills);
    }
  }, [purchasedbills]);

  const fetchUserData = async () => {
    try {
      console.log("Checking employee validity...");
      const response = await axios.get(
        `${API_BASE_URL}/api/auth/checkvaliduser`,
        {
          withCredentials: true,
        }
      );

      const loggedInUser = response.data.user;
      if (!loggedInUser) {
        navigate("/login");
        return;
      }

      const isEmp = loggedInUser.role === "Employee";
      setisEmployee(isEmp);

      const userId = isEmp ? loggedInUser.employeeId : loggedInUser.userId;

      const userRes = await axios.get(
        isEmp
          ? `${API_BASE_URL}/api/employees/fetch/${userId}`
          : `${API_BASE_URL}/api/auth/fetch/${userId}`
      );

      setUser(userRes.data.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustData = async () => {
    try {
      const id = custData._id;
      const CustomerDataRes = await axios.get(
        `${API_BASE_URL}/api/customers/fetch/${id}`
      );
      setCustdata(CustomerDataRes.data.data);
    } catch {
      console.log("error on fetching the customers");
    }
  };

  const fetchCustpurchaceData = async () => {
    try {
      const custId = custData._id;
      const CustomerbillsRes = await axios.get(
        `${API_BASE_URL}/api/billing/customer/fetch/${custId}`
      );
      setCustpurchasedata(CustomerbillsRes.data.bills);
    } catch {
      console.log("error on fetching the customers");
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchCustData();
      fetchCustpurchaceData();
    }
  }, []);

  const handleLogout = async () => {
    try {
      const empId = user._id;
      if (isEmployee) {
        await axios.post(
          `${API_BASE_URL}/api/auth/employee/logout/${empId}`,
          {},
          { withCredentials: true }
        );
      } else {
        await axios.post(
          `${API_BASE_URL}/api/auth/logout`,
          {},
          { withCredentials: true }
        );
      }
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleBack = () => {
    navigate("/customers", {
      state: { user },
      replace: true,
    });
  };

  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleviewdetails = () => {
    console.log("kkk")
  }

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
        <Sidebar user={user} onCollapsedChange={handleSidebarCollapse} />

        <div className="main-content">
          <header className="admin-header-box">
            <div className="header-greeting">
              <h1>
                <FiUser /> {custData?.username}
              </h1>
              <p className="cust-email">
                <FiMail />{" "}
                {custData?.email || "No email provided"}
              </p>
            </div>
            <div className="admin-info">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleBack();
                }}
                type="button"
              >
                <FiArrowLeft /> Back
              </button>
              <button
                className="logout-btn"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleLogout();
                }}
                type="button"
              >
                <FiLogOut /> Logout
              </button>
            </div>
          </header>

          {/* Tabs */}
          <div className="customer-tabs">
            <button
              className={`cust-tab-btn ${
                activeTab === "profile" ? "active" : ""
              }`}
              onClick={() => setActiveTab("profile")}
            >
              <FiUser className="tab-icon" /> Profile View
            </button>
            <button
              className={`cust-tab-btn ${
                activeTab === "products" ? "active" : ""
              }`}
              onClick={() => setActiveTab("products")}
            >
              <FiShoppingBag className="tab-icon" /> Purchased Products
              <span className="cust-product-count">
                ({purchasedbills.length})
              </span>
            </button>
          </div>

          {/* Content Container */}
          <div className="user-content-container cust-det-cont">
            {custData ? (
              <>
                {/* Profile View */}
                {activeTab === "profile" && (
                  <div className="user-profile-card">
                    <div className="profile-header view-cust-header">
                      <h2>Customer Profile</h2>
                      <span
                        className={`status-badge ${
                          custData.status === "active" ? "active" : "inactive"
                        }`}
                      >
                        {custData.status}
                      </span>
                    </div>

                    <div className="profile-content">
                      <div className="profile-details">
                        <div className="detail-group">
                          <div className="detail-item">
                            <div className="detail-icon">
                              <FiUser />
                            </div>
                            <div className="detail-content">
                              <h4>Full Name</h4>
                              <p>{custData.username || "Not provided"}</p>
                            </div>
                          </div>

                          <div className="detail-item">
                            <div className="detail-icon">
                              <FiMail />
                            </div>
                            <div className="detail-content">
                              <h4>Email Address</h4>
                              <p>{custData.email || "Not provided"}</p>
                            </div>
                          </div>

                          <div className="detail-item">
                            <div className="detail-icon">
                              <FiPhone />
                            </div>
                            <div className="detail-content">
                              <h4>Mobile Number</h4>
                              <p>{custData.mobile || "Not provided"}</p>
                            </div>
                          </div>

                          <div className="detail-item">
                            <div className="detail-icon">
                              <FiHome />
                            </div>
                            <div className="detail-content">
                              <h4>Address</h4>
                              <p>{custData.address || "Not provided"}</p>
                            </div>
                          </div>
                        </div>

                        <div className="detail-group">
                          <div className="detail-item">
                            <div className="detail-icon">
                              <FiShoppingBag />
                            </div>
                            <div className="detail-content">
                              <h4>Total Purchases</h4>
                              <p>{custData.totalPurchases || "0"}</p>
                            </div>
                          </div>

                          <div className="detail-item">
                            <div className="detail-icon">
                              <FiCalendar />
                            </div>
                            <div className="detail-content">
                              <h4>Last Purchase Date</h4>
                              <p>
                                {formatDate(custData.lastPurchaseDate) ||
                                  "No purchases yet"}
                              </p>
                            </div>
                          </div>

                          <div className="detail-item">
                            <div className="detail-icon">
                              <FiClock />
                            </div>
                            <div className="detail-content">
                              <h4>Account Created</h4>
                              <p>{formatDate(custData.createdAt)}</p>
                            </div>
                          </div>

                          <div className="detail-item">
                            <div className="detail-icon">
                              <FiInfo />
                            </div>
                            <div className="detail-content">
                              <h4>Notes</h4>
                              <p>{custData.notes || "No notes available"}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Purchased Products View */}
                {activeTab === "products" && (
                  <div className="cust-products-view">
                    <div className="products-header">
                      <div className="products-header-top">
                        <h2>
                          <FiShoppingBag /> Purchased Products
                        </h2>
                        <button 
                          className="filter-toggle-btn"
                          onClick={() => setShowFilterPanel(!showFilterPanel)}
                        >
                          <FiFilter /> {showFilterPanel ? 'Hide Filters' : 'Filter'}
                        </button>
                      </div>
                      
                      <div className="products-header-bottom">
                        <p className="products-count">
                          Showing {filteredBills.reduce((total, bill) => total + bill.items.length, 0)} of {purchasedbills.reduce((total, bill) => total + bill.items.length, 0)} items
                        </p>
                      </div>

                      {showFilterPanel && (
                        <div className="filter-panel">
                          <div className="filter-group">
                            <label>Date Range:</label>
                            <select 
                              value={dateFilter} 
                              onChange={(e) => setDateFilter(e.target.value)}
                              className="filter-select"
                            >
                              <option value="all">All Time</option>
                              <option value="today">Today</option>
                              <option value="week">Last 7 Days</option>
                              <option value="month">Last 30 Days</option>
                              <option value="year">Last Year</option>
                              <option value="custom">Custom Range</option>
                            </select>
                          </div>

                          {dateFilter === "custom" && (
                            <div className="filter-group custom-date-range">
                              <label>Custom Range:</label>
                              <div className="date-inputs">
                                <input
                                  type="date"
                                  value={customStartDate}
                                  onChange={(e) => setCustomStartDate(e.target.value)}
                                  className="date-input"
                                />
                                <span>to</span>
                                <input
                                  type="date"
                                  value={customEndDate}
                                  onChange={(e) => setCustomEndDate(e.target.value)}
                                  className="date-input"
                                  min={customStartDate}
                                />
                              </div>
                            </div>
                          )}

                          <div className="filter-actions">
                            <button className="apply-filter-btn" onClick={applyFilters}>
                              Apply Filters
                            </button>
                            <button className="reset-filter-btn" onClick={resetFilters}>
                              Reset
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="cust-products-list">
                      {filteredBills.length > 0 ? (
                        filteredBills.map((bill, billIndex) => (
                          <div key={bill._id || billIndex}>
                            <h4 className="bill-heading">
                              Bill #{billIndex + 1} - {formatDate(bill.createdAt)}
                            </h4>
                            {bill.items.map((product, productIndex) => (
                              <div
                                key={product.productId || productIndex}
                                className="cust-product-card"
                              >
                                <div className="cust-product-header">
                                  <img src={product.image} alt="Product" />
                                  <h3 className="cust-product-name">
                                    {product.name}
                                  </h3>
                                  <span className="cust-view-det-btn" onClick={handleviewdetails}>
                                    View Details
                                  </span>
                                </div>
                                <div className="cust-product-details">
                                  <div className="cust-product-container">
                                    <div className="cust-prod-content">
                                      <p className="cust-product-category">
                                        <FiTag /> {product.category}
                                      </p>
                                      <p className="cust-product-quantity">
                                        <FiPackage /> Qty: {product.quantity}
                                      </p>
                                    </div>
                                    <div className="cust-prod-content">
                                      <p className="cust-product-price">
                                        <FiDollarSign /> ₹
                                        {product.unitPrice?.toFixed(2)}
                                      </p>
                                      <p className="cust-product-date">
                                        <FiCalendar />{" "}
                                        {formatDate(bill.createdAt)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))
                      ) : (
                        <div className="no-products-message">
                          <p>No purchases found for the selected time period.</p>
                          {purchasedbills.length > 0 && (
                            <button className="reset-filter-btn" onClick={resetFilters}>
                              Reset Filters
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading customer data...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCustomers;