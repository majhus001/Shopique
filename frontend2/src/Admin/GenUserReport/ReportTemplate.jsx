export const generateReportHTML = (orderedUser, order) => {
  // Safely get values with fallbacks to prevent errors
  const orderId = order && order._id ? order._id : 'N/A';
  const username = orderedUser && orderedUser.username ? orderedUser.username : 'N/A';
  const mobile = orderedUser && orderedUser.mobile ? orderedUser.mobile : 'N/A';
  const email = orderedUser && orderedUser.email ? orderedUser.email : 'N/A';
  const address = orderedUser && orderedUser.address ? orderedUser.address : 'N/A';
  const pincode = order && order.pincode ? order.pincode : 'N/A';
  const currentDate = new Date().toLocaleString();

  return `
  <div style="width: 100%; font-family: Arial, sans-serif; color: #000; padding: 30px; box-sizing: border-box; background-color: #ffffff; max-width: 800px; margin: 0 auto;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #4a6bdf;">
      <h1 style="color: #4a6bdf; margin: 0; font-size: 28px; font-weight: 700;">SHOPIQUE</h1>
      <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Your Fashion Destination</p>
    </div>

    <!-- Delivery Label Title -->
    <div style="background-color: #4a6bdf; color: white; padding: 15px; text-align: center; border-radius: 8px; margin-bottom: 25px;">
      <h2 style="margin: 0; font-size: 22px;">Delivery Label</h2>
    </div>

    <!-- Customer Information -->
    <div style="margin-bottom: 25px; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; background-color: #f8f9fa;">
      <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px; border-bottom: 1px solid #e9ecef; padding-bottom: 10px;">Customer Information</h3>

      <div style="display: flex; margin-bottom: 15px;">
        <div style="width: 50%;">
          <p style="margin: 0 0 5px 0; font-size: 13px; color: #666;">Order ID</p>
          <p style="margin: 0; font-size: 16px; font-weight: 600;">${orderId}</p>
        </div>
        <div style="width: 50%;">
          <p style="margin: 0 0 5px 0; font-size: 13px; color: #666;">Customer Name</p>
          <p style="margin: 0; font-size: 16px; font-weight: 600;">${username}</p>
        </div>
      </div>

      <div style="display: flex; margin-bottom: 15px;">
        <div style="width: 50%;">
          <p style="margin: 0 0 5px 0; font-size: 13px; color: #666;">Mobile</p>
          <p style="margin: 0; font-size: 16px;">${mobile}</p>
        </div>
        <div style="width: 50%;">
          <p style="margin: 0 0 5px 0; font-size: 13px; color: #666;">Email</p>
          <p style="margin: 0; font-size: 16px;">${email}</p>
        </div>
      </div>

      <div style="margin-bottom: 15px;">
        <p style="margin: 0 0 5px 0; font-size: 13px; color: #666;">Delivery Address</p>
        <p style="margin: 0; font-size: 16px; line-height: 1.5;">${address}</p>
      </div>

      <div style="display: flex;">
        <div style="width: 50%;">
          <p style="margin: 0 0 5px 0; font-size: 13px; color: #666;">Pincode</p>
          <p style="margin: 0; font-size: 16px;">${pincode}</p>
        </div>
        <div style="width: 50%;">
          <p style="margin: 0 0 5px 0; font-size: 13px; color: #666;">Confirmed and Packed On</p>
          <p style="margin: 0; font-size: 16px;">${currentDate}</p>
        </div>
      </div>
    </div>

    <!-- Shipping Instructions -->
    <div style="margin-bottom: 25px; padding: 15px; border: 1px dashed #ccc; border-radius: 8px; background-color: #fff;">
      <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">Shipping Instructions</h3>
      <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.5;">
        Please handle with care. This package contains fashion items that may be delicate.
        For any delivery issues, please contact our customer service at support@shopique.com
      </p>
    </div>

    <!-- Footer -->
    <div style="margin-top: 30px; text-align: center; padding-top: 20px; border-top: 1px solid #e9ecef;">
      <p style="margin: 0; font-size: 16px; font-weight: 600; color: #333;">Thank You for Your Order!</p>
      <p style="margin: 5px 0 0 0; font-size: 13px; color: #666;">Shopique - Your Fashion Destination</p>
      <p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">www.shopique.com | support@shopique.com | +1-800-SHOPIQUE</p>
    </div>
  </div>
  `;
};
