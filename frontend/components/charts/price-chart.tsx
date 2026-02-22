"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import type { IndicatorSeries, OhlcvBar } from "@/lib/api";

type PriceChartProps = {
  bars: OhlcvBar[];
  indicators: IndicatorSeries[];
};

const INDICATOR_COLORS = ["#00F5FF", "#FFB800", "#9BA7B4", "#6FD3FF", "#FFD166", "#94A3B8", "#00F5FF"];

export function PriceChart({ bars, indicators }: PriceChartProps) {
  const merged = bars.map((bar) => {
    const point: Record<string, string | number | null> = {
      timestamp: bar.timestamp,
      close: bar.close
    };
    for (const indicator of indicators) {
      const matched = indicator.points.find((item) => item.timestamp === bar.timestamp);
      point[indicator.name] = matched?.value ?? null;
    }
    return point;
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={merged} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
        <CartesianGrid stroke="#1C2333" strokeDasharray="4 4" />
        <XAxis
          dataKey="timestamp"
          minTickGap={40}
          tickFormatter={(value: string) => new Date(value).toISOString().slice(0, 10)}
          stroke="#9BA7B4"
          tick={{ fontSize: 11 }}
        />
        <YAxis stroke="#9BA7B4" tick={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={{ background: "#0D1117", border: "1px solid #1C2333", borderRadius: 8 }}
          labelFormatter={(value) => new Date(value).toISOString()}
        />
        <Line type="monotone" dataKey="close" stroke="#00F5FF" strokeWidth={2} dot={false} name="Close" />
        {indicators.map((indicator, index) => (
          <Line
            key={indicator.name}
            type="monotone"
            dataKey={indicator.name}
            stroke={INDICATOR_COLORS[(index + 1) % INDICATOR_COLORS.length]}
            strokeWidth={1.5}
            dot={false}
            connectNulls
            name={indicator.name}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
