from datetime import datetime

import httpx

from app.core.config import settings


class FredFetcher:
    base_url = "https://api.stlouisfed.org/fred/series/observations"
    search_url = "https://api.stlouisfed.org/fred/series/search"

    async def fetch_series(self, series_id: str, start: str, end: str) -> list[dict]:
        params = {
            "series_id": series_id,
            "api_key": settings.fred_api_key,
            "file_type": "json",
            "observation_start": start,
            "observation_end": end,
        }
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(self.base_url, params=params)
            response.raise_for_status()
            payload = response.json()

        observations = payload.get("observations", [])
        for item in observations:
            item["fetched_at"] = datetime.utcnow().isoformat()
        return observations

    async def search_series(self, query: str, limit: int = 20) -> tuple[int, list[dict]]:
        params = {
            "search_text": query,
            "api_key": settings.fred_api_key,
            "file_type": "json",
            "limit": max(1, min(limit, 100)),
            "sort_order": "desc",
        }
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(self.search_url, params=params)
            response.raise_for_status()
            payload = response.json()

        count = int(payload.get("count", 0))
        return count, payload.get("seriess", [])
