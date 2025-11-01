import React, { useState, useRef, useEffect } from 'react';
import { ReceiptIcon, CloudSlashIcon, SpinnerIcon, CheckCircleIcon, CogIcon, SunIcon, MoonIcon, ComputerDesktopIcon } from './icons';
import { useTheme } from '../hooks/useTheme';

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const settingsRef = useRef<HTMLDivElement>(null);

  const themes = [
    { name: 'Light', value: 'light', icon: SunIcon },
    { name: 'Dark', value: 'dark', icon: MoonIcon },
    { name: 'System', value: 'system', icon: ComputerDesktopIcon },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="py-1" role="none">
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
