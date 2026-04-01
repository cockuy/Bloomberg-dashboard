import React, { useState, useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import { TrendingUp, TrendingDown, Clock, Newspaper, BarChart3, LayoutDashboard, Search, ChevronRight } from 'lucide-react';

function App() {
  const [config, setConfig] = useState(null);
  const [prices, setPrices] = useState({});
  const [selectedTicker, setSelectedTicker] = useState(null);
  const [candles, setCandles] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

  // Fetch initial config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/config`);
        if (!response.ok) throw new Error('Failed to load configuration');
        const data = await response.json();
        setConfig(data);
        // Select first ticker from portfolio by default
        const firstTicker = Object.keys(data.portfolio)[0];
        if (firstTicker) setSelectedTicker(firstTicker);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [API_BASE_URL]);

  // Price polling loop
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/prices`);
        if (response.ok) {
          const data = await response.json();
          setPrices(data);
        }
      } catch (err) {
        console.error('Price fetch error:', err);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 20000); // 20s polling
    return () => clearInterval(interval);
  }, [API_BASE_URL]);

  // Fetch candles and news when ticker changes
  useEffect(() => {
    if (!selectedTicker) return;

    const fetchData = async () => {
      try {
        const [candleRes, newsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/candles/${selectedTicker}`),
          fetch(`${API_BASE_URL}/api/news/${selectedTicker}`)
        ]);
        
        if (candleRes.ok) setCandles(await candleRes.json());
        if (newsRes.ok) setNews(await newsRes.json());
      } catch (err) {
        console.error('Ticker data fetch error:', err);
      }
    };

    fetchData();
  }, [selectedTicker, API_BASE_URL]);

  // Initialize Chart
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    if (chartContainerRef.current && candles.length > 0) {
      setChartReady(true);
    }
  }, [candles]);

  useEffect(() => {
    if (!chartReady || !chartContainerRef.current || candles.length === 0) return;

    // Clean up existing chart if it exists
    if (chartRef.current) {
      try {
        chartRef.current.remove();
      } catch (e) {
        console.warn('Error removing chart:', e);
      }
      chartRef.current = null;
      seriesRef.current = null;
    }

    let chart;
    let timeoutId;
    
    const initChart = () => {
      try {
        if (!chartContainerRef.current) return;
        
        chart = createChart(chartContainerRef.current, {
          layout: {
            background: { color: '#000000' },
            textColor: '#d1d1d1',
          },
          grid: {
            vertLines: { color: '#1a1a1a' },
            horzLines: { color: '#1a1a1a' },
          },
          width: chartContainerRef.current.clientWidth || 600,
          height: 400,
        });

        if (!chart || typeof chart.addCandlestickSeries !== 'function') {
          console.error('Invalid chart object returned from createChart:', chart);
          throw new Error('createChart did not return a valid chart object with addCandlestickSeries');
        }

        const series = chart.addCandlestickSeries({
          upColor: '#00ff00',
          downColor: '#ff0000',
          borderVisible: false,
          wickUpColor: '#00ff00',
          wickDownColor: '#ff0000',
        });

        series.setData(candles);
        chart.timeScale().fitContent();

        chartRef.current = chart;
        seriesRef.current = series;

        const handleResize = () => {
          if (chart && chartContainerRef.current) {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth });
          }
        };

        window.addEventListener('resize', handleResize);
        
        return () => {
          window.removeEventListener('resize', handleResize);
          if (chart) {
            try {
              chart.remove();
            } catch (e) {
              console.warn('Error removing chart in cleanup:', e);
            }
          }
        };
      } catch (err) {
        console.error('Chart initialization error:', err);
        setError('Chart initialization failed: ' + err.message);
      }
    };

    // Small delay to ensure DOM is fully ready in React 19
    timeoutId = setTimeout(initChart, 50);

    return () => {
      clearTimeout(timeoutId);
      if (chartRef.current) {
        try {
          chartRef.current.remove();
        } catch (e) {
          console.warn('Error removing chart in effect cleanup:', e);
        }
        chartRef.current = null;
        seriesRef.current = null;
      }
    };
  }, [chartReady, candles]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black text-terminal-accent font-mono">
        INITIALIZING TERMINAL...
      </div>
    );
  }

  const selectedPrice = prices[selectedTicker] || {};

  return (
    <div className="h-screen w-screen flex flex-col bg-black overflow-hidden font-sans">
      {/* Top Bar */}
      <div className="h-12 border-b border-terminal-border flex items-center px-4 justify-between bg-terminal-sidebar">
        <div className="flex items-center gap-4">
          <span className="text-terminal-accent font-bold tracking-tighter text-xl">NSE TERMINAL</span>
          <div className="h-4 w-[1px] bg-terminal-border"></div>
          <div className="flex items-center gap-2 text-[10px] text-terminal-muted uppercase tracking-widest font-mono">
            <Clock size={12} />
            {new Date().toLocaleTimeString()}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-terminal-muted">NIFTY 50</span>
            <span className="text-terminal-up">22,453.30 (+0.45%)</span>
          </div>
          <div className="h-4 w-[1px] bg-terminal-border"></div>
          <div className="text-xs font-mono text-terminal-muted">
            SYSTEM STATUS: <span className="text-terminal-up">ONLINE</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 border-r border-terminal-border bg-terminal-sidebar flex flex-col">
          <div className="p-3 border-b border-terminal-border">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-terminal-muted" size={14} />
              <input 
                type="text" 
                placeholder="SEARCH TICKERS..."
                className="w-full bg-black border border-terminal-border rounded py-1 pl-8 pr-2 text-[10px] font-mono focus:outline-none focus:border-terminal-accent"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {/* Portfolio Section */}
            <div className="p-3 bg-terminal-row border-b border-terminal-border">
              <h2 className="text-[10px] uppercase tracking-widest text-terminal-muted font-bold flex items-center gap-2">
                <LayoutDashboard size={12} /> Portfolio
              </h2>
            </div>
            <div className="divide-y divide-terminal-border">
              {Object.entries(config?.portfolio || {}).map(([ticker, details]) => {
                const priceData = prices[ticker];
                const isSelected = selectedTicker === ticker;
                return (
                  <div 
                    key={ticker} 
                    onClick={() => setSelectedTicker(ticker)}
                    className={`p-3 cursor-pointer transition-colors ${isSelected ? 'bg-terminal-hover border-l-2 border-terminal-accent' : 'hover:bg-terminal-hover'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold font-mono">{ticker.replace('.NS', '')}</span>
                      <span className="text-xs font-mono">{priceData?.price || '---'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-terminal-muted font-mono">QTY: {details.qty}</span>
                      <span className={`text-[10px] font-mono ${priceData?.change >= 0 ? 'text-terminal-up' : 'text-terminal-down'}`}>
                        {priceData?.change >= 0 ? '+' : ''}{priceData?.pChange || '0.00'}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Watchlist Section */}
            <div className="p-3 bg-terminal-row border-b border-terminal-border mt-2">
              <h2 className="text-[10px] uppercase tracking-widest text-terminal-muted font-bold flex items-center gap-2">
                <BarChart3 size={12} /> Watchlist
              </h2>
            </div>
            <div className="divide-y divide-terminal-border">
              {(config?.watchlist || []).map(ticker => {
                const priceData = prices[ticker];
                const isSelected = selectedTicker === ticker;
                return (
                  <div 
                    key={ticker} 
                    onClick={() => setSelectedTicker(ticker)}
                    className={`p-3 cursor-pointer transition-colors ${isSelected ? 'bg-terminal-hover border-l-2 border-terminal-accent' : 'hover:bg-terminal-hover'}`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold font-mono">{ticker.replace('.NS', '')}</span>
                      <div className="text-right">
                        <div className="text-xs font-mono">{priceData?.price || '---'}</div>
                        <div className={`text-[10px] font-mono ${priceData?.change >= 0 ? 'text-terminal-up' : 'text-terminal-down'}`}>
                          {priceData?.change >= 0 ? '+' : ''}{priceData?.pChange || '0.00'}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Panel */}
        <div className="flex-1 flex flex-col bg-terminal-bg overflow-y-auto">
          {selectedTicker ? (
            <div className="p-6 space-y-6">
              {/* Header Info */}
              <div className="flex justify-between items-end border-b border-terminal-border pb-4">
                <div>
                  <div className="flex items-center gap-2 text-terminal-muted text-[10px] uppercase tracking-widest mb-1">
                    NSE INDIA <ChevronRight size={10} /> {selectedTicker}
                  </div>
                  <h1 className="text-3xl font-bold tracking-tighter">{selectedTicker.replace('.NS', '')}</h1>
                  <div className="text-xs text-terminal-muted font-mono mt-1">EQUITY | ISIN: INE002A01018</div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-mono font-bold tracking-tighter">
                    {selectedPrice.price?.toLocaleString() || '---'}
                  </div>
                  <div className={`text-sm font-mono font-bold ${selectedPrice.change >= 0 ? 'text-terminal-up' : 'text-terminal-down'}`}>
                    {selectedPrice.change >= 0 ? '▲' : '▼'} {Math.abs(selectedPrice.change || 0).toFixed(2)} ({selectedPrice.pChange || '0.00'}%)
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'OPEN', value: '2,940.00' },
                  { label: 'HIGH', value: '2,965.45' },
                  { label: 'LOW', value: '2,932.10' },
                  { label: 'VOLUME', value: selectedPrice.volume?.toLocaleString() || '---' },
                ].map(stat => (
                  <div key={stat.label} className="bg-terminal-sidebar p-3 border border-terminal-border">
                    <div className="text-[10px] text-terminal-muted uppercase mb-1 font-bold">{stat.label}</div>
                    <div className="text-sm font-mono">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Chart Section */}
              <div className="bg-terminal-sidebar border border-terminal-border p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-[10px] text-terminal-muted uppercase font-bold tracking-widest">Interactive Chart</div>
                  <div className="flex gap-2">
                    {['1D', '1W', '1M', '1Y'].map(tf => (
                      <button key={tf} className="text-[10px] font-mono px-2 py-1 border border-terminal-border hover:bg-terminal-accent hover:text-black transition-colors">
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
                <div ref={chartContainerRef} className="w-full" />
              </div>

              {/* News Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] text-terminal-muted uppercase font-bold tracking-widest border-b border-terminal-border pb-2">
                  <Newspaper size={12} /> Market News
                </div>
                <div className="space-y-3">
                  {news.length > 0 ? news.map((item, i) => (
                    <div key={i} className="group cursor-pointer">
                      <div className="flex gap-4 items-start">
                        <div className="text-[10px] font-mono text-terminal-muted whitespace-nowrap pt-1">
                          {new Date(item.datetime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div>
                          <h3 className="text-sm group-hover:text-terminal-accent transition-colors leading-snug">
                            {item.headline}
                          </h3>
                          <div className="text-[10px] text-terminal-muted mt-1 uppercase tracking-tighter">
                            {item.source} • {new Date(item.datetime * 1000).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-xs text-terminal-muted font-mono italic">No recent news found for this ticker.</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-6xl font-bold tracking-tighter text-terminal-border">NSE</div>
                <div className="text-xs text-terminal-muted font-mono uppercase tracking-widest">Select a ticker to begin analysis</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
