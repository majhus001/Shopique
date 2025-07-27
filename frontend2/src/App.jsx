import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminHome from "./Admin/homepage/AdminHome";
import Adnavbar from "./Admin/Adnavbar/Adnavbar";
import Sidebar from "./Admin/sidebar/Sidebar";
import Adminorders from "./Admin/Adminorders/Adminorders";
import Adminprofile from "./Admin/Adminprofile/Adminprofile";
import UserManagement from "./Admin/AdminUserman/UserManagement";
import Userhistory from "./Admin/AdminUserman/Userhistory";
import AdproductsList from "./Admin/AdminProducts/AdproductsList";
import RecentActivity from "./Admin/homepage/RecentActivity/RecentActivity";
import GenerateUserReport from "./Admin/GenUserReport/GenerateUserReport";
import Reports from "./Admin/GenUserReport/Reports";
import Billing from "./Admin/Billing/Billing";
import RecentBills from "./Admin/Billing/RecentBills";


import Login from "./LogSin/Login";
import SignUp from "./LogSin/SignUp";
import AddProducts from "./Admin/AdminProducts/Products/AddProducts";
import Customers from "./Admin/Customers/Customers";
import Employees from "./Admin/Employees/Employees";
import AddEmployee from "./Admin/Employees/AddEmployee";
import EmpDash from "./Employees/Dashboard/EmpDash";
import AdminReports from "./Admin/AdminReports/AdminReports";
import ViewCustormers from "./Admin/Customers/ViewCustormers";
import ViewStocks from "./Admin/homepage/Stockmaintainance/ViewStocks";
import ScrollToTop from "./ScrollToTop";
import EmployeeHistory from "./Admin/Employees/EmployeeHistory";
import ViewProductsDetails from "./Admin/homepage/ProductDetails/ViewProductsDetails";
import ViewDailySales from "./Admin/homepage/Dailysales/ViewDailySales";
import AddCategoryList from "./Admin/AdminProducts/Category/AddCategoryList";
import Banner from "./Admin/Banners/Banner";
const App = () => {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/adnavbar" element={<Adnavbar />} />
        <Route path="/sidebar" element={<Sidebar />} />
        <Route path="/adhome" element={<AdminHome />} />
        <Route path="/adprof" element={<Adminprofile />} />
        <Route path="/adorders" element={<Adminorders />} />
        <Route path="/userman" element={<UserManagement />} />
        <Route path="/aduserhis" element={<Userhistory />} />
        <Route path="/adprodlist" element={<AdproductsList />} />
        <Route path="/addcategorylist" element={<AddCategoryList />} />
        <Route path="/banner" element={<Banner />} />
        <Route path="/recentactivity" element={<RecentActivity />} />
        <Route path="/generateuserreport" element={<GenerateUserReport />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/recentbillings" element={<RecentBills />} />
        <Route path="/addproducts" element={<AddProducts />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/viewcustomers" element={<ViewCustormers />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/addemployees" element={<AddEmployee />} />
        <Route path="/empdash" element={<EmpDash />} />
        <Route path="/adreports" element={<AdminReports />} />
        <Route path="/stockmaintain" element={<ViewStocks />} />
        <Route path="/employeehistory" element={<EmployeeHistory />} />
        <Route path="/viewproductdetails" element={<ViewProductsDetails />} />
        <Route path="/viewdailysales" element={<ViewDailySales />} />
      </Routes>
    </Router>
  );
};

export default App;