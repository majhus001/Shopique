import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Adnavbar from "../Adnavbar/Adnavbar";
import Sidebar from "../sidebar/Sidebar";
import API_BASE_URL from "../../api";
import "./Reports.css";
import {
  FiFileText,
  FiUser,
  FiMail,
  FiHome,
  FiMapPin,
  FiDownload,
  FiSearch,
  FiArrowLeft,
  FiArrowRight,
  FiLogOut,
  FiPackage,
  FiAlertCircle
} from "react-icons/fi";

const Reports = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const stateUser = location.state?.user || null;
  const stateOrders = location.state?.orders || null;

  const [user, setUser] = useState(stateUser);
  const [orders, setOrders] = useState(stateOrders);
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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
      const order = response.data.order;

      navigate("/generateuserreport", {
        state: { orduser, order, user, orders },
      });
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setLoadingOrder((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // Filter reports by Order ID
  const filteredReports = reports.filter((report) =>
    report.orderId?.toString().toLowerCase().startsWith(searchQuery.toLowerCase()) ||
    report.username?.toLowerCase().startsWith(searchQuery.toLowerCase()) ||
    report.email?.toLowerCase().startsWith(searchQuery.toLowerCase())
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
            <h1><FiFileText /> Order Reports</h1>
            <div className="admin-info">
              <button className="ad-or-d-btn" onClick={handleLogout}>
                <FiLogOut /> Logout
              </button>
            </div>
          </header>

          <div className="ad-ord-search-rep">
            <div className="search-input-container" style={{ display: 'flex', alignItems: 'center', flex: 1, position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: '12px', color: '#adb5bd', fontSize: '1rem' }} />
              <input
                type="text"
                placeholder="Search by Order ID, Username, Email"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="ad-ord-search-input"
                style={{ paddingLeft: '40px' }}
              />
            </div>
            <button className="ad-or-d-btn" onClick={handleBack}>
              <FiArrowLeft /> Back
            </button>
          </div>

          {loadingReport ? (
            <div className="loader-container">
              <span className="loader-big"></span>
              <p className="loader-text">Loading reports...</p>
            </div>
          ) : currentReports.length > 0 ? (
            <div>
              <div className="report-list">
                {currentReports.map((report, index) => (
                  <div key={index} className="report-card">
                    <div className="report-details">
                      <p>
                        <FiFileText />
                        <strong>Order ID:</strong> {report.orderId}
                      </p>
                      <p>
                        <FiUser />
                        <strong>Name:</strong> {report.username}
                      </p>
                    </div>
                    <div className="report-details">
                      <p>
                        <FiMail />
                        <strong>Email:</strong> {report.email}
                      </p>
                      <p className="address-field">
                        <FiHome />
                        <strong>Address:</strong>
                        <span style={{
                          display: '-webkit-box',
                          maxWidth: '100%',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          lineHeight: '1.3',
                          maxHeight: '2.6em'
                        }} title={report.address}>
                          {report.address}
                        </span>
                      </p>
                    </div>
                    <div className="report-actions">
                      <button
                        className="ad-or-d-btn"
                        onClick={() => handleGenRep(report.orderId)}
                        disabled={loadingOrder[report.orderId]}
                      >
                        {loadingOrder[report.orderId] ? (
                          <>
                            Generating... <span className="loader"></span>
                          </>
                        ) : (
                          <>
                            <FiDownload /> Download Report
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Buttons */}
              <div className="pagination-container">
                <div className="pagination-buttons">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    <FiArrowLeft /> Previous
                  </button>
                  <span className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                  >
                    Next <FiArrowRight />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-reports-container">
              <FiAlertCircle className="no-reports-icon" />
              <h2 className="no-reports-title">No Reports Found</h2>
              <p className="no-reports-text">
                There are no reports matching your search criteria. Try adjusting your search or check back later.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
