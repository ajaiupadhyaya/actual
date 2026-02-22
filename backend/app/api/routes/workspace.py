from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db_session
from app.core.security import get_current_subject
from app.models.db_models import User, WorkspaceLayout

router = APIRouter(prefix="/workspace", tags=["workspace"])


class SaveLayoutRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    layout: list[dict]


class LayoutResponse(BaseModel):
    name: str
    layout: list[dict]
    updated_at: datetime


@router.post("/layouts", response_model=LayoutResponse)
async def save_layout(
    payload: SaveLayoutRequest,
    email: str = Depends(get_current_subject),
    db: AsyncSession = Depends(get_db_session),
) -> LayoutResponse:
    user = await db.scalar(select(User).where(User.email == email))
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    existing = await db.scalar(
        select(WorkspaceLayout).where(WorkspaceLayout.user_id == user.id, WorkspaceLayout.name == payload.name)
    )
    now = datetime.now(UTC)
    if existing:
        existing.layout_json = payload.layout
        existing.updated_at = now
        layout = existing
    else:
        layout = WorkspaceLayout(
            user_id=user.id,
            name=payload.name,
            layout_json=payload.layout,
            created_at=now,
            updated_at=now,
        )
        db.add(layout)

    await db.commit()
    return LayoutResponse(name=layout.name, layout=layout.layout_json, updated_at=layout.updated_at)


@router.get("/layouts/{name}", response_model=LayoutResponse)
async def get_layout(
    name: str,
    email: str = Depends(get_current_subject),
    db: AsyncSession = Depends(get_db_session),
) -> LayoutResponse:
    user = await db.scalar(select(User).where(User.email == email))
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    layout = await db.scalar(select(WorkspaceLayout).where(WorkspaceLayout.user_id == user.id, WorkspaceLayout.name == name))
    if not layout:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Layout not found")

    return LayoutResponse(name=layout.name, layout=layout.layout_json, updated_at=layout.updated_at)
