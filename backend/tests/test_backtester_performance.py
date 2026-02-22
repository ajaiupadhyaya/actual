from datetime import UTC, datetime, timedelta

from app.engine.backtester.performance import build_tear_sheet, max_drawdown
from app.models.schemas import BacktestTrade, EquityPoint


def test_max_drawdown_computation() -> None:
    base = datetime(2026, 1, 1, tzinfo=UTC)
    curve = [
        EquityPoint(timestamp=base, equity=100_000),
        EquityPoint(timestamp=base + timedelta(days=1), equity=110_000),
        EquityPoint(timestamp=base + timedelta(days=2), equity=95_000),
        EquityPoint(timestamp=base + timedelta(days=3), equity=120_000),
    ]

    dd = max_drawdown(curve)
    assert round(dd, 4) == 0.1364


def test_tear_sheet_has_expected_fields() -> None:
    base = datetime(2026, 1, 1, tzinfo=UTC)
    curve = [
        EquityPoint(timestamp=base, equity=100_000),
        EquityPoint(timestamp=base + timedelta(days=1), equity=101_000),
        EquityPoint(timestamp=base + timedelta(days=2), equity=102_500),
        EquityPoint(timestamp=base + timedelta(days=3), equity=101_500),
        EquityPoint(timestamp=base + timedelta(days=4), equity=103_000),
    ]
    trades = [
        BacktestTrade(timestamp=base + timedelta(days=2), side="BUY", quantity=100, price=100.0, pnl=0.0),
        BacktestTrade(timestamp=base + timedelta(days=4), side="SELL", quantity=100, price=103.0, pnl=300.0),
    ]

    sheet = build_tear_sheet(100_000, curve, trades)
    assert sheet.trade_count == 2
    assert sheet.total_return > 0
    assert sheet.annualized_volatility >= 0
