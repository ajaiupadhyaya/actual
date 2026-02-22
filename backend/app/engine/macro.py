from datetime import UTC, datetime

import numpy as np
import pandas as pd

from app.data.fetchers.fred import FredFetcher
from app.models.schemas import CorrelationCell, MacroDashboardResponse, MacroPoint, MacroSeries

DEFAULT_MACRO_SERIES: dict[str, str] = {
    "GDP": "Real GDP",
    "CPIAUCSL": "CPI All Urban Consumers",
    "UNRATE": "Unemployment Rate",
    "FEDFUNDS": "Fed Funds Effective Rate",
    "INDPRO": "Industrial Production Index",
}


def _to_timestamp(date_str: str) -> datetime:
    return datetime.fromisoformat(f"{date_str}T00:00:00+00:00")


def _build_points(values: pd.Series, recession_map: dict[datetime, int]) -> list[MacroPoint]:
    yoy = values.pct_change(periods=12) * 100.0
    std = values.std(ddof=0)
    z_scores = (values - values.mean()) / std if std and std > 0 else pd.Series([0.0] * len(values), index=values.index)

    points: list[MacroPoint] = []
    for timestamp, value in values.items():
        dt = pd.Timestamp(timestamp).to_pydatetime().astimezone(UTC)
        yoy_value = yoy.loc[timestamp]
        z_value = z_scores.loc[timestamp]
        yoy_float = float(yoy_value) if bool(pd.notna(yoy_value)) else None
        z_float = float(z_value) if bool(pd.notna(z_value)) else None
        points.append(
            MacroPoint(
                timestamp=dt,
                value=float(value),
                yoy_change=yoy_float,
                z_score=z_float,
                recession_flag=recession_map.get(dt, 0),
            )
        )
    return points


async def build_macro_dashboard(start: str, end: str, series_ids: list[str] | None) -> MacroDashboardResponse:
    chosen_series = [series.upper() for series in (series_ids or list(DEFAULT_MACRO_SERIES.keys()))]
    fetcher = FredFetcher()

    recession_obs = await fetcher.fetch_series(series_id="USREC", start=start, end=end)
    recession_map: dict[datetime, int] = {
        _to_timestamp(item["date"]): int(float(item.get("value", 0.0) if item.get("value") != "." else 0.0))
        for item in recession_obs
    }

    frame_data: dict[str, pd.Series] = {}
    series_collection: list[MacroSeries] = []

    for series_id in chosen_series:
        observations = await fetcher.fetch_series(series_id=series_id, start=start, end=end)
        rows = [
            (_to_timestamp(item["date"]), float(item["value"]))
            for item in observations
            if item.get("value") not in (None, ".")
        ]

        if not rows:
            continue

        data = pd.Series({timestamp: value for timestamp, value in rows}).sort_index()
        frame_data[series_id] = data

        series_collection.append(
            MacroSeries(
                series_id=series_id,
                label=DEFAULT_MACRO_SERIES.get(series_id, series_id),
                points=_build_points(data, recession_map),
            )
        )

    if frame_data:
        matrix = pd.DataFrame(frame_data).dropna(how="any")
        corr = matrix.corr()
        correlations = [
            CorrelationCell(row=str(row), col=str(col), value=float(np.real(corr.loc[row, col])))
            for row in corr.index
            for col in corr.columns
        ]
    else:
        correlations = []

    return MacroDashboardResponse(start=start, end=end, series=series_collection, correlation_matrix=correlations)
