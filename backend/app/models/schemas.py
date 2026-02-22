from datetime import datetime
from typing import Any

from pydantic import BaseModel, EmailStr, Field


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=10)


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class DataPoint(BaseModel):
    timestamp: datetime
    value: float
    metadata: dict[str, Any] = Field(default_factory=dict)


class UnifiedSeriesResponse(BaseModel):
    ticker_or_series_id: str
    source: str
    frequency: str
    unit: str
    last_updated: datetime
    data: list[DataPoint]


class DataRegistryEntryResponse(BaseModel):
    ticker_or_series_id: str
    source: str
    frequency: str
    unit: str
    last_updated: datetime
    latest_value: float | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class DataRegistryListResponse(BaseModel):
    total: int
    items: list[DataRegistryEntryResponse]


class FredSearchItem(BaseModel):
    series_id: str
    title: str
    frequency: str | None = None
    units: str | None = None


class FredSearchResponse(BaseModel):
    total: int
    items: list[FredSearchItem]


class OhlcvBar(BaseModel):
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float


class IndicatorPoint(BaseModel):
    timestamp: datetime
    value: float


class IndicatorSeries(BaseModel):
    name: str
    points: list[IndicatorPoint]


class TechnicalAnalysisResponse(BaseModel):
    ticker_or_series_id: str
    source: str
    frequency: str
    last_updated: datetime
    ohlcv: list[OhlcvBar]
    indicators: list[IndicatorSeries]


class DcfStage(BaseModel):
    years: int = Field(ge=1)
    growth_rate: float = Field(description="Annual growth rate as decimal, e.g. 0.08")


class DcfRequest(BaseModel):
    ticker: str = Field(min_length=1, max_length=20)
    base_fcf: float = Field(gt=0)
    wacc: float = Field(gt=0, lt=1)
    terminal_growth_rate: float = Field(ge=0, lt=1)
    net_debt: float = 0.0
    shares_outstanding: float = Field(gt=0)
    stages: list[DcfStage] = Field(min_length=1)
    wacc_sensitivity: list[float] = Field(default_factory=list)
    terminal_growth_sensitivity: list[float] = Field(default_factory=list)
    monte_carlo_runs: int = Field(default=500, ge=100, le=10000)
    wacc_std_dev: float = Field(default=0.01, ge=0, lt=0.2)
    terminal_growth_std_dev: float = Field(default=0.005, ge=0, lt=0.1)
    growth_std_dev: float = Field(default=0.01, ge=0, lt=0.2)


class DcfProjectedCashFlow(BaseModel):
    year: int
    projected_fcf: float
    discount_factor: float
    present_value: float


class DcfSensitivityPoint(BaseModel):
    wacc: float
    terminal_growth_rate: float
    intrinsic_value_per_share: float


class DcfUncertaintySummary(BaseModel):
    runs: int
    intrinsic_value_p5: float
    intrinsic_value_p50: float
    intrinsic_value_p95: float
    enterprise_value_p5: float
    enterprise_value_p50: float
    enterprise_value_p95: float


class DcfResponse(BaseModel):
    ticker: str
    enterprise_value: float
    equity_value: float
    intrinsic_value_per_share: float
    terminal_value: float
    discounted_terminal_value: float
    projected_cash_flows: list[DcfProjectedCashFlow]
    sensitivity: list[DcfSensitivityPoint]
    uncertainty: DcfUncertaintySummary


class MeanVarianceRequest(BaseModel):
    symbols: list[str] = Field(min_length=2)
    start: str
    end: str
    risk_free_rate: float = 0.0
    long_only: bool = True
    frontier_points: int = Field(default=600, ge=50, le=5000)


class PortfolioWeights(BaseModel):
    symbol: str
    weight: float


class PortfolioFrontierPoint(BaseModel):
    expected_return: float
    volatility: float
    sharpe_ratio: float


class MeanVarianceResponse(BaseModel):
    symbols: list[str]
    expected_annual_return: float
    annual_volatility: float
    sharpe_ratio: float
    weights: list[PortfolioWeights]
    efficient_frontier: list[PortfolioFrontierPoint]


class RiskMetricsRequest(BaseModel):
    symbols: list[str] = Field(min_length=1)
    start: str
    end: str
    confidence_level: float = Field(default=0.95, gt=0.5, lt=0.999)
    horizon_days: int = Field(default=1, ge=1, le=252)
    weights: list[float] | None = None


class CorrelationCell(BaseModel):
    row: str
    col: str
    value: float


class RiskMetricsResponse(BaseModel):
    symbols: list[str]
    confidence_level: float
    horizon_days: int
    historical_var: float
    parametric_var: float
    correlation_matrix: list[CorrelationCell]


class BacktestStrategyConfig(BaseModel):
    name: str = Field(default="sma_crossover")
    fast_window: int = Field(default=20, ge=2, le=200)
    slow_window: int = Field(default=50, ge=3, le=400)


class BacktestRequest(BaseModel):
    symbol: str = Field(min_length=1, max_length=20)
    start: str
    end: str
    initial_capital: float = Field(default=100000.0, gt=0)
    trade_size: int = Field(default=100, ge=1)
    strategy: BacktestStrategyConfig = Field(default_factory=BacktestStrategyConfig)


class BacktestTrade(BaseModel):
    timestamp: datetime
    side: str
    quantity: int
    price: float
    pnl: float


class EquityPoint(BaseModel):
    timestamp: datetime
    equity: float


class TearSheet(BaseModel):
    total_return: float
    annualized_return: float
    annualized_volatility: float
    sharpe_ratio: float
    max_drawdown: float
    calmar_ratio: float
    win_rate: float
    trade_count: int


class BacktestResponse(BaseModel):
    symbol: str
    strategy: str
    initial_capital: float
    final_equity: float
    tear_sheet: TearSheet
    equity_curve: list[EquityPoint]
    trades: list[BacktestTrade]


class MacroDashboardRequest(BaseModel):
    start: str
    end: str
    series_ids: list[str] | None = None


class MacroPoint(BaseModel):
    timestamp: datetime
    value: float
    yoy_change: float | None = None
    z_score: float | None = None
    recession_flag: int = 0


class MacroSeries(BaseModel):
    series_id: str
    label: str
    source: str = "FRED"
    points: list[MacroPoint]


class MacroDashboardResponse(BaseModel):
    start: str
    end: str
    series: list[MacroSeries]
    correlation_matrix: list[CorrelationCell]


class MlTrainRequest(BaseModel):
    symbol: str = Field(min_length=1, max_length=20)
    start: str
    end: str
    lags: int = Field(default=5, ge=2, le=30)
    train_ratio: float = Field(default=0.8, gt=0.5, lt=0.95)


class MlPredictionPoint(BaseModel):
    timestamp: datetime
    actual: float
    predicted: float


class MlTrainResponse(BaseModel):
    symbol: str
    model_name: str
    lags: int
    train_size: int
    test_size: int
    mse: float
    rmse: float
    mae: float
    r2: float
    coefficients: list[float]
    intercept: float
    predictions: list[MlPredictionPoint]
