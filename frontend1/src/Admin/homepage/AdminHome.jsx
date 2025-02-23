import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./AdminHome.css"; // Updated CSS file
import Adnavbar from "../Adnavbar/Adnavbar";
import API_BASE_URL from "../../api";

const AdminHome = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, user } = location.state || {};
  const [userData, setUserData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [pendingOrders, setUsersPendingOrder] = useState([]);
  const [mobileprod, setMobileProducts] = useState([]);
  const [clothprod, setClothProducts] = useState([]);
  const [homeappliprod, setHomeAppliProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          userDataRes,
          OrdersRes,
          mobileProdRes,
          clothProdRes,
          homeAppliRes,
        ] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/admin/userdata`),
          axios.get(`${API_BASE_URL}/api/admin/pendingorders`),
          axios.get(`${API_BASE_URL}/api/admin/fetchmobiles`),
          axios.get(`${API_BASE_URL}/api/admin/fetchcloths`),
          axios.get(`${API_BASE_URL}/api/admin/fetchhomeappliance`),
        ]);

        setUserData(userDataRes.data);
        setOrders(OrdersRes.data);
        setUsersPendingOrder(
          OrdersRes.data.filter((order) => order.OrderStatus === "Pending")
        );
        setMobileProducts(mobileProdRes.data);
        setClothProducts(clothProdRes.data);
        setHomeAppliProducts(homeAppliRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

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
            <h1>Welcome to the Admin Dashboard</h1>
            <div className="admin-info">
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </header>

          <div className="admin-dashboard">
            <div className="ad-det-card">
              <div onClick={handleUsemanclk}>
                <h3>Total Users</h3>
                <p>{userData.length}</p>
              </div>
            </div>
            <div className="ad-det-card" onClick={handleProdclk}>
              <h3>Total Products</h3>
              <p>
                {mobileprod.length + clothprod.length + homeappliprod.length}
              </p>
            </div>
            <div className="ad-det-card" onClick={handleOrderclk}>
              <h3>Pending Orders</h3>
              <p>{pendingOrders.length}</p>
            </div>
            <div className="ad-det-card">
              <h3>Reports</h3>
              <p>View Reports</p>
            </div>
          </div>

          <section className="recent-activity">
            <h2>Recent Activity</h2>
            <ul>
              <li>User John Doe updated their profile.</li>
              <li>Product 'Laptop X' added to inventory.</li>
              <li>Order #12345 shipped.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
