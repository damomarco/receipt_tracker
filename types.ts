

export const DEFAULT_CATEGORIES = [
  'Food & Drink',
  'Groceries',
  'Transportation',
  'Shopping',
  'Lodging',
  'Entertainment',
  'Utilities',
  'Health & Wellness',
  'Other',
] as const;

export type DefaultCategory = typeof DEFAULT_CATEGORIES[number];
export type Category = string;

export const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'United States Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'GBP', name: 'British Pound Sterling' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'HKD', name: 'Hong Kong Dollar' },
  { code: 'NZD', name: 'New Zealand Dollar' },
] as const;

export type SupportedCurrencyCode = typeof SUPPORTED_CURRENCIES[number]['code'];

export interface ReceiptItemData {
  description: {
    original: string;
    translated: string;
  };
  price: number;
  category: Category;
}

export interface Receipt {
  id: string;
  merchant: {
    original: string;
    translated: string;
  };
  date: string; // YYYY-MM-DD
  location?: string; // e.g., "Tokyo, Japan"
  total: number;
  currency: string;
  items: ReceiptItemData[];
  status: 'pending' | 'syncing' | 'synced';
  tripId?: string;
}

export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface ExtractedReceiptData {
  merchant: {
    original: string;
    translated: string;
  };
  date: string; // Should be in YYYY-MM-DD format
  location?: {
    determined: string; // The AI's best guess for the location.
    suggestions: string[]; // A list of possible countries if the AI is uncertain.
  };
  total: number;
  currency: string;
  items: ReceiptItemData[];
}

export interface ExchangeRateCache {
    [key: string]: number; // key format: "YYYY-MM-DD_FROM_TO"
}