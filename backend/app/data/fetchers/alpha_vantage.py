from datetime import datetime

import httpx

from app.core.config import settings


class AlphaVantageFetcher:
    base_url = "https://www.alphavantage.co/query"

    async def fetch_daily(self, symbol: str) -> list[dict]:
        params = {
            "function": "TIME_SERIES_DAILY_ADJUSTED",
            "symbol": symbol,
            "outputsize": "compact",
            "apikey": settings.alpha_vantage_api_key,
        }
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(self.base_url, params=params)
            response.raise_for_status()
            payload = response.json()

        raw = payload.get("Time Series (Daily)", {})
        rows: list[dict] = []
        for date_str, values in raw.items():
            rows.append(
                {
                    "timestamp": datetime.fromisoformat(f"{date_str}T00:00:00+00:00"),
                    "open": float(values["1. open"]),
                    "high": float(values["2. high"]),
                    "low": float(values["3. low"]),
                    "close": float(values["4. close"]),
                    "volume": float(values["6. volume"]),
                }
            )

        rows.sort(key=lambda item: item["timestamp"])
        return rows
