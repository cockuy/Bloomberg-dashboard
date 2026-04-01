import React from 'react';
import ChartPanel from './ChartPanel';
import FundamentalsPanel from './FundamentalsPanel';
import NewsPanel from './NewsPanel';

const MainPanel = ({ selectedTicker, activeTimeframe, onTimeframeChange }) => {
  if (!selectedTicker) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted font-mono italic">
        SELECT A SECURITY TO VIEW TERMINAL DATA
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-bg">
      <ChartPanel 
        ticker={selectedTicker} 
        timeframe={activeTimeframe} 
        onTimeframeChange={onTimeframeChange} 
      />
      <FundamentalsPanel ticker={selectedTicker} />
      <NewsPanel ticker={selectedTicker} />
    </div>
  );
};

export default MainPanel;
