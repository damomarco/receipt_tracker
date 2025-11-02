import React, { useState, useRef, useEffect } from 'react';
import { ReceiptIcon, CloudSlashIcon, SpinnerIcon, CheckCircleIcon, CogIcon, SunIcon, MoonIcon, ComputerDesktopIcon, CashIcon, BriefcaseIcon, DownloadIcon, ArrowUpTrayIcon } from './icons';
import { useTheme } from '../hooks/useTheme';
import { useCurrency } from '../contexts/CurrencyContext';
import { SUPPORTED_CURRENCIES, SupportedCurrencyCode } from '../types';

interface HeaderProps {
  isOnline: boolean;
  pendingCount: number;
  syncingCount: number;
  onManageCategories: () => void;
  onManageTrips: () => void;
  selectedTripName: string | null;
  onExportData: () => void;
  onImportData: () => void;
}

const SyncStatus: React.FC<Omit<HeaderProps, 'isOnline' | 'onManageCategories' | 'onManageTrips' | 'selectedTripName' | 'onExportData' | 'onImportData'>> = ({ pendingCount, syncingCount }) => {
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

export const Header: React.FC<HeaderProps> = ({ isOnline, pendingCount, syncingCount, onManageCategories, onManageTrips, selectedTripName, onExportData, onImportData }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { homeCurrency, setHomeCurrency, ratesLastUpdated } = useCurrency();
  const settingsRef = useRef<HTMLDivElement>(null);

  const themes = [
    { name: 'Light', value: 'light', icon: SunIcon },
    { name: 'Dark', value: 'dark', icon: MoonIcon },
    { name: 'System', value: 'system', icon: ComputerDesktopIcon },
  ];
  
  const handleCurrencyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value === 'none') {
      setHomeCurrency(null);
    } else {
      setHomeCurrency(value as SupportedCurrencyCode);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const timeAgo = (date: string | null): string => {
    if (!date) return 'never';
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "just now";
  }

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md dark:shadow-gray-800/50 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 md:px-6 md:py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 min-w-0">
          <ReceiptIcon className="w-8 h-8 text-blue-600 dark:text-blue-500 flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight truncate">
              Travel Receipt Manager
            </h1>
            {selectedTripName && (
              <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold truncate" title={selectedTripName}>
                {selectedTripName}
              </p>
            )}
          </div>
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
            <div ref={settingsRef} className="relative">
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                aria-label="Open settings menu"
                aria-haspopup="true"
                aria-expanded={isSettingsOpen}
              >
                <CogIcon className="w-6 h-6" />
              </button>
              {isSettingsOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="py-1" role="none">
                    <div className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Settings</div>
                    <button
                      onClick={() => {
                        onManageTrips();
                        setIsSettingsOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      role="menuitem"
                    >
                      <BriefcaseIcon className="w-5 h-5 mr-3" />
                      Manage Trips
                    </button>
                    <button
                      onClick={() => {
                        onManageCategories();
                        setIsSettingsOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      role="menuitem"
                    >
                      <CogIcon className="w-5 h-5 mr-3" />
                      Manage Categories
                    </button>
                     <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                      <label htmlFor="home-currency" className="flex items-center text-sm font-medium">
                        <CashIcon className="w-5 h-5 mr-3" />
                        Home Currency
                      </label>
                      <select
                        id="home-currency"
                        value={homeCurrency || 'none'}
                        onChange={handleCurrencyChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-gray-50 dark:bg-gray-700"
                      >
                        <option value="none">None</option>
                        {SUPPORTED_CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
                      </select>
                       <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                        Rates last updated: {timeAgo(ratesLastUpdated)}
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700"></div>
                  <div className="py-1" role="none">
                    <div className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data Portability</div>
                    <button
                      onClick={() => {
                        onImportData();
                        setIsSettingsOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      role="menuitem"
                    >
                      <ArrowUpTrayIcon className="w-5 h-5 mr-3" />
                      Import from Backup...
                    </button>
                    <button
                      onClick={() => {
                        onExportData();
                        setIsSettingsOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      role="menuitem"
                    >
                      <DownloadIcon className="w-5 h-5 mr-3" />
                      Export to Backup...
                    </button>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700"></div>
                  <div className="py-1" role="none">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Theme</div>
                    {themes.map(({ name, value, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => {
                          setTheme(value as 'light' | 'dark' | 'system');
                        }}
                        className={`flex items-center w-full px-4 py-2 text-sm text-left ${
                          theme === value
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        role="menuitemradio"
                        aria-checked={theme === value}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
        </div>
      </div>
    </header>
  );
};