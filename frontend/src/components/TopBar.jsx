import React from 'react';

const TopBar = ({ summary, lastUpdated, loading }) => {
  const formatValue = (val) => val?.toLocaleString('en-IN', { maximumFractionDigits: 0 });

  if (loading && !summary) {
    return (
      <div className="h-12 bg-panel border-b border-border flex items-center px-4 gap-8 animate-pulse">
        <div className="w-32 h-4 bg-border rounded"></div>
        <div className="w-48 h-4 bg-border rounded"></div>
      </div>
    );
  }

  const pnlColor = (val) => val >= 0 ? 'text-green' : 'text-red';

  return (
    <div className="h-12 bg-panel border-b border-border flex items-center px-4 justify-between select-none">
      <div className="flex items-center gap-8">
        <div className="text-orange font-bold tracking-tighter text-lg">NSE TERMINAL</div>
        
        {summary ? (
          <div className="flex items-center gap-6 text-[11px] font-medium uppercase">
            <div className="flex flex-col">
              <span className="text-muted text-[9px]">Portfolio Value</span>
              <span className="text-text">₹{formatValue(summary.total_value)}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-muted text-[9px]">Day P&L</span>
              <span className={pnlColor(summary.day_pnl)}>
                {summary.day_pnl >= 0 ? '+' : ''}{formatValue(summary.day_pnl)} 
                ({summary.day_pnl_pct.toFixed(2)}%)
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-muted text-[9px]">Overall P&L</span>
              <span className={pnlColor(summary.overall_pnl)}>
                {summary.overall_pnl >= 0 ? '+' : ''}{formatValue(summary.overall_pnl)} 
                ({summary.overall_pnl_pct.toFixed(2)}%)
              </span>
            </div>
          </div>
        ) : (
          <div className="text-red text-xs">Data unavailable</div>
        )}
      </div>

      <div className="text-muted text-[10px] font-mono">
        As of {lastUpdated || '--:--'} IST
      </div>
    </div>
  );
};

export default TopBar;
