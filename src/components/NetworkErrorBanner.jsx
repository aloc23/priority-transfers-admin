import { useState } from 'react';
import { XIcon, WarningIcon } from './Icons';

export default function NetworkErrorBanner({ show, onDismiss, onRetry }) {
  const [dismissed, setDismissed] = useState(false);

  if (!show || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) onDismiss();
  };

  const handleRetry = () => {
    setDismissed(false);
    if (onRetry) onRetry();
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <WarningIcon className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Connection Error</p>
            <p className="text-sm text-red-100">
              Unable to connect to server. Some data may not be up to date.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRetry}
            className="px-3 py-1 text-xs bg-red-700 hover:bg-red-800 rounded font-medium transition-colors"
          >
            Retry
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-red-700 rounded transition-colors"
            aria-label="Dismiss"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}