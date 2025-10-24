const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Send welcome email
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@trafficmanagement.com',
      to: userEmail,
      subject: 'Welcome to Traffic Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Traffic Management System!</h2>
          <p>Hello ${userName},</p>
          <p>Thank you for registering with our Traffic Management System. You can now:</p>
          <ul>
            <li>Report traffic incidents</li>
            <li>Track your trips</li>
            <li>Find nearby gas stations</li>
            <li>Get real-time traffic updates</li>
          </ul>
          <p>If you have any questions, please don't hesitate to contact us.</p>
          <p>Best regards,<br>Traffic Management Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully');
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (userEmail, resetToken) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@trafficmanagement.com',
      to: userEmail,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You have requested to reset your password. Click the link below to reset your password:</p>
          <p><a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>Traffic Management Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully');
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Send report notification email
const sendReportNotificationEmail = async (adminEmail, reportData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@trafficmanagement.com',
      to: adminEmail,
      subject: 'New Traffic Report - Action Required',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Traffic Report</h2>
          <p>A new traffic report has been submitted:</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Type:</strong> ${reportData.reportType}</p>
            <p><strong>Title:</strong> ${reportData.title}</p>
            <p><strong>Location:</strong> ${reportData.location.address}</p>
            <p><strong>Description:</strong> ${reportData.description}</p>
            <p><strong>Priority:</strong> ${reportData.priority}</p>
          </div>
          <p>Please review and take appropriate action.</p>
          <p>Best regards,<br>Traffic Management System</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Report notification email sent successfully');
  } catch (error) {
    console.error('Error sending report notification email:', error);
    throw error;
  }
};

// Send trip reminder email
const sendTripReminderEmail = async (userEmail, tripData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@trafficmanagement.com',
      to: userEmail,
      subject: 'Trip Reminder',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Trip Reminder</h2>
          <p>You have a planned trip:</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>From:</strong> ${tripData.startLocation.address}</p>
            <p><strong>To:</strong> ${tripData.endLocation.address}</p>
            <p><strong>Planned Start:</strong> ${new Date(tripData.plannedStartTime).toLocaleString()}</p>
            <p><strong>Distance:</strong> ${tripData.distance} km</p>
          </div>
          <p>Safe travels!</p>
          <p>Best regards,<br>Traffic Management Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Trip reminder email sent successfully');
  } catch (error) {
    console.error('Error sending trip reminder email:', error);
    throw error;
  }
};

// Send gas station update email
const sendGasStationUpdateEmail = async (userEmail, stationData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@trafficmanagement.com',
      to: userEmail,
      subject: 'Gas Station Update',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Gas Station Update</h2>
          <p>The gas station you're following has been updated:</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Station:</strong> ${stationData.name}</p>
            <p><strong>Brand:</strong> ${stationData.brand}</p>
            <p><strong>Location:</strong> ${stationData.location.address}</p>
            <p><strong>Status:</strong> ${stationData.status}</p>
          </div>
          <p>Best regards,<br>Traffic Management Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Gas station update email sent successfully');
  } catch (error) {
    console.error('Error sending gas station update email:', error);
    throw error;
  }
};

// Send system notification email
const sendSystemNotificationEmail = async (userEmail, notificationData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@trafficmanagement.com',
      to: userEmail,
      subject: notificationData.title,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${notificationData.title}</h2>
          <p>${notificationData.message}</p>
          ${notificationData.action ? `
            <p><a href="${notificationData.action.url}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">${notificationData.action.text || 'View Details'}</a></p>
          ` : ''}
          <p>Best regards,<br>Traffic Management Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('System notification email sent successfully');
  } catch (error) {
    console.error('Error sending system notification email:', error);
    throw error;
  }
};

// Send bulk email
const sendBulkEmail = async (recipients, subject, htmlContent) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@trafficmanagement.com',
      to: recipients.join(', '),
      subject: subject,
      html: htmlContent
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Bulk email sent successfully');
  } catch (error) {
    console.error('Error sending bulk email:', error);
    throw error;
  }
};

// Send email with attachment
const sendEmailWithAttachment = async (recipient, subject, htmlContent, attachments) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@trafficmanagement.com',
      to: recipient,
      subject: subject,
      html: htmlContent,
      attachments: attachments
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Email with attachment sent successfully');
  } catch (error) {
    console.error('Error sending email with attachment:', error);
    throw error;
  }
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendReportNotificationEmail,
  sendTripReminderEmail,
  sendGasStationUpdateEmail,
  sendSystemNotificationEmail,
  sendBulkEmail,
  sendEmailWithAttachment
};
