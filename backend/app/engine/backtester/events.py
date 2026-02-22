from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class BarEvent:
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float


@dataclass(frozen=True)
class SignalEvent:
    timestamp: datetime
    signal: str


@dataclass(frozen=True)
class OrderEvent:
    timestamp: datetime
    side: str
    quantity: int


@dataclass(frozen=True)
class FillEvent:
    timestamp: datetime
    side: str
    quantity: int
    price: float
