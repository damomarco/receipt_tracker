import React from 'react';
import { HashtagIcon, CashIcon } from './icons';
import { CategorySpendingChart } from './CategorySpendingChart';
import { useReceipts } from '../contexts/ReceiptsContext';

export const SpendingSummary: React.FC = () => {
  const { receipts } = useReceipts();

  const totalReceipts = receipts.length;

  const totalsByCurrency = React.useMemo(() => {
    return receipts.reduce((acc, receipt) => {
      const currency = receipt.currency || 'UNKNOWN';
      if (!acc[currency]) {
        acc[currency] = 0;
      }
      acc[currency] += receipt.total;
      return acc;
    }, {} as Record<string, number>);
  }, [receipts]);

  const currencyEntries = Object.entries(totalsByCurrency);

  if (receipts.length === 0) {
    return null; // Don't show the summary if there are no receipts
  }

  return (
    <div className="mb-6 bg-white dark:bg-gray-800/50 p-4 md:p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Spending Summary</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md">
          <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full">
            <HashtagIcon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Receipts</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalReceipts}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md">
          <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full">
            <CashIcon className="w-6 h-6 text-green-600 dark:text-green-300" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
            <div className="text-xl font-semibold text-gray-900 dark:text-white">
              {currencyEntries.length > 0 ? (
                currencyEntries.map(([currency, total], index) => (
                  <span key={currency}>
                    {new Intl.NumberFormat('ja-JP', { style: 'currency', currency, minimumFractionDigits: 0, currencyDisplay: 'symbol' }).format(total as number)}
                    {index < currencyEntries.length - 1 && <span className="mx-2">|</span>}
                  </span>
                ))
              ) : (
                'N/A'
              )}
            </div>
          </div>
        </div>
      </div>
      <CategorySpendingChart />
    </div>
  );
};