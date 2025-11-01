import React, { useState } from 'react';
import { Receipt } from '../types';
import { ReceiptItem } from './ReceiptItem';
import { DownloadIcon, CalendarIcon, ChevronDownIcon } from './icons';
import { exportToCSV } from '../utils/csv';

interface ReceiptListProps {
  receipts: Receipt[];
  onDelete: (id: string) => void;
  onUpdate: (receipt: Receipt) => void;
  allCategories: string[];
}

export const ReceiptList: React.FC<ReceiptListProps> = ({ receipts, onDelete, onUpdate, allCategories }) => {
  const groupedReceipts = receipts.reduce((acc, receipt) => {
    const date = receipt.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(receipt);
    return acc;
  }, {} as Record<string, Receipt[]>);

  const sortedDates = Object.keys(groupedReceipts).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>(() => {
    if (sortedDates.length > 0) {
      // Expand the most recent date group by default
      return { [sortedDates[0]]: true };
    }
    return {};
  });

  const toggleDateExpansion = (date: string) => {
    setExpandedDates(prev => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  if (receipts.length === 0) {
    return (
      <div className="text-center py-20 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">No receipts yet</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Tap the '+' button to add your first receipt.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedDates.map(date => {
        const isExpanded = !!expandedDates[date];
        const dateObj = new Date(date + 'T00:00:00'); // To avoid timezone issues
        const formattedDate = dateObj.toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        
        return (
          <div key={date} className="bg-white dark:bg-gray-800/50 rounded-lg shadow-md transition-all duration-300">
            <div
              className="flex justify-between items-center p-4 md:p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg"
              onClick={() => toggleDateExpansion(date)}
              role="button"
              aria-expanded={isExpanded}
              aria-controls={`receipts-for-${date}`}
            >
              <div className="flex items-center space-x-3">
                <CalendarIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{formattedDate}</h2>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    exportToCSV(groupedReceipts[date], date);
                  }}
                  className="flex items-center space-x-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2 px-3 rounded-md transition-colors"
                  aria-label={`Export receipts for ${formattedDate} to CSV`}
                >
                  <DownloadIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <ChevronDownIcon className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform transform ${isExpanded ? 'rotate-180' : ''}`} />
              </div>
            </div>
            
            {isExpanded && (
              <div id={`receipts-for-${date}`} className="px-4 md:px-6 pb-4 md:pb-6">
                <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                  {groupedReceipts[date].map(receipt => (
                    <ReceiptItem key={receipt.id} receipt={receipt} onDelete={onDelete} onUpdate={onUpdate} allCategories={allCategories} />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
