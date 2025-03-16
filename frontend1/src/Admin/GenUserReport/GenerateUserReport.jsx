import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./GenerateUserReport.css"; // External CSS
import Adnavbar from "../Adnavbar/Adnavbar";
import Sidebar from "../sidebar/Sidebar";
import axios from "axios";
import API_BASE_URL from "../../api"; // Assuming you have config
import { generateReportHTML } from "./ReportTemplate";

const GenerateUserReport = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const stateUser = location.state?.user || null;
  const stateOrders = location.state?.orders || null;
  const orderedUser = location.state?.orduser || null;
  const order = location.state?.order || null;

  const [user, setUser] = useState(stateUser);
  const [orders, setOrders] = useState(stateOrders);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchUserData = async () => {
    try {
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
    } catch (error) {
      console.error("Error fetching user:", error);
      navigate("/login");
    }
  };

  // Function to fetch order data from backend if not available in state
  const fetchOrderData = async () => {
    try {
      const OrdersRes = await axios.get(
        `${API_BASE_URL}/api/admin/pendingorders`
      );
      setOrders(OrdersRes.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchOrderData();
  }, []);

  const generatePDF = async () => {
    if (!orderedUser) {
      alert("No user data available to generate report.");
      return;
    }

    setIsGenerating(true);

    // ✅ Generate PDF now
    const reportContainer = document.createElement("div");
    reportContainer.style.padding = "30px";
    reportContainer.style.backgroundColor = "#fff";
    reportContainer.style.width = "700px";
    reportContainer.style.fontFamily = "Arial, sans-serif";
    reportContainer.innerHTML = generateReportHTML(orderedUser, order);

    document.body.appendChild(reportContainer);

    html2canvas(reportContainer).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`UserReport_${orderedUser.username}.pdf`);

      document.body.removeChild(reportContainer);
      setIsGenerating(false);
    });
  };

  // ✅ Handle Logout
  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      navigate("/home");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div>
      <div className="ad-nav">
        <Adnavbar user={user} />
      </div>
      <div className="admin-container">
        <Sidebar user={user} orders={orders} />
        <div className="main-content">
          <header className="admin-header">
            <h1>Order Details</h1>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </header>

          <div className="report-container">
            <h2 className="report-title">Generate User Report</h2>

            {orderedUser ? (
              <div className="user-card">
                <p>
                  <strong>Order ID:</strong> {order._id}
                </p>
                <p>
                  <strong>Name:</strong> {orderedUser.username}
                </p>
                <p>
                  <strong>Email:</strong> {orderedUser.email}
                </p>
                <p>
                  <strong>Phone:</strong> {orderedUser.mobile}
                </p>
                <p>
                  <strong>Address:</strong> {orderedUser.address}
                </p>
                <p>
                  <strong>Pincode:</strong> {order.pincode}
                </p>
                
                <button
                  className={`download-btn ${
                    isGenerating ? "disabled-btn" : ""
                  }`}
                  onClick={generatePDF}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generating..." : "Download PDF Report"}
                </button>
                </div>
            ) : (
              <p className="no-data-text">
                No user data available to generate report.
              </p>
            )}

            <button className="back-btn" onClick={handleBack}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateUserReport;
