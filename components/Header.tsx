
import React from 'react';
import { ReceiptIcon, CloudSlashIcon, SpinnerIcon, CheckCircleIcon } from './icons';

interface HeaderProps {
  isOnline: boolean;
  pendingCount: number;
  syncingCount: number;
}

const SyncStatus: React.FC<Omit<HeaderProps, 'isOnline'>> = ({ pendingCount, syncingCount }) => {
  if (syncingCount > 0) {
    return (
      <div className="flex items-center space-x-2 text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
        <SpinnerIcon className="w-4 h-4" />
        <span>Syncing {syncingCount} item{syncingCount > 1 ? 's' : ''}...</span>
      </div>
    );
  }

  if (pendingCount > 0) {
     return (
      <div className="flex items-center space-x-2 text-sm text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
        <CloudSlashIcon className="w-4 h-4" />
        <span>Offline ({pendingCount} pending)</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-sm text-green-700 bg-green-100 px-3 py-1 rounded-full">
      <CheckCircleIcon className="w-4 h-4" />
      <span>All changes synced</span>
    </div>
  );
};

export const Header: React.FC<HeaderProps> = ({ isOnline, pendingCount, syncingCount }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 md:px-6 md:py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ReceiptIcon className="w-8 h-8 text-blue-600" />
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">
            Travel Receipt Manager
          </h1>
        </div>
        <div className="hidden sm:block">
          {!isOnline && pendingCount === 0 && syncingCount === 0 ? (
            <div className="flex items-center space-x-2 text-sm text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
              <CloudSlashIcon className="w-4 h-4" />
              <span>Offline</span>
            </div>
          ) : (
            <SyncStatus pendingCount={pendingCount} syncingCount={syncingCount} />
          )}
        </div>
      </div>
    </header>
  );
};
