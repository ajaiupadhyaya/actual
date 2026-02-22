"use client";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { useEffect, useMemo, useState } from "react";
import type { Layouts } from "react-grid-layout";
import type { ChangeEvent } from "react";

import { PriceChart } from "@/components/charts/price-chart";
import { WorkspaceGrid } from "@/components/panels/workspace-grid";
import {
  fetchTechnicalAnalysis,
  loadLayout,
  login,
  register,
  saveLayout,
  type IndicatorSeries,
  type OhlcvBar
} from "@/lib/api";
import { useAuthStore } from "@/store/auth";

const AVAILABLE_INDICATORS = ["SMA_20", "EMA_20", "RSI_14", "MACD", "BBANDS_20"];

const defaultLayouts: Layouts = {
  lg: [
    { i: "chart", x: 0, y: 0, w: 8, h: 12 },
    { i: "watchlist", x: 8, y: 0, w: 4, h: 6 },
    { i: "macro", x: 8, y: 6, w: 4, h: 6 }
  ],
  md: [
    { i: "chart", x: 0, y: 0, w: 7, h: 12 },
    { i: "watchlist", x: 7, y: 0, w: 3, h: 6 },
    { i: "macro", x: 7, y: 6, w: 3, h: 6 }
  ],
  sm: [
    { i: "chart", x: 0, y: 0, w: 6, h: 10 },
    { i: "watchlist", x: 0, y: 10, w: 6, h: 4 },
    { i: "macro", x: 0, y: 14, w: 6, h: 4 }
  ]
};

export default function DashboardPage() {
  const { token, setAuth } = useAuthStore();
  const [email, setEmail] = useState("researcher@example.com");
  const [password, setPassword] = useState("research-password-123");
  const [symbol, setSymbol] = useState("AAPL");
  const [layouts, setLayouts] = useState<Layouts>(defaultLayouts);
  const [indicators, setIndicators] = useState<string[]>(["SMA_20", "EMA_20"]);
  const [bars, setBars] = useState<OhlcvBar[]>([]);
  const [indicatorSeries, setIndicatorSeries] = useState<IndicatorSeries[]>([]);
  const [status, setStatus] = useState("Ready");

  const startDate = useMemo(() => new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString().slice(0, 10), []);
  const endDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    const run = async () => {
      try {
        setStatus("Loading price series...");
        const response = await fetchTechnicalAnalysis(symbol, startDate, endDate, indicators);
        setBars(response.ohlcv);
        setIndicatorSeries(response.indicators);
        setStatus(`Loaded ${response.ohlcv.length} rows from ${response.source} with ${response.indicators.length} overlays`);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Failed to load series");
      }
    };
    void run();
  }, [symbol, startDate, endDate, indicators]);

  const handleToggleIndicator = (indicator: string) => {
    setIndicators((current: string[]) =>
      current.includes(indicator)
        ? current.filter((item: string) => item !== indicator)
        : [...current, indicator]
    );
  };

  const handleBootstrapAuth = async () => {
    try {
      setStatus("Authenticating...");
      let auth;
      try {
        auth = await login(email, password);
      } catch {
        auth = await register(email, password);
      }
      setAuth(auth.access_token, email);
      setStatus("Authenticated");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Authentication failed");
    }
  };

  const handleSaveLayout = async () => {
    if (!token) {
      setStatus("Authenticate first");
      return;
    }
    await saveLayout("default", layouts.lg ?? [], token);
    setStatus("Layout saved");
  };

  const handleLoadLayout = async () => {
    if (!token) {
      setStatus("Authenticate first");
      return;
    }
    const loaded = await loadLayout("default", token);
    setLayouts((prev: Layouts) => ({ ...prev, lg: loaded as Layouts["lg"] }));
    setStatus("Layout loaded");
  };

  return (
    <main className="min-h-screen bg-bg p-4 text-white">
      <header className="mb-4 flex flex-wrap items-end gap-3 rounded border border-grid bg-[#0F141B] p-3">
        <div>
          <label className="block text-xs text-slate-400">Email</label>
          <input className="rounded border border-grid bg-bg px-2 py-1 text-sm" value={email} onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-slate-400">Password</label>
          <input className="rounded border border-grid bg-bg px-2 py-1 text-sm" type="password" value={password} onChange={(event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)} />
        </div>
        <button className="rounded border border-primary px-3 py-1 text-sm text-primary" onClick={handleBootstrapAuth}>Auth</button>

        <div>
          <label className="block text-xs text-slate-400">Symbol</label>
          <input className="rounded border border-grid bg-bg px-2 py-1 text-sm" value={symbol} onChange={(event: ChangeEvent<HTMLInputElement>) => setSymbol(event.target.value.toUpperCase())} />
        </div>

        <div>
          <label className="block text-xs text-slate-400">Indicators</label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_INDICATORS.map((indicator) => (
              <button
                key={indicator}
                type="button"
                onClick={() => handleToggleIndicator(indicator)}
                className={`rounded border px-2 py-1 text-xs ${
                  indicators.includes(indicator)
                    ? "border-primary text-primary"
                    : "border-grid text-slate-400"
                }`}
              >
                {indicator}
              </button>
            ))}
          </div>
        </div>

        <button className="rounded border border-secondary px-3 py-1 text-sm text-secondary" onClick={handleSaveLayout}>Save Layout</button>
        <button className="rounded border border-secondary px-3 py-1 text-sm text-secondary" onClick={handleLoadLayout}>Load Layout</button>
        <div className="ml-auto font-mono text-xs text-slate-400">{status}</div>
      </header>

      <div className="h-[78vh]">
        <WorkspaceGrid
          layouts={layouts}
          onLayoutChange={setLayouts}
          chart={<PriceChart bars={bars} indicators={indicatorSeries} />}
        />
      </div>
    </main>
  );
}
