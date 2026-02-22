from datetime import UTC, datetime

from app.models.schemas import DataPoint, UnifiedSeriesResponse


def normalize_fred_series(series_id: str, observations: list[dict]) -> UnifiedSeriesResponse:
    points: list[DataPoint] = []
    for obs in observations:
        value_raw = obs.get("value")
        if value_raw in (None, "."):
            continue
        points.append(
            DataPoint(
                timestamp=datetime.fromisoformat(f"{obs['date']}T00:00:00+00:00"),
                value=float(value_raw),
                metadata={},
            )
        )

    return UnifiedSeriesResponse(
        ticker_or_series_id=series_id,
        source="FRED",
        frequency="daily",
        unit="index",
        last_updated=datetime.now(UTC),
        data=points,
    )


def normalize_yahoo_ohlcv(symbol: str, rows: list[dict]) -> UnifiedSeriesResponse:
    points = [
        DataPoint(timestamp=row["timestamp"], value=row["close"], metadata={k: v for k, v in row.items() if k != "close"})
        for row in rows
    ]
    return UnifiedSeriesResponse(
        ticker_or_series_id=symbol,
        source="Yahoo Finance",
        frequency="daily",
        unit="price",
        last_updated=datetime.now(UTC),
        data=points,
    )


def normalize_alpha_daily(symbol: str, rows: list[dict]) -> UnifiedSeriesResponse:
    points = [
        DataPoint(
            timestamp=row["timestamp"],
            value=row["close"],
            metadata={k: v for k, v in row.items() if k != "close"},
        )
        for row in rows
    ]
    return UnifiedSeriesResponse(
        ticker_or_series_id=symbol,
        source="Alpha Vantage",
        frequency="daily",
        unit="price",
        last_updated=datetime.now(UTC),
        data=points,
    )
