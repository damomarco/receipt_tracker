import React from 'react';
import { ReceiptIcon, CloudSlashIcon, SpinnerIcon, CheckCircleIcon, CogIcon } from './icons';
import { ThemeSwitcher } from './ThemeSwitcher';

interface HeaderProps {
  isOnline: boolean;
  pendingCount: number;
  syncingCount: number;
  onManageCategories: () => void;
}

const SyncStatus: React.FC<Omit<HeaderProps, 'isOnline' | 'onManageCategories'>> = ({ pendingCount, syncingCount }) => {
  if (syncingCount > 0) {
    return (
      <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 px-3 py-1 rounded-full">
        <SpinnerIcon className="w-4 h-4" />
        <span>Syncing {syncingCount} item{syncingCount > 1 ? 's' : ''}...</span>
      </div>
    );
  }

  if (pendingCount > 0) {
     return (
      <div className="flex items-center space-x-2 text-sm text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 px-3 py-1 rounded-full">
        <CloudSlashIcon className="w-4 h-4" />
        <span>Offline ({pendingCount} pending)</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-sm text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/50 px-3 py-1 rounded-full">
      <CheckCircleIcon className="w-4 h-4" />
      <span>All changes synced</span>
    </div>
  );
};

export const Header: React.FC<HeaderProps> = ({ isOnline, pendingCount, syncingCount, onManageCategories }) => {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-md dark:shadow-gray-800/50 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 md:px-6 md:py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ReceiptIcon className="w-8 h-8 text-blue-600 dark:text-blue-500" />
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
            Travel Receipt Manager
          </h1>
        </div>
        <div className="flex items-center space-x-4">
            <div className="hidden sm:block">
              {!isOnline && pendingCount === 0 && syncingCount === 0 ? (
                <div className="flex items-center space-x-2 text-sm text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 px-3 py-1 rounded-full">
                  <CloudSlashIcon className="w-4 h-4" />
                  <span>Offline</span>
                </div>
              ) : (
                <SyncStatus pendingCount={pendingCount} syncingCount={syncingCount} />
              )}
            </div>
            <button
                onClick={onManageCategories}
                className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                aria-label="Manage categories"
            >
                <CogIcon className="w-5 h-5" />
            </button>
            <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
};
