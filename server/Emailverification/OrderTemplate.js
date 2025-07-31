const generateOrderEmailHTML = (username, data, orderId) => {
  const slugify = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount).replace('₹', '₹');
  };

  const itemsHTML = data.cartItems
    .map(
      (item) => `
    <tr>
      <td class="item-image-cell" style="padding:15px 10px;border-bottom:1px solid #f1f5f9;vertical-align:top;">
        <a href="https://shopique-iota.vercel.app/products/${slugify(item.category)}/${slugify(
          item.subCategory
        )}/${slugify(item.name)}/${item._id}" target="_blank" style="display:block;">
          <img src="${item.image}" alt="${item.name}" 
               class="item-image" 
               style="width:90px;height:90px;object-fit:cover;border-radius:8px;border:1px solid #f1f5f9;display:block;">
        </a>
      </td>
      <td class="item-details-cell" style="padding:15px 10px;border-bottom:1px solid #f1f5f9;vertical-align:top;">
        <a href="https://shopique-iota.vercel.app/products/${slugify(item.category)}/${slugify(
          item.subCategory
        )}/${slugify(item.name)}/${item._id}" target="_blank" 
           style="text-decoration:none;color:#1e293b;font-weight:600;font-size:15px;line-height:1.4;display:block;margin-bottom:8px;">
          ${item.name}
        </a>
        <div style="margin-bottom:10px;">
          <span style="background:#f1f5f9;color:#64748b;font-size:12px;padding:4px 8px;border-radius:4px;display:inline-block;">
            ${item.brand}
          </span>
          <span style="background:#f1f5f9;color:#64748b;font-size:12px;padding:4px 8px;border-radius:4px;display:inline-block;margin-left:5px;">
            ${item.category}
          </span>
        </div>
        <div style="color:#475569;font-size:14px;font-weight:500;">
          <span style="color:#7c3aed;">Qty: ${item.quantity}</span>
          <span style="margin:0 5px;color:#cbd5e1;">×</span>
          <span style="color:#059669;">₹${item.offerPrice.toFixed(2)}</span>
        </div>
      </td>
      <td class="item-price-cell" style="padding:15px 10px;border-bottom:1px solid #f1f5f9;text-align:right;vertical-align:top;">
        <div style="font-size:16px;font-weight:700;color:#059669;">
          ₹${(item.offerPrice * item.quantity).toFixed(2)}
        </div>
      </td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - Shopique</title>
      <style type="text/css">
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body {
          margin: 0;
          padding: 0;
          background-color: #f8fafc;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.5;
          color: #334155;
        }
        
        /* Mobile Responsive Styles */
        @media only screen and (max-width: 600px) {
          .email-container {
            width: 100% !important;
            border-radius: 0 !important;
          }
          .header-padding {
            padding: 25px 15px !important;
          }
          .content-padding {
            padding: 20px 15px !important;
          }
          .item-image {
            width: 70px !important;
            height: 70px !important;
          }
          .item-image-cell, .item-details-cell, .item-price-cell {
            display: block !important;
            width: 100% !important;
            padding: 12px 10px !important;
            text-align: left !important;
          }
          .two-column {
            display: block !important;
          }
          .column {
            width: 100% !important;
            margin-bottom: 15px !important;
          }
          .cta-button {
            display: block !important;
            width: 100% !important;
            box-sizing: border-box !important;
            padding: 14px !important;
          }
          .summary-table td {
            padding: 8px 0 !important;
            font-size: 14px !important;
          }
        }
      </style>
    </head>
    <body>
      
      <!-- Main Container -->
      <div class="email-container" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div class="header-padding" style="background:#4f46e5;padding:30px;text-align:center;">
          <h1 style="margin:0;color:white;font-size:24px;font-weight:700;">Shopique</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Your order has been confirmed</p>
        </div>
        
        <!-- Order Confirmation -->
        <div style="background:#10b981;padding:15px;text-align:center;">
          <p style="margin:0;color:white;font-size:16px;font-weight:600;">
            ✅ Order #${orderId} confirmed on ${new Date().toLocaleDateString('en-IN')}
          </p>
        </div>
        
        <!-- Main Content -->
        <div class="content-padding" style="padding:25px;">
          
          <!-- Greeting -->
          <div style="margin-bottom:25px;">
            <h2 style="margin:0 0 10px;color:#1e293b;font-size:20px;font-weight:600;">Hello ${username},</h2>
            <p style="margin:0;color:#64748b;font-size:15px;">
              Thank you for your order! We're preparing your items and will notify you when they ship.
            </p>
          </div>
          
          <!-- Order Items -->
          <div style="margin-bottom:25px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
            <div style="background:#f8fafc;padding:15px;border-bottom:1px solid #e2e8f0;">
              <h3 style="margin:0;color:#4f46e5;font-size:16px;font-weight:600;">Your Order (${data.cartItems.length} items)</h3>
            </div>
            
            <table width="100%" style="border-collapse:collapse;">
              ${itemsHTML}
            </table>
          </div>
          
          <!-- Order Summary -->
          <div style="margin-bottom:25px;background:#f8fafc;border-radius:8px;padding:20px;">
            <h3 style="margin:0 0 15px;color:#1e293b;font-size:16px;font-weight:600;">Order Summary</h3>
            
            <table class="summary-table" width="100%" style="border-collapse:collapse;">
              <tr>
                <td style="padding:8px 0;color:#64748b;font-size:14px;">Subtotal</td>
                <td style="padding:8px 0;text-align:right;color:#1e293b;font-weight:500;font-size:14px;">
                  ${formatCurrency(data.totalPrice - data.deliveryfee)}
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#64748b;font-size:14px;">Delivery</td>
                <td style="padding:8px 0;text-align:right;color:#1e293b;font-weight:500;font-size:14px;">
                  ${data.deliveryfee === 0 ? 'Free' : formatCurrency(data.deliveryfee)}
                </td>
              </tr>
              <tr style="border-top:1px solid #e2e8f0;">
                <td style="padding:12px 0;color:#1e293b;font-size:16px;font-weight:600;">Total</td>
                <td style="padding:12px 0;text-align:right;color:#059669;font-weight:700;font-size:16px;">
                  ${formatCurrency(data.totalPrice)}
                </td>
              </tr>
            </table>
          </div>
          
          <!-- Delivery Info -->
          <div style="margin-bottom:25px;background:#ecfdf5;border-radius:8px;padding:20px;border:1px solid #a7f3d0;">
            <h3 style="margin:0 0 15px;color:#065f46;font-size:16px;font-weight:600;">Delivery Information</h3>
            
            <div class="two-column" style="display:flex;gap:20px;">
              <div class="column" style="flex:1;">
                <div style="margin-bottom:15px;">
                  <h4 style="margin:0 0 5px;color:#065f46;font-size:14px;font-weight:600;">Shipping Address</h4>
                  <p style="margin:0;color:#047857;font-size:14px;">${data.deliveryAddress}</p>
                  <p style="margin:5px 0 0;color:#047857;font-size:14px;">PIN: ${data.pincode}</p>
                </div>
              </div>
              
              <div class="column" style="flex:1;">
                <div style="margin-bottom:15px;">
                  <h4 style="margin:0 0 5px;color:#065f46;font-size:14px;font-weight:600;">Contact & Payment</h4>
                  <p style="margin:0;color:#047857;font-size:14px;">${data.mobileNumber}</p>
                  <p style="margin:5px 0 0;color:#047857;font-size:14px;">${data.paymentMethod}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 style="margin:0 0 5px;color:#065f46;font-size:14px;font-weight:600;">Expected Delivery</h4>
              <p style="margin:0;color:#047857;font-size:14px;font-weight:500;">
                ${new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { 
                  weekday: 'short', 
                  day: 'numeric', 
                  month: 'short' 
                })} - ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { 
                  weekday: 'short', 
                  day: 'numeric', 
                  month: 'short' 
                })}
              </p>
            </div>
          </div>
          
          <!-- CTA Button -->
          <div style="text-align:center;margin-bottom:25px;">
            <a href="https://shopique-iota.vercel.app/user/myorders" 
               class="cta-button"
               style="background:#4f46e5;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:600;font-size:15px;display:inline-block;">
              Track Your Order
            </a>
          </div>
          
          <!-- Help Section -->
          <div style="text-align:center;color:#64748b;font-size:14px;">
            <p style="margin:0 0 10px;">Need help with your order?</p>
            <a href="mailto:support@shopique.com" style="color:#4f46e5;text-decoration:none;font-weight:500;">Contact our support team</a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background:#1e293b;padding:20px;text-align:center;color:#94a3b8;font-size:12px;">
          <p style="margin:0 0 8px;">© ${new Date().getFullYear()} Shopique. All rights reserved.</p>
          <p style="margin:0;">This is an automated email - please do not reply directly</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = { generateOrderEmailHTML };