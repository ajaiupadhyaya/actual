from fastapi import APIRouter, HTTPException

from app.engine.fundamentals import compute_dcf
from app.models.schemas import DcfRequest, DcfResponse

router = APIRouter(prefix="/fundamentals", tags=["fundamentals"])


@router.post("/dcf", response_model=DcfResponse)
async def run_dcf(payload: DcfRequest) -> DcfResponse:
    try:
        return compute_dcf(payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
