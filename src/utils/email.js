// Email notification utility using Supabase Edge Function

import { isValidJWT } from './auth';

export async function sendDriverEmailNotification({ driverEmail, subject, message }) {
  // Simulate sending email (replace with real API call)
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Email sent to ${driverEmail}: ${subject}\n${message}`);
      resolve({ success: true });
    }, 1000);
  });
}

// Helper function to generate HTML content for booking confirmation
export function generateBookingConfirmationHTML(booking, driverName) {
  const formatDateTime = (date, time) => {
    if (!date && !time) return 'Not specified';
    return `${date || 'Not specified'} ${time ? `at ${time}` : ''}`.trim();
  };

  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4f46e5; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">
            Booking Confirmation
          </h2>
          
          <p>Dear ${driverName},</p>
          
          <p>You have been assigned to a confirmed booking. Please review the details below:</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">Booking Details</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 30%;">Customer:</td>
                <td style="padding: 8px 0;">${booking.customer}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Pickup Location:</td>
                <td style="padding: 8px 0;">${booking.pickup}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Destination:</td>
                <td style="padding: 8px 0;">${booking.destination}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Date & Time:</td>
                <td style="padding: 8px 0;">
                  ${booking.type === 'tour' 
                    ? `Tour: ${formatDateTime(booking.tourStartDate, booking.tourPickupTime)} - ${formatDateTime(booking.tourEndDate, booking.tourReturnPickupTime)}`
                    : formatDateTime(booking.date, booking.time)}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Service Type:</td>
                <td style="padding: 8px 0;">${booking.type || 'Priority'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Vehicle:</td>
                <td style="padding: 8px 0;">${booking.vehicle || 'Not specified'}</td>
              </tr>
              ${booking.price ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Price:</td>
                <td style="padding: 8px 0;">€${booking.price}</td>
              </tr>
              ` : ''}
              ${booking.journeyDistance ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Distance:</td>
                <td style="padding: 8px 0;">${booking.journeyDistance}</td>
              </tr>
              ` : ''}
              ${booking.journeyDuration ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Duration:</td>
                <td style="padding: 8px 0;">${booking.journeyDuration}</td>
              </tr>
              ` : ''}
            </table>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; font-weight: bold;">📋 Action Required:</p>
            <p style="margin: 5px 0 0 0;">Please confirm your availability and prepare for this booking. Contact the office if you have any questions or concerns.</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
            <p>Best regards,<br>Priority Transfers Admin Team</p>
            <p style="margin-top: 20px;">This is an automated message. Please do not reply directly to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// New function for sending booking confirmation emails to drivers via Supabase
export async function sendDriverConfirmationEmail({ to, subject, html, supabaseJwt }) {
  const SUPABASE_EDGE_FUNCTION_URL = 'https://hepfwlezvvfdbkoqujhh.supabase.co/functions/v1/sendDriverConfirmation-ts';
  
  // Validate JWT before making the request
  if (!isValidJWT(supabaseJwt)) {
    const errorMsg = !supabaseJwt 
      ? 'No JWT provided for authentication' 
      : 'Invalid or malformed JWT provided';
    console.error('JWT validation failed:', errorMsg);
    return { 
      success: false, 
      error: `Authentication error: ${errorMsg}. Please ensure you are logged in with a valid Supabase account.` 
    };
  }
  
  try {
    console.log('Sending driver confirmation email...', { to, subject });
    console.log('Using JWT for authentication (length):', supabaseJwt.length);
    
    const response = await fetch(SUPABASE_EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseJwt}`,
      },
      body: JSON.stringify({
        to,
        subject,
        html
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('Driver confirmation email sent successfully:', result);
      return { success: true, data: result };
    } else {
      // Handle specific HTTP error statuses
      if (response.status === 401) {
        const authError = 'Authentication failed: Your login session is invalid or expired. Please log out and log in again.';
        console.error('401 Unauthorized:', authError);
        return { success: false, error: authError };
      }
      
      const errorMsg = result.error || `HTTP ${response.status}: Failed to send email`;
      console.error('Failed to send driver confirmation email:', errorMsg);
      return { success: false, error: errorMsg };
    }
  } catch (error) {
    console.error('Error sending driver confirmation email:', error);
    const networkErrorMsg = `Network error: ${error.message}. Please check your internet connection and try again.`;
    return { success: false, error: networkErrorMsg };
  }
}
