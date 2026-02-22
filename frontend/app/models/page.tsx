"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { runDcf, type DcfResponse } from "@/lib/api";

type StageInput = {
  years: string;
  growth_rate: string;
};

function parseNumberList(value: string): number[] {
  return value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item));
}

export default function ModelsPage() {
  const [ticker, setTicker] = useState("AAPL");
  const [baseFcf, setBaseFcf] = useState("120000000000");
  const [wacc, setWacc] = useState("0.09");
  const [terminalGrowth, setTerminalGrowth] = useState("0.03");
  const [netDebt, setNetDebt] = useState("95000000000");
  const [sharesOutstanding, setSharesOutstanding] = useState("15500000000");
  const [stages, setStages] = useState<StageInput[]>([
    { years: "3", growth_rate: "0.08" },
    { years: "3", growth_rate: "0.05" }
  ]);
  const [waccSensitivity, setWaccSensitivity] = useState("0.08,0.09,0.10,0.11");
  const [terminalSensitivity, setTerminalSensitivity] = useState("0.02,0.03,0.04");
  const [monteCarloRuns, setMonteCarloRuns] = useState("1200");
  const [waccStdDev, setWaccStdDev] = useState("0.01");
  const [terminalStdDev, setTerminalStdDev] = useState("0.005");
  const [growthStdDev, setGrowthStdDev] = useState("0.01");
  const [status, setStatus] = useState("Ready");
  const [result, setResult] = useState<DcfResponse | null>(null);

  const sensitivityGrid = useMemo(() => {
    if (!result) {
      return { waccAxis: [] as number[], terminalAxis: [] as number[], values: {} as Record<string, number> };
    }
    const waccAxis = Array.from(new Set<number>(result.sensitivity.map((item) => item.wacc))).sort((a: number, b: number) => a - b);
    const terminalAxis = Array.from(new Set<number>(result.sensitivity.map((item) => item.terminal_growth_rate))).sort((a: number, b: number) => a - b);
    const values = Object.fromEntries(
      result.sensitivity.map((item) => [`${item.wacc}-${item.terminal_growth_rate}`, item.intrinsic_value_per_share])
    );
    return { waccAxis, terminalAxis, values };
  }, [result]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setStatus("Running DCF...");
      const parsedStages = stages
        .map((stage) => ({ years: Number(stage.years), growth_rate: Number(stage.growth_rate) }))
        .filter((stage) => Number.isFinite(stage.years) && stage.years > 0 && Number.isFinite(stage.growth_rate));

      if (parsedStages.length === 0) {
        throw new Error("Provide at least one valid DCF stage.");
      }

      const response = await runDcf({
        ticker,
        base_fcf: Number(baseFcf),
        wacc: Number(wacc),
        terminal_growth_rate: Number(terminalGrowth),
        net_debt: Number(netDebt),
        shares_outstanding: Number(sharesOutstanding),
        stages: parsedStages,
        wacc_sensitivity: parseNumberList(waccSensitivity),
        terminal_growth_sensitivity: parseNumberList(terminalSensitivity),
        monte_carlo_runs: Number(monteCarloRuns),
        wacc_std_dev: Number(waccStdDev),
        terminal_growth_std_dev: Number(terminalStdDev),
        growth_std_dev: Number(growthStdDev)
      });
      setResult(response);
      setStatus("DCF complete");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "DCF failed");
    }
  };

  return (
    <main className="min-h-screen bg-bg p-6 text-white">
      <h1 className="font-mono text-2xl text-primary">Fundamental Models</h1>
      <p className="mt-2 text-sm text-slate-400">Configurable DCF with user-defined stage curves, sensitivity matrix, and Monte Carlo uncertainty bands.</p>

      <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 gap-3 rounded border border-grid bg-[#0F141B] p-4 md:grid-cols-3">
        <label className="text-xs text-slate-400">Ticker
          <input value={ticker} onChange={(event: ChangeEvent<HTMLInputElement>) => setTicker(event.target.value.toUpperCase())} className="mt-1 w-full rounded border border-grid bg-bg px-2 py-1 text-sm text-white" />
        </label>
        <label className="text-xs text-slate-400">Base FCF
          <input value={baseFcf} onChange={(event: ChangeEvent<HTMLInputElement>) => setBaseFcf(event.target.value)} className="mt-1 w-full rounded border border-grid bg-bg px-2 py-1 text-sm text-white" />
        </label>
        <label className="text-xs text-slate-400">WACC
          <input value={wacc} onChange={(event: ChangeEvent<HTMLInputElement>) => setWacc(event.target.value)} className="mt-1 w-full rounded border border-grid bg-bg px-2 py-1 text-sm text-white" />
        </label>
        <label className="text-xs text-slate-400">Terminal Growth
          <input value={terminalGrowth} onChange={(event: ChangeEvent<HTMLInputElement>) => setTerminalGrowth(event.target.value)} className="mt-1 w-full rounded border border-grid bg-bg px-2 py-1 text-sm text-white" />
        </label>
        <label className="text-xs text-slate-400">Net Debt
          <input value={netDebt} onChange={(event: ChangeEvent<HTMLInputElement>) => setNetDebt(event.target.value)} className="mt-1 w-full rounded border border-grid bg-bg px-2 py-1 text-sm text-white" />
        </label>
        <label className="text-xs text-slate-400">Shares Outstanding
          <input value={sharesOutstanding} onChange={(event: ChangeEvent<HTMLInputElement>) => setSharesOutstanding(event.target.value)} className="mt-1 w-full rounded border border-grid bg-bg px-2 py-1 text-sm text-white" />
        </label>
        <label className="text-xs text-slate-400">WACC Sensitivity (comma separated)
          <input value={waccSensitivity} onChange={(event: ChangeEvent<HTMLInputElement>) => setWaccSensitivity(event.target.value)} className="mt-1 w-full rounded border border-grid bg-bg px-2 py-1 text-sm text-white" />
        </label>
        <label className="text-xs text-slate-400">Terminal Growth Sensitivity (comma separated)
          <input value={terminalSensitivity} onChange={(event: ChangeEvent<HTMLInputElement>) => setTerminalSensitivity(event.target.value)} className="mt-1 w-full rounded border border-grid bg-bg px-2 py-1 text-sm text-white" />
        </label>
        <label className="text-xs text-slate-400">Monte Carlo Runs
          <input value={monteCarloRuns} onChange={(event: ChangeEvent<HTMLInputElement>) => setMonteCarloRuns(event.target.value)} className="mt-1 w-full rounded border border-grid bg-bg px-2 py-1 text-sm text-white" />
        </label>
        <label className="text-xs text-slate-400">WACC Std Dev
          <input value={waccStdDev} onChange={(event: ChangeEvent<HTMLInputElement>) => setWaccStdDev(event.target.value)} className="mt-1 w-full rounded border border-grid bg-bg px-2 py-1 text-sm text-white" />
        </label>
        <label className="text-xs text-slate-400">Terminal Growth Std Dev
          <input value={terminalStdDev} onChange={(event: ChangeEvent<HTMLInputElement>) => setTerminalStdDev(event.target.value)} className="mt-1 w-full rounded border border-grid bg-bg px-2 py-1 text-sm text-white" />
        </label>
        <label className="text-xs text-slate-400">Stage Growth Std Dev
          <input value={growthStdDev} onChange={(event: ChangeEvent<HTMLInputElement>) => setGrowthStdDev(event.target.value)} className="mt-1 w-full rounded border border-grid bg-bg px-2 py-1 text-sm text-white" />
        </label>
        <div className="md:col-span-3 rounded border border-grid p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs text-slate-400">Growth Stages</div>
            <button
              type="button"
              onClick={() => setStages((prev) => [...prev, { years: "2", growth_rate: "0.04" }])}
              className="rounded border border-grid px-2 py-1 text-xs text-slate-300"
            >
              Add Stage
            </button>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {stages.map((stage, idx) => (
              <div key={`stage-${idx}`} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <input
                  value={stage.years}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    const value = event.target.value;
                    setStages((prev) => prev.map((item, index) => (index === idx ? { ...item, years: value } : item)));
                  }}
                  placeholder="Years"
                  className="rounded border border-grid bg-bg px-2 py-1 text-sm text-white"
                />
                <input
                  value={stage.growth_rate}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    const value = event.target.value;
                    setStages((prev) => prev.map((item, index) => (index === idx ? { ...item, growth_rate: value } : item)));
                  }}
                  placeholder="Growth rate"
                  className="rounded border border-grid bg-bg px-2 py-1 text-sm text-white"
                />
                <button
                  type="button"
                  onClick={() => setStages((prev) => (prev.length > 1 ? prev.filter((_, index) => index !== idx) : prev))}
                  className="rounded border border-grid px-2 py-1 text-xs text-slate-300"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="md:col-span-3 flex items-center gap-3">
          <button type="submit" className="rounded border border-primary px-4 py-2 text-sm text-primary">Run DCF</button>
          <span className="font-mono text-xs text-slate-400">{status}</span>
        </div>
      </form>

      {result ? (
        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded border border-grid bg-[#0F141B] p-4">
            <div className="text-xs text-slate-400">Intrinsic Value / Share</div>
            <div className="mt-1 font-mono text-xl text-primary">${result.intrinsic_value_per_share.toFixed(2)}</div>
          </div>
          <div className="rounded border border-grid bg-[#0F141B] p-4">
            <div className="text-xs text-slate-400">Enterprise Value</div>
            <div className="mt-1 font-mono text-xl text-secondary">${result.enterprise_value.toFixed(0)}</div>
          </div>
          <div className="rounded border border-grid bg-[#0F141B] p-4">
            <div className="text-xs text-slate-400">Discounted Terminal Value</div>
            <div className="mt-1 font-mono text-xl text-slate-200">${result.discounted_terminal_value.toFixed(0)}</div>
          </div>
          <div className="rounded border border-grid bg-[#0F141B] p-4">
            <div className="text-xs text-slate-400">Intrinsic Value p5 / p50 / p95</div>
            <div className="mt-1 font-mono text-sm text-slate-200">
              ${result.uncertainty.intrinsic_value_p5.toFixed(2)} / ${result.uncertainty.intrinsic_value_p50.toFixed(2)} / ${result.uncertainty.intrinsic_value_p95.toFixed(2)}
            </div>
            <div className="mt-1 text-xs text-slate-400">{result.uncertainty.runs} Monte Carlo runs</div>
          </div>

          <div className="rounded border border-grid bg-[#0F141B] p-4 md:col-span-3 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={result.projected_cash_flows}>
                <CartesianGrid stroke="#1C2333" strokeDasharray="4 4" />
                <XAxis dataKey="year" stroke="#9BA7B4" />
                <YAxis stroke="#9BA7B4" />
                <Tooltip contentStyle={{ background: "#0D1117", border: "1px solid #1C2333" }} />
                <Line type="monotone" dataKey="projected_fcf" stroke="#00F5FF" dot={false} />
                <Line type="monotone" dataKey="present_value" stroke="#FFB800" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded border border-grid bg-[#0F141B] p-4 md:col-span-3">
            <h2 className="text-sm font-semibold text-secondary">Sensitivity Matrix (Intrinsic Value / Share)</h2>
            <div className="mt-3 overflow-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="border border-grid px-2 py-1 text-left">WACC \ Terminal g</th>
                    {sensitivityGrid.terminalAxis.map((terminal) => (
                      <th key={`terminal-${terminal}`} className="border border-grid px-2 py-1 text-left">{(terminal * 100).toFixed(2)}%</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sensitivityGrid.waccAxis.map((waccPoint) => (
                    <tr key={`wacc-${waccPoint}`}>
                      <td className="border border-grid px-2 py-1 font-semibold">{(waccPoint * 100).toFixed(2)}%</td>
                      {sensitivityGrid.terminalAxis.map((terminalPoint) => {
                        const key = `${waccPoint}-${terminalPoint}`;
                        const value = sensitivityGrid.values[key];
                        return (
                          <td key={`${key}-value`} className="border border-grid px-2 py-1">
                            {value ? `$${value.toFixed(2)}` : "-"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
