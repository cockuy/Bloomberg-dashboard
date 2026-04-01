import React from 'react';

const NewsItem = ({ item }) => {
  const timeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
  };

  return (
    <a 
      href={item.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block p-3 bg-panel border border-border hover:border-muted transition-colors group"
    >
      <div className="text-xs font-medium text-text group-hover:text-orange mb-1 leading-snug">
        {item.headline}
      </div>
      <div className="flex justify-between items-center text-[9px] font-mono uppercase">
        <span className="text-orange">{item.source}</span>
        <span className="text-muted">{timeAgo(item.published_at)}</span>
      </div>
    </a>
  );
};

export default NewsItem;
