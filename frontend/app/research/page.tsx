"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { trainMlBaseline, type MlTrainResponse } from "@/lib/api";

export default function ResearchPage() {
  const [symbol, setSymbol] = useState("AAPL");
  const [lags, setLags] = useState("5");
  const [status, setStatus] = useState("Ready");
  const [result, setResult] = useState<MlTrainResponse | null>(null);

  const start = useMemo(() => new Date(Date.now() - 1000 * 60 * 60 * 24 * 365 * 5).toISOString().slice(0, 10), []);
  const end = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const handleTrain = async () => {
    try {
      setStatus("Training baseline model...");
      const response = await trainMlBaseline({
        symbol,
        start,
        end,
        lags: Number(lags),
        train_ratio: 0.8
      });
      setResult(response);
      setStatus("Training complete");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Training failed");
    }
  };

  return (
    <main className="min-h-screen bg-bg p-6 text-white">
      <h1 className="font-mono text-2xl text-primary">ML Research</h1>
      <p className="mt-2 text-sm text-slate-400">Baseline return-forecast model with lagged features and out-of-sample diagnostics.</p>

      <section className="mt-5 rounded border border-grid bg-[#0F141B] p-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs text-slate-400">Symbol
            <input
              value={symbol}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setSymbol(event.target.value.toUpperCase())}
              className="mt-1 w-32 rounded border border-grid bg-bg px-2 py-1 text-sm text-white"
            />
          </label>
          <label className="text-xs text-slate-400">Lags
            <input
              value={lags}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setLags(event.target.value)}
              className="mt-1 w-24 rounded border border-grid bg-bg px-2 py-1 text-sm text-white"
            />
          </label>
          <button type="button" onClick={handleTrain} className="rounded border border-primary px-4 py-2 text-sm text-primary">
            Train Model
          </button>
          <span className="font-mono text-xs text-slate-400">{status}</span>
        </div>
      </section>

      {result ? (
        <>
          <section className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded border border-grid bg-[#0F141B] p-4">
              <div className="text-xs text-slate-400">RMSE</div>
              <div className="mt-1 font-mono text-xl text-primary">{result.rmse.toFixed(6)}</div>
            </div>
            <div className="rounded border border-grid bg-[#0F141B] p-4">
              <div className="text-xs text-slate-400">MAE</div>
              <div className="mt-1 font-mono text-xl text-secondary">{result.mae.toFixed(6)}</div>
            </div>
            <div className="rounded border border-grid bg-[#0F141B] p-4">
              <div className="text-xs text-slate-400">R²</div>
              <div className="mt-1 font-mono text-xl text-slate-200">{result.r2.toFixed(4)}</div>
            </div>
            <div className="rounded border border-grid bg-[#0F141B] p-4">
              <div className="text-xs text-slate-400">Test Samples</div>
              <div className="mt-1 font-mono text-xl text-slate-200">{result.test_size}</div>
            </div>
          </section>

          <section className="mt-6 h-[340px] rounded border border-grid bg-[#0F141B] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={result.predictions}>
                <CartesianGrid stroke="#1C2333" strokeDasharray="4 4" />
                <XAxis dataKey="timestamp" stroke="#9BA7B4" tickFormatter={(value: string) => value.slice(0, 10)} />
                <YAxis stroke="#9BA7B4" />
                <Tooltip contentStyle={{ background: "#0D1117", border: "1px solid #1C2333" }} />
                <Line type="monotone" dataKey="actual" stroke="#00F5FF" dot={false} />
                <Line type="monotone" dataKey="predicted" stroke="#FFB800" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </section>
        </>
      ) : null}
    </main>
  );
}
