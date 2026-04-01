import React, { useState, useEffect, useRef } from 'react';

const StockRow = ({ stock, isActive, onClick, isPortfolio }) => {
  const [flash, setFlash] = useState(null);
  const prevPrice = useRef(stock.ltp);

  useEffect(() => {
    if (stock.ltp !== prevPrice.current) {
      setFlash(stock.ltp > prevPrice.current ? 'green' : 'red');
      prevPrice.current = stock.ltp;
      const timer = setTimeout(() => setFlash(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [stock.ltp]);

  const pnlColor = stock.change_pct >= 0 ? 'text-green' : 'text-red';

  return (
    <div 
      onClick={onClick}
      className={`
        relative p-2 border-b border-border cursor-pointer transition-colors group
        ${isActive ? 'bg-panel border-l-2 border-l-orange' : 'hover:bg-panel/50'}
        ${flash === 'green' ? 'flash-green' : flash === 'red' ? 'flash-red' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-text">{stock.ticker.replace('.NS', '')}</span>
          {isPortfolio && (
            <span className="text-[9px] text-muted">{stock.qty} SH</span>
          )}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[11px] font-mono text-text">{stock.ltp?.toFixed(2)}</span>
          <span className={`text-[9px] font-mono ${pnlColor}`}>
            {stock.change_pct >= 0 ? '+' : ''}{stock.change_pct?.toFixed(2)}%
          </span>
        </div>
      </div>

      {isPortfolio && (
        <div className="w-full h-[2px] bg-border mt-1">
          <div 
            className="h-full bg-orange transition-all duration-500" 
            style={{ width: `${stock.allocation_pct || 0}%` }}
          ></div>
        </div>
      )}

      {/* Tooltip */}
      <div className="invisible group-hover:visible absolute left-full top-0 ml-2 z-50 w-48 bg-panel border border-border p-2 shadow-xl text-[10px]">
        <div className="flex justify-between border-b border-border pb-1 mb-1">
          <span className="text-muted uppercase">Value</span>
          <span className="text-text">₹{stock.current_value?.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between border-b border-border pb-1 mb-1">
          <span className="text-muted uppercase">Allocation</span>
          <span className="text-text">{stock.allocation_pct?.toFixed(2)}%</span>
        </div>
        <div className="flex justify-between border-b border-border pb-1 mb-1">
          <span className="text-muted uppercase">P&L</span>
          <span className={pnlColor}>
            ₹{stock.unrealized_pnl?.toLocaleString('en-IN')} ({stock.unrealized_pnl_pct?.toFixed(2)}%)
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted uppercase">Avg Buy</span>
          <span className="text-text">₹{stock.avg_price?.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  );
};

export default StockRow;
