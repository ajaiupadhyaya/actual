from datetime import UTC

import pandas as pd
import yfinance as yf


class YahooFetcher:
    async def fetch_daily(self, symbol: str, start: str, end: str) -> list[dict]:
        ticker = yf.Ticker(symbol)
        history: pd.DataFrame = ticker.history(start=start, end=end, interval="1d", auto_adjust=False)
        history = history.reset_index()

        rows: list[dict] = []
        for _, row in history.iterrows():
            rows.append(
                {
                    "timestamp": row["Date"].to_pydatetime().astimezone(UTC),
                    "open": float(row["Open"]),
                    "high": float(row["High"]),
                    "low": float(row["Low"]),
                    "close": float(row["Close"]),
                    "volume": float(row["Volume"]),
                }
            )
        return rows
