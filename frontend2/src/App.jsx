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
import AddProducts from "./Admin/AdminProducts/AddProducts";
import Customers from "./Admin/Customers/Customers";
import Employees from "./Admin/Employees/Employees";
import AddEmployee from "./Admin/Employees/AddEmployee";
import EmpDash from "./Employees/Dashboard/EmpDash";
const App = () => {
  return (
    <Router>
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
         <Route path="/recentactivity" element={<RecentActivity />} />
         <Route path="/generateuserreport" element={<GenerateUserReport />} />
         <Route path="/reports" element={<Reports />} />
         <Route path="/billing" element={<Billing />} />
         <Route path="/recentbillings" element={<RecentBills />} />
         <Route path="/addproducts" element={<AddProducts />} /> 
         <Route path="/customers" element={<Customers />} /> 
         <Route path="/employees" element={<Employees />} /> 
         <Route path="/addemployees" element={<AddEmployee />} /> 
         <Route path="/empdash" element={<EmpDash />} /> 
        
      </Routes>
    </Router>
  );
};

export default App;
