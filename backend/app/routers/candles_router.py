from fastapi import APIRouter, Query
from app.services.cache_service import cache
from app.services.yfinance_fetcher import YFinanceFetcher

router = APIRouter()

@router.get("/candles/{ticker}")
async def get_candles(ticker: str, tf: str = Query("1D")):
    ttl = 90 if tf in ["1m", "5m", "15m"] else 300
    cache_key = f"candles:{ticker}:{tf}"
    
    cached = cache.get(cache_key, ttl)
    if cached and not cached["stale"]:
        return {"data": cached["payload"], "stale": False}
    
    candles = YFinanceFetcher.fetch_candles(ticker, tf)
    if not candles:
        if cached:
            return {"data": cached["payload"], "stale": True}
        return {"data": None, "error": "Chart data unavailable"}
    
    cache.set(cache_key, candles)
    return {"data": candles, "stale": False}
