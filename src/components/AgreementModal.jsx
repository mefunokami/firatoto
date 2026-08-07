import React from 'react';

const AgreementModal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-lg shadow-lg max-w-2xl w-full p-6 relative"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6 text-center border-b pb-3 text-black">{title}</h2>
        <div className="max-h-[60vh] overflow-y-auto text-base text-gray-800 dark:text-gray-200">{children}</div>
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 dark:text-gray-400 hover:text-black text-2xl">&times;</button>
      </div>
    </div>
  );
};

export default AgreementModal; 