import React from 'react';
import ModalPortal from './ModalPortal';
import { CloseIcon } from './Icons';

/**
 * Modal for displaying authentication errors and prompting users to re-login
 */
export default function AuthErrorModal({ isOpen, onClose, onReLogin, error = null }) {
  const defaultError = "Your login session has expired or is invalid. Please log in again to continue.";
  const displayError = error || defaultError;

  const handleReLogin = () => {
    onClose();
    if (onReLogin) {
      onReLogin();
    }
  };

  return (
    <ModalPortal isOpen={isOpen}>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-error-modal-title"
        aria-describedby="auth-error-modal-description"
      >
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
            onClick={onClose}
            aria-label="Close authentication error dialog"
          >
            <CloseIcon className="w-6 h-6" />
          </button>

          {/* Error Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 15.5C3.544 17.333 4.506 19 6.046 19z" 
                />
              </svg>
            </div>
          </div>

          <h2 id="auth-error-modal-title" className="text-xl font-bold mb-4 text-red-700 text-center">
            Authentication Required
          </h2>

          <p id="auth-error-modal-description" className="text-gray-600 mb-6 text-center">
            {displayError}
          </p>

          <div className="flex gap-3 justify-center">
            <button
              type="button"
              className="btn btn-outline px-6 py-2"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger px-6 py-2"
              onClick={handleReLogin}
            >
              Re-Login
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}