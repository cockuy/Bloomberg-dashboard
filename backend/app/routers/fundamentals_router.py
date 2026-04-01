from fastapi import APIRouter
from app.services.cache_service import cache
from app.services.yfinance_fetcher import YFinanceFetcher

router = APIRouter()

@router.get("/fundamentals/{ticker}")
async def get_fundamentals(ticker: str):
    cache_key = f"fundamentals:{ticker}"
    cached = cache.get(cache_key, 3600)
    
    if cached and not cached["stale"]:
        return {"data": cached["payload"], "stale": False}
        
    data = YFinanceFetcher.fetch_fundamentals(ticker)
    if not data:
        if cached:
            return {"data": cached["payload"], "stale": True}
        return {"data": None, "error": "Fundamentals unavailable"}
        
    cache.set(cache_key, data)
    return {"data": data, "stale": False}
