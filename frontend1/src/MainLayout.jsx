import React from "react";
import { Outlet, useLocation, matchPath } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import BottomNav from "./components/Bottom Navbar/BottomNav";
import Footer from "./screens/Homepage/Footer/Footer";

const MainLayout = () => {
  const location = useLocation();

  const hideFooterRoutes = [
    "/user/profile",
    "/user/myorders",
    "/user/cart",
    "/user/:userId/product/buynow",
    "/user/:userId/order/checkout",
  ];

  const shouldHideFooter = hideFooterRoutes.some((path) =>
    matchPath({ path, end: false }, location.pathname)
  );

  return (
    <>
      <Navbar />
      <div className="main-container">
        <Outlet />
      </div>
      {!shouldHideFooter && <Footer />}
      <BottomNav />
    </>
  );
};

export default MainLayout;
