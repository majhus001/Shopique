const generateForgetPasswordEmailHTML = (verificationCode) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Password Reset - Shopique</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          background-color: #f8f9fa;
          border-radius: 8px 8px 0 0;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #4a00e0;
        }
        .content {
          padding: 30px;
          background-color: #fff;
          border-radius: 0 0 8px 8px;
          border: 1px solid #e9ecef;
        }
        .otp-container {
          margin: 25px 0;
          text-align: center;
        }
        .otp-code {
          display: inline-block;
          padding: 15px 30px;
          font-size: 24px;
          font-weight: bold;
          letter-spacing: 3px;
          color: #4a00e0;
          background-color: #f8f9fa;
          border-radius: 5px;
          border: 1px dashed #4a00e0;
        }
        .footer {
          margin-top: 30px;
          font-size: 12px;
          text-align: center;
          color: #6c757d;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #4a00e0;
          color: white !important;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">SHOPIQUE</div>
      </div>
      <div class="content">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password. Use the following OTP to proceed:</p>
        
        <div class="otp-container">
          <div class="otp-code">${verificationCode}</div>
        </div>
        
        <p>This code is valid for 10 minutes. If you didn't request this, please ignore this email.</p>
        
        <p>Need help? <a href="mailto:support@shopique.com">Contact our support team</a></p>
        
        <p>Thanks,<br>The Shopique Team</p>
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} Shopique. All rights reserved.
      </div>
    </body>
    </html>
  `;
};

module.exports = { generateForgetPasswordEmailHTML };
