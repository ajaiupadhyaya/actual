import json

from fastapi import APIRouter, Query

from app.core.cache import redis_client
from app.data.fetchers.yahoo import YahooFetcher
from app.engine.indicators import compute_indicators
from app.models.schemas import TechnicalAnalysisResponse

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.get("/technical/{symbol}", response_model=TechnicalAnalysisResponse)
async def get_technical_analysis(
    symbol: str,
    start: str = Query(..., description="YYYY-MM-DD"),
    end: str = Query(..., description="YYYY-MM-DD"),
    indicators: str = Query("SMA_20,EMA_20", description="Comma-separated indicators"),
) -> TechnicalAnalysisResponse:
    indicator_list = [value.strip().upper() for value in indicators.split(",") if value.strip()]
    cache_key = f"analysis:technical:{symbol}:{start}:{end}:{','.join(indicator_list)}"

    cached = await redis_client.get(cache_key)
    if cached:
        return TechnicalAnalysisResponse.model_validate_json(cached)

    rows = await YahooFetcher().fetch_daily(symbol=symbol, start=start, end=end)
    response = compute_indicators(rows=rows, indicators=indicator_list, symbol=symbol)

    await redis_client.set(cache_key, json.dumps(response.model_dump(mode="json")), ex=60 * 30)
    return response
