"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import {
  fetchAlphaVantageSeries,
  fetchFredSeries,
  fetchRegistry,
  fetchYahooSeries,
  searchFredSeries,
  type DataRegistryEntry,
  type DataRegistryListResponse,
  type FredSearchResponse,
  type UnifiedSeriesResponse
} from "@/lib/api";

type PreviewPoint = {
  timestamp: string;
  value: number;
};

function formatDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export default function DataStorePage() {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("ALL");
  const [status, setStatus] = useState("Ready");
  const [registry, setRegistry] = useState<DataRegistryListResponse | null>(null);
  const [selected, setSelected] = useState<DataRegistryEntry | null>(null);
  const [preview, setPreview] = useState<UnifiedSeriesResponse | null>(null);

  const [fredSearchText, setFredSearchText] = useState("industrial production");
  const [fredResults, setFredResults] = useState<FredSearchResponse | null>(null);

  const start = useMemo(() => formatDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 365 * 3)), []);
  const end = useMemo(() => formatDate(new Date()), []);

  const loadRegistry = async () => {
    setStatus("Loading registry...");
    try {
      const response = await fetchRegistry({
        q: query || undefined,
        source: source === "ALL" ? undefined : source,
        limit: 200,
        offset: 0
      });
      setRegistry(response);
      if (!selected && response.items.length > 0) {
        setSelected(response.items[0]);
      }
      setStatus(`Loaded ${response.items.length} registry series`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to load registry");
    }
  };

  useEffect(() => {
    void loadRegistry();
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!selected) {
        setPreview(null);
        return;
      }

      setStatus(`Loading preview for ${selected.ticker_or_series_id}...`);
      try {
        let response: UnifiedSeriesResponse;
        if (selected.source === "FRED") {
          response = await fetchFredSeries(selected.ticker_or_series_id, start, end);
        } else if (selected.source === "Yahoo Finance") {
          response = await fetchYahooSeries(selected.ticker_or_series_id, start, end);
        } else if (selected.source === "Alpha Vantage") {
          response = await fetchAlphaVantageSeries(selected.ticker_or_series_id);
        } else {
          throw new Error(`Unsupported source: ${selected.source}`);
        }
        setPreview(response);
        setStatus(`Preview loaded (${response.data.length} points)`);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Failed to load preview");
      }
    };

    void run();
  }, [selected, start, end]);

  const previewPoints: PreviewPoint[] = useMemo(
    () =>
      (preview?.data ?? []).map((item) => ({
        timestamp: item.timestamp,
        value: item.value
      })),
    [preview]
  );

  const handleFredSearch = async () => {
    try {
      setStatus("Searching FRED series...");
      const response = await searchFredSeries(fredSearchText, 25);
      setFredResults(response);
      setStatus(`Found ${response.items.length} FRED series`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "FRED search failed");
    }
  };

  return (
    <main className="min-h-screen bg-bg p-6 text-white">
      <h1 className="font-mono text-2xl text-primary">DataStore Registry</h1>
      <p className="mt-2 text-sm text-slate-400">Browse, search, and preview normalized data series across integrated sources.</p>

      <section className="mt-5 rounded border border-grid bg-[#0F141B] p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <label className="text-xs text-slate-400">Search
            <input
              value={query}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
              className="mt-1 w-full rounded border border-grid bg-bg px-2 py-1 text-sm text-white"
            />
          </label>
          <label className="text-xs text-slate-400">Source
            <select
              value={source}
              onChange={(event: ChangeEvent<HTMLSelectElement>) => setSource(event.target.value)}
              className="mt-1 w-full rounded border border-grid bg-bg px-2 py-1 text-sm text-white"
            >
              <option value="ALL">All Sources</option>
              <option value="FRED">FRED</option>
              <option value="Yahoo Finance">Yahoo Finance</option>
              <option value="Alpha Vantage">Alpha Vantage</option>
            </select>
          </label>
          <div className="flex items-end">
            <button type="button" onClick={loadRegistry} className="rounded border border-primary px-4 py-2 text-sm text-primary">Refresh Registry</button>
          </div>
          <div className="flex items-end font-mono text-xs text-slate-400">{status}</div>
        </div>
      </section>

      <section className="mt-4 rounded border border-grid bg-[#0F141B] p-4">
        <h2 className="text-sm font-semibold text-secondary">FRED Discovery</h2>
        <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
          <input
            value={fredSearchText}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setFredSearchText(event.target.value)}
            className="rounded border border-grid bg-bg px-2 py-1 text-sm text-white"
            placeholder="Search FRED catalog"
          />
          <button type="button" onClick={handleFredSearch} className="rounded border border-secondary px-4 py-2 text-sm text-secondary">Search FRED</button>
        </div>
        {fredResults ? (
          <div className="mt-3 max-h-56 overflow-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="border border-grid px-2 py-1 text-left">Series ID</th>
                  <th className="border border-grid px-2 py-1 text-left">Title</th>
                  <th className="border border-grid px-2 py-1 text-left">Frequency</th>
                  <th className="border border-grid px-2 py-1 text-left">Units</th>
                </tr>
              </thead>
              <tbody>
                {fredResults.items.map((item) => (
                  <tr key={item.series_id}>
                    <td className="border border-grid px-2 py-1 font-mono">{item.series_id}</td>
                    <td className="border border-grid px-2 py-1">{item.title}</td>
                    <td className="border border-grid px-2 py-1">{item.frequency ?? "-"}</td>
                    <td className="border border-grid px-2 py-1">{item.units ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded border border-grid bg-[#0F141B] p-4">
          <h2 className="text-sm font-semibold text-secondary">Registry Series</h2>
          <div className="mt-3 max-h-[420px] overflow-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="border border-grid px-2 py-1 text-left">ID</th>
                  <th className="border border-grid px-2 py-1 text-left">Source</th>
                  <th className="border border-grid px-2 py-1 text-left">Latest</th>
                </tr>
              </thead>
              <tbody>
                {(registry?.items ?? []).map((item) => (
                  <tr
                    key={`${item.source}-${item.ticker_or_series_id}`}
                    className={selected?.ticker_or_series_id === item.ticker_or_series_id && selected?.source === item.source ? "bg-[#131b24]" : ""}
                    onClick={() => setSelected(item)}
                  >
                    <td className="border border-grid px-2 py-1 cursor-pointer">{item.ticker_or_series_id}</td>
                    <td className="border border-grid px-2 py-1">{item.source}</td>
                    <td className="border border-grid px-2 py-1">{typeof item.latest_value === "number" ? item.latest_value.toFixed(4) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded border border-grid bg-[#0F141B] p-4">
          <h2 className="text-sm font-semibold text-secondary">Series Preview</h2>
          {preview ? (
            <>
              <div className="mt-2 text-xs text-slate-400">
                <span className="mr-4">{preview.ticker_or_series_id}</span>
                <span className="mr-4">{preview.source}</span>
                <span>{preview.frequency}</span>
              </div>
              <div className="mt-3 h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={previewPoints}>
                    <CartesianGrid stroke="#1C2333" strokeDasharray="4 4" />
                    <XAxis dataKey="timestamp" stroke="#9BA7B4" tickFormatter={(value: string) => value.slice(0, 10)} />
                    <YAxis stroke="#9BA7B4" />
                    <Tooltip contentStyle={{ background: "#0D1117", border: "1px solid #1C2333" }} />
                    <Line type="monotone" dataKey="value" stroke="#00F5FF" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="mt-3 text-sm text-slate-400">Select a registry row to preview.</div>
          )}
        </div>
      </section>
    </main>
  );
}
