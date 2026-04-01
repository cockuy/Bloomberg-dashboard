import React, { useState, useEffect } from 'react';
import { client } from '../api/client';

const FundamentalsPanel = ({ ticker }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const res = await client.fetchFundamentals(ticker);
      if (res.data) {
        setData(res.data);
        setError(null);
      } else {
        setError(res.error);
      }
      setLoading(false);
    };
    fetch();
  }, [ticker]);

  const format = (val, type) => {
    if (val === null || val === undefined) return '—';
    if (type === 'currency') return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (type === 'percent') return `${(val * 100).toFixed(2)}%`;
    return val.toLocaleString();
  };

  const metrics = [
    { label: 'PE Ratio', key: 'pe_ratio' },
    { label: 'Market Cap', key: 'market_cap', type: 'currency' },
    { label: 'EPS', key: 'eps' },
    { label: 'ROE', key: 'roe', type: 'percent' },
    { label: 'Debt/Equity', key: 'debt_to_equity' },
    { label: 'Div Yield', key: 'dividend_yield', type: 'percent' },
    { label: '52W High', key: 'week_52_high' },
    { label: '52W Low', key: 'week_52_low' },
    { label: 'Book Value', key: 'book_value' },
  ];

  return (
    <div className="p-4 border-b border-border bg-bg">
      <h3 className="text-[10px] font-bold text-orange tracking-widest mb-4 uppercase">Fundamentals</h3>
      
      {error ? (
        <div className="text-red text-[10px] font-mono">Fundamentals unavailable</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {metrics.map(m => (
            <div key={m.label} className="bg-panel p-3 border border-border">
              <div className="text-[9px] text-muted uppercase mb-1">{m.label}</div>
              {loading ? (
                <div className="h-4 w-16 bg-border animate-pulse rounded"></div>
              ) : (
                <div className="text-xs font-bold text-text font-mono">
                  {format(data?.[m.key], m.type)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FundamentalsPanel;
