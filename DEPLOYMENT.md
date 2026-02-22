# Deployment Guide

This guide covers both local deployment and a production-style container deployment on a managed PaaS.

## 1) Prerequisites

- Docker Desktop (or Docker Engine + Compose plugin)
- Git
- API keys for at least:
  - `FRED_API_KEY`
  - `ALPHA_VANTAGE_API_KEY`
- Optional: `POLYGON_API_KEY`, `OPENAI_API_KEY`, etc.

---

## 2) Environment Setup

From repo root:

```bash
cp .env.example .env
```

Set strong values for:

- `JWT_SECRET`
- `FRED_API_KEY`
- `ALPHA_VANTAGE_API_KEY`

Keep these aligned for local compose:

- `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`
- `FRONTEND_ORIGIN=http://localhost:3000`

---

## 3) Local Deployment (Recommended First)

From repo root:

```bash
docker compose up --build
```

Services and ports:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`
- Postgres: `localhost:5432`
- Redis: `localhost:6379`

Stop services:

```bash
docker compose down
```

Reset data volumes:

```bash
docker compose down -v
```

---

## 4) Smoke Test Checklist

1. Open `http://localhost:3000`
2. Navigate to:
   - `/dashboard`
   - `/models`
   - `/risk`
   - `/backtest`
   - `/macro`
3. Confirm backend health:

```bash
curl http://localhost:8000/health
```

Expected response:

```json
{"status":"ok"}
```

---

## 5) Production-Style Deployment (Managed PaaS)

Use a managed platform that supports Docker images and managed Postgres/Redis.

## 5.1 Provision managed data services

Create:

- Managed PostgreSQL instance
- Managed Redis instance

Capture connection strings:

- `DATABASE_URL=postgresql+asyncpg://...`
- `REDIS_URL=redis://...`

## 5.2 Deploy Backend service

Build from `backend/Dockerfile`.
Set environment variables:

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `FRONTEND_ORIGIN` (your deployed frontend URL)
- `FRED_API_KEY`
- `ALPHA_VANTAGE_API_KEY`

Expose port `8000`.
Health check path: `/health`.

## 5.3 Deploy Frontend service

Build from `frontend/Dockerfile`.
Set environment variable:

- `NEXT_PUBLIC_API_BASE_URL=https://<your-backend-domain>`

Expose port `3000`.

## 5.4 Verify CORS and routing

- Backend `FRONTEND_ORIGIN` must exactly match frontend domain.
- Confirm frontend can call backend endpoints without CORS errors.

---

## 6) Operational Notes

- Keep all secrets in the platform secret manager (not in git).
- Use separate environments (`dev`, `staging`, `prod`) with separate DB/Redis instances.
- Rotate `JWT_SECRET` and API keys periodically.
- Enable platform logs and monitor:
  - 5xx rate
  - response latency
  - memory/CPU

---

## 7) Common Issues

- `401 Invalid token`:
  - Verify login/register flow and Authorization header (`Bearer <token>`).
- CORS failures:
  - Confirm `FRONTEND_ORIGIN` equals deployed frontend origin exactly.
- Empty data series:
  - Verify API keys and free-tier limits.
- Backend boots but frontend errors:
  - Ensure `NEXT_PUBLIC_API_BASE_URL` points to reachable backend URL.

---

## 8) Fast Rollback Strategy

- Keep image tags immutable.
- Roll back frontend and backend independently to previous known-good tags.
- Never roll back one service across a breaking API contract without the paired version.
