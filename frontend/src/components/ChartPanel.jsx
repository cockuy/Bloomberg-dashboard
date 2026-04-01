import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import TimeframeSelector from './TimeframeSelector';
import { useChartPolling } from '../hooks/useChartPolling';
import { client } from '../api/client';

const ChartPanel = ({ ticker, timeframe, onTimeframeChange }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const seriesRef = useRef();
  const [priceData, setPriceData] = useState(null);
  
  const { candles, loading, error, stale } = useChartPolling(ticker, timeframe);

  // Fetch current price for header
  useEffect(() => {
    const fetchPrice = async () => {
      const res = await client.fetchPrices();
      if (res.data) {
        const stock = res.data.prices[ticker];
        setPriceData(stock);
      }
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 20000);
    return () => clearInterval(interval);
  }, [ticker]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0a0a0a' },
        textColor: '#888888',
      },
      grid: {
        vertLines: { color: '#222222' },
        horzLines: { color: '#222222' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        borderColor: '#222222',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#222222',
      },
    });

    const series = chart.addCandlestickSeries({
      upColor: '#00cc66',
      downColor: '#ff3333',
      borderVisible: false,
      wickUpColor: '#00cc66',
      wickDownColor: '#ff3333',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (seriesRef.current && candles.length > 0) {
      seriesRef.current.setData(candles);
      // Auto-scroll to edge if needed
      chartRef.current.timeScale().scrollToPosition(0, false);
    }
  }, [candles]);

  const isIntraday = ['1m', '5m', '15m'].includes(timeframe);

  return (
    <div className="border-b border-border bg-panel">
      {/* Header */}
      <div className="p-4 flex justify-between items-end border-b border-border">
        <div className="flex items-baseline gap-4">
          <h2 className="text-2xl font-bold text-text">{ticker.replace('.NS', '')}</h2>
          {priceData && (
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-xl text-text">{priceData.ltp.toFixed(2)}</span>
              <span className={`text-sm ${priceData.change_pct >= 0 ? 'text-green' : 'text-red'}`}>
                {priceData.change_pct >= 0 ? '+' : ''}{priceData.change_pct.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-6 text-[10px] font-mono text-muted uppercase">
          <div className="flex flex-col items-end">
            <span>Vol</span>
            <span className="text-text">{priceData?.volume?.toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-end">
            <span>Day High</span>
            <span className="text-text">{priceData?.day_high?.toFixed(2)}</span>
          </div>
          <div className="flex flex-col items-end">
            <span>Day Low</span>
            <span className="text-text">{priceData?.day_low?.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-2 border-b border-border flex justify-between items-center bg-bg">
        <TimeframeSelector active={timeframe} onChange={onTimeframeChange} />
        {isIntraday && (
          <span className="text-[9px] text-orange italic">Intraday data available for last 7 days</span>
        )}
      </div>

      <div className="relative h-[400px]">
        {loading && (
          <div className="absolute inset-0 z-10 bg-bg/50 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-orange border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 z-10 bg-bg flex flex-col items-center justify-center gap-4">
            <span className="text-red text-sm font-mono">Chart data unavailable</span>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-1 border border-border text-[10px] hover:border-muted"
            >
              RETRY
            </button>
          </div>
        )}
        <div ref={chartContainerRef} className="chart-container" />
      </div>
    </div>
  );
};

export default ChartPanel;
