import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import handleLogout from "../../utils/Logout";
import userimg from "../../assets/users/user.png";
import {
  FaUser,
  FaMoneyCheck,
  FaBox,
  FaSignOutAlt,
  FaSignInAlt,
  FaShoppingCart,
} from "react-icons/fa";

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  });

  const handleNavigation = (path) => {
    if (path === "profile") {
      navigate(`/user/${user?._id || "unauthorized"}/profile`);
    } else if (path === "myorders") {
      navigate(`/user/${user?._id || "unauthorized"}/myorders`);
    } else if (path === "cart") {
      navigate(`/user/${user?._id || "unauthorized"}/cart`);
    } else {
      navigate(`${path}`);
    }
  };

  const handleLogoutUser = async () => {
    const logout = handleLogout(dispatch);
    if (logout) {
      navigate("/home");
    } else {
      toast.error("unable to logout");
    }
  };

  return (
    <>
      <div className="sidebar">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnHover
          draggable
          theme="colored"
        />
        {!user ? (
          <div className="sidebar-auth-prompt">
            <p>Please login to access your account</p>
            <button className="sidebar-btn" onClick={() => navigate("/login")}>
              <FaSignInAlt />
              <span>Login</span>
            </button>
          </div>
        ) : (
          <>
            {isLoading ? (
              <div className="sidebar-loading">Loading...</div>
            ) : (
              <div className="sidebar-user">
                <img
                  src={user?.image || userimg}
                  alt="profile"
                  className="sidebar-user-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/default-profile.png";
                  }}
                />
                <h4 className="sidebar-user-name">{user.username || "User"}</h4>
                <p className="sidebar-user-email">{user?.email || ""}</p>
              </div>
            )}

            <nav className="sidebar-nav">
              <button
                className="sidebar-btn"
                onClick={() => handleNavigation("profile")}
              >
                <FaUser />
                <span>Profile</span>
              </button>
              <button
                className="sidebar-btn"
                onClick={() => handleNavigation("cart")}
              >
                <FaShoppingCart />
                <span>Cart</span>
              </button>
              <button
                className="sidebar-btn"
                onClick={() => handleNavigation("myorders")}
              >
                <FaBox />
                <span>My Orders</span>
              </button>
              <button
                className="sidebar-btn"
                onClick={() => handleNavigation("settings")}
              >
                <FaMoneyCheck />
                <span>Payments</span>
              </button>
              <button
                className="sidebar-btn sidebar-logout"
                onClick={handleLogoutUser}
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </nav>
          </>
        )}
      </div>
    </>
  );
};

export default Sidebar;
