from fastapi import APIRouter
from app.services.cache_service import cache
from app.services.finnhub_client import FinnhubClient
from app.services.rss_parser import RSSParser
from app.services.company_name_resolver import CompanyNameResolver

router = APIRouter()
finnhub = FinnhubClient()

@router.get("/news/{ticker}")
async def get_news(ticker: str):
    cache_key = f"news:{ticker}"
    cached = cache.get(cache_key, 300)
    
    if cached and not cached["stale"]:
        return {"data": cached["payload"], "stale": False}
        
    company_name = CompanyNameResolver.resolve(ticker)
    
    # Fetch independently
    finnhub_news = finnhub.fetch_company_news(ticker)
    rss_news = RSSParser.fetch_news(company_name)
    
    payload = {
        "today": rss_news["today"],
        "week": rss_news["week"],
        "company": finnhub_news
    }
    
    cache.set(cache_key, payload)
    return {"data": payload, "stale": False}
