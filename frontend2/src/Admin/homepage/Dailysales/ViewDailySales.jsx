import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Adnavbar from "../../Adnavbar/Adnavbar";
import Sidebar from "../../sidebar/Sidebar";
import API_BASE_URL from "../../../api";
import "./ViewDailySales.css";
import {
  FiUsers,
  FiLogOut,
  FiActivity,
  FiDollarSign,
  FiShoppingBag,
  FiCalendar,
  FiFilter,
  FiDownload,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
} from "react-icons/fi";
import {
  format,
  parseISO,
  subDays,
  startOfDay,
  endOfDay,
  isToday,
} from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { SalesReportTemplate } from "./SalesReportTemplate";

export default function ViewDailySales() {
  const location = useLocation();
  const navigate = useNavigate();
  const reportRef = useRef(null);

  const initialUser = location.state?.user || null;
  const stateOrders = location.state?.orders || null;
  const statedailysales = location.state?.dailysales || null;

  const [user, setUser] = useState(initialUser);
  const [orders, setOrders] = useState(stateOrders);
  const [dailysales, setdailysales] = useState(statedailysales || []);
  const [filteredSales, setFilteredSales] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEmployee, setIsEmployee] = useState(false);
  const [totalSales, setTotalSales] = useState(0);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [filterActive, setFilterActive] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchOrderData();
    if (!statedailysales || statedailysales.length <= 0) {
      fetchdailysales();
    } else {
      calculateTotal(statedailysales);
      const today = new Date();
      setDateRange([startOfDay(today), endOfDay(today)]);
    }
  }, []);

  useEffect(() => {
    if (dailysales.length > 0) {
      calculateTotal(dailysales);
      if (!startDate && !endDate) {
        const today = new Date();
        setDateRange([startOfDay(today), endOfDay(today)]);
      }
    }
  }, [dailysales]);

  useEffect(() => {
    if (startDate && endDate) {
      applyDateFilter();
    } else if (startDate === null && endDate === null) {
      setFilteredSales(dailysales);
      calculateTotal(dailysales);
      setFilterActive(false);
    }
  }, [dateRange]);

  const calculateTotal = (salesData) => {
    const total = salesData.reduce((sum, sale) => sum + sale.totalAmount, 0);
    setTotalSales(total);
  };

  const applyDateFilter = () => {
    if (!startDate || !endDate) return;

    const filtered = dailysales.filter((sale) => {
      const saleDate = parseISO(sale.soldAt);
      return saleDate >= startOfDay(startDate) && saleDate <= endOfDay(endDate);
    });

    setFilteredSales(filtered);
    calculateTotal(filtered);
    setFilterActive(!(isToday(startDate) && isToday(endDate)));
  };

  const clearDateFilter = () => {
    setDateRange([null, null]);
  };

  const showAllTimeSales = () => {
    setDateRange([null, null]);
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/auth/checkvaliduser`, {
        withCredentials: true,
      });

      const loggedInUser = res.data.user;
      if (!loggedInUser) return navigate("/login");

      const isEmp = loggedInUser.role === "Employee";
      setIsEmployee(isEmp);

      const userId = isEmp ? loggedInUser.employeeId : loggedInUser.userId;
      const userResponse = await axios.get(
        `${API_BASE_URL}/api/${isEmp ? "employees" : "auth"}/fetch/${userId}`
      );

      setUser(userResponse.data.data);
    } catch (error) {
      console.error("Error fetching user:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/admin/pendingorders`);
      setOrders(res.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchdailysales = async () => {
    try {
      setLoading(true);
      const dailysalesres = await axios.get(
        `${API_BASE_URL}/api/dailysales/fetch`
      );
      setdailysales(dailysalesres.data.data);
      const today = new Date();
      setDateRange([startOfDay(today), endOfDay(today)]);
    } catch (err) {
      console.error("Error fetching daily sales:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), "MMM dd, yyyy hh:mm a");
  };

  const quickFilter = (days) => {
    if (days === 0) {
      showAllTimeSales();
      return;
    }
    const end = new Date();
    const start = subDays(end, days);
    setDateRange([start, end]);
  };

  const SalesReportTemplate = (filteredSales, totalSales, dateRange) => {
    const [startDate, endDate] = dateRange;
    const reportDate = new Date().toLocaleString();

    let dateRangeText = "All Time";
    if (startDate && endDate) {
      dateRangeText = `${format(startDate, "MMM d, yyyy")} to ${format(
        endDate,
        "MMM d, yyyy"
      )}`;
    }

    return `
    <div style="width: 100%; font-family: Arial, sans-serif; color: #000; padding: 30px; box-sizing: border-box; background-color: #ffffff; max-width: 800px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #4a6bdf;">
        <h1 style="color: #4a6bdf; margin: 0; font-size: 28px; font-weight: 700;">SHOPIQUE</h1>
        <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Daily Sales Report</p>
      </div>

      <div style="margin-bottom: 25px; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; background-color: #f8f9fa;">
        <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px; border-bottom: 1px solid #e9ecef; padding-bottom: 10px;">Report Summary</h3>

        <div style="display: flex; margin-bottom: 15px;">
          <div style="width: 50%;">
            <p style="margin: 0 0 5px 0; font-size: 13px; color: #666;">Report Date</p>
            <p style="margin: 0; font-size: 16px; font-weight: 600;">${reportDate}</p>
          </div>
          <div style="width: 50%;">
            <p style="margin: 0 0 5px 0; font-size: 13px; color: #666;">Period Covered</p>
            <p style="margin: 0; font-size: 16px; font-weight: 600;">${dateRangeText}</p>
          </div>
        </div>

        <div style="display: flex; margin-bottom: 15px;">
          <div style="width: 50%;">
            <p style="margin: 0 0 5px 0; font-size: 13px; color: #666;">Total Transactions</p>
            <p style="margin: 0; font-size: 16px;">${filteredSales.length}</p>
          </div>
          <div style="width: 50%;">
            <p style="margin: 0 0 5px 0; font-size: 13px; color: #666;">Total Revenue</p>
            <p style="margin: 0; font-size: 16px;">₹${totalSales.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 25px;">
        <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px; border-bottom: 1px solid #e9ecef; padding-bottom: 10px;">Sales Transactions</h3>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="background-color: #f8f9fa; border-bottom: 2px solid #e9ecef;">
              <th style="padding: 10px; text-align: left;">Bill No.</th>
              <th style="padding: 10px; text-align: left;">Product</th>
              <th style="padding: 10px; text-align: left;">Price</th>
              <th style="padding: 10px; text-align: left;">Qty</th>
              <th style="padding: 10px; text-align: left;">Total</th>
              <th style="padding: 10px; text-align: left;">Date</th>
            </tr>
          </thead>
          <tbody>
            ${filteredSales
              .map(
                (sale) => `
              <tr style="border-bottom: 1px solid #e9ecef;">
                <td style="padding: 10px;">${sale.billNumber}</td>
                <td style="padding: 10px;">${sale.productname}</td>
                <td style="padding: 10px;">₹${sale.price.toFixed(2)}</td>
                <td style="padding: 10px;">${sale.quantity}</td>
                <td style="padding: 10px;">₹${sale.totalAmount.toFixed(2)}</td>
                <td style="padding: 10px;">${formatDate(sale.soldAt)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>

      <div style="margin-top: 30px; text-align: center; padding-top: 20px; border-top: 1px solid #e9ecef;">
        <p style="margin: 0; font-size: 16px; font-weight: 600; color: #333;">Shopique Sales Report</p>
        <p style="margin: 5px 0 0 0; font-size: 13px; color: #666;">Generated by Shopique POS System</p>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">www.shopique.com | support@shopique.com</p>
      </div>
    </div>
    `;
  };

  const downloadPDF = async () => {
    if (filteredSales.length === 0) {
      setStatusMessage({
        type: "error",
        text: "No sales data available to generate report",
      });
      return;
    }

    try {
      setIsGeneratingPDF(true);
      setStatusMessage({
        type: "info",
        text: "Generating PDF report, please wait...",
      });

      // Create a hidden div for the report
      const reportContainer = document.createElement("div");
      reportContainer.style.padding = "30px";
      reportContainer.style.backgroundColor = "#fff";
      reportContainer.style.width = "700px";
      reportContainer.style.fontFamily = "Arial, sans-serif";
      reportContainer.style.position = "absolute";
      reportContainer.style.left = "-9999px";
      reportContainer.innerHTML = SalesReportTemplate(
        filteredSales,
        totalSales,
        dateRange
      );

      // Append to body
      document.body.appendChild(reportContainer);

      try {
        // Use html2canvas with better options
        const canvas = await html2canvas(reportContainer, {
          scale: 2,
          useCORS: true,
          logging: true,
          backgroundColor: "#ffffff",
        });

        // Create PDF
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

        // Save the PDF
        const fileName = `SalesReport_${
          startDate ? format(startDate, "yyyy-MM-dd") : "AllTime"
        }_${endDate ? format(endDate, "yyyy-MM-dd") : ""}.pdf`;
        pdf.save(fileName);

        setStatusMessage({
          type: "success",
          text: "PDF report generated successfully!",
        });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      } catch (canvasError) {
        console.error("Error generating canvas:", canvasError);
        setStatusMessage({
          type: "error",
          text: "Failed to generate PDF. Please try again.",
        });
      } finally {
        // Clean up
        document.body.removeChild(reportContainer);
      }
    } catch (error) {
      console.error("Error in PDF generation:", error);
      setStatusMessage({
        type: "error",
        text: "An error occurred while generating the PDF. Please try again.",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  const handleLogout = async () => {
    try {
      const empId = user._id;
      if (isEmployee) {
        await axios.post(
          `${API_BASE_URL}/api/auth/employee/logout/${empId}`,
          {},
          { withCredentials: true }
        );
      } else {
        await axios.post(
          `${API_BASE_URL}/api/auth/logout`,
          {},
          { withCredentials: true }
        );
      }
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div style={{ cursor: loading || isGeneratingPDF ? "wait" : "default" }}>
      <div className="ad-nav">
        <Adnavbar user={user} orders={orders} />
      </div>
      <div
        className={`admin-container ${
          sidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        <Sidebar
          user={user}
          orders={orders}
          onCollapsedChange={handleSidebarCollapse}
        />
        <div className="main-content" ref={reportRef}>
          <header className="admin-header-box">
            <div className="header-greeting">
              <h1>
                <FiActivity /> Daily Sales Report
              </h1>
              <p className="subtitle">
                Detailed view of all sales transactions
              </p>
            </div>

            <div className="admin-info">
              <button className="logout-btn" onClick={handleLogout}>
                <FiLogOut /> Logout
              </button>
            </div>
          </header>

          {/* Status Messages */}
          {statusMessage && (
            <div className={`status-message ${statusMessage.type}`}>
              {statusMessage.type === "success" && <FiCheckCircle />}
              {statusMessage.type === "error" && <FiAlertCircle />}
              {statusMessage.type === "info" && <FiInfo />}
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

          <section className="vds-filter-section">
            <div className="vds-date-filter">
              <div className="vds-date-range-picker">
                <FiCalendar className="filter-icon" />
                <DatePicker
                  selectsRange={true}
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => {
                    setDateRange(update);
                  }}
                  isClearable={true}
                  placeholderText="Select date range"
                  className="date-picker-input"
                  dateFormat="MMM d, yyyy"
                />
                {filterActive && (
                  <button
                    className="clear-filter-btn"
                    onClick={clearDateFilter}
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              <div className="vds-btn-cont">
                <div className="vds-quick-filters">
                  <button onClick={() => quickFilter(1)}>Today</button>
                  <button onClick={() => quickFilter(7)}>Last 7 Days</button>
                  <button onClick={() => quickFilter(30)}>Last 30 Days</button>
                  <button onClick={() => quickFilter(0)}>All Time</button>
                </div>
                <button
                  className="vds-download-btn"
                  onClick={downloadPDF}
                  disabled={filteredSales.length === 0 || isGeneratingPDF}
                >
                  <FiDownload />{" "}
                  {isGeneratingPDF ? "Generating..." : "Download PDF"}
                </button>
              </div>
            </div>
          </section>

          <section className="vds-sales-summary">
            <div className="vds-summary-card">
              <div className="vds-summary-icon">
                <FiShoppingBag />
              </div>
              <div className="vds-summary-content">
                <h3>Total Sales</h3>
                <p>{filteredSales.length} Transactions</p>
              </div>
            </div>

            <div className="vds-summary-card">
              <div className="vds-summary-icon">
                <FiDollarSign />
              </div>
              <div className="vds-summary-content">
                <h3>Total Revenue</h3>
                <p>₹{totalSales.toFixed(2)}</p>
              </div>
            </div>

            <div className="vds-summary-card">
              <div className="vds-summary-icon">
                <FiCalendar />
              </div>
              <div className="vds-summary-content">
                <h3>Report Period</h3>
                <p>
                  {startDate && endDate
                    ? `${format(startDate, "MMM d, yyyy")} - ${format(
                        endDate,
                        "MMM d, yyyy"
                      )}`
                    : "All Time"}
                </p>
              </div>
            </div>
          </section>

          <section className="vds-recent-activity-section">
            <div className="vds-section-header-box">
              <div className="vds-section-header">
                <h2 className="vds-section-title">Sales Transactions</h2>
                {filterActive && (
                  <span className="filter-indicator">
                    <FiFilter /> Filter Applied
                  </span>
                )}
              </div>
            </div>

            <div className="vds-table-container">
              <table className="vds-sales-table">
                <thead>
                  <tr>
                    <th>Bill No.</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th>Date/Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.length > 0 ? (
                    filteredSales.map((sale, index) => (
                      <tr key={index}>
                        <td>{sale.billNumber}</td>
                        <td>{sale.productname}</td>
                        <td>{sale.category}</td>
                        <td>₹{sale.price.toFixed(2)}</td>
                        <td>{sale.quantity}</td>
                        <td>₹{sale.totalAmount.toFixed(2)}</td>
                        <td>{formatDate(sale.soldAt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="vds-no-data">
                        {filterActive
                          ? "No sales data found for selected dates"
                          : "No sales data available"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
