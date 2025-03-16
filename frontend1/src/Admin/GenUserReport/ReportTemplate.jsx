export const generateReportHTML = (orderedUser, order) => `
  <div style="width: 100%; font-family: Arial, sans-serif; color: #000; padding: 10px; border: 2px dashed #000; box-sizing: border-box;">
    <h2 style="text-align: center; margin-bottom: 10px;">Delivery Label</h2>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 14px;">
      <tbody>
        <tr>
          <td style="padding: 8px; border: 1px solid #000;"><strong>Order ID</strong></td>
          <td style="padding: 8px; border: 1px solid #000;">${order._id}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #000;"><strong>Customer Name</strong></td>
          <td style="padding: 8px; border: 1px solid #000;">${orderedUser.username}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #000;"><strong>Mobile</strong></td>
          <td style="padding: 8px; border: 1px solid #000;">${orderedUser.mobile}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #000;"><strong>Email</strong></td>
          <td style="padding: 8px; border: 1px solid #000;">${orderedUser.email}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #000;"><strong>Address</strong></td>
          <td style="padding: 8px; border: 1px solid #000;">${orderedUser.address}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #000;"><strong>Pincode</strong></td>
          <td style="padding: 8px; border: 1px solid #000;">${order.pincode || " "}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #000;"><strong>Confirmed and Packed On</strong></td>
          <td style="padding: 8px; border: 1px solid #000;">${new Date().toLocaleString()}</td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top: 20px; text-align: center;">
      <p style="margin: 0;"><strong>Thank You for Your Order!</strong></p>
    </div>
  </div>
`;
