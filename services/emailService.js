const nodemailer = require('nodemailer');

// Create transporter - configure based on your email provider
const createTransporter = () => {
  // For development, we'll use a simple console logger
  // In production, configure with your email provider (Gmail, SendGrid, etc.)
  
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      service: 'gmail', // or your preferred service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Development mode - log to console
    return {
      sendMail: async (mailOptions) => {
        console.log('📧 Email would be sent:', {
          to: mailOptions.to,
          subject: mailOptions.subject,
          text: mailOptions.text?.substring(0, 100) + '...',
          html: mailOptions.html ? 'HTML content' : 'No HTML'
        });
        return { messageId: 'dev-mode', accepted: [mailOptions.to] };
      }
    };
  }
};

const transporter = createTransporter();

/**
 * Send booking confirmation email
 * @param {Object} booking - Booking details
 * @param {Object} event - Event details
 */
const sendBookingConfirmation = async (booking, event) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@eventify.com',
    to: booking.userEmail,
    subject: `Booking Confirmed: ${event.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8B5CF6;">🎉 Booking Confirmed!</h2>
        
        <p>Hi ${booking.userName},</p>
        
        <p>Your booking has been confirmed! Here are the details:</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1f2937;">${event.name}</h3>
          <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
          <p><strong>Location:</strong> ${event.location}</p>
          <p><strong>Tickets:</strong> ${booking.tickets}</p>
          <p><strong>Booking ID:</strong> ${booking._id}</p>
        </div>
        
        <p>Thank you for choosing Eventify! We look forward to seeing you there.</p>
        
        <p style="color: #6b7280; font-size: 14px;">
          Need to make changes? You can cancel your booking anytime from your My Bookings page.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          This is an automated email from Eventify. Please don't reply to this email.
        </p>
      </div>
    `,
    text: `
      Booking Confirmed: ${event.name}
      
      Hi ${booking.userName},
      
      Your booking has been confirmed!
      
      Event: ${event.name}
      Date: ${new Date(event.date).toLocaleDateString()}
      Location: ${event.location}
      Tickets: ${booking.tickets}
      Booking ID: ${booking._id}
      
      Thank you for choosing Eventify!
    `
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Booking confirmation email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Error sending booking confirmation email:', error);
    throw error;
  }
};

/**
 * Send booking cancellation email
 * @param {Object} booking - Booking details
 * @param {Object} event - Event details
 */
const sendCancellationConfirmation = async (booking, event) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@eventify.com',
    to: booking.userEmail,
    subject: `Booking Cancelled: ${event.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #EF4444;">📧 Booking Cancelled</h2>
        
        <p>Hi ${booking.userName},</p>
        
        <p>Your booking has been successfully cancelled. Here are the details:</p>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <h3 style="margin-top: 0; color: #1f2937;">${event.name}</h3>
          <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
          <p><strong>Location:</strong> ${event.location}</p>
          <p><strong>Tickets Cancelled:</strong> ${booking.tickets}</p>
          <p><strong>Booking ID:</strong> ${booking._id}</p>
        </div>
        
        <p>We're sorry to see you go! If you change your mind, you can always book again (subject to availability).</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          This is an automated email from Eventify. Please don't reply to this email.
        </p>
      </div>
    `,
    text: `
      Booking Cancelled: ${event.name}
      
      Hi ${booking.userName},
      
      Your booking has been cancelled.
      
      Event: ${event.name}
      Date: ${new Date(event.date).toLocaleDateString()}
      Location: ${event.location}
      Tickets Cancelled: ${booking.tickets}
      Booking ID: ${booking._id}
      
      We're sorry to see you go!
    `
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Cancellation email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Error sending cancellation email:', error);
    throw error;
  }
};

module.exports = {
  sendBookingConfirmation,
  sendCancellationConfirmation,
  transporter
};
