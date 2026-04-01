import yfinance as yf
import pandas as pd
from datetime import datetime

class YFinanceFetcher:
    @staticmethod
    def fetch_batch_prices(tickers: list[str]) -> dict | None:
        try:
            data = yf.download(tickers, period="2d", interval="1d", group_by='ticker', progress=False)
            if data.empty:
                return None
            
            results = {}
            for ticker in tickers:
                try:
                    if len(tickers) > 1:
                        ticker_data = data[ticker]
                    else:
                        ticker_data = data
                    
                    if ticker_data.empty or len(ticker_data) < 1:
                        continue
                        
                    latest = ticker_data.iloc[-1]
                    prev = ticker_data.iloc[0] if len(ticker_data) > 1 else latest
                    
                    results[ticker] = {
                        "ltp": float(latest["Close"]),
                        "change_pct": float(((latest["Close"] - prev["Close"]) / prev["Close"]) * 100) if prev["Close"] != 0 else 0,
                        "volume": int(latest["Volume"]),
                        "day_high": float(latest["High"]),
                        "day_low": float(latest["Low"]),
                        "prev_close": float(prev["Close"])
                    }
                except Exception:
                    continue
            return results
        except Exception:
            return None

    @staticmethod
    def fetch_candles(ticker: str, timeframe: str) -> list | None:
        mapping = {
            "1m":  {"period": "7d",  "interval": "1m"},
            "5m":  {"period": "7d",  "interval": "5m"},
            "15m": {"period": "7d",  "interval": "15m"},
            "1D":  {"period": "1y",  "interval": "1d"},
            "1W":  {"period": "5y",  "interval": "1wk"},
            "1M":  {"period": "10y", "interval": "1mo"}
        }
        
        conf = mapping.get(timeframe, mapping["1D"])
        try:
            df = yf.download(ticker, period=conf["period"], interval=conf["interval"], progress=False)
            if df.empty:
                return None
            
            df = df.dropna()
            candles = []
            for idx, row in df.iterrows():
                candles.append({
                    "time": int(idx.timestamp()),
                    "open": float(row["Open"]),
                    "high": float(row["High"]),
                    "low": float(row["Low"]),
                    "close": float(row["Close"]),
                    "volume": int(row["Volume"])
                })
            return candles
        except Exception:
            return None

    @staticmethod
    def fetch_fundamentals(ticker: str) -> dict | None:
        try:
            info = yf.Ticker(ticker).info
            return {
                "pe_ratio": info.get("trailingPE"),
                "market_cap": info.get("marketCap"),
                "eps": info.get("trailingEps"),
                "roe": info.get("returnOnEquity"),
                "debt_to_equity": info.get("debtToEquity"),
                "revenue_growth": info.get("revenueGrowth"),
                "earnings_growth": info.get("earningsGrowth"),
                "week_52_high": info.get("fiftyTwoWeekHigh"),
                "week_52_low": info.get("fiftyTwoWeekLow"),
                "dividend_yield": info.get("dividendYield"),
                "book_value": info.get("bookValue")
            }
        except Exception:
            return None
