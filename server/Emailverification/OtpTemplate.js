const OtpTemplate = (verificationCode) => {
  return `<div style="font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; max-width: 900px; margin: auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid rgba(0,0,0,0.05);">
      <!-- Welcome Header -->
      <div style="background: linear-gradient(135deg, #4F46E5 0%, #007AFF 100%); padding: 20px 25px; text-align: center; position: relative; overflow: hidden;">
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at 70% 30%, rgba(255,255,255,0.2) 0%, transparent 70%);"></div>
        <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; position: relative;">Welcome to Shopique!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 15px; font-weight: 400; position: relative;">Let's verify your email to begin</p>
      </div>
      
      <!-- Content Area -->
      <div style="padding: 40px 35px;">
        <div style="margin-bottom: 25px;">
          <p style="font-size: 16px; color: #4B5563; margin-bottom: 20px; line-height: 1.6;">Thank you for joining Shopique! We're excited to have you on board.</p>
          <p style="font-size: 16px; color: #4B5563; margin-bottom: 20px; line-height: 1.6;">To activate your account, please enter this verification code in your browser:</p>
        </div>
        
        <!-- Verification Code Display -->
        <div style="background: linear-gradient(to right, #F9FAFB, #F3F4F6); border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center; border: 1px solid rgba(79, 70, 229, 0.2); box-shadow: inset 0 1px 2px rgba(0,0,0,0.03); position: relative;">
          <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(to right, #4F46E5, #A855F7); border-radius: 12px 12px 0 0;"></div>
          <p style="margin: 0 0 8px; font-size: 14px; color: #6B7280; letter-spacing: 0.5px;">YOUR VERIFICATION CODE</p>
          <div style="font-size: 42px; font-weight: 700; letter-spacing: 5px; color: #4F46E5; margin: 15px 0; font-family: 'Courier New', monospace;">${verificationCode}</div>
          <div style="display: inline-flex; align-items: center; background: rgba(79, 70, 229, 0.1); padding: 6px 12px; border-radius: 20px; margin-top: 5px;">
            <svg style="margin-right: 6px;" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#4F46E5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p style="margin: 0; font-size: 13px; color: #4F46E5; font-weight: 500;">Expires in 10 minutes</p>
          </div>
        </div>
        
        <!-- Verification Instructions -->
        <div style="background: rgba(249, 250, 251, 0.7); border-radius: 10px; padding: 20px; margin: 30px 0; border-left: 4px solid #E5E7EB;">
          <p style="margin: 0 0 10px; font-size: 15px; color: #4B5563; font-weight: 600;">How to use this code:</p>
          <ol style="margin: 0; padding-left: 20px; color: #4B5563; font-size: 14px; line-height: 1.6;">
            <li style="margin-bottom: 8px;">Return to your Shopique browser window</li>
            <li style="margin-bottom: 8px;">Enter the 6-digit code shown above</li>
            <li>Click "Verify Email" to complete your registration</li>
          </ol>
        </div>
        
        <!-- Security Note -->
        <div style="background: rgba(254, 242, 242, 0.5); border-radius: 10px; padding: 18px; margin: 35px 0; border-left: 4px solid #EF4444; display: flex;">
          <div style="margin-right: 12px; flex-shrink: 0;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V11M12 15H12.01M5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21Z" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div>
            <p style="margin: 0 0 5px; font-size: 15px; color: #B91C1C; font-weight: 600;">Security Notice</p>
            <p style="margin: 0; font-size: 14px; color: #B91C1C; line-height: 1.5;">Never share this code with anyone. Shopique will never ask for this code via phone or email.</p>
          </div>
        </div>
        
        <!-- Help Section -->
        <div style="border-top: 1px solid rgba(0,0,0,0.05); padding-top: 25px;">
          <p style="font-size: 14px; color: #6B7280; margin-bottom: 15px; text-align: center;">Didn't request this code?</p>
          <p style="font-size: 13px; color: #6B7280; margin-bottom: 0; text-align: center; line-height: 1.5;">
            If you didn't initiate this signup, please ignore this email or <a href="mailto:support@shopique.com" style="color: #4F46E5; text-decoration: none; font-weight: 500;">contact support</a> immediately.
          </p>
        </div>
        
        <!-- Premium Footer -->
        <div style="border-top: 1px solid rgba(0,0,0,0.05); padding-top: 25px; text-align: center; margin-top: 25px;">
          <p style="font-size: 12px; color: #9CA3AF; margin: 0; line-height: 1.5;">
            © ${new Date().getFullYear()} Shopique. All rights reserved.<br>
            Elevating your shopping experience
          </p>
        </div>
      </div>
    </div>`;
};

module.exports = {OtpTemplate};