const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export type DataPoint = {
  timestamp: string;
  value: number;
  metadata: Record<string, unknown>;
};

export type UnifiedSeriesResponse = {
  ticker_or_series_id: string;
  source: string;
  frequency: string;
  unit: string;
  last_updated: string;
  data: DataPoint[];
};

export type DataRegistryEntry = {
  ticker_or_series_id: string;
  source: string;
  frequency: string;
  unit: string;
  last_updated: string;
  latest_value: number | null;
  metadata: Record<string, unknown>;
};

export type DataRegistryListResponse = {
  total: number;
  items: DataRegistryEntry[];
};

export type FredSearchResponse = {
  total: number;
  items: Array<{
    series_id: string;
    title: string;
    frequency: string | null;
    units: string | null;
  }>;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
};

export type OhlcvBar = {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type IndicatorPoint = {
  timestamp: string;
  value: number;
};

export type IndicatorSeries = {
  name: string;
  points: IndicatorPoint[];
};

export type TechnicalAnalysisResponse = {
  ticker_or_series_id: string;
  source: string;
  frequency: string;
  last_updated: string;
  ohlcv: OhlcvBar[];
  indicators: IndicatorSeries[];
};

export type DcfStage = {
  years: number;
  growth_rate: number;
};

export type DcfRequest = {
  ticker: string;
  base_fcf: number;
  wacc: number;
  terminal_growth_rate: number;
  net_debt: number;
  shares_outstanding: number;
  stages: DcfStage[];
  wacc_sensitivity: number[];
  terminal_growth_sensitivity: number[];
  monte_carlo_runs: number;
  wacc_std_dev: number;
  terminal_growth_std_dev: number;
  growth_std_dev: number;
};

export type DcfProjectedCashFlow = {
  year: number;
  projected_fcf: number;
  discount_factor: number;
  present_value: number;
};

export type DcfResponse = {
  ticker: string;
  enterprise_value: number;
  equity_value: number;
  intrinsic_value_per_share: number;
  terminal_value: number;
  discounted_terminal_value: number;
  projected_cash_flows: DcfProjectedCashFlow[];
  sensitivity: Array<{
    wacc: number;
    terminal_growth_rate: number;
    intrinsic_value_per_share: number;
  }>;
  uncertainty: {
    runs: number;
    intrinsic_value_p5: number;
    intrinsic_value_p50: number;
    intrinsic_value_p95: number;
    enterprise_value_p5: number;
    enterprise_value_p50: number;
    enterprise_value_p95: number;
  };
};

export type MeanVarianceRequest = {
  symbols: string[];
  start: string;
  end: string;
  risk_free_rate: number;
  long_only: boolean;
  frontier_points: number;
};

export type MeanVarianceResponse = {
  symbols: string[];
  expected_annual_return: number;
  annual_volatility: number;
  sharpe_ratio: number;
  weights: Array<{ symbol: string; weight: number }>;
  efficient_frontier: Array<{
    expected_return: number;
    volatility: number;
    sharpe_ratio: number;
  }>;
};

export type RiskMetricsRequest = {
  symbols: string[];
  start: string;
  end: string;
  confidence_level: number;
  horizon_days: number;
  weights?: number[];
};

export type RiskMetricsResponse = {
  symbols: string[];
  confidence_level: number;
  horizon_days: number;
  historical_var: number;
  parametric_var: number;
  correlation_matrix: Array<{ row: string; col: string; value: number }>;
};

export type BacktestRequest = {
  symbol: string;
  start: string;
  end: string;
  initial_capital: number;
  trade_size: number;
  strategy: {
    name: string;
    fast_window: number;
    slow_window: number;
  };
};

export type BacktestResponse = {
  symbol: string;
  strategy: string;
  initial_capital: number;
  final_equity: number;
  tear_sheet: {
    total_return: number;
    annualized_return: number;
    annualized_volatility: number;
    sharpe_ratio: number;
    max_drawdown: number;
    calmar_ratio: number;
    win_rate: number;
    trade_count: number;
  };
  equity_curve: Array<{ timestamp: string; equity: number }>;
  trades: Array<{
    timestamp: string;
    side: string;
    quantity: number;
    price: number;
    pnl: number;
  }>;
};

export type MacroDashboardRequest = {
  start: string;
  end: string;
  series_ids?: string[];
};

export type MacroDashboardResponse = {
  start: string;
  end: string;
  series: Array<{
    series_id: string;
    label: string;
    source: string;
    points: Array<{
      timestamp: string;
      value: number;
      yoy_change: number | null;
      z_score: number | null;
      recession_flag: number;
    }>;
  }>;
  correlation_matrix: Array<{ row: string; col: string; value: number }>;
};

export type MlTrainRequest = {
  symbol: string;
  start: string;
  end: string;
  lags: number;
  train_ratio: number;
};

export type MlTrainResponse = {
  symbol: string;
  model_name: string;
  lags: number;
  train_size: number;
  test_size: number;
  mse: number;
  rmse: number;
  mae: number;
  r2: number;
  coefficients: number[];
  intercept: number;
  predictions: Array<{
    timestamp: string;
    actual: number;
    predicted: number;
  }>;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API ${response.status}: ${text}`);
  }

  return (await response.json()) as T;
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  return request<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export async function register(email: string, password: string): Promise<TokenResponse> {
  return request<TokenResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export async function fetchYahooSeries(symbol: string, start: string, end: string): Promise<UnifiedSeriesResponse> {
  const params = new URLSearchParams({ start, end });
  return request<UnifiedSeriesResponse>(`/data/yahoo/${symbol}?${params.toString()}`);
}

export async function fetchFredSeries(seriesId: string, start: string, end: string): Promise<UnifiedSeriesResponse> {
  const params = new URLSearchParams({ start, end });
  return request<UnifiedSeriesResponse>(`/data/fred/${seriesId}?${params.toString()}`);
}

export async function fetchAlphaVantageSeries(symbol: string): Promise<UnifiedSeriesResponse> {
  return request<UnifiedSeriesResponse>(`/data/alpha-vantage/${symbol}`);
}

export async function fetchRegistry(params?: {
  q?: string;
  source?: string;
  limit?: number;
  offset?: number;
}): Promise<DataRegistryListResponse> {
  const query = new URLSearchParams();
  if (params?.q) query.set("q", params.q);
  if (params?.source) query.set("source", params.source);
  if (typeof params?.limit === "number") query.set("limit", String(params.limit));
  if (typeof params?.offset === "number") query.set("offset", String(params.offset));
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return request<DataRegistryListResponse>(`/data/registry${suffix}`);
}

export async function searchFredSeries(q: string, limit = 20): Promise<FredSearchResponse> {
  const query = new URLSearchParams({ q, limit: String(limit) });
  return request<FredSearchResponse>(`/data/fred/search?${query.toString()}`);
}

export async function fetchTechnicalAnalysis(
  symbol: string,
  start: string,
  end: string,
  indicators: string[]
): Promise<TechnicalAnalysisResponse> {
  const params = new URLSearchParams({
    start,
    end,
    indicators: indicators.join(",")
  });
  return request<TechnicalAnalysisResponse>(`/analysis/technical/${symbol}?${params.toString()}`);
}

export async function runDcf(payload: DcfRequest): Promise<DcfResponse> {
  return request<DcfResponse>("/fundamentals/dcf", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function runMeanVariance(payload: MeanVarianceRequest): Promise<MeanVarianceResponse> {
  return request<MeanVarianceResponse>("/risk/mean-variance", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function runRiskMetrics(payload: RiskMetricsRequest): Promise<RiskMetricsResponse> {
  return request<RiskMetricsResponse>("/risk/metrics", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function runBacktest(payload: BacktestRequest): Promise<BacktestResponse> {
  return request<BacktestResponse>("/backtest/run", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function fetchMacroDashboard(payload: MacroDashboardRequest): Promise<MacroDashboardResponse> {
  return request<MacroDashboardResponse>("/macro/dashboard", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function trainMlBaseline(payload: MlTrainRequest): Promise<MlTrainResponse> {
  return request<MlTrainResponse>("/ml/train-baseline", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function saveLayout(name: string, layout: unknown[], token: string): Promise<void> {
  await request("/workspace/layouts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name, layout })
  });
}

export async function loadLayout(name: string, token: string): Promise<unknown[]> {
  const response = await request<{ name: string; layout: unknown[] }>(`/workspace/layouts/${name}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.layout;
}
