import math

import numpy as np
import pandas as pd
import yfinance as yf

from app.models.schemas import MlPredictionPoint, MlTrainRequest, MlTrainResponse


def _build_lag_matrix(prices: pd.Series, lags: int) -> tuple[np.ndarray, np.ndarray, list[pd.Timestamp]]:
    returns = prices.pct_change().dropna()
    values = returns.to_numpy(dtype=float)

    features: list[list[float]] = []
    targets: list[float] = []
    timestamps: list[pd.Timestamp] = []

    for idx in range(lags, len(values)):
        features.append(values[idx - lags : idx].tolist())
        targets.append(float(values[idx]))
        timestamps.append(pd.Timestamp(returns.index[idx]))

    return np.array(features, dtype=float), np.array(targets, dtype=float), timestamps


def _fit_linear_regression(x: np.ndarray, y: np.ndarray) -> tuple[np.ndarray, float]:
    x_augmented = np.c_[np.ones((x.shape[0], 1)), x]
    beta = np.linalg.pinv(x_augmented.T @ x_augmented) @ x_augmented.T @ y
    intercept = float(beta[0])
    coefficients = beta[1:]
    return coefficients, intercept


def _predict(x: np.ndarray, coefficients: np.ndarray, intercept: float) -> np.ndarray:
    return x @ coefficients + intercept


def train_baseline_model(payload: MlTrainRequest) -> MlTrainResponse:
    frame = yf.download(payload.symbol, start=payload.start, end=payload.end, auto_adjust=False, progress=False)
    if frame.empty:
        raise ValueError("No market data available for requested range")

    close_series = frame["Close"].dropna()
    x, y, timestamps = _build_lag_matrix(close_series, payload.lags)

    if len(y) < 30:
        raise ValueError("Insufficient observations for training")

    split_idx = int(len(y) * payload.train_ratio)
    x_train, x_test = x[:split_idx], x[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]
    ts_test = timestamps[split_idx:]

    coefficients, intercept = _fit_linear_regression(x_train, y_train)
    predictions = _predict(x_test, coefficients, intercept)

    errors = y_test - predictions
    mse = float(np.mean(errors**2))
    rmse = float(math.sqrt(mse))
    mae = float(np.mean(np.abs(errors)))

    y_mean = float(np.mean(y_test)) if len(y_test) > 0 else 0.0
    ss_res = float(np.sum((y_test - predictions) ** 2))
    ss_tot = float(np.sum((y_test - y_mean) ** 2))
    r2 = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0.0

    prediction_points = [
        MlPredictionPoint(
            timestamp=ts.to_pydatetime(),
            actual=float(actual),
            predicted=float(pred),
        )
        for ts, actual, pred in zip(ts_test, y_test, predictions)
    ]

    return MlTrainResponse(
        symbol=payload.symbol.upper(),
        model_name="LinearLagModel",
        lags=payload.lags,
        train_size=len(y_train),
        test_size=len(y_test),
        mse=mse,
        rmse=rmse,
        mae=mae,
        r2=float(r2),
        coefficients=[float(value) for value in coefficients.tolist()],
        intercept=intercept,
        predictions=prediction_points,
    )
