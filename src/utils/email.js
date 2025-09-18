// Email notification utility using Supabase Edge Function
import supabase from './supabaseClient';

// Helper function to get a valid JWT from Supabase
export async function getValidSupabaseJWT() {
  try {
    // Check if Supabase is properly configured
    if (!supabase || !supabase.auth) {
      console.warn('Supabase client not configured');
      return { success: false, error: 'Supabase authentication is not configured. Email functionality is limited to demo mode.' };
    }
    
    // First try to get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting Supabase session:', sessionError);
      return { success: false, error: `Session error: ${sessionError.message}` };
    }
    
    if (!session || !session.access_token) {
      console.warn('No active Supabase session found');
      return { success: false, error: 'No active session. Please log in with a Supabase account.' };
    }
    
    // Additional validation to ensure the token is valid
    const jwt = session.access_token;
    if (typeof jwt !== 'string' || jwt.length < 20) {
      console.error('Invalid JWT format:', jwt);
      return { success: false, error: 'Invalid authentication token format.' };
    }
    
    // Optional: Try to get user to verify token is still valid
    const { error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('JWT validation failed:', userError);
      return { success: false, error: 'Authentication token is expired or invalid. Please log in again.' };
    }
    
    return { success: true, jwt };
  } catch (error) {
    console.error('Unexpected error getting JWT:', error);
    return { success: false, error: `Authentication error: ${error.message}` };
  }
}

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
  
  // If JWT is not provided, try to get a valid one
  if (!supabaseJwt) {
    console.log('No JWT provided, attempting to get valid JWT...');
    const jwtResult = await getValidSupabaseJWT();
    if (!jwtResult.success) {
      return { success: false, error: jwtResult.error };
    }
    supabaseJwt = jwtResult.jwt;
  }
  
  // Validate JWT before making request
  if (!supabaseJwt || typeof supabaseJwt !== 'string' || supabaseJwt.length < 20) {
    return { success: false, error: 'Invalid or missing JWT token. Please log in again.' };
  }
  
  try {
    console.log('Sending driver confirmation email...', { to, subject });
    
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
      console.error('Failed to send driver confirmation email:', result);
      
      // Handle specific error cases
      if (response.status === 401) {
        return { success: false, error: 'Authentication failed. Your login token is expired or invalid. Please log in again.' };
      }
      
      return { success: false, error: result.error || `HTTP ${response.status}: Failed to send email` };
    }
  } catch (error) {
    console.error('Error sending driver confirmation email:', error);
    return { success: false, error: error.message || 'Network error occurred while sending email' };
  }
}
