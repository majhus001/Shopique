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
import { FiUser, FiMail, FiPhone, FiHome, FiMapPin, FiFileText, FiDownload, FiArrowLeft, FiInfo, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

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
  const [statusMessage, setStatusMessage] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

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
    if (!stateOrders) {
      fetchOrderData();
    }

    // Log data for debugging
    if (orderedUser && order) {
      console.log("User data available:", orderedUser);
      console.log("Order data available:", order);
    } else {
      console.log("Missing data - User:", orderedUser, "Order:", order);
    }
  }, []);

  const generatePDF = async () => {
    if (!orderedUser || !order) {
      setStatusMessage({
        type: 'error',
        text: 'No user data available to generate report.'
      });
      return;
    }

    try {
      setIsGenerating(true);
      setStatusMessage({
        type: 'info',
        text: 'Generating PDF report, please wait...'
      });
      console.log("Generating PDF for user:", orderedUser.username);

      // Create a hidden div for the report
      const reportContainer = document.createElement("div");
      reportContainer.style.padding = "30px";
      reportContainer.style.backgroundColor = "#fff";
      reportContainer.style.width = "700px";
      reportContainer.style.fontFamily = "Arial, sans-serif";
      reportContainer.style.position = "absolute";
      reportContainer.style.left = "-9999px";
      reportContainer.innerHTML = generateReportHTML(orderedUser, order);

      // Append to body
      document.body.appendChild(reportContainer);

      try {
        // Use html2canvas with better options
        const canvas = await html2canvas(reportContainer, {
          scale: 2, // Higher scale for better quality
          useCORS: true,
          logging: true,
          backgroundColor: "#ffffff"
        });

        // Create PDF
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

        // Save the PDF
        pdf.save(`UserReport_${orderedUser.username}_${new Date().getTime()}.pdf`);
        console.log("PDF generated successfully");

        // Show success message
        setStatusMessage({
          type: 'success',
          text: 'PDF report generated successfully!'
        });
        setShowSuccess(true);

        // Reset success message after 5 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 5000);
      } catch (canvasError) {
        console.error("Error generating canvas:", canvasError);
        setStatusMessage({
          type: 'error',
          text: 'Failed to generate PDF. Please try again.'
        });
      } finally {
        // Clean up
        document.body.removeChild(reportContainer);
        setIsGenerating(false);
      }
    } catch (error) {
      console.error("Error in PDF generation:", error);
      setIsGenerating(false);
      setStatusMessage({
        type: 'error',
        text: 'An error occurred while generating the PDF. Please try again.'
      });
    }
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
            <div className="report-header">
              <FiFileText className="report-icon" />
              <h2 className="report-title">Generate User Report</h2>
            </div>

            {statusMessage && (
              <div className={`status-message ${statusMessage.type}`}>
                {statusMessage.type === 'success' && <FiCheckCircle />}
                {statusMessage.type === 'error' && <FiAlertCircle />}
                {statusMessage.type === 'info' && <FiInfo />}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {showSuccess && (
              <div className="success-checkmark">
                <div className="check-icon">
                  <span className="icon-line line-tip"></span>
                  <span className="icon-line line-long"></span>
                  <div className="icon-circle"></div>
                  <div className="icon-fix"></div>
                </div>
              </div>
            )}

            {orderedUser && order ? (
              <div className="enhanced-user-card">
                <div className="user-card-header">
                  <h3 className="user-card-title">
                    <FiUser /> Customer Information
                  </h3>
                  <p className="user-card-subtitle">Order details for delivery label</p>
                </div>

                <div className="user-info-table">
                  <div className="user-info-row">
                    <div className="user-info-cell">
                      <div className="info-icon"><FiFileText /></div>
                      <div className="info-content">
                        <div className="info-label">Order ID</div>
                        <div className="info-value">{order._id || "N/A"}</div>
                      </div>
                    </div>

                    <div className="user-info-cell">
                      <div className="info-icon"><FiUser /></div>
                      <div className="info-content">
                        <div className="info-label">Customer Name</div>
                        <div className="info-value">{orderedUser.username || "N/A"}</div>
                      </div>
                    </div>
                  </div>

                  <div className="user-info-row">
                    <div className="user-info-cell">
                      <div className="info-icon"><FiMail /></div>
                      <div className="info-content">
                        <div className="info-label">Email Address</div>
                        <div className="info-value">{orderedUser.email || "N/A"}</div>
                      </div>
                    </div>

                    <div className="user-info-cell">
                      <div className="info-icon"><FiPhone /></div>
                      <div className="info-content">
                        <div className="info-label">Phone Number</div>
                        <div className="info-value">{orderedUser.mobile || "N/A"}</div>
                      </div>
                    </div>
                  </div>

                  <div className="user-info-row full-width">
                    <div className="user-info-cell">
                      <div className="info-icon"><FiHome /></div>
                      <div className="info-content">
                        <div className="info-label">Delivery Address</div>
                        <div className="info-value address-value">{orderedUser.address || "N/A"}</div>
                      </div>
                    </div>
                  </div>

                  <div className="user-info-row">
                    <div className="user-info-cell">
                      <div className="info-icon"><FiMapPin /></div>
                      <div className="info-content">
                        <div className="info-label">Pincode</div>
                        <div className="info-value">{order.pincode || "N/A"}</div>
                      </div>
                    </div>

                    <div className="user-info-cell">
                      <div className="info-icon"><FiFileText /></div>
                      <div className="info-content">
                        <div className="info-label">Order Date</div>
                        <div className="info-value">{new Date().toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  className="download-btn"
                  onClick={generatePDF}
                  disabled={isGenerating}
                  style={{
                    color: '#fff',
                    cursor: 'pointer',
                    border: 'none',
                    marginTop: '30px'
                  }}
                >
                  {isGenerating ? (
                    <>
                      <span className="spinner"></span> Generating PDF...
                    </>
                  ) : (
                    <>
                      <FiDownload /> Download PDF Report
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="no-data-container">
                <p className="no-data-text">
                  No user data available to generate report.
                </p>
                <p className="help-text">
                  Please make sure you navigate to this page from the order details page.
                </p>
              </div>
            )}



            <div className="buttons-container">
              <button className="back-btn" onClick={handleBack}>
                <FiArrowLeft /> Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateUserReport;
