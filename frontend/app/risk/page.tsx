"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";

import { runMeanVariance, runRiskMetrics, type MeanVarianceResponse, type RiskMetricsResponse } from "@/lib/api";

export default function RiskPage() {
  const [symbolsInput, setSymbolsInput] = useState("AAPL,MSFT,NVDA,SPY");
  const [riskFreeRate, setRiskFreeRate] = useState("0.04");
  const [confidenceLevel, setConfidenceLevel] = useState("0.95");
  const [horizonDays, setHorizonDays] = useState("1");
  const [frontierPoints, setFrontierPoints] = useState("800");
  const [longOnly, setLongOnly] = useState(true);
  const [status, setStatus] = useState("Ready");
  const [mvo, setMvo] = useState<MeanVarianceResponse | null>(null);
  const [risk, setRisk] = useState<RiskMetricsResponse | null>(null);

  const start = useMemo(() => new Date(Date.now() - 1000 * 60 * 60 * 24 * 365).toISOString().slice(0, 10), []);
  const end = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const symbols = symbolsInput
    .split(",")
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);

  const runAll = async () => {
    try {
      setStatus("Running optimization...");
      const meanVariance = await runMeanVariance({
        symbols,
        start,
        end,
        risk_free_rate: Number(riskFreeRate),
        long_only: longOnly,
        frontier_points: Number(frontierPoints)
      });
      setMvo(meanVariance);

      setStatus("Running VaR and correlation...");
      const riskMetrics = await runRiskMetrics({
        symbols,
        start,
        end,
        confidence_level: Number(confidenceLevel),
        horizon_days: Number(horizonDays),
        weights: meanVariance.weights.map((item) => item.weight)
      });
      setRisk(riskMetrics);
      setStatus("Risk analysis complete");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Risk analysis failed");
    }
  };

  const correlationRows = useMemo(() => {
    if (!risk) {
      return [];
    }
    return risk.symbols.map((rowSymbol) => {
      const row: Record<string, string | number> = { row: rowSymbol };
      for (const colSymbol of risk.symbols) {
        const match = risk.correlation_matrix.find((item) => item.row === rowSymbol && item.col === colSymbol);
        row[colSymbol] = match ? Number(match.value.toFixed(3)) : 0;
      }
      return row;
    });
  }, [risk]);

  return (
    <main className="min-h-screen bg-bg p-6 text-white">
      <h1 className="font-mono text-2xl text-primary">Portfolio & Risk</h1>
      <p className="mt-2 text-sm text-slate-400">Mean-variance optimization, VaR, and rolling correlation snapshot.</p>

      <section className="mt-5 rounded border border-grid bg-[#0F141B] p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="text-xs text-slate-400">Symbols (comma separated)
            <input
              value={symbolsInput}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setSymbolsInput(event.target.value)}
              className="mt-1 w-full rounded border border-grid bg-bg px-2 py-1 text-sm text-white"
            />
          </label>
          <label className="text-xs text-slate-400">Risk-free Rate
            <input
              value={riskFreeRate}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setRiskFreeRate(event.target.value)}
              className="mt-1 w-full rounded border border-grid bg-bg px-2 py-1 text-sm text-white"
            />
          </label>
          <label className="text-xs text-slate-400">Confidence Level
            <input
              value={confidenceLevel}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setConfidenceLevel(event.target.value)}
              className="mt-1 w-full rounded border border-grid bg-bg px-2 py-1 text-sm text-white"
            />
          </label>
          <label className="text-xs text-slate-400">VaR Horizon (days)
            <input
              value={horizonDays}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setHorizonDays(event.target.value)}
              className="mt-1 w-full rounded border border-grid bg-bg px-2 py-1 text-sm text-white"
            />
          </label>
          <label className="text-xs text-slate-400">Frontier Sample Size
            <input
              value={frontierPoints}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setFrontierPoints(event.target.value)}
              className="mt-1 w-full rounded border border-grid bg-bg px-2 py-1 text-sm text-white"
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-400">
            <input type="checkbox" checked={longOnly} onChange={(event: ChangeEvent<HTMLInputElement>) => setLongOnly(event.target.checked)} />
            Long-only optimization
          </label>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button type="button" onClick={runAll} className="rounded border border-secondary px-4 py-2 text-sm text-secondary">Run Risk Engine</button>
          <span className="font-mono text-xs text-slate-400">{status}</span>
        </div>
      </section>

      {mvo ? (
        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded border border-grid bg-[#0F141B] p-4">
            <div className="text-xs text-slate-400">Expected Annual Return</div>
            <div className="mt-1 font-mono text-xl text-primary">{(mvo.expected_annual_return * 100).toFixed(2)}%</div>
          </div>
          <div className="rounded border border-grid bg-[#0F141B] p-4">
            <div className="text-xs text-slate-400">Annual Volatility</div>
            <div className="mt-1 font-mono text-xl text-secondary">{(mvo.annual_volatility * 100).toFixed(2)}%</div>
          </div>
          <div className="rounded border border-grid bg-[#0F141B] p-4">
            <div className="text-xs text-slate-400">Sharpe Ratio</div>
            <div className="mt-1 font-mono text-xl text-slate-200">{mvo.sharpe_ratio.toFixed(2)}</div>
          </div>

          <div className="h-[300px] rounded border border-grid bg-[#0F141B] p-4 md:col-span-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mvo.weights}>
                <CartesianGrid stroke="#1C2333" strokeDasharray="4 4" />
                <XAxis dataKey="symbol" stroke="#9BA7B4" />
                <YAxis stroke="#9BA7B4" />
                <Tooltip contentStyle={{ background: "#0D1117", border: "1px solid #1C2333" }} formatter={(value: number) => `${(value * 100).toFixed(2)}%`} />
                <Bar dataKey="weight" fill="#00F5FF" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="h-[320px] rounded border border-grid bg-[#0F141B] p-4 md:col-span-3">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid stroke="#1C2333" strokeDasharray="4 4" />
                <XAxis
                  type="number"
                  dataKey="volatility"
                  stroke="#9BA7B4"
                  tickFormatter={(value) => `${(value * 100).toFixed(1)}%`}
                  name="Volatility"
                />
                <YAxis
                  type="number"
                  dataKey="expected_return"
                  stroke="#9BA7B4"
                  tickFormatter={(value) => `${(value * 100).toFixed(1)}%`}
                  name="Return"
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{ background: "#0D1117", border: "1px solid #1C2333" }}
                  formatter={(value: number, key) => {
                    if (key === "sharpe_ratio") {
                      return value.toFixed(2);
                    }
                    return `${(value * 100).toFixed(2)}%`;
                  }}
                />
                <Scatter data={mvo.efficient_frontier} fill="#00F5FF" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </section>
      ) : null}

      {risk ? (
        <section className="mt-6 rounded border border-grid bg-[#0F141B] p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="font-mono text-sm">Historical VaR ({(risk.confidence_level * 100).toFixed(1)}%): {(risk.historical_var * 100).toFixed(2)}%</div>
            <div className="font-mono text-sm">Parametric VaR ({(risk.confidence_level * 100).toFixed(1)}%): {(risk.parametric_var * 100).toFixed(2)}%</div>
          </div>

          <div className="mt-4 overflow-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="border border-grid px-2 py-1 text-left">Symbol</th>
                  {risk.symbols.map((symbol) => (
                    <th key={symbol} className="border border-grid px-2 py-1 text-left">{symbol}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {correlationRows.map((row) => (
                  <tr key={String(row.row)}>
                    <td className="border border-grid px-2 py-1 font-semibold">{row.row}</td>
                    {risk.symbols.map((symbol) => (
                      <td key={`${row.row}-${symbol}`} className="border border-grid px-2 py-1">
                        {String(row[symbol])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </main>
  );
}
