from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(Text())
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    layouts: Mapped[list["WorkspaceLayout"]] = relationship(back_populates="user")


class WorkspaceLayout(Base):
    __tablename__ = "workspace_layouts"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(100), index=True)
    layout_json: Mapped[dict] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    user: Mapped[User] = relationship(back_populates="layouts")


class DataRegistryEntry(Base):
    __tablename__ = "data_registry_entries"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    ticker_or_series_id: Mapped[str] = mapped_column(String(120), index=True)
    source: Mapped[str] = mapped_column(String(80), index=True)
    frequency: Mapped[str] = mapped_column(String(40), index=True)
    unit: Mapped[str] = mapped_column(String(40))
    last_updated: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    latest_value: Mapped[float | None]
    metadata_json: Mapped[dict] = mapped_column(JSONB, default=dict)
