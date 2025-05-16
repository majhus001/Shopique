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
} from "react-icons/fi";

const ViewCustomers = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const stateUser = location.state?.user || null;
  const stateCustData = location.state?.custData || null;

  // State for user and customer data
  const [user, setUser] = useState(stateUser);
  const [custData, setCustdata] = useState(stateCustData);
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isEmployee, setisEmployee] = useState(false);
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' or 'products'

  // Static product data
  const staticProducts = [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: 129.99,
      quantity: 1,
      purchasedAt: "2023-05-15T10:30:00Z",
      image: "https://via.placeholder.com/100",
      category: "Electronics",
    },
    {
      id: 2,
      name: "Organic Cotton T-Shirt",
      price: 24.99,
      quantity: 2,
      purchasedAt: "2023-06-20T14:45:00Z",
      image: "https://via.placeholder.com/100",
      category: "Clothing",
    },
    {
      id: 3,
      name: "Stainless Steel Water Bottle",
      price: 19.99,
      quantity: 1,
      purchasedAt: "2023-07-10T09:15:00Z",
      image: "https://via.placeholder.com/100",
      category: "Accessories",
    },
  ];

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

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchCustData();
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
                <FiUser className="header-icon" /> {custData?.username}
              </h1>
              <p className="user-email">
                <FiMail className="email-icon" />{" "}
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
                ({staticProducts.length})
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
                      <h2>
                        <FiShoppingBag /> Purchased Products
                      </h2>
                      <p className="products-count">
                        {staticProducts.length} items purchased
                      </p>
                    </div>

                    <div className="cust-products-list">
                      {staticProducts.map((product) => (
                        <div key={product.id} className="cust-product-card">
                          <div className="cust-product-header">
                            <img src={product.image} alt={"img"} />
                            <h3 className="cust-product-name">
                              {product.name}
                            </h3>
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
                                  <FiDollarSign /> {product.price.toFixed(2)}
                                </p>
                                <p className="cust-product-date">
                                  <FiCalendar />{" "}
                                  {formatDate(product.purchasedAt)}
                                </p>
                              </div>
                              <div>
                                <button className="cust-view-det-btn">
                                  view details
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
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
