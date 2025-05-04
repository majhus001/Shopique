import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminHome from "./Admin/homepage/AdminHome";
import Adnavbar from "./Admin/Adnavbar/Adnavbar";
import Adminorders from "./Admin/Adminorders/Adminorders";
import Adminprofile from "./Admin/Adminprofile/Adminprofile";
import UserManagement from "./Admin/AdminUserman/UserManagement";
import Userhistory from "./Admin/AdminUserman/Userhistory";
import AdproductsList from "./Admin/AdminProducts/AdproductsList";
import RecentActivity from "./Admin/homepage/RecentActivity/RecentActivity";
import Sidebar from "./Admin/sidebar/Sidebar";
import GenerateUserReport from "./Admin/GenUserReport/GenerateUserReport";
import Reports from "./Admin/GenUserReport/Reports";
import Billing from "./Admin/Billing/Billing";

import Login from "./LogSin/Login";
import SignUp from "../../frontend1/src/LogSin/SignUp";
import RecentBills from "./Admin/Billing/RecentBills";
import AddProducts from "./Admin/AdminProducts/AddProducts";
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        <Route path="/adhome" element={<AdminHome />} />
        <Route path="/adprod" element={<ProductAddPage />} />
        <Route path="/adprodlist" element={<AdproductsList />} />
        <Route path="/adorders" element={<Adminorders />} />
        <Route path="/adnavbar" element={<Adnavbar />} />
        <Route path="/adprof" element={<Adminprofile />} />
        <Route path="/userman" element={<UserManagement />} />
        <Route path="/aduserhis" element={<Userhistory />} />
        <Route path="/recentactivity" element={<RecentActivity />} />
        <Route path="/sidebar" element={<Sidebar />} />
        <Route path="/generateuserreport" element={<GenerateUserReport />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/recentbillings" element={<RecentBills />} />
        <Route path="/addproducts" element={<AddProducts />} />
      </Routes>
    </Router>
  );
};

export default App;
