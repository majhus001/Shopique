import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./AdminHome.css";
import Adnavbar from "../Adnavbar/Adnavbar";
import API_BASE_URL from "../../api";

const AdminHome = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const stateUser = location.state?.user || null;
  const stateOrders = location.state?.orders || null;

  // State for user and orders
  const [user, setUser] = useState(stateUser);
  const [orders, setOrders] = useState(stateOrders);
  const [userData, setUserData] = useState([]);
  const [pendingOrders, setUsersPendingOrder] = useState([]);
  const [mobileprod, setMobileProducts] = useState([]);
  const [clothprod, setClothProducts] = useState([]);
  const [homeappliprod, setHomeAppliProducts] = useState([]);

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

  // Fetch other required data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userDataRes, mobileProdRes, clothProdRes, homeAppliRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/admin/userdata`),
          axios.get(`${API_BASE_URL}/api/admin/fetchmobiles`),
          axios.get(`${API_BASE_URL}/api/admin/fetchcloths`),
          axios.get(`${API_BASE_URL}/api/admin/fetchhomeappliance`),
        ]);

        setUserData(userDataRes.data);
        setMobileProducts(mobileProdRes.data);
        setClothProducts(clothProdRes.data);
        setHomeAppliProducts(homeAppliRes.data);
      } catch (err) {
        console.error("Error fetching additional data:", err);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
      console.log(response.data.message);
      navigate("/home");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleDashclk = () => navigate("/adhome", { state: { user, orders } });
  const handleprofileclk = () => navigate("/adprof", { state: { user, orders } });
  const handleUsemanclk = () => navigate("/userman", { state: { user, orders } });
  const handleOrderclk = () => navigate("/adorders", { state: { user, orders } });
  const handleProdclk = () => navigate("/adprodlist", { state: { user, orders } });

  return (
    <div>
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
              <li><button className="ad-sb-btns" onClick={handleDashclk}>Dashboard</button></li>
              <li><button className="ad-sb-btns" onClick={handleprofileclk}>Profile</button></li>
              <li><button className="ad-sb-btns" onClick={handleUsemanclk}>User Management</button></li>
              <li><button className="ad-sb-btns" onClick={handleOrderclk}>Orders</button></li>
              <li><button className="ad-sb-btns" onClick={handleProdclk}>Products</button></li>
              <li><button className="ad-sb-btns">Settings</button></li>
            </ul>
          </div>
        </div>

        <div className="main-content">
          <header className="admin-header">
            <h1>Welcome to the Admin Dashboard</h1>
            <div className="admin-info">
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          </header>

          <div className="admin-dashboard">
            <div className="ad-det-card" onClick={handleUsemanclk}>
              <h3>Total Users</h3>
              <p>{userData.length}</p>
            </div>
            <div className="ad-det-card" onClick={handleProdclk}>
              <h3>Total Products</h3>
              <p>{mobileprod.length + clothprod.length + homeappliprod.length}</p>
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
