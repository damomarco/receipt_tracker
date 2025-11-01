import React, { useState, useMemo } from 'react';
import { Receipt } from '../types';
import { ReceiptItem } from './ReceiptItem';
import { DownloadIcon, CalendarIcon, ChevronDownIcon } from './icons';
import { exportToCSV } from '../utils/csv';
import { useReceipts } from '../contexts/ReceiptsContext';

interface ReceiptListProps {
  totalReceiptCount: number;
}

export const ReceiptList: React.FC<ReceiptListProps> = ({ totalReceiptCount }) => {
  const { receipts } = useReceipts();
  
  const groupedByMonth = useMemo(() => {
    return receipts.reduce((acc, receipt) => {
      const month = receipt.date.substring(0, 7); // YYYY-MM
      const date = receipt.date;
      if (!acc[month]) {
        acc[month] = {};
      }
      if (!acc[month][date]) {
          acc[month][date] = [];
      }
      acc[month][date].push(receipt);
      return acc;
    }, {} as Record<string, Record<string, Receipt[]>>);
  }, [receipts]);

  const sortedMonths = useMemo(() => Object.keys(groupedByMonth).sort((a, b) => b.localeCompare(a)), [groupedByMonth]);

  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>(() => {
    if (sortedMonths.length > 0) {
      // Expand the most recent month by default
      return { [sortedMonths[0]]: true };
    }
    return {};
  });

  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>(() => {
    if (sortedMonths.length > 0) {
      const mostRecentMonth = sortedMonths[0];
      const daysInMonth = Object.keys(groupedByMonth[mostRecentMonth]).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      if (daysInMonth.length > 0) {
        // Expand the most recent day in the most recent month by default
        return { [daysInMonth[0]]: true };
      }
    }
    return {};
  });

  const toggleMonthExpansion = (month: string) => {
    setExpandedMonths(prev => ({ ...prev, [month]: !prev[month] }));
  };

  const toggleDayExpansion = (date: string) => {
    setExpandedDays(prev => ({ ...prev, [date]: !prev[date] }));
  };


  if (totalReceiptCount === 0) {
    return (
      <div className="text-center py-20 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">No receipts yet</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Tap the '+' button to add your first receipt.</p>
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <div className="text-center py-20 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">No Receipts Found</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">No receipts match the current date filter. Try adjusting the dates or clearing the filter.</p>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {sortedMonths.map(month => {
        const isMonthExpanded = !!expandedMonths[month];
        const monthObj = new Date(month + '-02T00:00:00'); // Use day 2 to avoid timezone issues
        const formattedMonth = monthObj.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
        });
        
        const daysInMonth = Object.keys(groupedByMonth[month]).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        const allReceiptsInMonth = daysInMonth.flatMap(date => groupedByMonth[month][date]);

        return (
          <div key={month} className="bg-white dark:bg-gray-800/50 rounded-lg shadow-md transition-all duration-300">
            <div
              className="flex justify-between items-center p-4 md:p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg"
              onClick={() => toggleMonthExpansion(month)}
              role="button"
              aria-expanded={isMonthExpanded}
              aria-controls={`receipts-for-${month}`}
            >
              <div className="flex items-center space-x-3">
                <CalendarIcon className="w-7 h-7 text-gray-500 dark:text-gray-400" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{formattedMonth}</h2>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    exportToCSV(allReceiptsInMonth, month);
                  }}
                  className="flex items-center space-x-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2 px-3 rounded-md transition-colors"
                  aria-label={`Export receipts for ${formattedMonth} to CSV`}
                >
                  <DownloadIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Export Month</span>
                </button>
                <ChevronDownIcon className={`w-6 h-6 text-gray-500 dark:text-gray-400 transition-transform transform ${isMonthExpanded ? 'rotate-180' : ''}`} />
              </div>
            </div>
            
            {isMonthExpanded && (
              <div id={`receipts-for-${month}`} className="px-4 md:px-6 pb-4 md:pb-6 space-y-4 border-t border-gray-200 dark:border-gray-700">
                {daysInMonth.map(date => {
                  const isDayExpanded = !!expandedDays[date];
                  const dateObj = new Date(date + 'T00:00:00'); // To avoid timezone issues
                  const formattedDate = dateObj.toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  });

                  return (
                    <div key={date} className="bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div
                        className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg"
                        onClick={() => toggleDayExpansion(date)}
                        role="button"
                        aria-expanded={isDayExpanded}
                        aria-controls={`receipts-for-${date}`}
                      >
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">{formattedDate}</h3>
                        </div>
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              exportToCSV(groupedByMonth[month][date], date);
                            }}
                            className="flex items-center space-x-2 text-xs bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 font-semibold py-1 px-2 rounded-md transition-colors"
                            aria-label={`Export receipts for ${formattedDate} to CSV`}
                          >
                            <DownloadIcon className="w-3 h-3" />
                            <span className="hidden sm:inline">Export Day</span>
                          </button>
                          <ChevronDownIcon className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform transform ${isDayExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                      
                      {isDayExpanded && (
                        <div id={`receipts-for-${date}`} className="px-4 pb-4">
                          <div className="space-y-4 border-t border-gray-200 dark:border-gray-600 pt-4">
                            {groupedByMonth[month][date].map(receipt => (
                              <ReceiptItem key={receipt.id} receipt={receipt} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};