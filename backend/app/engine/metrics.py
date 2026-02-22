import math
from collections.abc import Sequence


def sharpe_ratio(returns: Sequence[float], risk_free_rate: float = 0.0, periods_per_year: int = 252) -> float:
    if not returns:
        raise ValueError("returns must not be empty")

    mean_return = sum(returns) / len(returns)
    variance = sum((value - mean_return) ** 2 for value in returns) / len(returns)
    std_dev = math.sqrt(variance)

    if std_dev == 0:
        raise ValueError("standard deviation is zero")

    excess_return = mean_return - (risk_free_rate / periods_per_year)
    return (excess_return / std_dev) * math.sqrt(periods_per_year)
