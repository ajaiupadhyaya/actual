import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg p-8 text-white">
      <div className="mb-12">
        <h1 className="font-mono text-3xl text-primary">Quant Research Dashboard</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-300">
          MVP shell is available in the dashboard workspace with live data fetch and panel layout persistence.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/dashboard" className="inline-block rounded border border-grid px-4 py-2 text-sm text-secondary">
            Open Dashboard
          </Link>
          <Link href="/models" className="inline-block rounded border border-primary px-4 py-2 text-sm text-primary">
            Fundamental Models
          </Link>
          <Link href="/risk" className="inline-block rounded border border-secondary px-4 py-2 text-sm text-secondary">
            Portfolio & Risk
          </Link>
          <Link href="/backtest" className="inline-block rounded border border-grid px-4 py-2 text-sm text-slate-200">
            Backtesting Lab
          </Link>
          <Link href="/macro" className="inline-block rounded border border-secondary px-4 py-2 text-sm text-secondary">
            Macro Explorer
          </Link>
          <Link href="/research" className="inline-block rounded border border-primary px-4 py-2 text-sm text-primary">
            ML Research
          </Link>
          <Link href="/datastore" className="inline-block rounded border border-secondary px-4 py-2 text-sm text-secondary">
            DataStore Registry
          </Link>
        </div>
      </div>

      <hr className="my-8 border-slate-700" />

      <div>
        <h2 className="font-mono text-2xl text-amber-500 mb-3">Featured: The Leveraged Machine</h2>
        <p className="max-w-2xl text-sm text-slate-300 mb-4">
          A scrollytelling data journalism piece on private equity and the anatomy of LBOs. Publication-quality visualization of capital stacks, debt structures, and systemic risk.
        </p>
        <Link href="/journalism" className="inline-block rounded bg-amber-600 hover:bg-amber-700 px-6 py-3 text-sm font-semibold text-slate-950 transition-colors">
          Read The Leveraged Machine →
        </Link>
      </div>
    </main>
  );
}
