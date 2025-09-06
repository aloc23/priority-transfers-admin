// Enhanced Export Component with Progress and Error Handling
import { useState } from 'react';
import { exportToCSV, exportToExcel, exportToPDF } from '../utils/export';
import { DownloadIcon, LoadingIcon } from './Icons';

const LoadingIcon = ({ className = "w-4 h-4" }) => (
  <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.3"/>
    <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"/>
  </svg>
);

export default function ExportDropdown({ 
  data, 
  filename, 
  title = "Report",
  className = "",
  disabled = false,
  formats = ['csv', 'excel', 'pdf'] 
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportMessage, setExportMessage] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleExport = async (format) => {
    if (!data || data.length === 0) {
      alert('No data available to export');
      return;
    }

    setIsExporting(true);
    setExportProgress(0);
    setExportMessage('Preparing export...');
    setShowDropdown(false);

    const progressCallback = (progress, message) => {
      setExportProgress(progress);
      setExportMessage(message);
    };

    try {
      let result;
      const safeFilename = filename || `report-${new Date().toISOString().split('T')[0]}`;

      switch (format) {
        case 'csv':
          result = await exportToCSV(data, safeFilename, progressCallback);
          break;
        case 'excel':
          result = await exportToExcel(data, safeFilename, progressCallback);
          break;
        case 'pdf':
          result = await exportToPDF(data, safeFilename, title, progressCallback);
          break;
        default:
          throw new Error('Unsupported export format');
      }

      if (result.success) {
        setExportMessage(`Export completed: ${result.filename}`);
        setTimeout(() => {
          setIsExporting(false);
          setExportProgress(0);
          setExportMessage('');
        }, 2000);
      } else {
        throw new Error(result.error || 'Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert(`Export failed: ${error.message}`);
      setIsExporting(false);
      setExportProgress(0);
      setExportMessage('');
    }
  };

  const formatLabels = {
    csv: 'CSV',
    excel: 'Excel',
    pdf: 'PDF'
  };

  if (isExporting) {
    return (
      <div className={`relative ${className}`}>
        <div className="btn btn-outline opacity-75 cursor-not-allowed">
          <LoadingIcon className="w-4 h-4 mr-2" />
          <div className="flex flex-col items-start">
            <span className="text-xs">Exporting...</span>
            {exportProgress > 0 && (
              <div className="text-xs text-slate-500">{Math.round(exportProgress)}%</div>
            )}
          </div>
        </div>
        {exportMessage && (
          <div className="absolute top-full left-0 mt-1 p-2 bg-slate-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-50">
            {exportMessage}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={disabled || !data || data.length === 0}
        className={`btn btn-outline flex items-center gap-2 ${
          disabled || !data || data.length === 0 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-slate-50'
        }`}
      >
        <DownloadIcon className="w-4 h-4" />
        Export
      </button>
      
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
            {formats.map(format => (
              <button
                key={format}
                onClick={() => handleExport(format)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
              >
                {formatLabels[format]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}