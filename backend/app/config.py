import json
import os
from typing import Dict, List, Any

class TickerNormalizer:
    @staticmethod
    def normalize(ticker: str) -> str:
        """Ensures ticker has .NS suffix for Indian stocks if not present."""
        ticker = ticker.upper().strip()
        if not ticker.endswith(".NS") and "." not in ticker:
            return f"{ticker}.NS"
        return ticker

def load_portfolio_config() -> Dict[str, Any]:
    """Loads and normalizes the portfolio configuration from portfolio.json."""
    config_path = os.path.join(os.path.dirname(__file__), "..", "portfolio.json")
    
    if not os.path.exists(config_path):
        return {"portfolio": {}, "watchlist": []}
        
    with open(config_path, "r") as f:
        data = json.load(f)
        
    # Normalize portfolio keys
    normalized_portfolio = {}
    for ticker, details in data.get("portfolio", {}).items():
        normalized_ticker = TickerNormalizer.normalize(ticker)
        normalized_portfolio[normalized_ticker] = details
        
    # Normalize watchlist
    normalized_watchlist = [
        TickerNormalizer.normalize(ticker) 
        for ticker in data.get("watchlist", [])
    ]
    
    return {
        "portfolio": normalized_portfolio,
        "watchlist": normalized_watchlist
    }
