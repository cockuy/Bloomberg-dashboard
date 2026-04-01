from fastapi import APIRouter
from app.config import load_portfolio_config

router = APIRouter()

@router.get("/config")
async def get_config():
    config = load_portfolio_config()
    portfolio_list = []
    for ticker, details in config["portfolio"].items():
        portfolio_list.append({
            "ticker": ticker,
            "qty": details["qty"],
            "avg_price": details["avg_price"]
        })
    
    return {
        "portfolio": portfolio_list,
        "watchlist": config["watchlist"]
    }
