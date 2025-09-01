// Export utilities for CSV and PDF generation with progress tracking
export const exportToCSV = async (data, filename, progressCallback = null) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return { success: false, error: 'No data to export' };
  }

  try {
    if (progressCallback) progressCallback(10, 'Starting export...');

    const headers = Object.keys(data[0]);
    if (progressCallback) progressCallback(25, 'Processing headers...');

    // Process data in chunks for large datasets to prevent timeouts
    const chunkSize = 1000;
    const csvRows = [headers.join(',')];
    
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      const chunkRows = chunk.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      );
      csvRows.push(...chunkRows);
      
      const progress = 25 + (70 * (i + chunkSize)) / data.length;
      if (progressCallback) progressCallback(Math.min(progress, 95), `Processing row ${Math.min(i + chunkSize, data.length)} of ${data.length}...`);
      
      // Allow UI to update for large datasets
      if (data.length > 1000) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    if (progressCallback) progressCallback(95, 'Creating download file...');

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up URL
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    if (progressCallback) progressCallback(100, 'Export completed!');
    
    return { success: true, filename: `${filename}.csv`, rowCount: data.length };
  } catch (error) {
    console.error('Export failed:', error);
    if (progressCallback) progressCallback(0, 'Export failed');
    return { success: false, error: error.message };
  }
};

export const exportToPDF = async (data, filename, title = 'Report', progressCallback = null) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return { success: false, error: 'No data to export' };
  }

  try {
    if (progressCallback) progressCallback(10, 'Starting PDF generation...');

    // Create a simple HTML table for PDF generation
    const headers = Object.keys(data[0]);
    if (progressCallback) progressCallback(25, 'Processing headers...');

    // Process data in chunks for large datasets
    const chunkSize = 500; // Smaller chunks for PDF to prevent browser hangs
    let tableRows = '';
    
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      const chunkRows = chunk.map(row => 
        `<tr>${headers.map(header => `<td style="border: 1px solid #ddd; padding: 8px;">${row[header] || ''}</td>`).join('')}</tr>`
      ).join('');
      tableRows += chunkRows;
      
      const progress = 25 + (60 * (i + chunkSize)) / data.length;
      if (progressCallback) progressCallback(Math.min(progress, 85), `Processing row ${Math.min(i + chunkSize, data.length)} of ${data.length}...`);
      
      // Allow UI to update for large datasets
      if (data.length > 200) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    if (progressCallback) progressCallback(85, 'Creating PDF document...');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; margin-bottom: 20px; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th { background-color: #f2f2f2; border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold; }
          td { border: 1px solid #ddd; padding: 8px; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .export-date { font-size: 12px; color: #666; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="export-date">Generated on: ${new Date().toLocaleString()}</div>
        <table>
          <thead>
            <tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
      </html>
    `;

    if (progressCallback) progressCallback(95, 'Opening print dialog...');

    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load then trigger print dialog
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      // Note: User can save as PDF from the print dialog
      if (progressCallback) progressCallback(100, 'PDF print dialog opened!');
    };

    return { success: true, filename: `${filename}.pdf`, rowCount: data.length };
  } catch (error) {
    console.error('PDF generation failed:', error);
    if (progressCallback) progressCallback(0, 'PDF generation failed');
    return { success: false, error: error.message };
  }
};

export const exportCalendarEvents = async (events, format = 'csv', progressCallback = null) => {
  try {
    if (progressCallback) progressCallback(10, 'Processing calendar events...');

    const calendarData = events.map(event => ({
      'Title': event.title || '',
      'Start Date': event.start ? new Date(event.start).toLocaleDateString() : '',
      'Start Time': event.start ? new Date(event.start).toLocaleTimeString() : '',
      'End Date': event.end ? new Date(event.end).toLocaleDateString() : '',
      'End Time': event.end ? new Date(event.end).toLocaleTimeString() : '',
      'Description': event.description || '',
      'Type': event.type || '',
      'Status': event.status || ''
    }));

    if (progressCallback) progressCallback(50, 'Preparing export...');

    const filename = `calendar-events-${new Date().toISOString().split('T')[0]}`;
    
    let result;
    if (format === 'csv') {
      result = await exportToCSV(calendarData, filename, (progress, message) => {
        if (progressCallback) progressCallback(50 + (progress * 0.5), message);
      });
    } else {
      result = await exportToPDF(calendarData, filename, 'Calendar Events', (progress, message) => {
        if (progressCallback) progressCallback(50 + (progress * 0.5), message);
      });
    }
    
    return result;
  } catch (error) {
    console.error('Calendar export failed:', error);
    if (progressCallback) progressCallback(0, 'Calendar export failed');
    return { success: false, error: error.message };
  }
};

export const exportReportData = async (reportType, data, progressCallback = null) => {
  try {
    if (progressCallback) progressCallback(10, `Preparing ${reportType} report...`);

    const filename = `${reportType}-report-${new Date().toISOString().split('T')[0]}`;
    let processedData;
    
    switch (reportType) {
      case 'revenue':
        processedData = data.map(item => ({
          'Date': item.date,
          'Bookings': item.bookings,
          'Revenue': `€${item.revenue}`,
          'Type': item.type
        }));
        break;
        
      case 'driver':
        processedData = data.map(item => ({
          'Driver': item.driver,
          'Total Bookings': item.totalBookings,
          'Completed': item.completed,
          'Rating': item.rating,
          'Revenue': `€${item.revenue}`
        }));
        break;
        
      case 'customer':
        processedData = data.map(item => ({
          'Customer': item.customer,
          'Total Bookings': item.totalBookings,
          'Last Booking': item.lastBooking,
          'Total Spent': `€${item.totalSpent}`,
          'Status': item.status
        }));
        break;
        
      case 'booking':
        processedData = data.map(item => ({
          'Date': item.date,
          'Customer': item.customer,
          'Pickup': item.pickup,
          'Destination': item.destination,
          'Driver': item.driver,
          'Vehicle': item.vehicle,
          'Status': item.status,
          'Type': item.type,
          'Amount': `€${item.amount || 45}`
        }));
        break;
        
      case 'fleet':
        processedData = data.map(item => ({
          'Vehicle': `${item.make} ${item.model}`,
          'Year': item.year,
          'License': item.license,
          'Driver': item.driver || 'Unassigned',
          'Status': item.status,
          'Utilization': item.utilization || 'N/A'
        }));
        break;
        
      default:
        processedData = data;
    }

    if (progressCallback) progressCallback(30, 'Starting export...');

    const result = await exportToCSV(processedData, filename, (progress, message) => {
      if (progressCallback) progressCallback(30 + (progress * 0.7), message);
    });
    
    return result;
  } catch (error) {
    console.error('Report export failed:', error);
    if (progressCallback) progressCallback(0, 'Report export failed');
    return { success: false, error: error.message };
  }
};