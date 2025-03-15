import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Adnavbar from "../Adnavbar/Adnavbar";
import Sidebar from "../sidebar/Sidebar";
import API_BASE_URL from "../../api";
import "./Reports.css";

const Reports = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const stateUser = location.state?.user || null;
  const stateOrders = location.state?.orders || null;

  const [user, setUser] = useState(stateUser);
  const [orders, setOrders] = useState(stateOrders);
  const [reports, setReports] = useState([]);
  const [searchOrderId, setSearchOrderId] = useState("");
  const [loadingOrder, setLoadingOrder] = useState({});
  const [loadingReport, setLoadingReport] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 10;

  // Fetch Reports
  const fetchReportData = async () => {
    try {
      setLoadingReport(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/reports/fetch`
      );
      setReports(response.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoadingReport(false);
    }
  };

  // Check valid user
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

  // Fetch Orders
  const fetchOrderData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/pendingorders`
      );
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchOrderData();
    fetchReportData();
  }, []);

  // Logout function
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

  // Back button
  const handleBack = () => {
    navigate(-1);
  };

  // Generate Report
  const handleGenRep = async (orderId) => {
    try {
      setLoadingOrder((prev) => ({ ...prev, [orderId]: true }));
      const response = await axios.get(`${API_BASE_URL}/api/admin/orduser`, {
        params: { orderId },
      });
      
      const orduser = response.data.user;

      navigate("/generateuserreport", {
        state: { ordereduser: orduser, orderId, user, orders },
      });
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setLoadingOrder((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // Filter reports by Order ID
  const filteredReports = reports.filter((report) =>
    report.orderId
      ?.toString()
      .toLowerCase()
      .startsWith(searchOrderId.toLowerCase())
  );

  // Pagination calculations
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(
    indexOfFirstReport,
    indexOfLastReport
  );
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
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
            <h1>Order Reports</h1>
            <div className="admin-info">
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </header>

          <div className="ad-ord-search-rep">
            <input
              type="text"
              placeholder="Search by Order ID"
              value={searchOrderId}
              onChange={(e) => {
                setSearchOrderId(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
              className="ad-ord-search-input"
            />
            <button className="ad-or-d-btn" onClick={handleBack}>
              Back
            </button>
          </div>

          {loadingReport ? (
            <span className="loader-big"></span>
          ) : currentReports.length > 0 ? (
            <div>
              <div className="report-list">
                {currentReports.map((report, index) => (
                  <div key={index} className="report-card">
                    <div className="report-details">
                      <p>
                        <strong>Order ID:</strong> {report.orderId}
                      </p>
                      <p>
                        <strong>Name:</strong> {report.username}
                      </p>
                    </div>
                    <div className="report-details">
                      <p>
                        <strong>Email:</strong> {report.email}
                      </p>
                      <p>
                        <strong>Address:</strong> {report.address}
                      </p>
                    </div>
                    <div>
                      <button
                        className="ad-or-d-btn"
                        onClick={() => handleGenRep(report.orderId)}
                        disabled={loadingOrder[report.orderId]}
                      >
                        {loadingOrder[report.orderId] ? (
                          <>
                            Downloading... <span className="loader"></span>
                          </>
                        ) : (
                          "Download Report"
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Buttons */}
              <div className="pagination-buttons">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="ad-or-d-btn"
                >
                  Previous
                </button>
                <span style={{ padding: "0 10px" }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="ad-or-d-btn"
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <div className="report-container">
              <h2 className="report-title">No Reports Found</h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
