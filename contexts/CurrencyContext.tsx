import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { SupportedCurrencyCode, ExchangeRateCache } from '../types';
import { fetchExchangeRate } from '../services/currencyService';

interface CurrencyContextType {
  homeCurrency: SupportedCurrencyCode | null;
  setHomeCurrency: (currency: SupportedCurrencyCode | null) => void;
  getRate: (date: string, from: string, to: string) => Promise<number | null>;
  ratesLastUpdated: string | null;
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

  const value = {
    homeCurrency,
    setHomeCurrency,
    getRate,
    ratesLastUpdated,
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
