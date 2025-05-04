import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../api';
import './RecentBills.css';
import { FiArrowLeft, FiSearch, FiFilter, FiDownload, FiPrinter, FiEye, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function RecentBills({ setBillingPage }) {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBills, setFilteredBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showBillDetails, setShowBillDetails] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    dateRange: 'all',
    paymentMethod: 'all',
    paymentStatus: 'all',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch all bills
  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/api/billing/fetch`,
          { withCredentials: true }
        );

        if (response.data.success) {
          setBills(response.data.data || []);
          setFilteredBills(response.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching bills:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, []);

  // Filter bills based on search query and filter options
  useEffect(() => {
    let filtered = [...bills];

    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (bill) =>
          bill.billNumber?.toLowerCase().includes(query) ||
          bill.customerName?.toLowerCase().includes(query) ||
          bill.customerMobile?.includes(query)
      );
    }

    // Apply date range filter
    if (filterOptions.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (filterOptions.dateRange) {
        case 'today':
          filtered = filtered.filter(bill => {
            const billDate = new Date(bill.createdAt);
            return billDate >= today;
          });
          break;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          filtered = filtered.filter(bill => {
            const billDate = new Date(bill.createdAt);
            return billDate >= weekAgo;
          });
          break;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          filtered = filtered.filter(bill => {
            const billDate = new Date(bill.createdAt);
            return billDate >= monthAgo;
          });
          break;
        default:
          break;
      }
    }

    // Apply payment method filter
    if (filterOptions.paymentMethod !== 'all') {
      filtered = filtered.filter(
        bill => bill.paymentMethod === filterOptions.paymentMethod
      );
    }

    // Apply payment status filter
    if (filterOptions.paymentStatus !== 'all') {
      filtered = filtered.filter(
        bill => bill.paymentStatus === filterOptions.paymentStatus
      );
    }

    setFilteredBills(filtered);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [searchQuery, filterOptions, bills]);

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    setFilterOptions(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // View bill details
  const viewBillDetails = (bill) => {
    setSelectedBill(bill);
    setShowBillDetails(true);
  };

  // Print bill
  const printBill = (bill) => {
    setSelectedBill(bill);
    // Implement print functionality
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBills.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Go to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="recent-bills-container">
      <div className="recent-bills-header">
        <div className="header-left">
          <button className="back-button" onClick={() => setBillingPage(true)}>
            <FiArrowLeft /> Back to Billing
          </button>
          <h1>Recent Bills</h1>
        </div>
        <div className="search-filter-container">
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by bill number, customer name or mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-container">
            <div className="filter-dropdown">
              <label>Date Range:</label>
              <select
                value={filterOptions.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
            <div className="filter-dropdown">
              <label>Payment Method:</label>
              <select
                value={filterOptions.paymentMethod}
                onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
              >
                <option value="all">All Methods</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
              </select>
            </div>
            <div className="filter-dropdown">
              <label>Status:</label>
              <select
                value={filterOptions.paymentStatus}
                onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading bills...</p>
        </div>
      ) : filteredBills.length > 0 ? (
        <div className="bills-table-container">
          <table className="bills-table">
            <thead>
              <tr>
                <th>Bill Number</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((bill) => (
                <tr key={bill._id}>
                  <td>{bill.billNumber}</td>
                  <td>
                    <div className="customer-info">
                      <div className="customer-name">{bill.customerName}</div>
                      <div className="customer-mobile">{bill.customerMobile}</div>
                    </div>
                  </td>
                  <td>{new Date(bill.createdAt).toLocaleDateString()}</td>
                  <td>{bill.items.length} items</td>
                  <td className="amount">₹{bill.grandTotal.toFixed(2)}</td>
                  <td>
                    <span className={`payment-method ${bill.paymentMethod}`}>
                      {bill.paymentMethod}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${bill.paymentStatus.toLowerCase()}`}>
                      {bill.paymentStatus}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="action-btn view" onClick={() => viewBillDetails(bill)}>
                      <FiEye /> View
                    </button>
                    <button className="action-btn print" onClick={() => printBill(bill)}>
                      <FiPrinter /> Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {filteredBills.length > itemsPerPage && (
            <div className="pagination-container">
              <button
                className="pagination-btn prev"
                onClick={prevPage}
                disabled={currentPage === 1}
              >
                <FiChevronLeft /> Prev
              </button>

              <div className="pagination-numbers">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    className={`pagination-number ${currentPage === i + 1 ? 'active' : ''}`}
                    onClick={() => paginate(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                className="pagination-btn next"
                onClick={nextPage}
                disabled={currentPage === totalPages}
              >
                Next <FiChevronRight />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="no-bills-found">
          <div className="no-data-icon">
            <FiFilter />
          </div>
          <p>No bills found matching your search criteria.</p>
          <button onClick={() => {
            setSearchQuery('');
            setFilterOptions({
              dateRange: 'all',
              paymentMethod: 'all',
              paymentStatus: 'all',
            });
            setCurrentPage(1);
          }}>Clear Filters</button>
        </div>
      )}

      {showBillDetails && selectedBill && (
        <div className="bill-details-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Bill Details - {selectedBill.billNumber}</h2>
              <button className="close-btn" onClick={() => setShowBillDetails(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="bill-info-section">
                <div className="bill-info-column">
                  <h3>Customer Information</h3>
                  <p><strong>Name:</strong> {selectedBill.customerName}</p>
                  <p><strong>Mobile:</strong> {selectedBill.customerMobile}</p>
                  <p><strong>Email:</strong> {selectedBill.customerEmail || 'N/A'}</p>
                  <p><strong>Address:</strong> {selectedBill.customerAddress || 'N/A'}</p>
                </div>
                <div className="bill-info-column">
                  <h3>Bill Information</h3>
                  <p><strong>Bill Number:</strong> {selectedBill.billNumber}</p>
                  <p><strong>Date:</strong> {new Date(selectedBill.createdAt).toLocaleString()}</p>
                  <p><strong>Payment Method:</strong> {selectedBill.paymentMethod}</p>
                  <p><strong>Payment Status:</strong> {selectedBill.paymentStatus}</p>
                </div>
              </div>

              <h3>Items</h3>
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Category</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBill.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{item.category}</td>
                      <td>₹{item.unitPrice.toFixed(2)}</td>
                      <td>₹{item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="bill-summary">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>₹{selectedBill.subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Tax ({selectedBill.taxRate}%):</span>
                  <span>₹{selectedBill.taxAmount.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Discount ({selectedBill.discountRate}%):</span>
                  <span>₹{selectedBill.discountAmount.toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total Amount:</span>
                  <span>₹{selectedBill.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {selectedBill.notes && (
                <div className="bill-notes">
                  <h3>Notes</h3>
                  <p>{selectedBill.notes}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="print-btn" onClick={() => printBill(selectedBill)}>
                <FiPrinter /> Print Bill
              </button>
              <button className="download-btn">
                <FiDownload /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
