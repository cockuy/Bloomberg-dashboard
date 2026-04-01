# NSE Terminal - Bloomberg-Style Portfolio Tracker

A high-performance financial dashboard for tracking Indian stock market (NSE) portfolios.

## Features
- **Monorepo Scaffold**: Integrated FastAPI (Backend) + Vite/React (Frontend).
- **Portfolio Config**: Managed via `portfolio.json`.
- **Ticker Normalization**: Automatic `.NS` suffix enforcement.
- **Bloomberg UI**: Dark-themed, high-density terminal interface.
- **Hybrid Caching**: In-memory caching with stale-while-revalidate logic.
- **Polling Architecture**: Independent loops for prices (20s), charts (90s), and news (5m).

## Setup Instructions

### 1. Finnhub API Key
Sign up at [finnhub.io](https://finnhub.io), register, and get your free API key.

### 2. Local Setup

#### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your FINNHUB_API_KEY
uvicorn main:app --reload --port 8000
```

#### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
The app will be available at `http://localhost:3000`.

### 3. Portfolio Configuration
Edit `backend/portfolio.json` to manage your stocks:
```json
{
  "portfolio": {
    "RELIANCE.NS": { "qty": 10, "avg_price": 2450.00 }
  },
  "watchlist": ["TCS.NS", "INFY.NS"]
}
```
All tickers are automatically normalized to include the `.NS` suffix if missing.

## Deployment

### Backend (Railway)
- **Root Directory**: `backend/` (Set this in Railway project settings)
- Procfile: `web: uvicorn main:app --host 0.0.0.0 --port $PORT`
- Set Env Vars: `FINNHUB_API_KEY`, `ALLOWED_ORIGIN` (your Vercel URL).
- **Important**: Deploy as a single replica to maintain in-memory cache coherence.

### Frontend (Vercel)
- **Root Directory**: `frontend/` (Set this in Vercel project settings)
- Build Command: `npm run build`
- Output Directory: `dist`
- Set Env Var: `VITE_API_BASE_URL` (your Railway backend URL).
