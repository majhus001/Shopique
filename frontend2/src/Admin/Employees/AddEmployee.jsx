import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Adnavbar from '../Adnavbar/Adnavbar';
import API_BASE_URL from '../../api';
import './AddEmployee.css';
import Sidebar from '../sidebar/Sidebar';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiHome,
  FiDollarSign,
  FiCalendar,
  FiBriefcase,
  FiUsers,
  FiFileText,
  FiUpload,
  FiSave,
  FiX,
  FiTrash2,
  FiEye,
  FiAlertCircle,
  FiUserPlus,
  FiUserCheck
} from 'react-icons/fi';

export default function AddEmployee() {
  const location = useLocation();
  const navigate = useNavigate();

  const stateUser = location.state?.user || null;
  const stateOrders = location.state?.orders || null;
  const isEditMode = location.state?.editMode || false;
  const employeeData = location.state?.employeeData || null;

  // State for user and orders
  const [user, setUser] = useState(stateUser);
  const [orders, setOrders] = useState(stateOrders);
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [documents, setDocuments] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    password: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    salary: '',
    joiningDate: '',
    address: '',
    emergencyContact: '',
    status: 'Active'
  });

  // Handle sidebar collapse
  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  // Load employee data if in edit mode
  useEffect(() => {
    if (isEditMode && employeeData) {
      const formattedDate = employeeData.joiningDate
        ? new Date(employeeData.joiningDate).toISOString().split('T')[0]
        : '';

      setFormData({
        fullName: employeeData.fullName || '',
        password: '', // Don't load password for security reasons
        email: employeeData.email || '',
        phone: employeeData.phone || '',
        position: employeeData.position || '',
        department: employeeData.department || '',
        salary: employeeData.salary || '',
        joiningDate: formattedDate,
        address: employeeData.address || '',
        emergencyContact: employeeData.emergencyContact || '',
        status: employeeData.status || 'Active'
      });

      if (employeeData.documents && employeeData.documents.length > 0) {
        setDocuments(employeeData.documents);
      }
    }
  }, [isEditMode, employeeData]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    // Define required fields
    const requiredFields = [
      'fullName', 'email', 'phone', 'position',
      'department', 'salary', 'joiningDate', 'address'
    ];

    // Password is only required for new employees
    if (!isEditMode) {
      requiredFields.push('password');
    }

    requiredFields.forEach(field => {
      if (!formData[field]) {
        errors[field] = 'This field is required';
      }
    });

    // Password validation - minimum 6 characters
    if (formData.password && formData.password.length < 6 && !isEditMode) {
      errors.password = 'Password must be at least 6 characters';
    }

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }

    // Salary validation
    if (formData.salary && isNaN(Number(formData.salary))) {
      errors.salary = 'Salary must be a number';
    }

    // Log validation results for debugging
    console.log('Form validation errors:', errors);
    console.log('Form data:', formData);

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Format date for API
      const formattedDate = formData.joiningDate ? new Date(formData.joiningDate) : new Date();

      // Create payload with all required fields
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        department: formData.department,
        salary: Number(formData.salary),
        joiningDate: formattedDate,
        address: formData.address,
        emergencyContact: formData.emergencyContact || '',
        status: formData.status || 'Active',
        documents: documents.map(doc => ({
          name: doc.name,
          url: doc.url,
          uploadDate: doc.uploadDate
        }))
      };

      // Add password only if provided (for new employees or password changes)
      if (formData.password) {
        payload.password = formData.password;
      }

      console.log('Submitting payload:', payload);

      let response;

      if (isEditMode) {
        response = await axios.put(
          `${API_BASE_URL}/api/employees/update/${employeeData._id}`,
          payload
        );
      } else {
        response = await axios.post(
          `${API_BASE_URL}/api/employees/add`,
          payload
        );
      }

      console.log('API response:', response.data);

      if (response.data.success) {
        navigate('/employees', { state: { user, orders } });
      } else {
        alert(response.data.message || 'Failed to save employee data');
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('Error saving employee: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Handle document upload
  const handleDocumentUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setLoading(true);

    try {
      // Upload each file to the server
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('document', file);

        const response = await axios.post(
          `${API_BASE_URL}/api/employees/upload-document`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (response.data.success) {
          return response.data.document;
        } else {
          throw new Error(response.data.message || 'Failed to upload document');
        }
      });

      // Wait for all uploads to complete
      const uploadedDocuments = await Promise.all(uploadPromises);

      // Add the uploaded documents to the state
      setDocuments([...documents, ...uploadedDocuments]);
    } catch (error) {
      console.error('Error uploading documents:', error);
      alert('Error uploading documents: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle document deletion
  const handleDeleteDocument = (index) => {
    const newDocuments = [...documents];
    newDocuments.splice(index, 1);
    setDocuments(newDocuments);
  };

  // Handle cancel button
  const handleCancel = () => {
    navigate('/employees', { state: { user, orders } });
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
              <h1>
                {isEditMode ? <FiUserCheck className="header-icon" /> : <FiUserPlus className="header-icon" />}
                {isEditMode ? 'Edit Employee' : 'Add New Employee'}
              </h1>
              <p className="subtitle">
                {isEditMode
                  ? 'Update employee information in your organization'
                  : 'Add a new employee to your organization'}
              </p>
            </div>
          </header>

          <div className="add-employee-container">
            <form className="add-employee-form" onSubmit={handleSubmit}>
              {/* Personal Information Section */}
              <div className="form-section">
                <h3><FiUser className="form-section-icon" /> Personal Information</h3>

                <div className="form-group">
                  <label className="required-field">
                    <FiUser className="field-icon" /> Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={formErrors.fullName ? 'error' : ''}
                  />
                  {formErrors.fullName && (
                    <div className="error-message">{formErrors.fullName}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className={!isEditMode ? "required-field" : ""}>
                    <FiUser className="field-icon" /> Password {isEditMode && "(Leave blank to keep current)"}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={formErrors.password ? 'error' : ''}
                  />
                  {formErrors.password && (
                    <div className="error-message">{formErrors.password}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="required-field">
                    <FiMail className="field-icon" /> Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={formErrors.email ? 'error' : ''}
                  />
                  {formErrors.email && (
                    <div className="error-message">{formErrors.email}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="required-field">
                    <FiPhone className="field-icon" /> Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={formErrors.phone ? 'error' : ''}
                  />
                  {formErrors.phone && (
                    <div className="error-message">{formErrors.phone}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    <FiPhone className="field-icon" /> Emergency Contact
                  </label>
                  <input
                    type="tel"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="required-field">
                    <FiHome className="field-icon" /> Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={formErrors.address ? 'error' : ''}
                  />
                  {formErrors.address && (
                    <div className="error-message">{formErrors.address}</div>
                  )}
                </div>
              </div>

              {/* Employment Information Section */}
              <div className="form-section">
                <h3><FiBriefcase className="form-section-icon" /> Employment Information</h3>

                <div className="form-group">
                  <label className="required-field">
                    <FiBriefcase className="field-icon" /> Position
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className={formErrors.position ? 'error' : ''}
                  />
                  {formErrors.position && (
                    <div className="error-message">{formErrors.position}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="required-field">
                    <FiUsers className="field-icon" /> Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className={formErrors.department ? 'error' : ''}
                  />
                  {formErrors.department && (
                    <div className="error-message">{formErrors.department}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="required-field">
                    <FiDollarSign className="field-icon" /> Salary
                  </label>
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    className={formErrors.salary ? 'error' : ''}
                  />
                  {formErrors.salary && (
                    <div className="error-message">{formErrors.salary}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="required-field">
                    <FiCalendar className="field-icon" /> Joining Date
                  </label>
                  <input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleInputChange}
                    className={formErrors.joiningDate ? 'error' : ''}
                  />
                  {formErrors.joiningDate && (
                    <div className="error-message">{formErrors.joiningDate}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    <FiAlertCircle className="field-icon" /> Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
              </div>

              {/* Documents Section */}
              <div className="form-section">
                <h3><FiFileText className="form-section-icon" /> Documents</h3>

                <div className="form-group full-width">
                  <label>
                    <FiUpload className="field-icon" /> Upload Documents
                  </label>
                  <div
                    className="document-upload-container"
                    onClick={() => document.getElementById('document-upload').click()}
                  >
                    <FiUpload className="upload-icon" />
                    <p className="upload-text">Click to upload documents</p>
                    <p className="upload-hint">Supported formats: PDF, DOC, DOCX, JPG, PNG</p>
                    <input
                      type="file"
                      id="document-upload"
                      multiple
                      onChange={handleDocumentUpload}
                      style={{ display: 'none' }}
                    />
                  </div>

                  {documents.length > 0 && (
                    <div className="document-list">
                      {documents.map((doc, index) => (
                        <div key={index} className="document-item">
                          <div className="document-info">
                            <FiFileText className="document-icon" />
                            <div>
                              <div className="document-name">{doc.name}</div>
                              <div className="document-size">
                                {doc.size ? `${Math.round(doc.size / 1024)} KB` : 'Unknown size'} •
                                {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : 'Unknown date'}
                              </div>
                            </div>
                          </div>
                          <div className="document-actions">
                            {doc.url && (
                              <button
                                type="button"
                                className="document-action-btn view"
                                onClick={() => window.open(doc.url, '_blank')}
                                title="View document"
                              >
                                <FiEye />
                              </button>
                            )}
                            <button
                              type="button"
                              className="document-action-btn delete"
                              onClick={() => handleDeleteDocument(index)}
                              title="Delete document"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="required-fields-note">
                <span>*</span> Required fields
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCancel}
                >
                  <FiX /> Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading}
                >
                  <FiSave /> {isEditMode ? 'Update Employee' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
