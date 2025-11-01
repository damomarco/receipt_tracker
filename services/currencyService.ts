const API_BASE = 'https://api.frankfurter.app';

/**
 * Fetches the exchange rate for a specific date.
 * If the API returns a 404 (e.g., for a weekend/holiday), it recursively tries the previous day.
 * @param date The date in YYYY-MM-DD format.
 * @param from The currency code to convert from.
 * @param to The currency code to convert to.
 * @returns The exchange rate, or null if an error occurs.
 */
export const fetchExchangeRate = async (date: string, from: string, to: string): Promise<number | null> => {
  if (from === to) return 1;

  try {
    const response = await fetch(`${API_BASE}/${date}?from=${from}&to=${to}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`No exchange rate data for ${date}. Trying previous day.`);
        
        const prevDate = new Date(date + 'T00:00:00'); // Ensure parsing as local time
        prevDate.setDate(prevDate.getDate() - 1);
        const prevDateString = prevDate.toISOString().split('T')[0];
        
        // Prevent infinite recursion for very old dates
        if (new Date(prevDateString).getFullYear() < 1999) {
            return null;
        }

        return fetchExchangeRate(prevDateString, from, to);
      }
      throw new Error(`Failed to fetch exchange rate: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.rates && data.rates[to]) {
      return data.rates[to];
    }
    
    console.warn(`Rate for ${to} not found in response for date ${date}`);
    return null;
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return null;
  }
};
