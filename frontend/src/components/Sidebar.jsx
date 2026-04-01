import React from 'react';
import StockRow from './StockRow';

const Sidebar = ({ portfolio, watchlist, selectedTicker, onSelect }) => {
  return (
    <div className="w-[220px] bg-bg border-r border-border flex flex-col overflow-y-auto h-full">
      <div className="p-2 text-[10px] font-bold text-orange tracking-widest bg-panel border-b border-border">
        PORTFOLIO
      </div>
      <div className="flex flex-col">
        {portfolio.map(stock => (
          <StockRow 
            key={stock.ticker}
            stock={stock}
            isActive={selectedTicker === stock.ticker}
            onClick={() => onSelect(stock.ticker)}
            isPortfolio={true}
          />
        ))}
      </div>

      <div className="p-2 text-[10px] font-bold text-orange tracking-widest bg-panel border-t border-b border-border mt-4">
        WATCHLIST
      </div>
      <div className="flex flex-col">
        {watchlist.map(stock => (
          <StockRow 
            key={stock.ticker}
            stock={stock}
            isActive={selectedTicker === stock.ticker}
            onClick={() => onSelect(stock.ticker)}
            isPortfolio={false}
          />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
