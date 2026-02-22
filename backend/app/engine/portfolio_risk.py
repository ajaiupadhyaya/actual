import math
import statistics

import numpy as np
import pandas as pd
import yfinance as yf

from app.models.schemas import CorrelationCell, MeanVarianceResponse, PortfolioFrontierPoint, PortfolioWeights, RiskMetricsResponse


def _fetch_close_returns(symbols: list[str], start: str, end: str) -> pd.DataFrame:
    data = yf.download(symbols, start=start, end=end, auto_adjust=False, progress=False)
    closes = data["Close"] if "Close" in data else data

    if isinstance(closes, pd.Series):
        closes = closes.to_frame(name=symbols[0])

    closes = closes.dropna(how="all").ffill().dropna()
    returns = closes.pct_change().dropna()
    return returns


def compute_mean_variance(
    symbols: list[str],
    start: str,
    end: str,
    risk_free_rate: float,
    long_only: bool,
    frontier_points: int,
) -> MeanVarianceResponse:
    clean_symbols = [symbol.upper() for symbol in symbols]
    returns = _fetch_close_returns(clean_symbols, start=start, end=end)

    mean_returns = returns.mean().to_numpy(dtype=float) * 252.0
    covariance = returns.cov().to_numpy(dtype=float) * 252.0

    inverse_cov = np.linalg.pinv(covariance)
    excess_returns = mean_returns - risk_free_rate
    raw_weights = inverse_cov @ excess_returns

    if long_only:
        raw_weights = np.clip(raw_weights, 0, None)

    weight_sum = raw_weights.sum()
    if weight_sum <= 0:
        raw_weights = np.ones_like(raw_weights) / len(raw_weights)
    else:
        raw_weights = raw_weights / weight_sum

    portfolio_return = float(raw_weights @ mean_returns)
    portfolio_vol = float(math.sqrt(raw_weights @ covariance @ raw_weights.T))
    sharpe = (portfolio_return - risk_free_rate) / portfolio_vol if portfolio_vol > 0 else 0.0

    rng = np.random.default_rng(seed=21)
    frontier: list[PortfolioFrontierPoint] = []
    for _ in range(frontier_points):
        if long_only:
            sample_weights = rng.dirichlet(np.ones(len(clean_symbols)))
        else:
            raw = rng.normal(0, 1, size=len(clean_symbols))
            gross = np.sum(np.abs(raw))
            sample_weights = raw / gross if gross > 0 else np.ones(len(clean_symbols)) / len(clean_symbols)

        sample_return = float(sample_weights @ mean_returns)
        sample_volatility = float(math.sqrt(sample_weights @ covariance @ sample_weights.T))
        sample_sharpe = (sample_return - risk_free_rate) / sample_volatility if sample_volatility > 0 else 0.0
        frontier.append(
            PortfolioFrontierPoint(
                expected_return=sample_return,
                volatility=sample_volatility,
                sharpe_ratio=float(sample_sharpe),
            )
        )

    frontier = sorted(frontier, key=lambda point: point.volatility)

    weights = [PortfolioWeights(symbol=symbol, weight=float(weight)) for symbol, weight in zip(clean_symbols, raw_weights)]

    return MeanVarianceResponse(
        symbols=clean_symbols,
        expected_annual_return=portfolio_return,
        annual_volatility=portfolio_vol,
        sharpe_ratio=float(sharpe),
        weights=weights,
        efficient_frontier=frontier,
    )


def compute_risk_metrics(
    symbols: list[str],
    start: str,
    end: str,
    confidence_level: float,
    horizon_days: int,
    weights: list[float] | None,
) -> RiskMetricsResponse:
    clean_symbols = [symbol.upper() for symbol in symbols]
    returns = _fetch_close_returns(clean_symbols, start=start, end=end)

    return compute_risk_metrics_from_returns(
        symbols=clean_symbols,
        returns=returns,
        confidence_level=confidence_level,
        horizon_days=horizon_days,
        weights=weights,
    )


def compute_risk_metrics_from_returns(
    symbols: list[str],
    returns: pd.DataFrame,
    confidence_level: float,
    horizon_days: int,
    weights: list[float] | None,
) -> RiskMetricsResponse:
    clean_symbols = [symbol.upper() for symbol in symbols]

    if weights is None:
        vector = np.ones(len(clean_symbols)) / len(clean_symbols)
    else:
        vector = np.array(weights, dtype=float)
        if len(vector) != len(clean_symbols):
            raise ValueError("weights length must equal symbols length")
        total = vector.sum()
        if total == 0:
            raise ValueError("weights sum cannot be zero")
        vector = vector / total

    portfolio_returns = returns.values @ vector

    percentile = (1 - confidence_level) * 100
    historical_var = -float(np.percentile(portfolio_returns, percentile) * math.sqrt(horizon_days))

    mean_daily = float(np.mean(portfolio_returns))
    std_daily = float(np.std(portfolio_returns, ddof=1))
    z_score = abs(statistics.NormalDist().inv_cdf(1 - confidence_level))
    parametric_var = -float((mean_daily - z_score * std_daily) * math.sqrt(horizon_days))

    corr = returns.corr()
    cells = [
        CorrelationCell(row=str(row), col=str(col), value=float(np.real(corr.loc[row, col])))
        for row in corr.index
        for col in corr.columns
    ]

    return RiskMetricsResponse(
        symbols=clean_symbols,
        confidence_level=confidence_level,
        horizon_days=horizon_days,
        historical_var=historical_var,
        parametric_var=parametric_var,
        correlation_matrix=cells,
    )
