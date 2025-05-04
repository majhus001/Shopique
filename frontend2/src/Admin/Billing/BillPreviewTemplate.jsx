import React from 'react';
import './BillPreviewTemplate.css';

/**
 * Bill Preview Template Component
 * This component renders the print-friendly bill template
 */
const BillPreviewTemplate = ({
  invoiceNumber,
  customer,
  cart,
  paymentMethod,
  tax,
  discount,
  note,
  calculateSubtotal,
  calculateTaxAmount,
  calculateDiscountAmount,
  calculateTotal
}) => {
  // Format the current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="shopique-bill-container" id="shopique-bill-container">
      <div className="shopique-bill-company-header">
        <div className="shopique-bill-company-logo">Shopique</div>
        <div className="shopique-bill-company-info">
          <p>123 Commerce Street</p>
          <p>Business City, ST 12345</p>
          <p>Phone: (555) 123-4567</p>
          <p>Email: sales@shopique.com</p>
        </div>
      </div>

      <div className="shopique-bill-header">
        <div className="shopique-bill-title">BILL</div>
        <div className="shopique-bill-details">
          <div className="shopique-bill-number">{invoiceNumber}</div>
          <div className="shopique-bill-date">Date: {currentDate}</div>
        </div>
      </div>

      <div className="shopique-bill-customer-section">
        <div className="shopique-bill-customer-info">
          <div className="shopique-bill-section-title">Customer Information</div>
          <div className="shopique-bill-customer-name">{customer ? customer.username : 'Guest Customer'}</div>
          <div className="shopique-bill-customer-detail">{customer ? (customer.mobile || 'No phone number') : ''}</div>
          <div className="shopique-bill-customer-detail">{customer ? (customer.email || '') : ''}</div>
          <div className="shopique-bill-customer-detail">{customer ? (customer.address || '') : ''}</div>
        </div>

        <div className="shopique-bill-payment-info">
          <div className="shopique-bill-section-title">Payment Information</div>
          <div className="shopique-bill-customer-detail">Payment Method: {paymentMethod.toUpperCase()}</div>
          <div className="shopique-bill-customer-detail">Payment Status: Paid</div>
        </div>
      </div>

      <table className="shopique-bill-items-table">
        <thead>
          <tr>
            <th className="shopique-bill-item-name">Item</th>
            <th className="shopique-bill-item-price">Price</th>
            <th className="shopique-bill-item-qty">Quantity</th>
            <th className="shopique-bill-item-total">Total</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item, index) => (
            <tr key={index}>
              <td className="shopique-bill-item-name">{item.name}</td>
              <td className="shopique-bill-item-price">₹{item.price.toFixed(2)}</td>
              <td className="shopique-bill-item-qty">{item.quantity}</td>
              <td className="shopique-bill-item-total">₹{(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="shopique-bill-summary">
        <div className="shopique-bill-summary-row">
          <span>Subtotal:</span>
          <span>₹{calculateSubtotal().toFixed(2)}</span>
        </div>
        <div className="shopique-bill-summary-row">
          <span>Tax ({tax}%):</span>
          <span>₹{calculateTaxAmount().toFixed(2)}</span>
        </div>
        <div className="shopique-bill-summary-row">
          <span>Discount ({discount}%):</span>
          <span>₹{calculateDiscountAmount().toFixed(2)}</span>
        </div>
        <div className="shopique-bill-summary-row shopique-bill-total">
          <span>Total Amount:</span>
          <span>₹{calculateTotal().toFixed(2)}</span>
        </div>
      </div>

      {note && (
        <div className="shopique-bill-notes">
          <div className="shopique-bill-section-title">Notes</div>
          <p>{note}</p>
        </div>
      )}

      <div className="shopique-bill-footer">
        <p>Thank you for your business!</p>
        <p>For questions or concerns regarding this bill, please contact us.</p>
      </div>
    </div>
  );
};

export default BillPreviewTemplate;
