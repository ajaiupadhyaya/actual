import json
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import redis_client
from app.core.db import get_db_session
from app.data.fetchers.alpha_vantage import AlphaVantageFetcher
from app.data.fetchers.fred import FredFetcher
from app.data.fetchers.yahoo import YahooFetcher
from app.data.processors.normalize import normalize_alpha_daily, normalize_fred_series, normalize_yahoo_ohlcv
from app.models.db_models import DataRegistryEntry
from app.models.schemas import (
    DataRegistryEntryResponse,
    DataRegistryListResponse,
    FredSearchItem,
    FredSearchResponse,
    UnifiedSeriesResponse,
)

router = APIRouter(prefix="/data", tags=["data"])


async def _upsert_registry_entry(response: UnifiedSeriesResponse, db: AsyncSession) -> None:
    latest_value = response.data[-1].value if response.data else None
    metadata = {
        "points": len(response.data),
        "preview_start": response.data[0].timestamp.isoformat() if response.data else None,
        "preview_end": response.data[-1].timestamp.isoformat() if response.data else None,
    }

    existing = await db.scalar(
        select(DataRegistryEntry).where(
            DataRegistryEntry.ticker_or_series_id == response.ticker_or_series_id,
            DataRegistryEntry.source == response.source,
        )
    )

    now = datetime.now(UTC)
    if existing:
        existing.frequency = response.frequency
        existing.unit = response.unit
        existing.last_updated = now
        existing.latest_value = latest_value
        existing.metadata_json = metadata
    else:
        db.add(
            DataRegistryEntry(
                ticker_or_series_id=response.ticker_or_series_id,
                source=response.source,
                frequency=response.frequency,
                unit=response.unit,
                last_updated=now,
                latest_value=latest_value,
                metadata_json=metadata,
            )
        )

    await db.commit()


@router.get("/fred/search", response_model=FredSearchResponse)
async def search_fred_series(
    q: str = Query(..., min_length=2, description="FRED search text"),
    limit: int = Query(default=20, ge=1, le=100),
) -> FredSearchResponse:
    try:
        total, rows = await FredFetcher().search_series(query=q, limit=limit)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"FRED search failed: {exc}") from exc

    return FredSearchResponse(
        total=total,
        items=[
            FredSearchItem(
                series_id=str(item.get("id", "")),
                title=str(item.get("title", "")),
                frequency=item.get("frequency"),
                units=item.get("units"),
            )
            for item in rows
            if item.get("id")
        ],
    )


@router.get("/fred/{series_id}", response_model=UnifiedSeriesResponse)
async def get_fred_series(
    series_id: str,
    start: str = Query(..., description="YYYY-MM-DD"),
    end: str = Query(..., description="YYYY-MM-DD"),
    db: AsyncSession = Depends(get_db_session),
) -> UnifiedSeriesResponse:
    cache_key = f"fred:{series_id}:{start}:{end}"
    cached = await redis_client.get(cache_key)
    if cached:
        return UnifiedSeriesResponse.model_validate_json(cached)

    if not series_id:
        raise HTTPException(status_code=400, detail="series_id is required")

    try:
        observations = await FredFetcher().fetch_series(series_id=series_id, start=start, end=end)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"FRED fetch failed: {exc}") from exc

    response = normalize_fred_series(series_id=series_id, observations=observations)
    await _upsert_registry_entry(response=response, db=db)
    await redis_client.set(cache_key, json.dumps(response.model_dump(mode="json")), ex=60 * 60 * 24)
    return response


@router.get("/yahoo/{symbol}", response_model=UnifiedSeriesResponse)
async def get_yahoo_series(
    symbol: str,
    start: str = Query(..., description="YYYY-MM-DD"),
    end: str = Query(..., description="YYYY-MM-DD"),
    db: AsyncSession = Depends(get_db_session),
) -> UnifiedSeriesResponse:
    cache_key = f"yahoo:{symbol}:{start}:{end}"
    cached = await redis_client.get(cache_key)
    if cached:
        return UnifiedSeriesResponse.model_validate_json(cached)

    try:
        rows = await YahooFetcher().fetch_daily(symbol=symbol, start=start, end=end)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Yahoo fetch failed: {exc}") from exc

    response = normalize_yahoo_ohlcv(symbol=symbol, rows=rows)
    await _upsert_registry_entry(response=response, db=db)
    await redis_client.set(cache_key, json.dumps(response.model_dump(mode="json")), ex=60 * 60)
    return response


@router.get("/alpha-vantage/{symbol}", response_model=UnifiedSeriesResponse)
async def get_alpha_vantage(symbol: str, db: AsyncSession = Depends(get_db_session)) -> UnifiedSeriesResponse:
    cache_key = f"alpha:{symbol}"
    cached = await redis_client.get(cache_key)
    if cached:
        return UnifiedSeriesResponse.model_validate_json(cached)

    try:
        rows = await AlphaVantageFetcher().fetch_daily(symbol=symbol)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Alpha Vantage fetch failed: {exc}") from exc

    response = normalize_alpha_daily(symbol=symbol, rows=rows)
    await _upsert_registry_entry(response=response, db=db)
    await redis_client.set(cache_key, json.dumps(response.model_dump(mode="json")), ex=60 * 60)
    return response


@router.get("/registry", response_model=DataRegistryListResponse)
async def list_registry(
    q: str = Query(default="", description="Search ticker/series id or source"),
    source: str | None = Query(default=None, description="Optional source filter"),
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db_session),
) -> DataRegistryListResponse:
    filters = []
    if source:
        filters.append(DataRegistryEntry.source.ilike(source))

    if q:
        query_text = f"%{q.strip()}%"
        filters.append(
            or_(
                DataRegistryEntry.ticker_or_series_id.ilike(query_text),
                DataRegistryEntry.source.ilike(query_text),
            )
        )

    where_clause = filters if filters else [True]
    total = int(await db.scalar(select(func.count()).select_from(DataRegistryEntry).where(*where_clause)) or 0)
    rows = (
        (
            await db.execute(
                select(DataRegistryEntry)
                .where(*where_clause)
                .order_by(DataRegistryEntry.last_updated.desc())
                .offset(offset)
                .limit(limit)
            )
        )
        .scalars()
        .all()
    )

    return DataRegistryListResponse(
        total=total,
        items=[
            DataRegistryEntryResponse(
                ticker_or_series_id=row.ticker_or_series_id,
                source=row.source,
                frequency=row.frequency,
                unit=row.unit,
                last_updated=row.last_updated,
                latest_value=row.latest_value,
                metadata=row.metadata_json or {},
            )
            for row in rows
        ],
    )


