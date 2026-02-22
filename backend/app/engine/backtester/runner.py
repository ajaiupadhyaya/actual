from collections import deque

import yfinance as yf

from app.engine.backtester.events import BarEvent, FillEvent, OrderEvent, SignalEvent
from app.engine.backtester.performance import build_tear_sheet
from app.engine.backtester.strategy import SmaCrossoverStrategy
from app.models.schemas import BacktestRequest, BacktestResponse, BacktestTrade, EquityPoint


def run_backtest(payload: BacktestRequest) -> BacktestResponse:
    frame = yf.download(payload.symbol, start=payload.start, end=payload.end, auto_adjust=False, progress=False)
    if frame.empty:
        raise ValueError("No market data available for requested range")

    frame = frame[["Open", "High", "Low", "Close", "Volume"]].dropna().copy()
    frame.columns = ["open", "high", "low", "close", "volume"]

    strategy = SmaCrossoverStrategy(
        fast_window=payload.strategy.fast_window,
        slow_window=payload.strategy.slow_window,
    )

    frame["sma_fast"] = frame["close"].rolling(payload.strategy.fast_window).mean()
    frame["sma_slow"] = frame["close"].rolling(payload.strategy.slow_window).mean()

    event_queue: deque[object] = deque()
    position = 0
    cash = payload.initial_capital
    entry_price = 0.0
    trades: list[BacktestTrade] = []
    equity_curve: list[EquityPoint] = []

    for index, (timestamp, row) in enumerate(frame.iterrows()):
        bar = BarEvent(
            timestamp=timestamp.to_pydatetime(),
            open=float(row["open"]),
            high=float(row["high"]),
            low=float(row["low"]),
            close=float(row["close"]),
            volume=float(row["volume"]),
        )
        event_queue.append(bar)

        signal = strategy.generate_signal(index=index, frame=frame)
        if signal:
            event_queue.append(SignalEvent(timestamp=bar.timestamp, signal=signal))

        while event_queue:
            event = event_queue.popleft()
            if isinstance(event, SignalEvent):
                if event.signal == "BUY" and position == 0:
                    event_queue.append(OrderEvent(timestamp=event.timestamp, side="BUY", quantity=payload.trade_size))
                elif event.signal == "SELL" and position > 0:
                    event_queue.append(OrderEvent(timestamp=event.timestamp, side="SELL", quantity=position))
            elif isinstance(event, OrderEvent):
                event_queue.append(
                    FillEvent(
                        timestamp=event.timestamp,
                        side=event.side,
                        quantity=event.quantity,
                        price=bar.close,
                    )
                )
            elif isinstance(event, FillEvent):
                if event.side == "BUY":
                    cost = event.price * event.quantity
                    if cost <= cash:
                        cash -= cost
                        position += event.quantity
                        entry_price = event.price
                        trades.append(
                            BacktestTrade(
                                timestamp=event.timestamp,
                                side="BUY",
                                quantity=event.quantity,
                                price=event.price,
                                pnl=0.0,
                            )
                        )
                elif event.side == "SELL" and position >= event.quantity:
                    proceeds = event.price * event.quantity
                    cash += proceeds
                    pnl = (event.price - entry_price) * event.quantity
                    position -= event.quantity
                    trades.append(
                        BacktestTrade(
                            timestamp=event.timestamp,
                            side="SELL",
                            quantity=event.quantity,
                            price=event.price,
                            pnl=pnl,
                        )
                    )

        mark_to_market = cash + (position * bar.close)
        equity_curve.append(EquityPoint(timestamp=bar.timestamp, equity=mark_to_market))

    if position > 0:
        last_bar = frame.iloc[-1]
        liquidation_price = float(last_bar["close"])
        proceeds = liquidation_price * position
        cash += proceeds
        pnl = (liquidation_price - entry_price) * position
        trades.append(
            BacktestTrade(
                timestamp=frame.index[-1].to_pydatetime(),
                side="SELL",
                quantity=position,
                price=liquidation_price,
                pnl=pnl,
            )
        )
        position = 0
        equity_curve[-1] = EquityPoint(timestamp=equity_curve[-1].timestamp, equity=cash)

    tear_sheet = build_tear_sheet(payload.initial_capital, equity_curve, trades)

    return BacktestResponse(
        symbol=payload.symbol.upper(),
        strategy=payload.strategy.name,
        initial_capital=payload.initial_capital,
        final_equity=equity_curve[-1].equity if equity_curve else payload.initial_capital,
        tear_sheet=tear_sheet,
        equity_curve=equity_curve,
        trades=trades,
    )
