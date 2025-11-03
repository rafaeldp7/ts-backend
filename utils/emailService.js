const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  // Support both SMTP_* and EMAIL_* variable names for flexibility
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
  const smtpPort = process.env.SMTP_PORT || process.env.EMAIL_PORT || 587;
  
  // Debug: Log available email-related environment variables
  console.log('🔍 Email Service Debug:');
  console.log('  SMTP_USER:', process.env.SMTP_USER ? '✅ Set' : (process.env.EMAIL_USER ? '✅ Set (via EMAIL_USER)' : '❌ Missing'));
  console.log('  SMTP_PASS:', process.env.SMTP_PASS ? '✅ Set' : (process.env.EMAIL_PASS ? '✅ Set (via EMAIL_PASS)' : '❌ Missing'));
  console.log('  SMTP_HOST:', smtpHost);
  console.log('  SMTP_PORT:', smtpPort);
  console.log('  FROM_EMAIL:', process.env.FROM_EMAIL || 'Using email user or default');
  
  // Check if email credentials are configured
  if (!smtpUser || !smtpPass) {
    console.log('  ❌ Missing required credentials:', {
      user: !smtpUser ? 'Missing' : 'Found',
      pass: !smtpPass ? 'Missing' : 'Found'
    });
    return null; // Email not configured
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort),
    secure: false, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });
};

// Send OTP email
const sendOTPEmail = async (userEmail, otpCode) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('⚠️ Email service not configured (SMTP_USER or SMTP_PASS missing)');
      return false; // Email not configured, don't throw error
    }

    const mailOptions = {
      from: process.env.FROM_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER || 'noreply@trafficslight.com',
      to: userEmail,
      subject: 'Password Reset OTP - TrafficSlight',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
            <p style="color: #666; font-size: 16px;">You have requested to reset your password for TrafficSlight.</p>
          </div>
          
          <div style="background-color: #fff; border: 2px solid #007bff; padding: 30px; border-radius: 10px; text-align: center; margin: 20px 0;">
            <p style="color: #666; font-size: 14px; margin-bottom: 10px;">Your OTP code is:</p>
            <h1 style="color: #007bff; font-size: 36px; letter-spacing: 8px; margin: 20px 0; font-family: 'Courier New', monospace;">
              ${otpCode}
            </h1>
            <p style="color: #999; font-size: 12px; margin-top: 10px;">This code will expire in 10 minutes</p>
          </div>
          
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email or contact support if you have concerns.
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Best regards,<br>
              <strong>TrafficSlight Team</strong>
            </p>
          </div>
        </div>
      `
    };
    
    console.log(`📧 Attempting to send OTP email to ${userEmail}...`);
    console.log(`   From: ${mailOptions.from}`);
    console.log(`   Subject: ${mailOptions.subject}`);
    
    // Verify connection before sending
    await transporter.verify();
    console.log('✅ SMTP server connection verified');
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${userEmail}`);
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP email:');
    console.error('   Error Message:', error.message);
    console.error('   Error Code:', error.code);
    console.error('   Error Response:', error.response);
    console.error('   Error ResponseCode:', error.responseCode);
    console.error('   Full Error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    // Common Gmail authentication errors
    if (error.code === 'EAUTH' || error.message?.includes('Invalid login')) {
      console.error('   ⚠️ AUTHENTICATION ERROR: This usually means:');
      console.error('      1. Wrong email/password, OR');
      console.error('      2. Gmail requires an App Password (not regular password)');
      console.error('      3. Enable "Less secure app access" or use App Password');
      console.error('   📖 How to fix:');
      console.error('      - Go to: https://myaccount.google.com/apppasswords');
      console.error('      - Generate a new App Password for "Mail"');
      console.error('      - Use that 16-character password in SMTP_PASS/EMAIL_PASS');
    }
    
    // Don't throw error - allow OTP to still be generated and logged
    return false;
  }
};

// Send welcome email
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      return false;
    }

    const mailOptions = {
      from: process.env.FROM_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER || 'noreply@trafficslight.com',
      to: userEmail,
      subject: 'Welcome to TrafficSlight!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Welcome to TrafficSlight, ${userName}!</h2>
          <p>Thank you for registering with TrafficSlight. You can now:</p>
          <ul>
            <li>Track your trips</li>
            <li>Log fuel consumption</li>
            <li>Find nearby gas stations</li>
            <li>Manage your motorcycles</li>
          </ul>
          <p>Best regards,<br>TrafficSlight Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail
};

