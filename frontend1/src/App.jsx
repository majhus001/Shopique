import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Helmet } from "react-helmet-async";

import SignUp from "./LogSin/SignUp";
import Login from "./LogSin/Login";
import Searchproducts from "./screens/searchproducts/Searchproducts";
import HomePage from "./screens/Homepage/HomePage";
import ProductList from "./screens/Productscreens/ProductList";
import Cart from "./screens/CartScreen/Cart";
import Orderdetails from "./screens/Order/OrderCheckout";
import ProfilePage from "./screens/profiledetails/ProfilePage";
import Orderhistory from "./screens/Order/Orderhistory";
import Buynow from "./screens/BuyNowScreen/Buynow";
import ScrollToTop from "./ScrollToTop";
import AuthRequired from "./components/Authentication/AuthRequired";
import NotFound from "./NotFound/NotFound";
import AllProducts from "./screens/AllProducts/AllProducts";

const App = () => {
  return (
    <HelmetProvider>
      <Helmet>
        <meta
          name="google-site-verification"
          content="Iy_amYAduLvgypc42lB31DAHZcz59D4KqJHUHrLF8JE"
        />
      </Helmet>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/auth/signup" element={<SignUp />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/allproducts" element={<AllProducts />} />
          <Route
            path="/products/:category/:subCategory/:name/:id"
            element={<ProductList />}
          />
          <Route path="/user/myorders" element={<Orderhistory />} />
          <Route path="/user/cart" element={<Cart />} />
          <Route path="/user/profile" element={<ProfilePage />} />
          <Route
            path="/products/search/:category/:subCategory/:name/:id?"
            element={<Searchproducts />}
          />
          <Route path="/user/:userId/product/buynow" element={<Buynow />} />
          <Route
            path="/user/:userId/order/checkout"
            element={<Orderdetails />}
          />
          <Route path="/authentication" element={<AuthRequired />} />
          <Route path="/not-found" element={<NotFound />} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
};

export default App;
