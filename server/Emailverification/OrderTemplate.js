const generateOrderEmailHTML = (username, data, orderId) => {
  const itemsHTML = data.cartItems
    .map(
      (item) => `
    <tr>
      <td style="padding:15px 10px;border-bottom:1px solid #f0f0f0;">
        <a href="https://shopique-iota.vercel.app/products/${item.category}/${
        item.subCategory
      }/${item._id}" target="_blank">
          <img src="${item.image}" alt="${
        item.name
      }" width="90" style="border-radius:8px;border:1px solid #f5f5f5;" />
        </a>
      </td>
      <td style="padding:15px 10px;border-bottom:1px solid #f0f0f0;">
        <a href="https://shopique-iota.vercel.app/products/${item.category}/${
        item.subCategory
      }/${
        item._id
      }" target="_blank" style="text-decoration:none;color:#2d3748;font-weight:600;">
          ${item.name}
        </a>
        <p style="margin:8px 0 0;color:#718096;font-size:14px;">
          ${item.brand} | ${item.category}
        </p>
        <p style="margin:8px 0 0;color:#4a5568;">
          Quantity: ${item.quantity} × ₹${item.offerPrice}
        </p>
      </td>
      <td style="padding:15px 10px;color:#4a5568;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;">
        Price:
      </td>
      <td style="padding:15px 10px;color:green;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;">
        ₹${item.offerPrice * item.quantity}
      </td>
    </tr>
  `
    )
    .join("");

  return `
    <div style="font-family:'Inter', Arial, sans-serif;max-width:9  00px;margin:auto;background:#ffffff;">
      <!-- Header with Branding -->
      <div style="background:#007AFF;padding:25px;text-align:center;border-radius:8px 8px 0 0;">
        <h1 style="color:white;margin:0;font-size:24px;">🛍️ Shopique</h1>
      </div>
      
      <!-- Email Content -->
      <div style="padding:25px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;">
        <h2 style="color:#2d3748;margin-top:0;">Thank you for your order, ${username}!</h2>
        <p style="color:#4a5568;">Your order #${orderId} has been confirmed and will be processed shortly.</p>
        
        <!-- Order Summary Card -->
        <div style="background:#f8fafc;border-radius:8px;padding:20px;margin:25px 0;border:1px solid #edf2f7;">
          <h3 style="margin-top:0;color:#4F46E5;font-size:18px;">📦 Order Summary</h3>
          <table width="100%" style="border-collapse:collapse;">
            ${itemsHTML}
            <tr>
            <td colspan="2" style="padding:15px 10px;text-align:right;font-weight:600;border-top:1px solid #e2e8f0;">
                Total :
              </td>
             <td style="padding:15px 10px;text-align:right;font-weight:600;border-top:1px solid #e2e8f0;">
                ₹${data.totalPrice - data.deliveryfee}
              </td>
            
              
            </tr>
            <tr>
            <td colspan="2" style="padding:15px 10px;text-align:right;font-weight:600;">
                Shipping :
              </td>
              
              <td style="padding:15px 10px;text-align:right;font-weight:600;">
                ${data.deliveryfee}
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding:15px 10px;text-align:right;font-weight:600;border-top:1px solid #e2e8f0;">
                Subtotal :
              </td>
              <td style="padding:15px 10px;text-align:right;font-weight:600;border-top:1px solid #e2e8f0;">
                ₹${data.totalPrice}
              </td>

            </tr>
            <tr>
              <td colspan="2" style="padding:15px 10px;text-align:right;font-weight:700;font-size:17px;">
                Total Paid
              </td>
              <td style="padding:15px 10px;text-align:right;font-weight:700;font-size:17px;color:#4F46E5;">
                ₹${data.totalPrice}
              </td>
            </tr>
          </table>
        </div>
        
        <!-- Delivery Details Card -->
        <div style="background:#f0fdf4;border-radius:8px;padding:20px;margin:25px 0;border:1px solid #dcfce7;">
          <h3 style="margin-top:0;color:#166534;font-size:18px;">🚚 Delivery Information</h3>
          <div style="display:flex;margin-top:15px;">
            <div style="flex:1;">
              <p style="margin:8px 0;color:#166534;font-weight:600;">Shipping Address</p>
              <p style="margin:8px 0;color:#365314;">${data.deliveryAddress}</p>
              <p style="margin:8px 0;color:#365314;">Pincode: ${
                data.pincode
              }</p>
            </div>
            <div style="flex:1;">
              <p style="margin:8px 0;color:#166534;font-weight:600;">Contact: ${
                data.mobileNumber
              }</p>
              <p style="margin:8px 0;color:#365314;">Payment: ${
                data.paymentMethod
              }</p>
            </div>
          </div>
        </div>
        
        <!-- CTA Button -->
        <div style="text-align:center;margin:30px 0;">
          <a href="https://shopique-iota.vercel.app/user/${
            data.userId
          }/myorders" style="background:#4F46E5;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:600;display:inline-block;">
            View Your Order
          </a>
        </div>
        
        <!-- Footer -->
        <div style="border-top:1px solid #e2e8f0;padding-top:20px;text-align:center;color:#718096;font-size:14px;">
          <p>Need help? <a href="mailto:support@shopique.com" style="color:#4F46E5;">Contact our support team</a></p>
          <p>© ${new Date().getFullYear()} Shopique. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;
};

module.exports = { generateOrderEmailHTML };