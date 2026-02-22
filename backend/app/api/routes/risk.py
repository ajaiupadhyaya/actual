from fastapi import APIRouter, HTTPException

from app.engine.portfolio_risk import compute_mean_variance, compute_risk_metrics
from app.models.schemas import MeanVarianceRequest, MeanVarianceResponse, RiskMetricsRequest, RiskMetricsResponse

router = APIRouter(prefix="/risk", tags=["risk"])


@router.post("/mean-variance", response_model=MeanVarianceResponse)
async def run_mean_variance(payload: MeanVarianceRequest) -> MeanVarianceResponse:
    try:
        return compute_mean_variance(
            symbols=payload.symbols,
            start=payload.start,
            end=payload.end,
            risk_free_rate=payload.risk_free_rate,
            long_only=payload.long_only,
            frontier_points=payload.frontier_points,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/metrics", response_model=RiskMetricsResponse)
async def run_risk_metrics(payload: RiskMetricsRequest) -> RiskMetricsResponse:
    try:
        return compute_risk_metrics(
            symbols=payload.symbols,
            start=payload.start,
            end=payload.end,
            confidence_level=payload.confidence_level,
            horizon_days=payload.horizon_days,
            weights=payload.weights,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
