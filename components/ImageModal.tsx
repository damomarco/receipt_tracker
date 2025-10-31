import React from 'react';
import { XIcon } from './icons';

interface ImageModalProps {
  imageSrc: string;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ imageSrc, onClose }) => {
  // Effect to handle Escape key press for better accessibility
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Fullscreen image viewer"
    >
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
      <div
        className="relative max-w-full max-h-full"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
      >
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 md:-top-4 md:-right-4 bg-white text-gray-800 rounded-full p-2 shadow-lg z-10 hover:bg-gray-200 transition-transform transform hover:scale-110"
          aria-label="Close image viewer"
        >
          <XIcon className="w-6 h-6" />
        </button>
        <img
          src={imageSrc}
          alt="Full-size receipt"
          className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl"
        />
      </div>
    </div>
  );
};
