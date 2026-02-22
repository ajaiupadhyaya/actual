"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { CartesianGrid, Line, LineChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { fetchMacroDashboard, type MacroDashboardResponse } from "@/lib/api";

type MacroSeriesView = MacroDashboardResponse["series"][number];
type MacroPointView = MacroSeriesView["points"][number];

const AVAILABLE_SERIES = ["GDP", "CPIAUCSL", "UNRATE", "FEDFUNDS", "INDPRO"];

export default function MacroPage() {
  const [seriesIds, setSeriesIds] = useState<string[]>([...AVAILABLE_SERIES]);
  const [focusSeries, setFocusSeries] = useState("GDP");
  const [status, setStatus] = useState("Ready");
  const [result, setResult] = useState<MacroDashboardResponse | null>(null);

  const start = useMemo(() => new Date(Date.now() - 1000 * 60 * 60 * 24 * 365 * 12).toISOString().slice(0, 10), []);
  const end = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    const run = async () => {
      try {
        setStatus("Loading macro dashboard...");
        const response = await fetchMacroDashboard({ start, end, series_ids: seriesIds });
        setResult(response);
        if (!seriesIds.includes(focusSeries) && response.series.length > 0) {
          setFocusSeries(response.series[0].series_id);
        }
        setStatus(`Loaded ${response.series.length} macro series`);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Macro load failed");
      }
    };
    void run();
  }, [start, end, seriesIds, focusSeries]);

  const currentSeries = result?.series.find((item: MacroSeriesView) => item.series_id === focusSeries) ?? null;

  const chartData = useMemo(() => {
    if (!currentSeries) {
      return [];
    }
    return currentSeries.points.map((point: MacroPointView) => ({
      timestamp: point.timestamp,
      value: point.value,
      recession_flag: point.recession_flag
    }));
  }, [currentSeries]);

  const latestPoint = currentSeries?.points[currentSeries.points.length - 1] ?? null;

  const toggleSeries = (series: string) => {
    setSeriesIds((current: string[]) =>
      current.includes(series) ? current.filter((item: string) => item !== series) : [...current, series]
    );
  };

  const recessionRanges = useMemo(() => {
    const ranges: Array<{ start: string; end: string }> = [];
    if (chartData.length === 0) {
      return ranges;
    }
    let activeStart: string | null = null;
    for (let idx = 0; idx < chartData.length; idx++) {
      const row = chartData[idx];
      if (row.recession_flag === 1 && activeStart === null) {
        activeStart = row.timestamp;
      }
      if (row.recession_flag === 0 && activeStart !== null) {
        ranges.push({ start: activeStart, end: row.timestamp });
        activeStart = null;
      }
    }
    if (activeStart) {
      ranges.push({ start: activeStart, end: chartData[chartData.length - 1].timestamp });
    }
    return ranges;
  }, [chartData]);

  return (
    <main className="min-h-screen bg-bg p-6 text-white">
      <h1 className="font-mono text-2xl text-primary">Macro Explorer</h1>
      <p className="mt-2 text-sm text-slate-400">FRED macro dashboard with YoY, Z-score, recession overlays, and correlations.</p>

      <section className="mt-5 rounded border border-grid bg-[#0F141B] p-4">
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_SERIES.map((series) => (
            <button
              key={series}
              type="button"
              onClick={() => toggleSeries(series)}
              className={`rounded border px-2 py-1 text-xs ${
                seriesIds.includes(series) ? "border-primary text-primary" : "border-grid text-slate-400"
              }`}
            >
              {series}
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-3">
          <label className="text-xs text-slate-400">Focus Series
            <select
              value={focusSeries}
              onChange={(event: ChangeEvent<HTMLSelectElement>) => setFocusSeries(event.target.value)}
              className="ml-2 rounded border border-grid bg-bg px-2 py-1 text-xs text-white"
            >
              {(result?.series ?? []).map((series: MacroSeriesView) => (
                <option key={series.series_id} value={series.series_id}>{series.series_id}</option>
              ))}
            </select>
          </label>
          <span className="font-mono text-xs text-slate-400">{status}</span>
        </div>
      </section>

      {currentSeries ? (
        <>
          <section className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded border border-grid bg-[#0F141B] p-4">
              <div className="text-xs text-slate-400">Latest Value</div>
              <div className="mt-1 font-mono text-xl text-primary">{latestPoint?.value.toFixed(2) ?? "-"}</div>
            </div>
            <div className="rounded border border-grid bg-[#0F141B] p-4">
              <div className="text-xs text-slate-400">YoY Change</div>
              <div className="mt-1 font-mono text-xl text-secondary">{latestPoint?.yoy_change?.toFixed(2) ?? "-"}%</div>
            </div>
            <div className="rounded border border-grid bg-[#0F141B] p-4">
              <div className="text-xs text-slate-400">Z-Score</div>
              <div className="mt-1 font-mono text-xl text-slate-200">{latestPoint?.z_score?.toFixed(2) ?? "-"}</div>
            </div>
          </section>

          <section className="mt-6 h-[340px] rounded border border-grid bg-[#0F141B] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid stroke="#1C2333" strokeDasharray="4 4" />
                <XAxis dataKey="timestamp" stroke="#9BA7B4" tickFormatter={(value: string) => value.slice(0, 10)} />
                <YAxis stroke="#9BA7B4" />
                <Tooltip contentStyle={{ background: "#0D1117", border: "1px solid #1C2333" }} />
                {recessionRanges.map((range, idx) => (
                  <ReferenceArea key={`${range.start}-${idx}`} x1={range.start} x2={range.end} fill="#1C2333" fillOpacity={0.35} />
                ))}
                <Line type="monotone" dataKey="value" stroke="#00F5FF" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </section>
        </>
      ) : null}

      {result ? (
        <section className="mt-6 rounded border border-grid bg-[#0F141B] p-4">
          <h2 className="text-sm font-semibold text-secondary">Correlation Matrix</h2>
          <div className="mt-3 overflow-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="border border-grid px-2 py-1 text-left">Series</th>
                  {result.series.map((series: MacroSeriesView) => (
                    <th key={series.series_id} className="border border-grid px-2 py-1 text-left">{series.series_id}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.series.map((rowSeries: MacroSeriesView) => (
                  <tr key={rowSeries.series_id}>
                    <td className="border border-grid px-2 py-1 font-semibold">{rowSeries.series_id}</td>
                    {result.series.map((colSeries: MacroSeriesView) => {
                      const match = result.correlation_matrix.find((item) => item.row === rowSeries.series_id && item.col === colSeries.series_id);
                      return (
                        <td key={`${rowSeries.series_id}-${colSeries.series_id}`} className="border border-grid px-2 py-1">
                          {match ? match.value.toFixed(3) : "-"}
                        </td>
                      );
                    })}
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
