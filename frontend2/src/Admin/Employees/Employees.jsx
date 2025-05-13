import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Adnavbar from "../Adnavbar/Adnavbar";
import API_BASE_URL from "../../api";
import "./Employees.css";
import Sidebar from "../sidebar/Sidebar";
import {
  FiUsers,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiUserPlus,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiRefreshCw,
  FiUserCheck,
  FiClock,
  FiAlertCircle,
  FiFileText
} from "react-icons/fi";

export default function Employees() {
  const location = useLocation();
  const navigate = useNavigate();

  const stateUser = location.state?.user || null;
  const stateOrders = location.state?.orders || null;

  // State for user and orders
  const [user, setUser] = useState(stateUser);
  const [orders, setOrders] = useState(stateOrders);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(8);
  const [sortField, setSortField] = useState("fullName");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterStatus, setFilterStatus] = useState("All");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    onLeave: 0,
    terminated: 0
  });

  // Handle sidebar collapse
  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  // Fetch employees data
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/employees/fetch`);
        if (response.data.success) {
          const employeesData = response.data.data || [];
          setEmployees(employeesData);
          setFilteredEmployees(sortEmployees(employeesData, sortField, sortDirection));
          calculateStats(employeesData);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [sortField, sortDirection]);

  // Calculate employee statistics
  const calculateStats = (employeeData) => {
    const stats = {
      total: employeeData.length,
      active: employeeData.filter(emp => emp.status === 'Active').length,
      onLeave: employeeData.filter(emp => emp.status === 'On Leave').length,
      terminated: employeeData.filter(emp => emp.status === 'Terminated').length
    };
    setStats(stats);
  };

  // Sort employees
  const sortEmployees = (employees, field, direction) => {
    return [...employees].sort((a, b) => {
      if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
      if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Handle sort change
  const handleSortChange = (field) => {
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    setFilteredEmployees(sortEmployees(filteredEmployees, field, newDirection));
  };

  // Filter employees based on search and status filter
  useEffect(() => {
    let result = employees;

    // Apply status filter
    if (filterStatus !== "All") {
      result = result.filter(employee => employee.status === filterStatus);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        employee =>
          employee.fullName?.toLowerCase().includes(query) ||
          employee.email?.toLowerCase().includes(query) ||
          employee.phone?.includes(query) ||
          employee.position?.toLowerCase().includes(query) ||
          employee.department?.toLowerCase().includes(query)
      );
    }

    // Sort the filtered results
    result = sortEmployees(result, sortField, sortDirection);
    setFilteredEmployees(result);
  }, [employees, searchQuery, filterStatus, sortField, sortDirection]);

  // Pagination logic
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Navigate to add employee page
  const handleAddEmployee = () => {
    navigate("/addemployees", { state: { user, orders } });
  };

  // Navigate to edit employee page
  const handleEditEmployee = (employee) => {
    navigate("/addemployees", {
      state: {
        user,
        orders,
        editMode: true,
        employeeData: employee
      }
    });
  };

  // Handle delete employee
  const handleDeleteEmployee = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        setLoading(true);
        const response = await axios.delete(`${API_BASE_URL}/api/employees/delete/${id}`);
        if (response.data.success) {
          // Remove from state
          const updatedEmployees = employees.filter(emp => emp._id !== id);
          setEmployees(updatedEmployees);
          setFilteredEmployees(sortEmployees(
            updatedEmployees.filter(emp => filterStatus === "All" || emp.status === filterStatus),
            sortField,
            sortDirection
          ));
          calculateStats(updatedEmployees);
        }
      } catch (error) {
        console.error("Error deleting employee:", error);
        alert("Failed to delete employee. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setFilterStatus("All");
    setCurrentPage(1);
    setSortField("fullName");
    setSortDirection("asc");
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
      <div className={`admin-container ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <Sidebar
          user={user}
          orders={orders}
          onCollapsedChange={handleSidebarCollapse}
        />
        <div className="main-content">
          <header className="admin-header-box">
            <div className="header-greeting">
              <h1><FiUsers className="header-icon" /> Employee Management</h1>
              <p className="subtitle">Manage your organization's workforce</p>
            </div>
            <div className="admin-actions">
              <button className="add-employee-btn" onClick={handleAddEmployee}>
                <FiUserPlus /> Add New Employee
              </button>
            </div>
          </header>

          {/* Employee Stats */}
          <div className="employee-stats-container">
            <div className="stat-card total">
              <div className="stat-icon">
                <FiUsers />
              </div>
              <div className="stat-content">
                <h3>{stats.total}</h3>
                <p>Total Employees</p>
              </div>
            </div>
            <div className="stat-card active">
              <div className="stat-icon">
                <FiUserCheck />
              </div>
              <div className="stat-content">
                <h3>{stats.active}</h3>
                <p>Active</p>
              </div>
            </div>
            <div className="stat-card on-leave">
              <div className="stat-icon">
                <FiClock />
              </div>
              <div className="stat-content">
                <h3>{stats.onLeave}</h3>
                <p>On Leave</p>
              </div>
            </div>
            <div className="stat-card terminated">
              <div className="stat-icon">
                <FiAlertCircle />
              </div>
              <div className="stat-content">
                <h3>{stats.terminated}</h3>
                <p>Terminated</p>
              </div>
            </div>
          </div>

          {/* Employee Management Container */}
          <div className="employee-management-container">
            <div className="employee-management-header">
              <div className="search-filter-container">
                <div className="search-container">
                  <div className="search-input-wrapper">
                    <FiSearch className="search-icon" />
                    <input
                      className="search-input"
                      type="text"
                      placeholder="Search by name, email, position..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        className="clear-search"
                        onClick={() => setSearchQuery("")}
                      >
                        <FiX />
                      </button>
                    )}
                  </div>
                </div>
                <div className="filter-container">
                  <div className="filter-dropdown">
                    <label><FiFilter /> Status:</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="All">All</option>
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Terminated">Terminated</option>
                    </select>
                  </div>
                  <button className="reset-filters-btn" onClick={resetFilters}>
                    <FiRefreshCw /> Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Employee List */}
            <div className="employee-list-container">
              {currentEmployees.length > 0 ? (
                <>
                  <div className="employee-list-header">
                    <div className="employee-column name" onClick={() => handleSortChange("fullName")}>
                      Name {sortField === "fullName" && (sortDirection === "asc" ? "↑" : "↓")}
                    </div>
                    <div className="employee-column position" onClick={() => handleSortChange("position")}>
                      Position {sortField === "position" && (sortDirection === "asc" ? "↑" : "↓")}
                    </div>
                    <div className="employee-column department" onClick={() => handleSortChange("department")}>
                      Department {sortField === "department" && (sortDirection === "asc" ? "↑" : "↓")}
                    </div>
                    <div className="employee-column contact">
                      Contact
                    </div>
                    <div className="employee-column status" onClick={() => handleSortChange("status")}>
                      Status {sortField === "status" && (sortDirection === "asc" ? "↑" : "↓")}
                    </div>
                    <div className="employee-column actions">
                      Actions
                    </div>
                  </div>
                  <div className="employee-list">
                    {currentEmployees.map((employee) => (
                      <div key={employee._id} className={`employee-item ${employee.status.toLowerCase().replace(' ', '-')}`}>
                        <div className="employee-column name">
                          <div className="employee-name">{employee.fullName}</div>
                          {employee.documents && employee.documents.length > 0 && (
                            <div className="document-count">
                              <FiFileText /> {employee.documents.length} document{employee.documents.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                        <div className="employee-column position">
                          {employee.position}
                        </div>
                        <div className="employee-column department">
                          {employee.department}
                        </div>
                        <div className="employee-column contact">
                          <div className="contact-info">
                            <div className="email">{employee.email}</div>
                            <div className="phone">{employee.phone}</div>
                          </div>
                        </div>
                        <div className="employee-column status">
                          <span className={`status-badge ${employee.status.toLowerCase().replace(' ', '-')}`}>
                            {employee.status}
                          </span>
                        </div>
                        <div className="employee-column actions">
                          <button
                            className="edit-btn"
                            onClick={() => handleEditEmployee(employee)}
                            title="Edit employee"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteEmployee(employee._id)}
                            title="Delete employee"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="no-employees-message">
                  {searchQuery || filterStatus !== "All" ? (
                    <p>No employees match your search criteria. <button onClick={resetFilters}>Reset filters</button></p>
                  ) : (
                    <p>No employees found. Add your first employee to get started.</p>
                  )}
                </div>
              )}
            </div>

            {/* Pagination */}
            {filteredEmployees.length > employeesPerPage && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <FiChevronLeft />
                </button>
                <div className="page-info">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  className="pagination-btn"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <FiChevronRight />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
