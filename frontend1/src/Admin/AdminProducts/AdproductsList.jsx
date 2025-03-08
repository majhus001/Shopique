import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./AdproductsList.css";
import Adnavbar from "../Adnavbar/Adnavbar";
import API_BASE_URL from "../../api";

const AdproductsList = () => {
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
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("mobiles"); // Initial category

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



  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [mobileProdRes, clothProdRes, homeAppliRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/admin/fetchmobiles`),
          axios.get(`${API_BASE_URL}/api/admin/fetchcloths`),
          axios.get(`${API_BASE_URL}/api/admin/fetchhomeappliance`),
        ]);
        setMobileProducts(mobileProdRes.data);
        setClothProducts(clothProdRes.data);
        setHomeAppliProducts(homeAppliRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category); // Set the selected category on toggle
  };

  return (
    <div style={{ cursor: loading ? "wait" : "default" }}>
      <div>
        <Adnavbar user={user} />
      </div>
      <div className="ad-prod-tit">
        <div className="ad-se-group">
          <label>
            <strong>Category :</strong>
          </label>
          <select
            name="category"
            required
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="mobiles">Mobiles</option>
            <option value="clothings">Clothings</option>
            <option value="hoappliances">Home Appliances</option>
          </select>
        </div>
        <button
          onClick={() => {
            navigate("/adprod");
          }}
        >
          Add Products
        </button>
      </div>

      <div className="ad-prod-dis">
        <h2>Products</h2>
        {selectedCategory === "mobiles" && (
          <div className="ad-prod-list">
            {mobileprod.length ? (
              mobileprod.map((product) => (
                <div key={product.id} className="ad-prod-card">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="ad-prod-img"
                  />
                  <div className="ad-prod-lt-det">
                    <div>
                      <p>
                        <strong>Name:</strong>
                      </p>
                      <p>
                        <strong>Brand:</strong>
                      </p>
                      <p>
                        <strong>Price ₹:</strong>
                      </p>
                      <p>
                        <strong>Stock:</strong>
                      </p>
                      <p>
                        <strong>Ratings:</strong>
                      </p>
                    </div>
                    <div className="ad-prod-lt-det-dt">
                      <p>{product.name}</p>
                      <p>{product.brand}</p>
                      <p>{product.price}</p>
                      <p>{product.stock}</p>
                      <p>{product.rating}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No mobile products available.</p>
            )}
          </div>
        )}

        {selectedCategory === "clothings" && (
          <div className="ad-prod-list">
            {clothprod.length ? (
              clothprod.map((product) => (
                <div key={product.id} className="ad-prod-card">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="ad-prod-img"
                  />
                  <div className="ad-prod-lt-det">
                    <div>
                      <p>
                        <strong>Name:</strong>
                      </p>
                      <p>
                        <strong>Brand:</strong>
                      </p>
                      <p>
                        <strong>Price ₹:</strong>
                      </p>
                      <p>
                        <strong>Stock:</strong>
                      </p>
                      <p>
                        <strong>Ratings:</strong>
                      </p>
                    </div>
                    <div className="ad-prod-lt-det-dt">
                      <p>{product.name}</p>
                      <p>{product.brand}</p>
                      <p>{product.price}</p>
                      <p>{product.stock}</p>
                      <p>{product.rating}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No clothing products available.</p>
            )}
          </div>
        )}

        {selectedCategory === "hoappliances" && (
          <div className="ad-prod-list">
            {homeappliprod.length ? (
              homeappliprod.map((product) => (
                <div key={product.id} className="ad-prod-card">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="ad-prod-img"
                  />
                  <div className="ad-prod-lt-det">
                    <div>
                      <p>
                        <strong>Name:</strong>
                      </p>
                      <p>
                        <strong>Brand:</strong>
                      </p>
                      <p>
                        <strong>Price ₹:</strong>
                      </p>
                      <p>
                        <strong>Stock:</strong>
                      </p>
                      <p>
                        <strong>Ratings:</strong>
                      </p>
                    </div>
                    <div className="ad-prod-lt-det-dt">
                      <p>{product.name}</p>
                      <p>{product.brand}</p>
                      <p>{product.price}</p>
                      <p>{product.stock}</p>
                      <p>{product.rating}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No home appliances available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdproductsList;
