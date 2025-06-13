import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Adnavbar from "../../Adnavbar/Adnavbar";
import Sidebar from "../../sidebar/Sidebar";
import API_BASE_URL from "../../../api";
import "./ViewStocks.css";
import { FiUsers, FiLogOut, FiActivity } from "react-icons/fi";

export default function ViewStocks() {
  const location = useLocation();
  const navigate = useNavigate();

  const initialUser = location.state?.user || null;
  const stateOrders = location.state?.orders || null;
  const stateproducts = location.state?.productsRes || null;

  const [user, setUser] = useState(initialUser);
  const [orders, setOrders] = useState(stateOrders);
  const [productsRes, setProductsRes] = useState(stateproducts);
  const [lowstock, setLowstock] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isEmployee, setIsEmployee] = useState(false);

  // Filter states
  const [filterStock, setFilterStock] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPrice, setFilterPrice] = useState("");

  useEffect(() => {
    fetchUserData();
    fetchOrderData();
    if (productsRes.length <= 0) {
      fetchProductData();
    } else {
      filterlowstockitems(productsRes);
    }
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

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/products/fetchAll`);
      const allProducts = res.data.data;
      setProductsRes(allProducts);
      filterlowstockitems(allProducts);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterlowstockitems = (allProducts) => {
    const lowStockItems = allProducts.filter((item) => item.stock <= 50);
    setLowstock(lowStockItems.length);
  };

  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

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

  // Filtered products based on user selection
  const filteredProducts = productsRes.filter((item) => {
    if (filterStock && item.stock > parseInt(filterStock)) return false;
    if (filterCategory && item.category !== filterCategory) return false;
    if (filterPrice && item.price > parseInt(filterPrice)) return false;
    return true;
  });

  const handlelowstockview = (item) => {
    console.log(item);
    navigate("/viewproductdetails", {
      state: {
        user,
        orders,
        item,
      },
    });
  };
  const handlelowstockadd = (item) => {
    navigate("/addproducts", {
      state: {
        user,
        orders,
        editProduct: item,
      },
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
        <Sidebar
          user={user}
          orders={orders}
          onCollapsedChange={handleSidebarCollapse}
        />

        <div className="main-content">
          <header className="admin-header-box">
            <div className="header-greeting">
              <h1>
                <FiUsers /> Stock Management
              </h1>
              <p className="subtitle">Manage and monitor product stocks</p>
            </div>
            <h2 className="vs-low-stock-header">Low Products Stock - {lowstock}</h2>
            <div className="admin-info">
              <button className="logout-btn" onClick={handleLogout}>
                <FiLogOut /> Logout
              </button>
            </div>
          </header>

          <section className="recent-activity-section">
            <div className="section-header-box">
              <div className="section-header">
                <h2 className="section-title">All Product Stocks</h2>
              </div>
            </div>

            {/* Filter Section */}
            <div className="filters-container">
              <select
                onChange={(e) => setFilterStock(e.target.value)}
                value={filterStock}
              >
                <option value="">All Stocks</option>
                <option value="50">Stock ≤ 50</option>
                <option value="100">Stock ≤ 100</option>
              </select>

              <select
                onChange={(e) => setFilterCategory(e.target.value)}
                value={filterCategory}
              >
                <option value="">All Categories</option>
                {[...new Set(productsRes.map((item) => item.category))].map(
                  (cat, i) => (
                    <option key={i} value={cat}>
                      {cat}
                    </option>
                  )
                )}
              </select>

              <select
                onChange={(e) => setFilterPrice(e.target.value)}
                value={filterPrice}
              >
                <option value="">All Prices</option>
                <option value="100">Price ≤ 100</option>
                <option value="500">Price ≤ 500</option>
                <option value="100000">Price ≤ 100000</option>
              </select>
            </div>

            <div className="stock-list">
              {filteredProducts.length > 0 ? (
                <ul className="low-stock-ul">
                  <div className="low-stock-title">
                    <li>Items</li>
                    <li>Stocks</li>
                    <li>Category</li>
                    <li>Price</li>
                    <li>Last Purchased</li>
                    <li>Action</li>
                  </div>
                  {filteredProducts.map((item, index) => (
                    <li key={index} className="low-stock-item">
                      <div
                        className="low-stock-info"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/addproducts", {
                            state: {
                              user,
                              orders,
                              editProduct: item,
                            },
                          });
                        }}
                      >
                        <div className="low-stock-info-header">
                          <img
                            className="stock-item-img"
                            src={item.images[0]}
                            alt={item.name}
                          />
                          <strong className="item-name">{item.name}</strong>
                        </div>
                        <span className="item-stock">{item.stock}</span>
                        <strong>
                          {item.category} - {item.subCategory}
                        </strong>
                        <span className="item-stock-price">{item.price}</span>
                        <span>
                          {new Date(item.updatedAt).toLocaleDateString()}
                        </span>
                        <div className="low-stock-action-btn-cont">
                          <span
                            className="low-stock-action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlelowstockview(item);
                            }}
                          >
                            view
                          </span>

                          <span
                            className="low-stock-action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlelowstockadd(item);
                            }}
                          >
                            Add
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="no-stock-msg">
                  <p>No matching products found</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
