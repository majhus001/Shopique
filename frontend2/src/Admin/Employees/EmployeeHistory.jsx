import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Adnavbar from "../Adnavbar/Adnavbar";
import API_BASE_URL from "../../api";
import "./EmployeeHistory.css";
import Sidebar from "../sidebar/Sidebar";
import {
  FiUsers,
  FiUser,
  FiEdit,
  FiPhone,
  FiMail,
  FiBriefcase,
  FiDollarSign,
  FiCalendar,
  FiHome,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiMinusCircle,
  FiFileText,
} from "react-icons/fi";
import { FaUserTie, FaIdCard } from "react-icons/fa";
import { BsBuilding } from "react-icons/bs";
import { format, parseISO, differenceInHours } from "date-fns";

export default function EmployeeHistory() {
  const location = useLocation();
  const navigate = useNavigate();

  const stateUser = location.state?.user || null;
  const stateOrders = location.state?.orders || null;
  const employeeData = location.state?.employeeData || null;

  const [user, setUser] = useState(stateUser);
  const [orders, setOrders] = useState(stateOrders);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    absent: 0,
    halfDay: 0,
    leave: 0,
  });

  const fetchUserData = async () => {
    try {
      setLoading(true);
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
      console.log("User fetched from backend:", userRes.data.data);
    } catch (error) {
      console.error("Error fetching user:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      fetchUserData();
    }
  }, []);

  useEffect(() => {
    if (employeeData && employeeData.attendance) {
      calculateAttendanceStats();
    }
  }, [employeeData]);

  const calculateAttendanceStats = () => {
    const stats = {
      present: 0,
      absent: 0,
      halfDay: 0,
      leave: 0,
    };

    employeeData.attendance.forEach((record) => {
      switch (record.status) {
        case "Present":
          stats.present++;
          break;
        case "Absent":
          stats.absent++;
          break;
        case "Half Day":
          stats.halfDay++;
          break;
        case "Leave":
          stats.leave++;
          break;
        default:
          break;
      }
    });

    setAttendanceStats(stats);
  };

  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  const formatDate = (dateString) => {
    return format(parseISO(dateString), "MMMM dd, yyyy");
  };

  const formatTime = (dateString) => {
    return dateString ? format(parseISO(dateString), "hh:mm a") : "--:--";
  };

  const calculateWorkingHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "--";
    const hours = differenceInHours(parseISO(checkOut), parseISO(checkIn));
    return `${hours} hrs`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Present":
        return <FiCheckCircle className="emp-his-text-success" />;
      case "Absent":
        return <FiXCircle className="emp-his-text-danger" />;
      case "Half Day":
        return <FiMinusCircle className="emp-his-text-warning" />;
      case "Leave":
        return <FiFileText className="emp-his-text-info" />;
      default:
        return null;
    }
  };

  const handleempdata = () => {
    navigate("/addemployees", {
      state: {
        user,
        orders,
        editMode: true,
        employeeData,
      },
    });
  };
  return (
    <div style={{ cursor: loading ? "wait" : "default" }}>
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
      <div className="ad-nav">
        <Adnavbar user={user} />
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
        <div className="main-content">
          <header className="admin-header-box">
            <div className="header-greeting">
              <h1>
                <FaUserTie className="header-icon" /> Employee Profile
              </h1>
              <p className="subtitle">
                {employeeData?.fullName}'s details and work history
              </p>
            </div>
          </header>

          <div className="emp-his-employee-history-container">
            <div className="emp-his-employee-history-header">
              <div className="emp-his-employee-avatar">
                <img
                  src={employeeData?.image || "/default-avatar.png"}
                  alt={employeeData?.fullName}
                  className="emp-his-employee-image"
                />
              </div>
              <div className="emp-his-employee-basic-info">
                <h2 onClick={handleempdata}>{employeeData?.fullName}</h2>
                <span className="emp-his-edit-btn" onClick={handleempdata}>
                  <FiEdit /> Edit
                </span>
                <p className="emp-his-employee-position">
                  <FiBriefcase /> {employeeData?.position}
                </p>
                <p className="emp-his-employee-department">
                  <BsBuilding /> {employeeData?.department} Department
                </p>
                <p
                  className={`emp-his-employee-status ${employeeData?.status?.toLowerCase()}`}
                >
                  {employeeData?.status}
                </p>
              </div>
            </div>

            <div className="emp-his-employee-tabs">
              <button
                className={`emp-his-tab-btn ${
                  activeTab === "details" ? "emp-his-active" : ""
                }`}
                onClick={() => setActiveTab("details")}
              >
                Personal Details
              </button>
              <button
                className={`emp-his-tab-btn ${
                  activeTab === "attendance" ? "emp-his-active" : ""
                }`}
                onClick={() => setActiveTab("attendance")}
              >
                Attendance History
              </button>
              <button
                className={`emp-his-tab-btn ${
                  activeTab === "documents" ? "emp-his-active" : ""
                }`}
                onClick={() => setActiveTab("documents")}
              >
                Documents
              </button>
            </div>

            {activeTab === "details" && (
              <div className="emp-his-employee-details-section">
                <div className="emp-his-details-card">
                  <h3 className="emp-his-details-card-title">
                    <FiUser /> Personal Information
                  </h3>
                  <div className="emp-his-details-cont">
                    <div className="emp-his-pdet-section">
                      <div className="emp-his-detail-item-title">
                        <span className="emp-his-detail-label">
                          Employee ID
                        </span>
                        <span className="emp-his-detail-label">
                          <FiMail /> Email
                        </span>
                        <span className="emp-his-detail-label">
                          <FiPhone />
                          Phone
                        </span>
                      </div>
                      <div className="emp-his-detail-item-value">
                        <span className="emp-his-detail-value">
                          : {employeeData?._id}
                        </span>
                        <span className="emp-his-detail-value">
                          : {employeeData?.email}
                        </span>
                        <span className="emp-his-detail-value">
                          : {employeeData?.phone}
                        </span>
                      </div>
                    </div>

                    <div className="emp-his-pdet-section">
                      <div className="emp-his-detail-item-title">
                        <span className="emp-his-detail-label">
                          <FiHome />
                          Address
                        </span>
                        <span className="emp-his-detail-label">
                          <FiPhone />
                          Emergency Contact
                        </span>
                      </div>
                      <div className="emp-his-detail-item-value">
                        <span
                          className="emp-his-detail-value"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          : {employeeData?.address}
                        </span>
                        <span className="emp-his-detail-value">
                          : {employeeData?.emergencyContact || "Not specified"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="emp-his-details-card">
                  <h3 className="emp-his-details-card-title">
                    <FaIdCard /> Employment Details
                  </h3>

                  <div className="emp-his-details-cont">
                    <div className="emp-his-pdet-section">
                      <div className="emp-his-detail-item-title">
                        <span className="emp-his-detail-label">Position:</span>
                        <span className="emp-his-detail-label">
                          Department:
                        </span>
                        <span className="emp-his-detail-label">Salary:</span>
                      </div>
                      <div className="emp-his-detail-item-value">
                        <span className="emp-his-detail-value">
                          {employeeData?.position}
                        </span>
                        <span className="emp-his-detail-value">
                          {employeeData?.department}
                        </span>
                        <span className="emp-his-detail-value">
                          ₹ {employeeData?.salary?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="emp-his-pdet-section">
                      <div className="emp-his-detail-item-title">
                        <span className="emp-his-detail-label">
                          Joining Date:
                        </span>
                        <span className="emp-his-detail-label">Role:</span>
                      </div>
                      <div className="emp-his-detail-item-value">
                        <span className="emp-his-detail-value">
                          <FiCalendar /> {formatDate(employeeData?.joiningDate)}
                        </span>
                        <span className="emp-his-detail-value">
                          {employeeData?.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "attendance" && (
              <div className="emp-his-attendance-section">
                <div className="emp-his-attendance-stats">
                  <div className="emp-his-stat-card emp-his-present">
                    <h4>Present</h4>
                    <p>{attendanceStats.present}</p>
                  </div>
                  <div className="emp-his-stat-card emp-his-absent">
                    <h4>Absent</h4>
                    <p>{attendanceStats.absent}</p>
                  </div>
                  <div className="emp-his-stat-card emp-his-half-day">
                    <h4>Half Day</h4>
                    <p>{attendanceStats.halfDay}</p>
                  </div>
                  <div className="emp-his-stat-card emp-his-leave">
                    <h4>Leave</h4>
                    <p>{attendanceStats.leave}</p>
                  </div>
                </div>

                <div className="emp-his-attendance-table-container">
                  <table className="emp-his-attendance-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Working Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeeData?.attendance?.map((record, index) => (
                        <tr key={index}>
                          <td>{formatDate(record.date)}</td>
                          <td>
                            <span
                              className={`emp-his-status-badge ${record.status
                                .toLowerCase()
                                .replace(" ", "-")}`}
                            >
                              {getStatusIcon(record.status)} {record.status}
                            </span>
                          </td>
                          <td>{formatTime(record.checkIn)}</td>
                          <td>{formatTime(record.checkOut)}</td>
                          <td>
                            <FiClock />{" "}
                            {calculateWorkingHours(
                              record.checkIn,
                              record.checkOut
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "documents" && (
              <div className="emp-his-documents-section">
                {employeeData?.documents?.length > 0 ? (
                  <div className="emp-his-documents-grid">
                    {employeeData.documents.map((doc, index) => (
                      <div className="emp-his-document-card" key={index}>
                        <div className="emp-his-document-icon">
                          <FiFileText />
                        </div>
                        <div className="emp-his-document-info">
                          <h4>{doc.name}</h4>
                          <p>Uploaded: {formatDate(doc.uploadDate)}</p>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="emp-his-view-document-btn"
                          >
                            View Document
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="emp-his-no-documents">
                    <p>No documents uploaded for this employee.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
