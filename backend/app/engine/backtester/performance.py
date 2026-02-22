import math
from datetime import datetime

from app.models.schemas import BacktestTrade, EquityPoint, TearSheet


def max_drawdown(equity_curve: list[EquityPoint]) -> float:
    if not equity_curve:
        return 0.0
    peak = equity_curve[0].equity
    drawdown = 0.0
    for point in equity_curve:
        if point.equity > peak:
            peak = point.equity
        current_drawdown = (point.equity - peak) / peak if peak else 0.0
        drawdown = min(drawdown, current_drawdown)
    return abs(drawdown)


def build_tear_sheet(initial_capital: float, equity_curve: list[EquityPoint], trades: list[BacktestTrade]) -> TearSheet:
    if len(equity_curve) < 2:
        return TearSheet(
            total_return=0.0,
            annualized_return=0.0,
            annualized_volatility=0.0,
            sharpe_ratio=0.0,
            max_drawdown=0.0,
            calmar_ratio=0.0,
            win_rate=0.0,
            trade_count=len(trades),
        )

    start = equity_curve[0].equity
    end = equity_curve[-1].equity
    total_return = (end - start) / start if start else 0.0

    returns = []
    for idx in range(1, len(equity_curve)):
        prev = equity_curve[idx - 1].equity
        current = equity_curve[idx].equity
        returns.append((current - prev) / prev if prev else 0.0)

    avg_return = sum(returns) / len(returns)
    variance = sum((value - avg_return) ** 2 for value in returns) / len(returns)
    volatility = math.sqrt(variance)

    annualized_return = (1 + avg_return) ** 252 - 1
    annualized_volatility = volatility * math.sqrt(252)
    sharpe_ratio = annualized_return / annualized_volatility if annualized_volatility > 0 else 0.0

    largest_drawdown = max_drawdown(equity_curve)
    calmar_ratio = annualized_return / largest_drawdown if largest_drawdown > 0 else 0.0

    realized = [trade.pnl for trade in trades if trade.pnl != 0]
    wins = sum(1 for value in realized if value > 0)
    win_rate = wins / len(realized) if realized else 0.0

    return TearSheet(
        total_return=total_return,
        annualized_return=annualized_return,
        annualized_volatility=annualized_volatility,
        sharpe_ratio=sharpe_ratio,
        max_drawdown=largest_drawdown,
        calmar_ratio=calmar_ratio,
        win_rate=win_rate,
        trade_count=len(trades),
    )
