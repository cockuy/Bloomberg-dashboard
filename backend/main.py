import os
import json
import asyncio
import yfinance as yf
import requests
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv

from app.config import load_portfolio_config

load_dotenv()

# Rate limiting setup
limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="NSE Terminal Backend")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Configuration
allowed_origins = os.getenv("ALLOWED_ORIGIN", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory cache for prices
price_cache = {
    "data": {},
    "last_updated": None
}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

@app.get("/api/config")
@limiter.limit("10/minute")
async def get_config(request: Request):
    config = load_portfolio_config()
    return config

@app.get("/api/prices")
@limiter.limit("30/minute")
async def get_prices(request: Request):
    """Fetches real-time prices for all tickers in portfolio and watchlist."""
    config = load_portfolio_config()
    tickers = list(config["portfolio"].keys()) + config["watchlist"]
    
    # Simple cache check (20s TTL)
    now = datetime.now()
    if price_cache["last_updated"] and (now - price_cache["last_updated"]).total_seconds() < 20:
        return price_cache["data"]

    try:
        # Fetch data using yfinance
        data = yf.download(tickers, period="1d", interval="1m", group_by="ticker", progress=False)
        
        results = {}
        for ticker in tickers:
            try:
                ticker_data = data[ticker] if len(tickers) > 1 else data
                if ticker_data.empty:
                    continue
                
                last_quote = ticker_data.iloc[-1]
                prev_close = ticker_data.iloc[0]['Open'] # Approximation for 1d period
                
                current_price = float(last_quote['Close'])
                change = current_price - prev_close
                p_change = (change / prev_close) * 100 if prev_close != 0 else 0
                
                results[ticker] = {
                    "price": round(current_price, 2),
                    "change": round(change, 2),
                    "pChange": round(p_change, 2),
                    "volume": int(last_quote['Volume']),
                    "lastUpdated": now.isoformat()
                }
            except Exception:
                continue
        
        price_cache["data"] = results
        price_cache["last_updated"] = now
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/candles/{ticker}")
@limiter.limit("20/minute")
async def get_candles(request: Request, ticker: str, timeframe: str = "1d"):
    """Fetches historical candle data for charts."""
    period_map = {"1d": "1d", "1w": "5d", "1m": "1mo", "1y": "1y"}
    interval_map = {"1d": "1m", "1w": "5m", "1m": "30m", "1y": "1d"}
    
    try:
        df = yf.download(
            ticker, 
            period=period_map.get(timeframe, "1d"), 
            interval=interval_map.get(timeframe, "1m"),
            progress=False
        )
        
        if df.empty:
            return []
            
        candles = []
        for index, row in df.iterrows():
            candles.append({
                "time": int(index.timestamp()),
                "open": float(row['Open']),
                "high": float(row['High']),
                "low": float(row['Low']),
                "close": float(row['Close']),
                "volume": int(row['Volume'])
            })
        return candles
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/news/{ticker}")
@limiter.limit("10/minute")
async def get_news(request: Request, ticker: str):
    """Fetches news using Finnhub API."""
    api_key = os.getenv("FINNHUB_API_KEY")
    if not api_key:
        return [] # Silent fail if no key
        
    # Finnhub uses standard tickers, strip .NS for better results
    clean_ticker = ticker.replace(".NS", "")
    
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
    
    url = f"https://finnhub.io/api/v1/company-news?symbol={clean_ticker}&from={start_date}&to={end_date}&token={api_key}"
    
    try:
        response = requests.get(url)
        return response.json()[:10] # Top 10 news items
    except Exception:
        return []

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 3000))
    uvicorn.run(app, host="0.0.0.0", port=port)
