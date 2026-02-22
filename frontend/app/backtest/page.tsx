"use client";

import { useState, type ChangeEvent } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { runBacktest, type BacktestResponse } from "@/lib/api";

export default function BacktestPage() {
  const [symbol, setSymbol] = useState("AAPL");
  const [start, setStart] = useState(() => new Date(Date.now() - 1000 * 60 * 60 * 24 * 365 * 2).toISOString().slice(0, 10));
  const [end, setEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const [fastWindow, setFastWindow] = useState("20");
  const [slowWindow, setSlowWindow] = useState("50");
  const [initialCapital, setInitialCapital] = useState("100000");
  const [tradeSize, setTradeSize] = useState("100");
  const [status, setStatus] = useState("Ready");
  const [result, setResult] = useState<BacktestResponse | null>(null);

  const handleRun = async () => {
    try {
      setStatus("Running backtest...");
      const response = await runBacktest({
        symbol,
        start,
        end,
        initial_capital: Number(initialCapital),
        trade_size: Number(tradeSize),
        strategy: {
          name: "sma_crossover",
          fast_window: Number(fastWindow),
          slow_window: Number(slowWindow)
        }
      });
      setResult(response);
      setStatus("Backtest complete");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Backtest failed");
    }
  };

  return (
    <main className="min-h-screen bg-bg p-6 text-white">
      <h1 className="font-mono text-2xl text-primary">Backtesting Lab</h1>
      <p className="mt-2 text-sm text-slate-400">Event-driven SMA crossover backtest with tear-sheet and trade log.</p>

      <section className="mt-5 rounded border border-grid bg-[#0F141B] p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
          <label className="text-xs text-slate-400">Symbol
            <input value={symbol} onChange={(event: ChangeEvent<HTMLInputElement>) => setSymbol(event.target.value.toUpperCase())} className="mt-1 w-full rounded border border-grid bg-bg px-2 py-1 text-sm text-white" />
          </label>
          <label className="text-xs text-slate-400">Start
            <input value={start} onChange={(event: ChangeEvent<HTMLInputElement>) => setStart(event.target.value)} className="mt-1 w-full rounded border border-grid bg-bg px-2 py-1 text-sm text-white" />
          </label>
          <label className="text-xs text-slate-400">End
            <input value={end} onChange={(event: ChangeEvent<HTMLInputElement>) => setEnd(event.target.value)} className="mt-1 w-full rounded border border-grid bg-bg px-2 py-1 text-sm text-white" />
          </label>
          <label className="text-xs text-slate-400">Fast Window
            <input value={fastWindow} onChange={(event: ChangeEvent<HTMLInputElement>) => setFastWindow(event.target.value)} className="mt-1 w-full rounded border border-grid bg-bg px-2 py-1 text-sm text-white" />
          </label>
          <label className="text-xs text-slate-400">Slow Window
            <input value={slowWindow} onChange={(event: ChangeEvent<HTMLInputElement>) => setSlowWindow(event.target.value)} className="mt-1 w-full rounded border border-grid bg-bg px-2 py-1 text-sm text-white" />
          </label>
          <label className="text-xs text-slate-400">Initial Capital
            <input value={initialCapital} onChange={(event: ChangeEvent<HTMLInputElement>) => setInitialCapital(event.target.value)} className="mt-1 w-full rounded border border-grid bg-bg px-2 py-1 text-sm text-white" />
          </label>
          <label className="text-xs text-slate-400">Trade Size
            <input value={tradeSize} onChange={(event: ChangeEvent<HTMLInputElement>) => setTradeSize(event.target.value)} className="mt-1 w-full rounded border border-grid bg-bg px-2 py-1 text-sm text-white" />
          </label>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button type="button" onClick={handleRun} className="rounded border border-primary px-4 py-2 text-sm text-primary">Run Backtest</button>
          <span className="font-mono text-xs text-slate-400">{status}</span>
        </div>
      </section>

      {result ? (
        <>
          <section className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded border border-grid bg-[#0F141B] p-4">
              <div className="text-xs text-slate-400">Total Return</div>
              <div className="mt-1 font-mono text-xl text-primary">{(result.tear_sheet.total_return * 100).toFixed(2)}%</div>
            </div>
            <div className="rounded border border-grid bg-[#0F141B] p-4">
              <div className="text-xs text-slate-400">Annualized Return</div>
              <div className="mt-1 font-mono text-xl text-secondary">{(result.tear_sheet.annualized_return * 100).toFixed(2)}%</div>
            </div>
            <div className="rounded border border-grid bg-[#0F141B] p-4">
              <div className="text-xs text-slate-400">Sharpe Ratio</div>
              <div className="mt-1 font-mono text-xl text-slate-200">{result.tear_sheet.sharpe_ratio.toFixed(2)}</div>
            </div>
            <div className="rounded border border-grid bg-[#0F141B] p-4">
              <div className="text-xs text-slate-400">Max Drawdown</div>
              <div className="mt-1 font-mono text-xl text-slate-200">{(result.tear_sheet.max_drawdown * 100).toFixed(2)}%</div>
            </div>
          </section>

          <section className="mt-6 h-[340px] rounded border border-grid bg-[#0F141B] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={result.equity_curve}>
                <CartesianGrid stroke="#1C2333" strokeDasharray="4 4" />
                <XAxis dataKey="timestamp" stroke="#9BA7B4" tickFormatter={(value: string) => value.slice(0, 10)} />
                <YAxis stroke="#9BA7B4" />
                <Tooltip contentStyle={{ background: "#0D1117", border: "1px solid #1C2333" }} />
                <Line type="monotone" dataKey="equity" stroke="#00F5FF" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </section>

          <section className="mt-6 rounded border border-grid bg-[#0F141B] p-4">
            <h2 className="text-sm font-semibold text-secondary">Trade Log</h2>
            <div className="mt-3 max-h-[280px] overflow-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="border border-grid px-2 py-1 text-left">Time</th>
                    <th className="border border-grid px-2 py-1 text-left">Side</th>
                    <th className="border border-grid px-2 py-1 text-left">Qty</th>
                    <th className="border border-grid px-2 py-1 text-left">Price</th>
                    <th className="border border-grid px-2 py-1 text-left">PnL</th>
                  </tr>
                </thead>
                <tbody>
                  {result.trades.map((trade, idx) => (
                    <tr key={`${trade.timestamp}-${idx}`}>
                      <td className="border border-grid px-2 py-1">{trade.timestamp.slice(0, 10)}</td>
                      <td className="border border-grid px-2 py-1">{trade.side}</td>
                      <td className="border border-grid px-2 py-1">{trade.quantity}</td>
                      <td className="border border-grid px-2 py-1">{trade.price.toFixed(2)}</td>
                      <td className="border border-grid px-2 py-1">{trade.pnl.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}
