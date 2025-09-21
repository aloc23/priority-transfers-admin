import React, { useState } from 'react';
import { documentProcessor } from '../utils/documentProcessor';
import { useAppStore } from '../context/AppStore';
import { formatCurrency } from '../utils/currency';
import { UploadIcon, CameraIcon } from '../components/Icons';

/**
 * Test page for document processing functionality
 * This demonstrates PDF OCR, image OCR, and receipt scanning capabilities
 */
export default function DocumentProcessingTest() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const [processingLog, setProcessingLog] = useState([]);
  const { addExpense, expenses } = useAppStore();

  const addLog = (message) => {
    setProcessingLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    setResults([]);
    addLog(`Processing ${file.name} (${file.type})...`);

    try {
      const extractedExpenses = await documentProcessor.processDocument(file);
      addLog(`Extracted ${extractedExpenses.length} expense(s) from document`);
      
      setResults(extractedExpenses);

      // Add expenses to global store
      for (const expense of extractedExpenses) {
        await addExpense(expense);
        addLog(`Added expense: ${expense.description} - €${expense.amount}`);
      }

      addLog('✓ Processing completed successfully');
    } catch (error) {
      addLog(`❌ Error: ${error.message}`);
      console.error('Document processing error:', error);
    } finally {
      setIsProcessing(false);
      event.target.value = '';
    }
  };

  const handleCameraCapture = async () => {
    if (!navigator.mediaDevices) {
      addLog('❌ Camera not available on this device');
      return;
    }

    setIsProcessing(true);
    setResults([]);
    addLog('Opening camera for receipt scanning...');

    try {
      const photo = await documentProcessor.captureReceiptPhoto();
      addLog('📷 Photo captured, processing with OCR...');
      
      const extractedExpenses = await documentProcessor.processDocument(photo);
      addLog(`Extracted ${extractedExpenses.length} expense(s) from receipt`);
      
      setResults(extractedExpenses);

      // Add expenses to global store
      for (const expense of extractedExpenses) {
        await addExpense(expense);
        addLog(`Added expense: ${expense.description} - €${expense.amount}`);
      }

      addLog('✓ Receipt processing completed successfully');
    } catch (error) {
      addLog(`❌ Camera error: ${error.message}`);
      console.error('Camera capture error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearLog = () => {
    setProcessingLog([]);
    setResults([]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">
          Document Processing Test
        </h1>
        <p className="text-slate-600 mb-6">
          Test the advanced document processing capabilities including PDF text extraction, 
          OCR for images, and mobile receipt scanning.
        </p>

        {/* Upload Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="file"
            id="file-upload"
            onChange={handleFileUpload}
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            style={{ display: 'none' }}
            disabled={isProcessing}
          />
          
          <button
            className="btn btn-primary flex items-center gap-2"
            onClick={() => document.getElementById('file-upload').click()}
            disabled={isProcessing}
          >
            <UploadIcon className="w-5 h-5" />
            Upload Document/Image
          </button>

          <button
            className="btn btn-outline flex items-center gap-2"
            onClick={handleCameraCapture}
            disabled={isProcessing}
          >
            <CameraIcon className="w-5 h-5" />
            Scan Receipt with Camera
          </button>

          <button
            className="btn btn-outline btn-sm"
            onClick={clearLog}
            disabled={isProcessing}
          >
            Clear Log
          </button>
        </div>

        {/* Processing Status */}
        {isProcessing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-blue-800">Processing document...</span>
            </div>
          </div>
        )}
      </div>

      {/* Results Display */}
      {results.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Extracted Expenses ({results.length})
          </h2>
          <div className="grid gap-4">
            {results.map((expense, index) => (
              <div key={index} className="border border-slate-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Date</label>
                    <p className="font-semibold">{expense.date}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Description</label>
                    <p className="font-semibold">{expense.description}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Amount</label>
                    <p className="font-semibold text-green-600">{formatCurrency(expense.amount)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Category</label>
                    <p className="font-semibold text-blue-600 capitalize">{expense.category || 'General'}</p>
                  </div>
                </div>
                {expense.rawText && (
                  <details className="mt-3">
                    <summary className="text-sm text-slate-500 cursor-pointer hover:text-slate-700">
                      View extracted text
                    </summary>
                    <pre className="mt-2 text-xs bg-slate-50 p-3 rounded border overflow-x-auto">
                      {expense.rawText}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Processing Log */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Processing Log</h2>
        <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
          {processingLog.length === 0 ? (
            <p className="text-slate-500">No processing activity yet...</p>
          ) : (
            processingLog.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))
          )}
        </div>
      </div>

      {/* Current Expenses Summary */}
      <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">
          Current Expenses Summary ({expenses.length})
        </h2>
        <div className="text-2xl font-bold text-green-600">
          Total: {formatCurrency(expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0))}
        </div>
        <p className="text-sm text-slate-600 mt-2">
          These expenses are synchronized globally across the application and will appear 
          in your dashboard, financial reports, and KPI calculations.
        </p>
      </div>
    </div>
  );
}
