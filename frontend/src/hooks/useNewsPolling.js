import { useState, useEffect, useCallback, useRef } from 'react';
import { client } from '../api/client';

export function useNewsPolling(ticker) {
  const [news, setNews] = useState({ today: [], week: [], company: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const timerRef = useRef(null);

  const poll = useCallback(async () => {
    if (!ticker) return;
    
    const result = await client.fetchNews(ticker);
    
    if (result.data) {
      setNews(result.data);
      setError(null);
    } else {
      setError(result.error);
    }
    setLoading(false);
    
    timerRef.current = setTimeout(poll, 300000); // 5 mins
  }, [ticker]);

  useEffect(() => {
    setLoading(true);
    clearTimeout(timerRef.current);
    poll();
    return () => clearTimeout(timerRef.current);
  }, [poll, ticker]);

  return { news, loading, error };
}
