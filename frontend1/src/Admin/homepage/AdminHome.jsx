import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./AdminHome.css";
import Adnavbar from "../Adnavbar/Adnavbar";
import API_BASE_URL from "../../api";
import Sidebar from "../sidebar/Sidebar";

const AdminHome = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const stateUser = location.state?.user || null;
  const stateOrders = location.state?.orders || null;

  const [user, setUser] = useState(stateUser);
  const [orders, setOrders] = useState(stateOrders);
  const [userData, setUserData] = useState([]);
  const [recactivity, setRecactivity] = useState([]);
  const [pendingOrders, setUsersPendingOrder] = useState([]);
  const [mobileprod, setMobileProducts] = useState([]);
  const [clothprod, setClothProducts] = useState([]);
  const [homeappliprod, setHomeAppliProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUserData = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch order data from backend if not available in state
  const fetchOrderData = async () => {
    try {
      setLoading(true);
      const OrdersRes = await axios.get(
        `${API_BASE_URL}/api/admin/pendingorders`
      );
      setOrders(OrdersRes.data);
      setUsersPendingOrder(
        OrdersRes.data.filter((order) => order.OrderStatus === "Pending")
      );
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchOrderData();
  }, []);

  // Fetch other required data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          userDataRes,
          userRecActRes,
          mobileProdRes,
          clothProdRes,
          homeAppliRes,
        ] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/admin/userdata`),
          axios.get(`${API_BASE_URL}/api/user/reactivity/fetch`),
          axios.get(`${API_BASE_URL}/api/admin/fetchmobiles`),
          axios.get(`${API_BASE_URL}/api/admin/fetchcloths`),
          axios.get(`${API_BASE_URL}/api/admin/fetchhomeappliance`),
        ]);

        setUserData(userDataRes.data);
        setRecactivity(userRecActRes.data);
        setMobileProducts(mobileProdRes.data);
        setClothProducts(clothProdRes.data);
        setHomeAppliProducts(homeAppliRes.data);
      } catch (err) {
        console.error("Error fetching additional data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

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

  const handleUsemanclk = () =>
    navigate("/userman", { state: { user, orders } });
  const handleOrderclk = () =>
    navigate("/adorders", { state: { user, orders } });
  const handleProdclk = () =>
    navigate("/adprodlist", { state: { user, orders } });

  const handleRecentActivityClick = () => {
    navigate("/recentactivity", { state: { user, orders, recactivity } });
  };
  const handlesbclk = () => {
    navigate("/sidebar", { state: { user, orders } });
  };

  return (
    <div style={{ cursor: loading ? "wait" : "default" }}>
      <div className="ad-nav">
        <Adnavbar user={user} />
      </div>
      <div className="admin-container">
        <Sidebar user={user} orders={orders} />

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
            <div className="ad-det-card" onClick={handleUsemanclk}>
              <h3>Total Users</h3>
              <p>{userData.length}</p>
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

          <section
            className="recent-activity ad-det-card"
            onClick={handleRecentActivityClick}
            style={{ cursor: "pointer" }}
          >
            <h2>Recent Activity</h2>
            <ul>
              {recactivity.slice(0, 5).map((item, index) => (
                <li key={index}>
                  User <strong>{item.username}</strong> {item.activity} on{" "}
                  {new Date(item.createdAt).toLocaleString()}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
