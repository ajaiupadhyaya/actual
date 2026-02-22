# Quant Research Dashboard (MVP Scaffold)

This repository now contains the first implementation slice of the platform:

- FastAPI backend with JWT auth (backend-first)
- PostgreSQL + Redis wiring
- Unified data endpoints for FRED, Yahoo Finance, and Alpha Vantage
- Workspace layout persistence API
- Next.js dashboard shell with draggable panel layout and live price chart + indicator overlays
- Docker Compose local stack

## Project Structure

- `backend/` FastAPI service
- `frontend/` Next.js 14 App Router UI
- `docker-compose.yml` local orchestration
- `.env.example` environment template

## Deployment

- Full guide: [DEPLOYMENT.md](DEPLOYMENT.md)

## Quick Start

1. Create env file:

```bash
cp .env.example .env
```

2. Add at least these keys in `.env`:

- `JWT_SECRET`
- `FRED_API_KEY`
- `ALPHA_VANTAGE_API_KEY`

3. Start services:

```bash
docker compose up --build
```

4. Open apps:

- Frontend: `http://localhost:3000`
- Backend docs: `http://localhost:8000/docs`

## Implemented API Endpoints

- `POST /auth/register`
- `POST /auth/login`
- `GET /data/fred/{series_id}?start=YYYY-MM-DD&end=YYYY-MM-DD`
- `GET /data/yahoo/{symbol}?start=YYYY-MM-DD&end=YYYY-MM-DD`
- `GET /data/alpha-vantage/{symbol}`
- `GET /analysis/technical/{symbol}?start=YYYY-MM-DD&end=YYYY-MM-DD&indicators=SMA_20,EMA_20`
- `POST /fundamentals/dcf`
- `POST /risk/mean-variance`
- `POST /risk/metrics`
- `POST /backtest/run`
- `POST /macro/dashboard`
- `POST /ml/train-baseline`
- `POST /workspace/layouts` (Bearer token)
- `GET /workspace/layouts/{name}` (Bearer token)
- `GET /health`

## Notes

- Data responses are normalized to a unified schema and cached in Redis with source-based TTL.
- The dashboard page includes auth bootstrap, symbol-based Yahoo fetch, and save/load layout actions.
- This is milestone 1 implementation and intentionally limited to the agreed MVP scope.