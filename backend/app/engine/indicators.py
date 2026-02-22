from datetime import UTC, datetime

import pandas as pd

from app.models.schemas import IndicatorPoint, IndicatorSeries, OhlcvBar, TechnicalAnalysisResponse


def _series_to_points(values: pd.Series) -> list[IndicatorPoint]:
    points: list[IndicatorPoint] = []
    clean = values.dropna()
    for timestamp, value in clean.items():
        ts = pd.Timestamp(timestamp).to_pydatetime()
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=UTC)
        else:
            ts = ts.astimezone(UTC)
        points.append(IndicatorPoint(timestamp=ts, value=float(value)))
    return points


def compute_indicators(rows: list[dict], indicators: list[str], symbol: str) -> TechnicalAnalysisResponse:
    frame = pd.DataFrame(rows)
    frame["timestamp"] = pd.to_datetime(frame["timestamp"], utc=True)
    frame = frame.sort_values("timestamp").set_index("timestamp")

    close = frame["close"]
    selected = {name.strip().upper() for name in indicators if name.strip()}
    series: list[IndicatorSeries] = []

    if "SMA_20" in selected:
        sma20 = close.rolling(20).mean()
        series.append(IndicatorSeries(name="SMA_20", points=_series_to_points(sma20)))

    if "EMA_20" in selected:
        ema20 = close.ewm(span=20, adjust=False).mean()
        series.append(IndicatorSeries(name="EMA_20", points=_series_to_points(ema20)))

    if "RSI_14" in selected:
        delta = close.diff()
        gain = delta.clip(lower=0).rolling(14).mean()
        loss = (-delta.clip(upper=0)).rolling(14).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        series.append(IndicatorSeries(name="RSI_14", points=_series_to_points(rsi)))

    if "MACD" in selected:
        ema12 = close.ewm(span=12, adjust=False).mean()
        ema26 = close.ewm(span=26, adjust=False).mean()
        macd = ema12 - ema26
        signal = macd.ewm(span=9, adjust=False).mean()
        histogram = macd - signal
        series.append(IndicatorSeries(name="MACD", points=_series_to_points(macd)))
        series.append(IndicatorSeries(name="MACD_SIGNAL", points=_series_to_points(signal)))
        series.append(IndicatorSeries(name="MACD_HIST", points=_series_to_points(histogram)))

    if "BBANDS_20" in selected:
        basis = close.rolling(20).mean()
        std = close.rolling(20).std()
        upper = basis + 2 * std
        lower = basis - 2 * std
        series.append(IndicatorSeries(name="BBANDS_MID", points=_series_to_points(basis)))
        series.append(IndicatorSeries(name="BBANDS_UPPER", points=_series_to_points(upper)))
        series.append(IndicatorSeries(name="BBANDS_LOWER", points=_series_to_points(lower)))

    ohlcv = [
        OhlcvBar(
            timestamp=pd.Timestamp(index).to_pydatetime(),
            open=float(item["open"]),
            high=float(item["high"]),
            low=float(item["low"]),
            close=float(item["close"]),
            volume=float(item["volume"]),
        )
        for index, item in frame.iterrows()
    ]

    return TechnicalAnalysisResponse(
        ticker_or_series_id=symbol,
        source="Yahoo Finance",
        frequency="daily",
        last_updated=datetime.now(UTC),
        ohlcv=ohlcv,
        indicators=series,
    )
