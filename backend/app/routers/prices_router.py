from fastapi import APIRouter
from app.services.cache_service import cache
from app.services.yfinance_fetcher import YFinanceFetcher
from app.config import load_portfolio_config
from datetime import datetime

router = APIRouter()

@router.get("/prices")
async def get_prices():
    cached = cache.get("prices", 20)
    if cached and not cached["stale"]:
        return {"data": cached["payload"], "error": None}
    
    config = load_portfolio_config()
    all_tickers = list(config["portfolio"].keys()) + config["watchlist"]
    
    live_prices = YFinanceFetcher.fetch_batch_prices(all_tickers)
    
    if not live_prices:
        if cached:
            return {"data": cached["payload"], "error": "Using stale data due to fetch failure"}
        return {"data": None, "error": "Failed to fetch live prices"}
    
    # Compute portfolio metrics
    total_value = 0
    day_pnl = 0
    overall_pnl = 0
    initial_investment = 0
    
    portfolio_data = []
    for ticker, details in config["portfolio"].items():
        price_info = live_prices.get(ticker)
        if not price_info:
            continue
            
        ltp = price_info["ltp"]
        qty = details["qty"]
        avg_price = details["avg_price"]
        prev_close = price_info["prev_close"]
        
        current_value = ltp * qty
        unrealized_pnl = (ltp - avg_price) * qty
        unrealized_pnl_pct = ((ltp - avg_price) / avg_price * 100) if avg_price != 0 else 0
        stock_day_pnl = (ltp - prev_close) * qty
        
        total_value += current_value
        day_pnl += stock_day_pnl
        overall_pnl += unrealized_pnl
        initial_investment += (avg_price * qty)
        
        portfolio_data.append({
            "ticker": ticker,
            "qty": qty,
            "avg_price": avg_price,
            "ltp": ltp,
            "current_value": current_value,
            "unrealized_pnl": unrealized_pnl,
            "unrealized_pnl_pct": unrealized_pnl_pct,
            "day_pnl": stock_day_pnl,
            "change_pct": price_info["change_pct"]
        })
        
    # Allocation %
    for item in portfolio_data:
        item["allocation_pct"] = (item["current_value"] / total_value * 100) if total_value != 0 else 0
        
    watchlist_data = []
    for ticker in config["watchlist"]:
        price_info = live_prices.get(ticker)
        if price_info:
            watchlist_data.append({
                "ticker": ticker,
                **price_info
            })
            
    summary = {
        "total_value": total_value,
        "day_pnl": day_pnl,
        "day_pnl_pct": (day_pnl / (total_value - day_pnl) * 100) if (total_value - day_pnl) != 0 else 0,
        "overall_pnl": overall_pnl,
        "overall_pnl_pct": (overall_pnl / initial_investment * 100) if initial_investment != 0 else 0,
        "last_updated": datetime.now().strftime("%H:%M:%S")
    }
    
    payload = {
        "prices": live_prices,
        "portfolio": portfolio_data,
        "watchlist": watchlist_data,
        "summary": summary,
        "stale": False
    }
    
    cache.set("prices", payload)
    return {"data": payload, "error": None}
