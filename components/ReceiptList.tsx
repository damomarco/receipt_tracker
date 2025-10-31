
import React from 'react';
import { Receipt } from '../types';
import { ReceiptItem } from './ReceiptItem';
import { DownloadIcon, CalendarIcon } from './icons';
import { exportToCSV } from '../utils/csv';

interface ReceiptListProps {
  receipts: Receipt[];
  onDelete: (id: string) => void;
  onUpdate: (receipt: Receipt) => void;
}

export const ReceiptList: React.FC<ReceiptListProps> = ({ receipts, onDelete, onUpdate }) => {
  const groupedReceipts = receipts.reduce((acc, receipt) => {
    const date = receipt.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(receipt);
    return acc;
  }, {} as Record<string, Receipt[]>);

  const sortedDates = Object.keys(groupedReceipts).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (receipts.length === 0) {
    return (
      <div className="text-center py-20 px-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-700">No receipts yet</h2>
        <p className="mt-2 text-gray-500">Tap the '+' button to add your first receipt.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sortedDates.map(date => {
        const dateObj = new Date(date + 'T00:00:00'); // To avoid timezone issues
        const formattedDate = dateObj.toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        
        return (
          <div key={date} className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <CalendarIcon className="w-6 h-6 text-gray-500" />
                <h2 className="text-xl font-bold text-gray-800">{formattedDate}</h2>
              </div>
              <button
                onClick={() => exportToCSV(groupedReceipts[date], date)}
                className="flex items-center space-x-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded-md transition-colors"
                aria-label={`Export receipts for ${formattedDate} to CSV`}
              >
                <DownloadIcon className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
            <div className="space-y-4">
              {groupedReceipts[date].map(receipt => (
                <ReceiptItem key={receipt.id} receipt={receipt} onDelete={onDelete} onUpdate={onUpdate} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
