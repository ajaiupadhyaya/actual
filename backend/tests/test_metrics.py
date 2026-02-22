import math

import pytest

from app.engine.metrics import sharpe_ratio


def test_sharpe_ratio_matches_expected_value() -> None:
    returns = [0.01, -0.005, 0.012, 0.004, -0.002]
    result = sharpe_ratio(returns)

    assert math.isfinite(result)
    assert result == pytest.approx(9.1609, rel=1e-3)


def test_sharpe_ratio_raises_on_empty_returns() -> None:
    with pytest.raises(ValueError, match="must not be empty"):
        sharpe_ratio([])
