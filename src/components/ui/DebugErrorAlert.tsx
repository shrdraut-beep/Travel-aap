import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const DebugErrorAlert: React.FC<{ error: string | null; onRetry?: () => void }> = ({ error, onRetry }) => {
  if (!error) return null;
  
  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm my-4 w-full text-left">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-red-800 font-bold text-sm">API Request Failed</h3>
          <div className="mt-1 text-sm text-red-700 font-mono whitespace-pre-wrap break-words max-w-full">
            {error}
          </div>
          {onRetry && (
            <button onClick={onRetry} className="mt-3 text-sm font-semibold text-red-700 hover:text-red-600 underline">
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
