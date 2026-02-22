from fastapi import APIRouter

from app.engine.macro import build_macro_dashboard
from app.models.schemas import MacroDashboardRequest, MacroDashboardResponse

router = APIRouter(prefix="/macro", tags=["macro"])


@router.post("/dashboard", response_model=MacroDashboardResponse)
async def macro_dashboard(payload: MacroDashboardRequest) -> MacroDashboardResponse:
    return await build_macro_dashboard(start=payload.start, end=payload.end, series_ids=payload.series_ids)
