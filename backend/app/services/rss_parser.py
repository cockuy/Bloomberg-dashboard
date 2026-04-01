import feedparser
from datetime import datetime, timedelta
import time

class RSSParser:
    @staticmethod
    def fetch_news(company_name: str) -> dict:
        try:
            url = f"https://news.google.com/rss/search?q={company_name}&hl=en-IN&gl=IN&ceid=IN:en"
            feed = feedparser.parse(url)
            
            today_news = []
            week_news = []
            
            now = datetime.now()
            one_day_ago = now - timedelta(days=1)
            one_week_ago = now - timedelta(days=7)
            
            for entry in feed.entries[:30]:
                published_parsed = entry.get("published_parsed")
                if not published_parsed:
                    continue
                    
                published_dt = datetime.fromtimestamp(time.mktime(published_parsed))
                
                item = {
                    "headline": entry.get("title"),
                    "source": entry.get("source", {}).get("title", "Google News"),
                    "url": entry.get("link"),
                    "published_at": published_dt.isoformat()
                }
                
                if published_dt > one_day_ago:
                    today_news.append(item)
                if published_dt > one_week_ago:
                    week_news.append(item)
                    
            return {"today": today_news, "week": week_news}
        except Exception:
            return {"today": [], "week": []}
