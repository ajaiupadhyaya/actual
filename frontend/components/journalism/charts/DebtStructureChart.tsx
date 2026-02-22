/**
 * DebtStructureChart - Capital stack visualization
 * 
 * Shows the layered debt structure of a typical LBO with:
 * - Ranking by seniority (top = most senior)
 * - Size by tranche amount
 * - Color by risk level
 * - Hover details (rates, terms, holders)
 */

'use client';

import { useEffect, useRef, useState } from 'react';

interface Tranche {
  rank: number;
  name: string;
  tranche_type: string;
  size_pct: number;
  size_representative: string;
  typical_spread_bps?: number;
  all_in_rate: string;
  maturity_years: number;
  covenant_structure: string;
  seniority: string;
  recovery_in_default: number;
  typical_holders: string;
  color: string;
  icon: string;
}

interface DebtStructureData {
  metadata: Record<string, any>;
  tranches: Tranche[];
}

interface DebtStructureChartProps {
  data: DebtStructureData;
  totalDebtAmount?: number;
  highlightedTrancheRank?: number | null;
}

export const DebtStructureChart: React.FC<DebtStructureChartProps> = ({
  data,
  totalDebtAmount = 1_000_000_000,
  highlightedTrancheRank = null,
}) => {
  const [hoveredRank, setHoveredRank] = useState<number | null>(null);
  const [selected, setSelected] = useState<Tranche | null>(null);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Title */}
      <div className="mb-8">
        <h3 className="font-playfair text-2xl text-amber-50 mb-2">Capital Stack Structure</h3>
        <p className="text-sm text-slate-400">
          Typical $1B LBO debt layering: senior (safest), mezzanine (riskier), equity (residual)
        </p>
      </div>

      {/* Stack visualization */}
      <div className="space-y-2 mb-8">
        {data.tranches.map((tranche, idx) => {
          const heightPercent = tranche.size_pct * 100;
          const isHighlighted =
            highlightedTrancheRank === tranche.rank || hoveredRank === tranche.rank;

          return (
            <div
              key={tranche.rank}
              className={`transition-all duration-200 cursor-pointer ${
                highlightedTrancheRank && !isHighlighted ? 'opacity-40' : 'opacity-100'
              }`}
              onMouseEnter={() => setHoveredRank(tranche.rank)}
              onMouseLeave={() => setHoveredRank(null)}
              onClick={() => setSelected(tranche)}
            >
              {/* Tranche bar */}
              <div
                className="relative h-16 rounded-sm border-2 border-slate-700 flex items-center px-4 group hover:border-amber-500"
                style={{
                  backgroundColor: tranche.color,
                  opacity: isHighlighted ? 0.95 : 0.7,
                }}
              >
                {/* Labels */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-white font-mono">
                    #{tranche.rank} {tranche.name}
                  </div>
                  <div className="text-xs text-slate-100 mt-0.5">
                    {tranche.size_representative} • {tranche.seniority}
                  </div>
                </div>

                {/* Rate info */}
                <div className="text-right text-xs text-slate-200 font-mono">
                  <div className="font-bold">{tranche.all_in_rate}</div>
                  <div className="text-slate-300">Mat: {tranche.maturity_years}yr</div>
                </div>

                {/* Recovery badge */}
                <div
                  className="ml-4 px-2 py-1 rounded text-xs font-mono text-white transition-colors"
                  style={{
                    backgroundColor: `rgba(0,0,0,${0.3 + tranche.recovery_in_default * 0.4})`,
                  }}
                >
                  {(tranche.recovery_in_default * 100).toFixed(0)}% recovery
                </div>
              </div>

              {/* Expanded details on hover/select */}
              {isHighlighted && (
                <div className="mt-2 p-3 bg-slate-900 border border-slate-700 rounded text-xs space-y-1">
                  <p className="text-slate-300">
                    <span className="text-amber-400 font-mono">Covenants:</span> {tranche.covenant_structure}
                  </p>
                  <p className="text-slate-300">
                    <span className="text-amber-400 font-mono">Holders:</span> {tranche.typical_holders}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected tranche details panel */}
      {selected && (
        <div className="border-l-4 border-amber-500 bg-slate-900 p-4 rounded space-y-3 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-amber-50 font-mono">
                Tranche #{selected.rank}: {selected.name}
              </h4>
              <p className="text-sm text-slate-400 mt-1">{selected.tranche_type}</p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-slate-500 hover:text-slate-300 text-lg"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wide">Size</p>
              <p className="font-mono text-amber-50">{selected.size_representative}</p>
              <p className="text-slate-400 text-xs mt-1">{(selected.size_pct * 100).toFixed(1)}% of total debt</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wide">All-in Rate</p>
              <p className="font-mono text-amber-50">{selected.all_in_rate}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wide">Maturity</p>
              <p className="font-mono text-amber-50">{selected.maturity_years} years</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wide">Recovery (Default)</p>
              <p className="font-mono text-amber-50">{(selected.recovery_in_default * 100).toFixed(0)}%</p>
            </div>
          </div>

          <div>
            <p className="text-slate-500 text-xs uppercase tracking-wide mb-2">Covenant Structure</p>
            <p className="text-sm text-slate-300 italic">{selected.covenant_structure}</p>
          </div>

          <div>
            <p className="text-slate-500 text-xs uppercase tracking-wide mb-2">Typical Holders</p>
            <p className="text-sm text-slate-300">{selected.typical_holders}</p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="border-t border-slate-700 pt-4">
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Recovery Rate Guide</p>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 rounded bg-green-600" />
            <span className="text-slate-400">90%+ Recovery (Low Risk)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 rounded bg-amber-600" />
            <span className="text-slate-400">50-90% Recovery (Moderate Risk)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 rounded bg-red-700" />
            <span className="text-slate-400">&lt;50% Recovery (High Risk)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebtStructureChart;
