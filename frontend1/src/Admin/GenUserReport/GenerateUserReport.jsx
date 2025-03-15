import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./GenerateUserReport.css"; // External CSS
import Adnavbar from "../Adnavbar/Adnavbar";
import Sidebar from "../sidebar/Sidebar";
import axios from "axios";
import { API_BASE_URL } from "../../api"; // Assuming you have config

const GenerateUserReport = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const stateUser = location.state?.user || null;
  const stateOrders = location.state?.orders || null;
  const orderedUser = location.state?.ordereduser || null;
  const orderId = location.state?.orderId || null;

  const [user] = useState(stateUser);
  const [orders] = useState(stateOrders);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = () => {
    if (!orderedUser) {
      alert("No user data available to generate report.");
      return;
    }

    setIsGenerating(true);

    const reportContainer = document.createElement("div");
    reportContainer.style.padding = "30px";
    reportContainer.style.backgroundColor = "#fff";
    reportContainer.style.width = "700px";
    reportContainer.style.fontFamily = "Arial, sans-serif";
    reportContainer.innerHTML = `
      <h1 style="text-align:center; color:#333; margin-bottom:20px;">User Report</h1>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Name:</strong> ${orderedUser.username}</p>
      <p><strong>Email:</strong> ${orderedUser.email}</p>
      <p><strong>Phone:</strong> ${orderedUser.mobile}</p>
      <p><strong>Address:</strong> ${orderedUser.address}</p>
    `;

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
    if (window.confirm("Are you sure you want to go back?")) {
      navigate(-1);
    }
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
                  <strong>Order ID:</strong> {orderId}
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
                <button
                  className={`download-btn ${isGenerating ? "disabled-btn" : ""}`}
                  onClick={generatePDF}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generating..." : "Download PDF Report"}
                </button>
              </div>
            ) : (
              <p className="no-data-text">No user data available to generate report.</p>
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
