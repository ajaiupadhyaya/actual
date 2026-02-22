import math

import pandas as pd

from app.engine.fundamentals import compute_dcf
from app.engine.portfolio_risk import compute_risk_metrics_from_returns
from app.models.schemas import DcfRequest, DcfStage


def test_dcf_returns_positive_intrinsic_value() -> None:
    response = compute_dcf(
        DcfRequest(
            ticker="AAPL",
            base_fcf=100_000_000_000,
            wacc=0.09,
            terminal_growth_rate=0.03,
            net_debt=80_000_000_000,
            shares_outstanding=15_500_000_000,
            stages=[DcfStage(years=3, growth_rate=0.08), DcfStage(years=2, growth_rate=0.05)],
        )
    )

    assert response.enterprise_value > 0
    assert response.equity_value > 0
    assert response.intrinsic_value_per_share > 0
    assert len(response.projected_cash_flows) == 5


def test_dcf_rejects_invalid_terminal_growth() -> None:
    try:
        compute_dcf(
            DcfRequest(
                ticker="MSFT",
                base_fcf=70_000_000_000,
                wacc=0.06,
                terminal_growth_rate=0.07,
                net_debt=10_000_000_000,
                shares_outstanding=7_500_000_000,
                stages=[DcfStage(years=2, growth_rate=0.05)],
            )
        )
        assert False, "Expected ValueError"
    except ValueError as exc:
        assert "terminal_growth_rate" in str(exc)


def test_risk_metrics_outputs_var_and_correlation() -> None:
    returns = pd.DataFrame(
        {
            "AAPL": [0.01, -0.02, 0.015, 0.005, -0.01],
            "MSFT": [0.008, -0.018, 0.012, 0.004, -0.009],
        }
    )

    response = compute_risk_metrics_from_returns(
        symbols=["AAPL", "MSFT"],
        returns=returns,
        confidence_level=0.95,
        horizon_days=1,
        weights=[0.5, 0.5],
    )

    assert math.isfinite(response.historical_var)
    assert math.isfinite(response.parametric_var)
    assert len(response.correlation_matrix) == 4
