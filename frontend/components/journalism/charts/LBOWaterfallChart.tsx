/**
 * LBOWaterfallChart - Animated Sankey visualization showing sources & uses
 * 
 * Displays:
 * - Left side: Sources of capital (PE equity, debt tranches)
 * - Right side: Uses of capital (purchase price, fees)
 * - Animated flow on scroll revealing each tranche
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface WaterfallData {
  metadata: {
    deal_size_usd: number;
    description: string;
  };
  sources_uses: {
    sources: Array<{
      label: string;
      amount: number;
      pct_of_total: number;
      rate_range?: string;
      step: number;
      color: string;
    }>;
    uses: Array<{
      label: string;
      amount: number;
      pct_of_total: number;
      step: number;
      color: string;
    }>;
  };
}

interface LBOWaterfallChartProps {
  data: WaterfallData;
  activeStep: number;
  width?: number;
  height?: number;
}

export const LBOWaterfallChart: React.FC<LBOWaterfallChartProps> = ({
  data,
  activeStep = 0,
  width = 800,
  height = 600,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [renderedStep, setRenderedStep] = useState(0);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const margin = { top: 40, right: 100, bottom: 60, left: 100 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('class', 'lbo-waterfall font-sans');

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Title and description
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('class', 'font-playfair text-lg font-bold fill-amber-50')
      .text('$1B Acquisition: Sources & Uses');

    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 38)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-xs fill-slate-400')
      .text('Animated flow showing equity, debt, and fees at close');

    // Filter data by active step
    const visibleSources = data.sources_uses.sources.filter((s) => s.step <= activeStep);
    const visibleUses = data.sources_uses.uses.filter((s) => s.step <= activeStep);

    const totalAmount = data.metadata.deal_size_usd;

    // Scales
    const yScale = d3.scaleLinear().domain([0, totalAmount]).range([0, innerHeight]);

    const sourcesX = 0;
    const usesX = innerWidth * 0.6;

    // Render sources (left side)
    const sourcesGroup = g.append('g').attr('class', 'sources');

    sourcesGroup
      .append('text')
      .attr('x', sourcesX)
      .attr('y', -15)
      .attr('class', 'font-bold text-sm fill-slate-300')
      .text('SOURCES');

    let sourcesY = 0;

    visibleSources.forEach((source, idx) => {
      const height = yScale(source.amount);

      // Background rect
      sourcesGroup
        .append('rect')
        .attr('x', sourcesX - 60)
        .attr('y', sourcesY)
        .attr('width', 60)
        .attr('height', height)
        .attr('fill', source.color)
        .attr('opacity', 0.8)
        .attr('class', 'transition-all duration-300');

      // Label
      sourcesGroup
        .append('text')
        .attr('x', sourcesX - 65)
        .attr('y', sourcesY + height / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('class', 'text-xs fill-slate-100 font-medium')
        .text(source.label);

      // Amount
      sourcesGroup
        .append('text')
        .attr('x', sourcesX - 70)
        .attr('y', sourcesY + height / 2 + 10)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('class', 'text-xs fill-slate-300')
        .text(`$${(source.amount / 1_000_000).toFixed(0)}M`);

      sourcesY += height;
    });

    // Render uses (right side)
    const usesGroup = g.append('g').attr('class', 'uses');

    usesGroup
      .append('text')
      .attr('x', usesX)
      .attr('y', -15)
      .attr('class', 'font-bold text-sm fill-slate-300')
      .text('USES');

    let usesY = 0;

    visibleUses.forEach((use, idx) => {
      const height = yScale(use.amount);

      // Background rect
      usesGroup
        .append('rect')
        .attr('x', usesX)
        .attr('y', usesY)
        .attr('width', 60)
        .attr('height', height)
        .attr('fill', use.color)
        .attr('opacity', 0.8)
        .attr('class', 'transition-all duration-300');

      // Label
      usesGroup
        .append('text')
        .attr('x', usesX + 65)
        .attr('y', usesY + height / 2)
        .attr('text-anchor', 'start')
        .attr('dominant-baseline', 'middle')
        .attr('class', 'text-xs fill-slate-100 font-medium')
        .text(use.label);

      // Amount
      usesGroup
        .append('text')
        .attr('x', usesX + 65)
        .attr('y', usesY + height / 2 + 10)
        .attr('text-anchor', 'start')
        .attr('dominant-baseline', 'middle')
        .attr('class', 'text-xs fill-slate-300')
        .text(`$${(use.amount / 1_000_000).toFixed(0)}M`);

      // Connect sources to uses with flowing arrows
      usesY += height;
    });

    // Draw connecting flows
    if (visibleSources.length > 0 && visibleUses.length > 0) {
      const flowGroup = g.append('g').attr('class', 'flows').attr('opacity', 0.4);

      // Simple flow lines from sources center to uses center
      const sourcesTotalHeight = visibleSources.reduce((sum, s) => sum + yScale(s.amount), 0);
      const usesTotalHeight = visibleUses.reduce((sum, u) => sum + yScale(u.amount), 0);

      flowGroup
        .append('line')
        .attr('x1', sourcesX + 30)
        .attr('y1', sourcesTotalHeight / 2)
        .attr('x2', usesX)
        .attr('y2', usesTotalHeight / 2)
        .attr('stroke', '#94A3B8')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');
    }

    // Bottom annotation
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height - 10)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-xs fill-slate-500 italic')
      .text('The target company, not the PE firm, is responsible for this debt.');

    setRenderedStep(activeStep);
  }, [data, activeStep, width, height]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full max-w-4xl mx-auto"
      style={{ minHeight: '400px' }}
    />
  );
};

export default LBOWaterfallChart;
