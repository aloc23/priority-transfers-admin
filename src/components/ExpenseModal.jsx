import React, { useState, useRef } from "react";
import { CheckIcon, CloseIcon, UploadIcon, CameraIcon } from "../components/Icons";
import { documentProcessor } from "../utils/documentProcessor";
import { useResponsive } from "../hooks/useResponsive";

export default function ExpenseModal({ onSave, onClose, editing }) {
  const [form, setForm] = useState(editing || {
    date: "",
    description: "",
    amount: "",
    category: "general"
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const [showDocumentOptions, setShowDocumentOptions] = useState(false);
  const fileInputRef = useRef(null);
  const { isMobile } = useResponsive();

  // Handle document upload and processing
  const handleDocumentUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    setProcessingStatus("Processing document...");

    try {
      const expenses = await documentProcessor.processDocument(file);
      
      if (expenses.length > 0) {
        const expense = expenses[0]; // Use first extracted expense
        setForm({
          ...form,
          date: expense.date || form.date,
          description: expense.description || form.description,
          amount: expense.amount || form.amount,
          category: expense.category || form.category
        });
        setProcessingStatus("✓ Document processed successfully!");
        
        // Auto-clear success message after 3 seconds
        setTimeout(() => setProcessingStatus(""), 3000);
      } else {
        setProcessingStatus("No expense data found in document");
      }
    } catch (error) {
      console.error('Document processing error:', error);
      setProcessingStatus(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
      event.target.value = ''; // Reset file input
    }
  };

  // Handle camera capture for mobile receipt scanning
  const handleCameraCapture = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Camera not available on this device');
      return;
    }

    setIsProcessing(true);
    setProcessingStatus("Opening camera...");

    try {
      const photo = await documentProcessor.captureReceiptPhoto();
      setProcessingStatus("Processing receipt image...");
      
      const expenses = await documentProcessor.processDocument(photo);
      
      if (expenses.length > 0) {
        const expense = expenses[0];
        setForm({
          ...form,
          date: expense.date || form.date,
          description: expense.description || form.description,
          amount: expense.amount || form.amount,
          category: expense.category || form.category
        });
        setProcessingStatus("✓ Receipt scanned successfully!");
        setTimeout(() => setProcessingStatus(""), 3000);
      } else {
        setProcessingStatus("No expense data found in receipt");
      }
    } catch (error) {
      console.error('Camera capture error:', error);
      setProcessingStatus(`Camera error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg relative animate-fade-in max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
          onClick={onClose}
        >
          <CloseIcon className="w-6 h-6" />
        </button>
        
        <h2 className="text-xl font-bold mb-6 text-red-700 flex items-center gap-2">
          <CheckIcon className="w-6 h-6" /> 
          {editing ? 'Edit Expense' : 'Add Expense'}
        </h2>

        {/* Document Upload Section */}
        <div className="mb-6 p-4 bg-slate-50 rounded-lg">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Quick Entry Options</h3>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleDocumentUpload}
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              style={{ display: 'none' }}
            />
            
            <button
              type="button"
              className="btn btn-outline btn-sm flex items-center gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              <UploadIcon className="w-4 h-4" />
              {isMobile ? 'Upload' : 'Upload Document'}
            </button>

            {isMobile && (
              <button
                type="button"
                className="btn btn-outline btn-sm flex items-center gap-2"
                onClick={handleCameraCapture}
                disabled={isProcessing}
              >
                <CameraIcon className="w-4 h-4" />
                Scan Receipt
              </button>
            )}
          </div>

          {processingStatus && (
            <div className={`text-sm px-3 py-2 rounded ${
              processingStatus.includes('✓') ? 'bg-green-100 text-green-700' :
              processingStatus.includes('Error') ? 'bg-red-100 text-red-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {isProcessing && <span className="inline-block animate-spin mr-2">⏳</span>}
              {processingStatus}
            </div>
          )}
        </div>

        {/* Manual Entry Form */}
        <form
          className="space-y-4"
          onSubmit={e => {
            e.preventDefault();
            onSave({
              ...form,
              amount: parseFloat(form.amount) || 0
            });
          }}
        >
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Date</label>
            <input
              type="date"
              className="form-input w-full rounded-lg border-slate-300 focus:border-red-500 focus:ring-red-500"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Description</label>
            <input
              type="text"
              className="form-input w-full rounded-lg border-slate-300 focus:border-red-500 focus:ring-red-500"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Enter expense description..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Amount (€)</label>
            <input
              type="number"
              className="form-input w-full rounded-lg border-slate-300 focus:border-red-500 focus:ring-red-500"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              placeholder="0.00"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Category</label>
            <select
              className="form-select w-full rounded-lg border-slate-300 focus:border-red-500 focus:ring-red-500"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
            >
              <option value="general">General</option>
              <option value="fuel">Fuel</option>
              <option value="maintenance">Vehicle Maintenance</option>
              <option value="food">Food & Meals</option>
              <option value="office">Office Supplies</option>
              <option value="travel">Travel & Accommodation</option>
              <option value="parking">Parking & Tolls</option>
              <option value="insurance">Insurance</option>
              <option value="telecommunications">Telecommunications</option>
            </select>
          </div>

          <div className="flex gap-2 pt-4 justify-end">
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-danger shadow-md hover:shadow-lg"
              disabled={isProcessing || !form.description || !form.amount}
            >
              {editing ? 'Update' : 'Save'} Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
