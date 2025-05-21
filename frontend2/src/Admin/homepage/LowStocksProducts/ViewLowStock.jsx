import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Adnavbar from "../../Adnavbar/Adnavbar";
import Sidebar from "../../sidebar/Sidebar";
import API_BASE_URL from "../../../api";
import "./ViewLowStock.css";
import {
  FiUsers,
  FiLogOut,
  FiActivity,
  FiStar,
  FiShoppingCart,
  FiTruck,
  FiTag,
  FiInfo,
  FiBox,
  FiLayers,
  FiGift,
} from "react-icons/fi";
import {
  FaTshirt,
  FaMobileAlt,
  FaLaptop,
  FaBook,
  FaUtensils,
  FaGamepad,
  FaGem,
  FaCar,
  FaBaby,
} from "react-icons/fa";

export default function ViewLowStock() {
  const location = useLocation();
  const navigate = useNavigate();

  const initialUser = location.state?.user || null;
  const stateOrders = location.state?.orders || null;
  const product = location.state?.item || null;

  const [user, setUser] = useState(initialUser);
  const [orders, setOrders] = useState(stateOrders);
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isEmployee, setIsEmployee] = useState(false);

  const categoryIcons = {
    clothing: <FaTshirt />,
    mobile: <FaMobileAlt />,
    electronics: <FaLaptop />,
    books: <FaBook />,
    food: <FaUtensils />,
    toys: <FaGamepad />,
    jewelry: <FaGem />,
    automotive: <FaCar />,
    baby: <FaBaby />,
    default: <FiBox />,
  };

  useEffect(() => {
    fetchUserData();
    fetchOrderData();
  }, []);
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/auth/checkvaliduser`, {
        withCredentials: true,
      });

      const loggedInUser = res.data.user;
      if (!loggedInUser) return navigate("/login");

      const isEmp = loggedInUser.role === "Employee";
      setIsEmployee(isEmp);

      const userId = isEmp ? loggedInUser.employeeId : loggedInUser.userId;
      const userResponse = await axios.get(
        `${API_BASE_URL}/api/${isEmp ? "employees" : "auth"}/fetch/${userId}`
      );

      setUser(userResponse.data.data);
    } catch (error) {
      console.error("Error fetching user:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/admin/pendingorders`);
      setOrders(res.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };
  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Product Not Found</h2>
        <p>Please go back and select a product to view details.</p>
      </div>
    );
  }

  // Calculate stock percentage (assuming max stock for visualization is 100)
  const stockPercentage = Math.min(100, (product.stock / 100) * 100);

  const handleLogout = async () => {
    try {
      const empId = user._id;
      const logoutUrl = isEmployee
        ? `${API_BASE_URL}/api/auth/employee/logout/${empId}`
        : `${API_BASE_URL}/api/auth/logout`;

      await axios.post(logoutUrl, {}, { withCredentials: true });
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
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
                <FiActivity className="header-icon" /> Product Stock Details
              </h1>
              <p className="subtitle">Detailed view of product inventory</p>
            </div>

            <div className="admin-info">
              <button className="logout-btn" onClick={handleLogout}>
                <FiLogOut /> Logout
              </button>
            </div>
          </header>

          <section className="product-detail-container">
            {/* Product Header */}
            <div className="product-header">
              <h2>{product.name}</h2>
              <div className="product-meta">
                <span
                  className={`stock-status ${
                    product.stock <= 5
                      ? "low-stock"
                      : product.stock <= 20
                      ? "medium-stock"
                      : "high-stock"
                  }`}
                >
                  {product.stock} in stock
                </span>
                <span className="product-id">ID: {product._id}</span>
              </div>
            </div>

            {/* Main Product Grid */}
            <div className="product-grid">
              {/* Left Column - Images */}
              <div className="product-images">
                {product.images?.length > 0 ? (
                  <div className="image-gallery">
                    <div className="main-image">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://via.placeholder.com/300x300?text=No+Image";
                        }}
                      />
                    </div>
                    <div className="thumbnail-container">
                      {product.images.map((img, index) => (
                        <div key={index} className="thumbnail">
                          <img
                            src={img}
                            alt={`${product.name} ${index + 1}`}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://via.placeholder.com/100x100?text=Thumbnail";
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="no-image">
                    {categoryIcons[product.category?.toLowerCase()] ||
                      categoryIcons.default}
                  </div>
                )}
              </div>

              {/* Middle Column - Basic Info */}
              <div className="product-info">
                <div className="info-card">
                  <h3>
                    <FiInfo /> Product Information
                  </h3>
                  <div className="info-grid">{/* Info items... */}</div>
                </div>
                <div className="description-card">
                  <h3>
                    <FiInfo /> Description
                  </h3>
                  <p>{product.description || "No description available"}</p>
                </div>
              </div>

              {/* Right Column - Stock & Specs */}
              <div className="product-specs">
                <div className="stock-card">
                  <h3>
                    <FiBox /> Inventory Details
                  </h3>
                  <div className="stock-meter">
                    <div
                      className="stock-level"
                      style={{ width: `${stockPercentage}%` }}
                    ></div>
                  </div>
                  {/* Stock info items... */}
                </div>
                {/* Specifications and tags cards... */}
              </div>
            </div>

            {/* Reviews Section */}
            {product.reviews?.length > 0 && (
              <div className="reviews-section">
                <h3>
                  <FiStar /> Customer Reviews
                </h3>
                <div className="reviews-grid">
                  {product.reviews.map((review, index) => (
                    <div className="review-card" key={index}>
                      {/* Review content... */}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
