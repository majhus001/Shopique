import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./GenerateUserReport.css"; // Importing external CSS
import Adnavbar from "../Adnavbar/Adnavbar";
import Sidebar from "../sidebar/Sidebar";

const GenerateUserReport = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const stateUser = location.state?.user || null;
  const stateOrders = location.state?.orders || null;

  const orderedUser = location.state?.ordereduser || null;
  const orderId = location.state?.orderId || null;

  const [user, setUser] = useState(stateUser);
  const [orders, setOrders] = useState(stateOrders);

  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = () => {
    if (!orderedUser) {
      alert("No user data available to generate report.");
      return;
    }

    setIsGenerating(true);

    const reportContainer = document.createElement("div");
    reportContainer.style.padding = "20px";
    reportContainer.style.backgroundColor = "#fff";
    reportContainer.style.width = "600px";

    reportContainer.innerHTML = `
      <h1 style="text-align:center; color:#333;">User Report</h1>
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
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`UserReport_${orderedUser.username}.pdf`);

      document.body.removeChild(reportContainer);
      setIsGenerating(false);
    });
  };

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
            <div className="admin-info">
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </header>
          <div className="report-container">
            <h2 className="report-title">Generate User Report</h2>
            {orderedUser ? (
              <>
                <div className="user-details">
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
                </div>
                <button
                  className="download-btn"
                  onClick={generatePDF}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generating..." : "Download PDF Report"}
                </button>
              </>
            ) : (
              <p className="no-data-text">
                No user data available to generate report.
              </p>
            )}
            <button className="back-btn" onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateUserReport;
