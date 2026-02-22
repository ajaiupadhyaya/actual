from fastapi import APIRouter, HTTPException

from app.engine.ml import train_baseline_model
from app.models.schemas import MlTrainRequest, MlTrainResponse

router = APIRouter(prefix="/ml", tags=["ml"])


@router.post("/train-baseline", response_model=MlTrainResponse)
async def train_baseline(payload: MlTrainRequest) -> MlTrainResponse:
    try:
        return train_baseline_model(payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
