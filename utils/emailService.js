const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

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

  // Determine if using secure connection (port 465) or TLS (port 587)
  const isSecurePort = parseInt(smtpPort) === 465;
  
  return nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort),
    secure: isSecurePort, // true for 465 (SSL), false for 587 (TLS)
    requireTLS: !isSecurePort, // Require TLS for port 587
    auth: {
      user: smtpUser,
      pass: smtpPass
    },
    // Connection timeout settings for cloud hosting
    connectionTimeout: 30000, // 30 seconds
    greetingTimeout: 30000,
    socketTimeout: 30000,
    // Retry configuration
    pool: false,
    maxConnections: 1,
    maxMessages: 3,
    // Debug mode (can disable in production)
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development'
  });
};

// Email HTML template for OTP
const getOTPEmailHTML = (otpCode, type = 'password-reset') => {
  const isSignUp = type === 'sign-up';
  const title = isSignUp ? 'Email Verification' : 'Password Reset Request';
  const description = isSignUp 
    ? 'Please verify your email address to complete your registration for TrafficSlight.'
    : 'You have requested to reset your password for TrafficSlight.';
  const securityNotice = isSignUp
    ? 'If you didn\'t create an account, please ignore this email or contact support if you have concerns.'
    : 'If you didn\'t request this password reset, please ignore this email or contact support if you have concerns.';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="color: #333; margin-top: 0;">${title}</h2>
        <p style="color: #666; font-size: 16px;">${description}</p>
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
          <strong>⚠️ Security Notice:</strong> ${securityNotice}
        </p>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
        <p style="color: #999; font-size: 12px; margin: 0;">
          Best regards,<br>
          <strong>TrafficSlight Team</strong>
        </p>
      </div>
    </div>
  `;
};

// Send OTP email via SendGrid (preferred for cloud hosting)
const sendOTPViaSendGrid = async (userEmail, otpCode, type = 'password-reset') => {
  if (!process.env.SENDGRID_API_KEY) {
    return false; // SendGrid not configured
  }

  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER || 'noreply@trafficslight.com';
    const subject = type === 'sign-up' 
      ? 'Email Verification OTP - TrafficSlight'
      : 'Password Reset OTP - TrafficSlight';
    
    const msg = {
      to: userEmail,
      from: fromEmail,
      subject: subject,
      html: getOTPEmailHTML(otpCode, type)
    };

    await sgMail.send(msg);
    console.log(`✅ OTP email sent via SendGrid to ${userEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP via SendGrid:', error.message);
    if (error.response) {
      console.error('   Response Body:', error.response.body);
    }
    return false;
  }
};

// Send OTP email via SMTP (fallback)
const sendOTPViaSMTP = async (userEmail, otpCode, type = 'password-reset') => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('⚠️ SMTP not configured (SMTP_USER or SMTP_PASS missing)');
      return false;
    }

    const subject = type === 'sign-up' 
      ? 'Email Verification OTP - TrafficSlight'
      : 'Password Reset OTP - TrafficSlight';

    const mailOptions = {
      from: process.env.FROM_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER || 'noreply@trafficslight.com',
      to: userEmail,
      subject: subject,
      html: getOTPEmailHTML(otpCode, type)
    };
    
    console.log(`📧 Attempting to send OTP email via SMTP to ${userEmail}...`);
    console.log(`   From: ${mailOptions.from}`);
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully via SMTP to ${userEmail}`);
    console.log(`   Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP via SMTP:');
    console.error('   Error Message:', error.message);
    console.error('   Error Code:', error.code);
    
    if (error.code === 'EAUTH' || error.message?.includes('Invalid login')) {
      console.error('   ⚠️ AUTHENTICATION ERROR: Use Gmail App Password or SendGrid');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      console.error('   ⚠️ CONNECTION ERROR: SMTP may be blocked. Try using SendGrid instead.');
    }
    
    return false;
  }
};

// Send OTP email (tries SendGrid first, then SMTP)
// type: 'sign-up' for registration verification, 'password-reset' for password reset
const sendOTPEmail = async (userEmail, otpCode, type = 'password-reset') => {
  // Try SendGrid first (better for cloud hosting)
  const sendGridResult = await sendOTPViaSendGrid(userEmail, otpCode, type);
  if (sendGridResult) {
    return true;
  }

  // Fallback to SMTP if SendGrid fails or not configured
  console.log('📧 SendGrid not available, trying SMTP...');
  return await sendOTPViaSMTP(userEmail, otpCode, type);
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

