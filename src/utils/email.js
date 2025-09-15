// Simple email notification utility for demonstration
// Replace with your backend API call in production

export async function sendDriverEmailNotification({ driverEmail, subject, message }) {
  // Simulate sending email (replace with real API call)
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Email sent to ${driverEmail}: ${subject}\n${message}`);
      resolve({ success: true });
    }, 1000);
  });
}
