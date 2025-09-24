import React from 'react';
import ModalPortal from './ModalPortal';
import { CloseIcon } from './Icons';

/**
 * Modal for displaying general booking and data errors
 */
export default function ErrorModal({ isOpen, onClose, title = "Error", error = null }) {
  const defaultError = "An unexpected error occurred. Please try again.";
  
  // Handle both Error objects and strings safely
  let displayError = defaultError;
  if (error) {
    if (error instanceof Error) {
      displayError = error.message;
    } else if (typeof error === 'string') {
      displayError = error;
    } else {
      displayError = String(error);
    }
  }

  return (
    <ModalPortal isOpen={isOpen}>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="error-modal-title"
        aria-describedby="error-modal-description"
      >
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative">
          {/* Close button */}
          <button
            type="button"
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={onClose}
            aria-label="Close error modal"
          >
            <CloseIcon className="w-6 h-6" />
          </button>

          {/* Error icon */}
          <div className="flex justify-center pt-6 pb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-red-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
          </div>

          <h2 id="error-modal-title" className="text-xl font-bold mb-4 text-red-700 text-center">
            {title}
          </h2>

          <p id="error-modal-description" className="text-gray-600 mb-6 text-center px-6">
            {displayError}
          </p>

          <div className="flex justify-center pb-6">
            <button
              type="button"
              className="btn btn-primary px-8 py-2"
              onClick={onClose}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}