// Email notification utility using Supabase Edge Function
import supabase, { SUPABASE_ANON_KEY } from './supabaseClient';
import { getSupabaseApiHeaders, validateSupabaseConfig } from './auth';

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
  
  try {
    console.log('Sending driver confirmation email...', { to, subject });
    
    // Validate Supabase configuration before making the request
    const configValidation = validateSupabaseConfig();
    if (!configValidation.isValid) {
      console.error('Supabase configuration invalid:', configValidation.issues);
      return {
        success: false,
        error: `Configuration error: ${configValidation.issues.join(', ')}`,
        isConfigError: true
      };
    }
    
    // Use the standardized header function from auth.js
    const headers = getSupabaseApiHeaders(supabaseJwt);
    
    console.log('Request headers:', Object.keys(headers)); // Log header names for debugging
    
    const response = await fetch(SUPABASE_EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        to,
        subject,
        html
      })
    });

    // Check if response is ok first, then try to parse JSON
    if (response.ok) {
      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.warn('Response was successful but not valid JSON:', jsonError);
        result = { message: 'Email sent successfully' };
      }
      
      console.log('Driver confirmation email sent successfully:', result);
      return { success: true, data: result };
    } else {
      // Try to get error details from response
      let errorDetails;
      try {
        errorDetails = await response.json();
      } catch (jsonError) {
        // If JSON parsing fails, use response text or status
        try {
          errorDetails = { error: await response.text() };
        } catch (textError) {
          errorDetails = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
      }
      
      console.error(`Failed to send driver confirmation email (${response.status}):`, errorDetails);
      
      // Handle specific error cases
      if (response.status === 401) {
        console.error('401 Unauthorized: JWT missing or invalid');
        return { 
          success: false, 
          error: 'Authentication failed. Please log in again.',
          isAuthError: true
        };
      } else if (response.status === 406) {
        console.error('406 Not Acceptable: API key or content type issue');
        return {
          success: false,
          error: 'Request format not accepted by server. Please try again.',
          statusCode: response.status
        };
      } else if (response.status >= 500) {
        console.error('Server error:', response.status);
        return {
          success: false,
          error: 'Server error occurred. Please try again later.',
          statusCode: response.status
        };
      }
      
      return { 
        success: false, 
        error: errorDetails.error || errorDetails.message || 'Failed to send email',
        statusCode: response.status
      };
    }
  } catch (error) {
    console.error('Error sending driver confirmation email:', error);
    
    // Provide specific error messages for different types of network errors
    let errorMessage = 'Network error occurred';
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      errorMessage = 'Unable to connect to email service. Please check your internet connection.';
    } else if (error.name === 'AbortError') {
      errorMessage = 'Request timed out. Please try again.';
    } else if (error.name === 'TypeError' && error.message.includes('CORS')) {
      errorMessage = 'CORS error: Email service not properly configured.';
    }
    
    return { 
      success: false, 
      error: error.message || errorMessage,
      isNetworkError: true
    };
  }
}
