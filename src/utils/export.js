// Export utilities for CSV and PDF generation
export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    )
  ].join('\n');

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
  }
};

export const exportToPDF = (data, filename, title = 'Report') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Create a simple HTML table for PDF generation
  const headers = Object.keys(data[0]);
  const tableRows = data.map(row => 
    `<tr>${headers.map(header => `<td style="border: 1px solid #ddd; padding: 8px;">${row[header] || ''}</td>`).join('')}</tr>`
  ).join('');

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

  const printWindow = window.open('', '_blank');
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load then trigger print dialog
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    // Note: User can save as PDF from the print dialog
  };
};

export const exportCalendarEvents = (events, format = 'csv') => {
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

  const filename = `calendar-events-${new Date().toISOString().split('T')[0]}`;
  
  if (format === 'csv') {
    exportToCSV(calendarData, filename);
  } else {
    exportToPDF(calendarData, filename, 'Calendar Events');
  }
};

export const exportReportData = (reportType, data) => {
  const filename = `${reportType}-report-${new Date().toISOString().split('T')[0]}`;
  
  switch (reportType) {
    case 'revenue':
      return exportToCSV(data.map(item => ({
        'Date': item.date,
        'Bookings': item.bookings,
        'Revenue': `€${item.revenue}`,
        'Type': item.type
      })), filename);
      
    case 'driver':
      return exportToCSV(data.map(item => ({
        'Driver': item.driver,
        'Total Bookings': item.totalBookings,
        'Completed': item.completed,
        'Rating': item.rating,
        'Revenue': `€${item.revenue}`
      })), filename);
      
    case 'customer':
      return exportToCSV(data.map(item => ({
        'Customer': item.customer,
        'Total Bookings': item.totalBookings,
        'Last Booking': item.lastBooking,
        'Total Spent': `€${item.totalSpent}`,
        'Status': item.status
      })), filename);
      
    case 'booking':
      return exportToCSV(data.map(item => ({
        'Date': item.date,
        'Customer': item.customer,
        'Pickup': item.pickup,
        'Destination': item.destination,
        'Driver': item.driver,
        'Vehicle': item.vehicle,
        'Status': item.status,
        'Type': item.type,
        'Amount': `€${item.amount || 45}`
      })), filename);
      
    case 'fleet':
      return exportToCSV(data.map(item => ({
        'Vehicle': `${item.make} ${item.model}`,
        'Year': item.year,
        'License': item.license,
        'Driver': item.driver || 'Unassigned',
        'Status': item.status,
        'Utilization': item.utilization || 'N/A'
      })), filename);
      
    default:
      return exportToCSV(data, filename);
  }
};