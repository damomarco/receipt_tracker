
export interface Receipt {
  id: string;
  image: string; // base64 data URL
  merchant: {
    original: string;
    translated: string;
  };
  date: string; // YYYY-MM-DD
  total: number;
  currency: string;
  status: 'pending' | 'syncing' | 'synced';
}

export interface ExtractedReceiptData {
  merchant: {
    original: string;
    translated: string;
  };
  date: string; // Should be in YYYY-MM-DD format
  total: number;
  currency: string;
}
