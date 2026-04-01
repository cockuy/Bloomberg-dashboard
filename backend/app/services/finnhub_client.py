import os
import requests
from datetime import datetime, timedelta

class FinnhubClient:
    def __init__(self):
        self.api_key = os.getenv("FINNHUB_API_KEY")
        self.base_url = "https://finnhub.io/api/v1"

    def fetch_company_news(self, ticker: str) -> list:
        if not self.api_key:
            return []
        
        try:
            symbol = ticker.replace(".NS", "")
            to_date = datetime.now().strftime('%Y-%m-%d')
            from_date = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
            
            url = f"{self.base_url}/company-news?symbol={symbol}&from={from_date}&to={to_date}&token={self.api_key}"
            response = requests.get(url)
            if response.status_code != 200:
                return []
            
            data = response.json()
            news = []
            for item in data[:20]:
                news.append({
                    "headline": item.get("headline"),
                    "source": item.get("source"),
                    "url": item.get("url"),
                    "published_at": datetime.fromtimestamp(item.get("datetime")).isoformat() if item.get("datetime") else None
                })
            return news
        except Exception:
            return []
