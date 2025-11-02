import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { SupportedCurrencyCode, ExchangeRateCache, SUPPORTED_CURRENCIES } from '../types';
import { fetchExchangeRate } from '../services/currencyService';

const currencyToLocaleMap: Record<SupportedCurrencyCode, string> = {
  USD: 'en-US',
  EUR: 'de-DE', // Representative locale for Euro
  JPY: 'ja-JP',
  GBP: 'en-GB',
  AUD: 'en-AU',
  CAD: 'en-CA',
  CHF: 'de-CH',
  CNY: 'zh-CN',
  HKD: 'zh-HK',
  NZD: 'en-NZ',
};

interface CurrencyContextType {
  homeCurrency: SupportedCurrencyCode | null;
  setHomeCurrency: (currency: SupportedCurrencyCode | null) => void;
  getRate: (date: string, from: string, to: string) => Promise<number | null>;
  ratesLastUpdated: string | null;
  formatDate: (dateString: string, options?: Intl.DateTimeFormatOptions) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [homeCurrency, setHomeCurrency] = useLocalStorage<SupportedCurrencyCode | null>('homeCurrency', null);
  const [ratesCache, setRatesCache] = useLocalStorage<ExchangeRateCache>('ratesCache', {});
  const [ratesLastUpdated, setRatesLastUpdated] = useLocalStorage<string | null>('ratesLastUpdated', null);

  const getRate = useCallback(async (date: string, from: string, to: string): Promise<number | null> => {
    if (from === to) return 1;
    
    const cacheKey = `${date}_${from}_${to}`;
    if (ratesCache[cacheKey]) {
      return ratesCache[cacheKey];
    }
    
    const rate = await fetchExchangeRate(date, from, to);
    
    if (rate !== null) {
      setRatesCache(prev => ({ ...prev, [cacheKey]: rate }));
      setRatesLastUpdated(new Date().toISOString());
    }
    
    return rate;
  }, [ratesCache, setRatesCache, setRatesLastUpdated]);

  const formatDate = useCallback((dateString: string, options?: Intl.DateTimeFormatOptions): string => {
    const locale = homeCurrency ? currencyToLocaleMap[homeCurrency] : undefined;
    
    const formattingOptions: Intl.DateTimeFormatOptions = options || {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    };
    
    try {
        // Appending T00:00:00 helps parse the date in the local timezone rather than UTC
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString(locale, formattingOptions);
    } catch (e) {
        console.error("Error formatting date:", e);
        return dateString; // Fallback to original string on error
    }
  }, [homeCurrency]);

  const value = {
    homeCurrency,
    setHomeCurrency,
    getRate,
    ratesLastUpdated,
    formatDate,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
