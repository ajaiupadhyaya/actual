import numpy as np

from app.models.schemas import (
    DcfProjectedCashFlow,
    DcfRequest,
    DcfResponse,
    DcfSensitivityPoint,
    DcfUncertaintySummary,
)


def _compute_dcf_values(payload: DcfRequest, wacc: float, terminal_growth_rate: float, stage_growth_rates: list[float]) -> tuple[float, float, float, float, list[DcfProjectedCashFlow]]:
    if terminal_growth_rate >= wacc:
        raise ValueError("terminal_growth_rate must be less than wacc")

    projected_cash_flows: list[DcfProjectedCashFlow] = []
    current_fcf = payload.base_fcf
    year_counter = 0

    for stage, stage_growth in zip(payload.stages, stage_growth_rates):
        for _ in range(stage.years):
            year_counter += 1
            current_fcf = current_fcf * (1 + stage_growth)
            discount_factor = (1 + wacc) ** year_counter
            present_value = current_fcf / discount_factor
            projected_cash_flows.append(
                DcfProjectedCashFlow(
                    year=year_counter,
                    projected_fcf=current_fcf,
                    discount_factor=discount_factor,
                    present_value=present_value,
                )
            )

    terminal_value = current_fcf * (1 + terminal_growth_rate) / (wacc - terminal_growth_rate)
    discounted_terminal_value = terminal_value / ((1 + wacc) ** year_counter)
    enterprise_value = sum(item.present_value for item in projected_cash_flows) + discounted_terminal_value
    equity_value = enterprise_value - payload.net_debt
    intrinsic_value_per_share = equity_value / payload.shares_outstanding

    return enterprise_value, equity_value, intrinsic_value_per_share, discounted_terminal_value, projected_cash_flows


def compute_dcf(payload: DcfRequest) -> DcfResponse:
    base_stage_growth = [stage.growth_rate for stage in payload.stages]
    enterprise_value, equity_value, intrinsic_value_per_share, discounted_terminal_value, projected_cash_flows = _compute_dcf_values(
        payload=payload,
        wacc=payload.wacc,
        terminal_growth_rate=payload.terminal_growth_rate,
        stage_growth_rates=base_stage_growth,
    )

    final_fcf = projected_cash_flows[-1].projected_fcf if projected_cash_flows else payload.base_fcf
    terminal_value = final_fcf * (1 + payload.terminal_growth_rate) / (payload.wacc - payload.terminal_growth_rate)

    wacc_grid = payload.wacc_sensitivity or [payload.wacc]
    terminal_growth_grid = payload.terminal_growth_sensitivity or [payload.terminal_growth_rate]
    sensitivity: list[DcfSensitivityPoint] = []
    for wacc_candidate in sorted(set(wacc_grid)):
        if wacc_candidate <= 0 or wacc_candidate >= 1:
            continue
        for terminal_growth_candidate in sorted(set(terminal_growth_grid)):
            if terminal_growth_candidate < 0 or terminal_growth_candidate >= 1 or terminal_growth_candidate >= wacc_candidate:
                continue
            _, _, intrinsic_value_candidate, _, _ = _compute_dcf_values(
                payload=payload,
                wacc=wacc_candidate,
                terminal_growth_rate=terminal_growth_candidate,
                stage_growth_rates=base_stage_growth,
            )
            sensitivity.append(
                DcfSensitivityPoint(
                    wacc=wacc_candidate,
                    terminal_growth_rate=terminal_growth_candidate,
                    intrinsic_value_per_share=intrinsic_value_candidate,
                )
            )

    rng = np.random.default_rng(seed=42)
    intrinsic_values: list[float] = []
    enterprise_values: list[float] = []
    for _ in range(payload.monte_carlo_runs):
        sampled_wacc = float(rng.normal(payload.wacc, payload.wacc_std_dev))
        sampled_wacc = float(np.clip(sampled_wacc, 0.005, 0.99))

        sampled_terminal_growth = float(rng.normal(payload.terminal_growth_rate, payload.terminal_growth_std_dev))
        sampled_terminal_growth = float(np.clip(sampled_terminal_growth, 0.0, sampled_wacc - 0.001))

        sampled_stage_growth = [
            float(np.clip(rng.normal(growth, payload.growth_std_dev), -0.95, 1.5)) for growth in base_stage_growth
        ]

        mc_enterprise_value, _, mc_intrinsic_value_per_share, _, _ = _compute_dcf_values(
            payload=payload,
            wacc=sampled_wacc,
            terminal_growth_rate=sampled_terminal_growth,
            stage_growth_rates=sampled_stage_growth,
        )
        intrinsic_values.append(mc_intrinsic_value_per_share)
        enterprise_values.append(mc_enterprise_value)

    uncertainty = DcfUncertaintySummary(
        runs=payload.monte_carlo_runs,
        intrinsic_value_p5=float(np.percentile(intrinsic_values, 5)),
        intrinsic_value_p50=float(np.percentile(intrinsic_values, 50)),
        intrinsic_value_p95=float(np.percentile(intrinsic_values, 95)),
        enterprise_value_p5=float(np.percentile(enterprise_values, 5)),
        enterprise_value_p50=float(np.percentile(enterprise_values, 50)),
        enterprise_value_p95=float(np.percentile(enterprise_values, 95)),
    )

    return DcfResponse(
        ticker=payload.ticker.upper(),
        enterprise_value=enterprise_value,
        equity_value=equity_value,
        intrinsic_value_per_share=intrinsic_value_per_share,
        terminal_value=terminal_value,
        discounted_terminal_value=discounted_terminal_value,
        projected_cash_flows=projected_cash_flows,
        sensitivity=sensitivity,
        uncertainty=uncertainty,
    )
