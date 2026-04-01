import { useState, useEffect, useCallback, useRef } from 'react';
import { client } from '../api/client';

export function usePortfolioPolling() {
  const [data, setData] = useState({
    portfolio: [],
    watchlist: [],
    summary: null,
    lastUpdated: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stale, setStale] = useState(false);
  
  const backoffRef = useRef(20000); // Start at 20s
  const timerRef = useRef(null);

  const poll = useCallback(async () => {
    const result = await client.fetchPrices();
    
    if (result.data) {
      setData({
        portfolio: result.data.portfolio,
        watchlist: result.data.watchlist,
        summary: result.data.summary,
        lastUpdated: result.data.summary.last_updated
      });
      setStale(result.stale);
      setError(null);
      backoffRef.current = 20000; // Reset backoff
    } else {
      setError(result.error);
      // Exponential backoff up to 5 mins
      backoffRef.current = Math.min(backoffRef.current * 1.5, 300000);
    }
    setLoading(false);
    
    timerRef.current = setTimeout(poll, backoffRef.current);
  }, []);

  useEffect(() => {
    poll();
    return () => clearTimeout(timerRef.current);
  }, [poll]);

  return { ...data, loading, error, stale };
}
