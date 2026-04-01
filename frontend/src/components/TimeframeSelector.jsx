import React from 'react';

const TimeframeSelector = ({ active, onChange }) => {
  const tfs = ['1m', '5m', '15m', '1D', '1W', '1M'];

  return (
    <div className="flex gap-1">
      {tfs.map(tf => (
        <button
          key={tf}
          onClick={() => onChange(tf)}
          className={`
            px-3 py-1 text-[10px] font-bold border transition-all
            ${active === tf 
              ? 'border-orange text-orange bg-orange/5' 
              : 'border-border text-muted hover:border-muted'}
          `}
        >
          {tf}
        </button>
      ))}
    </div>
  );
};

export default TimeframeSelector;
