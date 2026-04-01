const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function apiFetch(endpoint) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'API Error');
    return { data: result.data, error: null, stale: result.stale || false };
  } catch (error) {
    console.error(`Fetch error [${endpoint}]:`, error);
    return { data: null, error: error.message, stale: false };
  }
}

export const client = {
  fetchConfig: () => apiFetch('/api/config'),
  fetchPrices: () => apiFetch('/api/prices'),
  fetchCandles: (ticker, tf) => apiFetch(`/api/candles/${ticker}?tf=${tf}`),
  fetchFundamentals: (ticker) => apiFetch(`/api/fundamentals/${ticker}`),
  fetchNews: (ticker) => apiFetch(`/api/news/${ticker}`),
};
