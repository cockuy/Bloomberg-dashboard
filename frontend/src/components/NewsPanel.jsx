import React, { useState } from 'react';
import { useNewsPolling } from '../hooks/useNewsPolling';
import NewsItem from './NewsItem';

const NewsPanel = ({ ticker }) => {
  const [tab, setTab] = useState('today');
  const { news, loading, error } = useNewsPolling(ticker);

  const tabs = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'company', label: 'Company' },
  ];

  return (
    <div className="p-4 bg-bg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[10px] font-bold text-orange tracking-widest uppercase">News</h3>
        <div className="flex gap-4">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`text-[10px] font-bold uppercase transition-colors ${tab === t.id ? 'text-text' : 'text-muted hover:text-text'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {loading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="h-12 bg-panel border border-border animate-pulse rounded"></div>
          ))
        ) : error ? (
          <div className="text-red text-[10px] font-mono">News unavailable</div>
        ) : news[tab].length === 0 ? (
          <div className="text-muted text-[10px] font-mono italic py-4">No news items found for this period</div>
        ) : (
          news[tab].map((item, i) => (
            <NewsItem key={i} item={item} />
          ))
        )}
      </div>
    </div>
  );
};

export default NewsPanel;
