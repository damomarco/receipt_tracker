import React, { useState } from 'react';
import { useReceipts } from '../contexts/ReceiptsContext';
import { ReceiptIcon, CashIcon, ChevronDownIcon } from './icons';
import { CategorySpendingChart } from './CategorySpendingChart';

interface Totals {
  [currency: string]: number;
}

interface SpendingSummaryProps {
  dateFilter: { start: string; end: string };
  setDateFilter: React.Dispatch<React.SetStateAction<{ start: string; end: string }>>;
}

export const SpendingSummary: React.FC<SpendingSummaryProps> = ({ dateFilter, setDateFilter }) => {
  const { receipts } = useReceipts();
  const [isExpanded, setIsExpanded] = useState(true);

  const totalsByCurrency = React.useMemo(() => {
    return receipts.reduce((acc, receipt) => {
      const currency = receipt.currency || 'UNKNOWN';
      if (!acc[currency]) {
        acc[currency] = 0;
      }
      const receiptTotalFromItems = receipt.items.reduce((sum, item) => sum + (item.price || 0), 0);
      acc[currency] += receiptTotalFromItems;
      return acc;
    }, {} as Totals);
  }, [receipts]);
  
  const sortedCurrencies = Object.keys(totalsByCurrency).sort();

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    setDateFilter(prev => ({ ...prev, [field]: value }));
  };
  
  const clearFilters = () => {
    setDateFilter({ start: '', end: '' });
  }

  const today = new Date().toISOString().split('T')[0];

  if (receipts.length === 0 && !dateFilter.start && !dateFilter.end) {
    return null; // Don't show summary if there are no receipts and no filters are set
  }

  return (
    <div className="mb-6 bg-white dark:bg-gray-800/50 rounded-lg shadow-md">
      <div
        className="flex justify-between items-center p-4 md:p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        aria-expanded={isExpanded}
        aria-controls="spending-summary-content"
      >
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Spending Summary</h2>
        <ChevronDownIcon className={`w-6 h-6 text-gray-500 dark:text-gray-400 transition-transform transform ${isExpanded ? 'rotate-180' : ''}`} />
      </div>
      
      {isExpanded && (
        <div id="spending-summary-content" className="px-4 md:px-6 pb-4 md:pb-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center justify-end py-4 gap-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="flex-1 min-w-[120px]">
                <label htmlFor="start-date" className="block text-xs font-medium text-gray-500 dark:text-gray-400">From</label>
                <input 
                  type="date"
                  id="start-date"
                  value={dateFilter.start}
                  onChange={(e) => handleDateChange('start', e.target.value)}
                  max={dateFilter.end || today}
                  className="mt-1 w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <label htmlFor="end-date" className="block text-xs font-medium text-gray-500 dark:text-gray-400">To</label>
                <input
                  type="date"
                  id="end-date"
                  value={dateFilter.end}
                  onChange={(e) => handleDateChange('end', e.target.value)}
                  min={dateFilter.start}
                  max={today}
                  className="mt-1 w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <button onClick={clearFilters} className="self-end text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 h-9">
                Clear
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <ReceiptIcon className="w-5 h-5 mr-2" />
                <h3 className="text-sm font-medium uppercase tracking-wider">Filtered Receipts</h3>
              </div>
              <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2">{receipts.length}</p>
            </div>
            
            {sortedCurrencies.map(currency => (
              <div key={currency} className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <CashIcon className="w-5 h-5 mr-2" />
                  <h3 className="text-sm font-medium uppercase tracking-wider">Total Spent ({currency})</h3>
                </div>
                <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2">
                  {new Intl.NumberFormat('ja-JP', { style: 'currency', currency, minimumFractionDigits: 0 }).format(totalsByCurrency[currency])}
                </p>
              </div>
            ))}
            {receipts.length > 0 && sortedCurrencies.length === 0 && (
                 <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg sm:col-span-2">
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                        <CashIcon className="w-5 h-5 mr-2" />
                        <h3 className="text-sm font-medium uppercase tracking-wider">Total Spent</h3>
                    </div>
                    <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2">No expenses recorded for this period.</p>
                 </div>
            )}
          </div>
          
          <CategorySpendingChart />
        </div>
      )}
    </div>
  );
};