import React from 'react';
import { CheckCircleIcon, XCircleIcon } from './icons';

interface NotificationModalProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ type, message, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[101] p-4 animate-fade-in" role="alertdialog" aria-modal="true" aria-labelledby="notification-message">
      <style>{`@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } } .animate-fade-in { animation: fade-in 0.2s; }`}</style>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm m-4 p-6 text-center">
        {type === 'success' ? (
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
        ) : (
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
        )}
        <p id="notification-message" className="text-lg text-gray-800 dark:text-gray-200 mb-6">{message}</p>
        <button
          onClick={onClose}
          className={`w-full font-semibold py-2 px-4 rounded-md shadow-sm transition ${
            type === 'success' 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          OK
        </button>
      </div>
    </div>
  );
};
