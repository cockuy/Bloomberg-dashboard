import yfinance as yf

class CompanyNameResolver:
    @staticmethod
    def resolve(ticker: str) -> str:
        try:
            info = yf.Ticker(ticker).info
            return info.get("longName", ticker)
        except Exception:
            return ticker
