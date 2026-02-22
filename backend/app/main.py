from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.api.routes import analysis, auth, backtest, data, fundamentals, health, macro, ml, risk, workspace
from app.core.cache import redis_client
from app.core.config import settings
from app.core.db import Base, engine


@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.info("Starting API service")
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    yield
    await redis_client.aclose()
    await engine.dispose()
    logger.info("API service stopped")


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(data.router)
app.include_router(workspace.router)
app.include_router(analysis.router)
app.include_router(fundamentals.router)
app.include_router(risk.router)
app.include_router(backtest.router)
app.include_router(macro.router)
app.include_router(ml.router)
