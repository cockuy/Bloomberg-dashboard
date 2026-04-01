# Bloomberg-dashboard
Bloomberg-style Indian stock market portfolio dashboard built with FastAPI, React, and yfinance. Features real-time-like updates, advanced charting, portfolio analytics, and news integration.


# 📊 Bloomberg-Style Indian Stock Market Dashboard

A full-stack financial dashboard inspired by Bloomberg Terminal, built for tracking Indian stock portfolios with real-time-like updates, charts, fundamentals, and news.

---

## 🚀 Features

### 📈 Portfolio Dashboard

* Total portfolio value
* Daily P&L (₹ + %)
* Overall P&L (₹ + %)
* Allocation breakdown

### 📊 Charts

* Candlestick charts (TradingView Lightweight Charts)
* Timeframes: 5m, 15m, 1D, 1W, 1M
* Smart auto-follow (like TradingView)

### 📰 News

* Company-specific news (Finnhub)
* Market news (Google RSS)
* Today / Weekly tabs

### 📉 Fundamentals

* PE Ratio, Market Cap, EPS
* ROE, Debt/Equity
* 52W High/Low, Dividend Yield

### ⚡ Performance

* Polling every 15–20 seconds
* Exponential backoff
* Smart caching + stale fallback

---

## 🛠️ Tech Stack

### Backend

* FastAPI
* yfinance
* Finnhub API
* Feedparser (RSS)
* SlowAPI (rate limiting)

### Frontend

* React (Vite)
* Tailwind CSS
* TradingView Lightweight Charts

### Deployment

* Backend: Railway
* Frontend: Vercel

---

## 📁 Project Structure

```
bloomberg-dashboard/
├── backend/
├── frontend/
└── portfolio.json
```

---

## ⚙️ Setup (Local)

### 1️⃣ Clone repo

```
git clone https://github.com/YOUR_USERNAME/bloomberg-dashboard.git
cd bloomberg-dashboard
```

---

### 2️⃣ Backend setup

```
cd backend
pip install -r requirements.txt
cp .env.example .env
```

👉 Add your Finnhub API key in `.env`

Run backend:

```
uvicorn main:app --reload --port 8000
```

---

### 3️⃣ Frontend setup

```
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## 🔑 API Keys

Get free API key from:
👉 https://finnhub.io

---

## 🧾 Portfolio Configuration

Edit:

```
backend/portfolio.json
```

Example:

```
{
  "portfolio": {
    "RELIANCE.NS": {"qty": 10, "avg_price": 2450}
  },
  "watchlist": ["TCS.NS"]
}
```

---

## 🚀 Deployment

### Backend (Railway)

* Connect GitHub repo
* Root directory → `backend`
* Add env variables:

  * `FINNHUB_API_KEY`
  * `ALLOWED_ORIGIN`

---

### Frontend (Vercel)

* Root directory → `frontend`
* Add env:

  * `VITE_API_BASE_URL`

---

## ⚠️ Disclaimer

This project is for educational purposes only. Not intended for actual trading decisions.

---

## ⭐ Future Improvements

* WebSocket real-time data
* User login system
* Advanced analytics
* Alerts & notifications

---

## 👨‍💻 Author

Built by COCKUY


---
