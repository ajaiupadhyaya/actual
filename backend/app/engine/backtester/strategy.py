from abc import ABC, abstractmethod

import pandas as pd


class BaseStrategy(ABC):
    @abstractmethod
    def generate_signal(self, index: int, frame: pd.DataFrame) -> str | None:
        raise NotImplementedError


class SmaCrossoverStrategy(BaseStrategy):
    def __init__(self, fast_window: int, slow_window: int):
        if fast_window >= slow_window:
            raise ValueError("fast_window must be smaller than slow_window")
        self.fast_window = fast_window
        self.slow_window = slow_window

    def generate_signal(self, index: int, frame: pd.DataFrame) -> str | None:
        if index < self.slow_window:
            return None

        current_fast = frame.iloc[index]["sma_fast"]
        current_slow = frame.iloc[index]["sma_slow"]
        previous_fast = frame.iloc[index - 1]["sma_fast"]
        previous_slow = frame.iloc[index - 1]["sma_slow"]

        if pd.isna(current_fast) or pd.isna(current_slow) or pd.isna(previous_fast) or pd.isna(previous_slow):
            return None

        if previous_fast <= previous_slow and current_fast > current_slow:
            return "BUY"

        if previous_fast >= previous_slow and current_fast < current_slow:
            return "SELL"

        return None
