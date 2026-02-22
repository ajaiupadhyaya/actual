from fastapi import APIRouter, HTTPException

from app.engine.backtester.runner import run_backtest
from app.models.schemas import BacktestRequest, BacktestResponse

router = APIRouter(prefix="/backtest", tags=["backtest"])


@router.post("/run", response_model=BacktestResponse)
async def run_backtest_route(payload: BacktestRequest) -> BacktestResponse:
    try:
        return run_backtest(payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
