import { useState, useEffect, useCallback, useRef } from 'react';
import { client } from '../api/client';

export function useChartPolling(ticker, timeframe) {
  const [candles, setCandles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stale, setStale] = useState(false);
  
  const backoffRef = useRef(90000);
  const timerRef = useRef(null);

  const poll = useCallback(async () => {
    if (!ticker) return;
    
    const result = await client.fetchCandles(ticker, timeframe);
    
    if (result.data) {
      setCandles(result.data);
      setStale(result.stale);
      setError(null);
      backoffRef.current = timeframe.includes('m') ? 90000 : 300000;
    } else {
      setError(result.error);
      backoffRef.current = Math.min(backoffRef.current * 1.5, 600000);
    }
    setLoading(false);
    
    timerRef.current = setTimeout(poll, backoffRef.current);
  }, [ticker, timeframe]);

  useEffect(() => {
    setLoading(true);
    clearTimeout(timerRef.current);
    poll();
    return () => clearTimeout(timerRef.current);
  }, [poll, ticker, timeframe]);

  return { candles, loading, error, stale };
}
