"use client";

import { useMemo, type ReactNode } from "react";
import { Responsive, WidthProvider, type Layout, type Layouts } from "react-grid-layout";

const ResponsiveGridLayout = WidthProvider(Responsive);

type WorkspaceGridProps = {
  layouts: Layouts;
  onLayoutChange: (next: Layouts) => void;
  chart: ReactNode;
};

export function WorkspaceGrid({ layouts, onLayoutChange, chart }: WorkspaceGridProps) {
  const breakpoints = useMemo(() => ({ lg: 1200, md: 996, sm: 768 }), []);
  const cols = useMemo(() => ({ lg: 12, md: 10, sm: 6 }), []);

  return (
    <ResponsiveGridLayout
      className="layout"
      breakpoints={breakpoints}
      cols={cols}
      layouts={layouts}
      rowHeight={30}
      margin={[12, 12]}
      draggableHandle=".panel-header"
      onLayoutChange={(_currentLayout: Layout[], allLayouts: Layouts) => onLayoutChange(allLayouts)}
    >
      <section key="chart" className="panel overflow-hidden">
        <header className="panel-header flex h-10 items-center border-b border-grid px-3 text-xs font-semibold text-primary">
          Price Series
        </header>
        <div className="h-[calc(100%-2.5rem)] p-2">{chart}</div>
      </section>

      <section key="watchlist" className="panel">
        <header className="panel-header flex h-10 items-center border-b border-grid px-3 text-xs font-semibold text-secondary">
          Watchlist
        </header>
        <div className="p-3 font-mono text-xs text-slate-300">
          <div>AAPL</div>
          <div>MSFT</div>
          <div>NVDA</div>
          <div>SPY</div>
        </div>
      </section>

      <section key="macro" className="panel">
        <header className="panel-header flex h-10 items-center border-b border-grid px-3 text-xs font-semibold text-secondary">
          Macro Snapshot
        </header>
        <div className="space-y-2 p-3 font-mono text-xs text-slate-300">
          <div className="flex justify-between"><span>UST 10Y</span><span>4.12%</span></div>
          <div className="flex justify-between"><span>CPI YoY</span><span>3.1%</span></div>
          <div className="flex justify-between"><span>Unemployment</span><span>4.0%</span></div>
        </div>
      </section>
    </ResponsiveGridLayout>
  );
}
