import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Table as TableIcon,
  Download,
  Activity,
  Layers,
  TrendingUp,
  Maximize2,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { ChartData } from '../../types';

interface ChartWidgetProps {
  data?: Partial<ChartData>;
  title?: string;
}

const DEFAULT_COLORS = [
  '#cc785c', // Claude/Yathish terracotta
  '#2563eb', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ec4899', // Pink
];

export function ChartWidget({ data, title }: ChartWidgetProps) {
  // Normalize incoming data with reliable defaults
  const chartTitle = title || data?.title || 'Interactive Quantitative Chart';
  const initialType = data?.chartType || 'line';
  const [activeType, setActiveType] = useState<'line' | 'bar' | 'area' | 'pie' | 'depth'>(initialType);
  const [activeView, setActiveView] = useState<'chart' | 'table'>('chart');
  const [hoveredPoint, setHoveredPoint] = useState<{ label: string; seriesName: string; value: number } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSeed, setSimSeed] = useState(0);

  // Fallback demo data if none or malformed provided
  const labels: string[] = useMemo(() => {
    if (data?.labels && data.labels.length > 0) return data.labels;
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  }, [data?.labels]);

  const rawDatasets = useMemo(() => {
    if (data?.datasets && data.datasets.length > 0) return data.datasets;
    return [
      { name: 'Frontier Intelligence', data: [42, 58, 65, 78, 85, 92, 98, 105] },
      { name: 'Baseline System', data: [30, 35, 40, 48, 52, 55, 60, 62] },
    ];
  }, [data?.datasets]);

  // Apply real-time simulation variance if toggled
  const datasets = useMemo(() => {
    if (!isSimulating) return rawDatasets;
    return rawDatasets.map((ds, sIdx) => ({
      ...ds,
      data: ds.data.map((v, i) => {
        const drift = Math.sin((i + simSeed + sIdx) * 1.5) * (v * 0.08);
        return Math.round((v + drift) * 10) / 10;
      }),
    }));
  }, [rawDatasets, isSimulating, simSeed]);

  // Compute summary metrics
  const metrics = useMemo(() => {
    const allValues = datasets.flatMap((d) => d.data);
    if (allValues.length === 0) return { max: 0, min: 0, avg: 0, total: 0, trend: '+0.0%' };
    const max = Math.max(...allValues);
    const min = Math.min(...allValues);
    const total = allValues.reduce((a, b) => a + b, 0);
    const avg = Math.round((total / allValues.length) * 10) / 10;
    const first = allValues[0] || 1;
    const last = allValues[allValues.length - 1] || 1;
    const trendNum = Math.round(((last - first) / Math.abs(first || 1)) * 1000) / 10;
    const trend = (trendNum >= 0 ? '+' : '') + trendNum + '%';
    return { max, min, avg, total: Math.round(total * 10) / 10, trend };
  }, [datasets]);

  // Export data as CSV
  const handleExportCSV = () => {
    const header = ['Label', ...datasets.map((d) => d.name)].join(',');
    const rows = labels.map((l, i) => [l, ...datasets.map((d) => d.data[i] ?? '')].join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [header, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${chartTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Dimensions for SVG canvas
  const svgWidth = 600;
  const svgHeight = 260;
  const padding = { top: 25, right: 30, bottom: 35, left: 45 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  const safeDatasets = useMemo(() => {
    return datasets.map((ds) => ({
      ...ds,
      data: ds.data.map((v) => (Number.isFinite(v) ? v : 0)),
    }));
  }, [datasets]);

  const allValues = safeDatasets.flatMap((d) => d.data);
  const rawYMax = allValues.length > 0 ? Math.max(...allValues) : 10;
  const rawYMin = allValues.length > 0 ? Math.min(0, Math.min(...allValues)) : 0;
  const yMax = rawYMax === rawYMin ? rawYMax + 10 : rawYMax * 1.15;
  const yMin = rawYMin;
  const yRange = yMax - yMin > 0 ? yMax - yMin : 1;

  const getX = (index: number) => {
    if (labels.length <= 1) return padding.left + graphWidth / 2;
    return padding.left + (Math.max(0, Math.min(index, labels.length - 1)) / (labels.length - 1)) * graphWidth;
  };

  const getY = (val: number) => {
    const safeVal = Number.isFinite(val) ? val : 0;
    return padding.top + graphHeight - ((safeVal - yMin) / yRange) * graphHeight;
  };

  return (
    <div className="my-4 overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xs">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 bg-[#fbfbfa] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#cc785c]/10 text-[#cc785c]">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-900">{chartTitle}</h4>
            <div className="flex items-center gap-2 text-[10px] text-stone-500 font-mono">
              <span>{datasets.length} series</span>
              <span>•</span>
              <span>{labels.length} points</span>
              {data?.unit && (
                <>
                  <span>•</span>
                  <span>Unit: {data.unit}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* View and format controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Chart Type Toggles */}
          <div className="flex items-center rounded-lg bg-stone-100 p-0.5 text-xs font-medium">
            <button
              onClick={() => setActiveType('line')}
              title="Line Chart"
              className={`rounded-md p-1.5 transition ${
                activeType === 'line' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <LineChartIcon className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setActiveType('bar')}
              title="Bar Chart"
              className={`rounded-md p-1.5 transition ${
                activeType === 'bar' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setActiveType('area')}
              title="Area Chart"
              className={`rounded-md p-1.5 transition ${
                activeType === 'area' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setActiveType('pie')}
              title="Donut / Distribution Chart"
              className={`rounded-md p-1.5 transition ${
                activeType === 'pie' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <PieChartIcon className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setActiveType('depth')}
              title="Depth / Order Book"
              className={`rounded-md p-1.5 transition ${
                activeType === 'depth' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-stone-200" />

          {/* Switch Chart / Table */}
          <div className="flex items-center rounded-lg bg-stone-100 p-0.5 text-xs font-medium">
            <button
              onClick={() => setActiveView('chart')}
              className={`rounded-md px-2 py-1 text-xs transition ${
                activeView === 'chart' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Visual
            </button>
            <button
              onClick={() => setActiveView('table')}
              className={`rounded-md px-2 py-1 text-xs transition ${
                activeView === 'table' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Data
            </button>
          </div>

          {/* Simulation Toggle */}
          <button
            onClick={() => {
              setIsSimulating(!isSimulating);
              setSimSeed((s) => s + 1);
            }}
            title={isSimulating ? 'Stop live drift simulation' : 'Simulate live stream drift'}
            className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition ${
              isSimulating
                ? 'border-amber-300 bg-amber-50 text-amber-900 font-semibold'
                : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
            }`}
          >
            <Zap className={`h-3 w-3 ${isSimulating ? 'text-amber-600 fill-amber-500' : 'text-stone-400'}`} />
            <span className="hidden sm:inline">{isSimulating ? 'Live Drift' : 'Drift'}</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            title="Download CSV dataset"
            className="flex items-center gap-1 rounded-md border border-stone-200 bg-white px-2 py-1 text-[11px] font-medium text-stone-600 hover:bg-stone-50 transition"
          >
            <Download className="h-3 w-3 text-stone-400" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 border-b border-stone-100 bg-stone-50/40 text-center text-xs divide-x divide-stone-100">
        <div className="p-2.5">
          <span className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider">Average</span>
          <span className="font-semibold text-stone-800">{metrics.avg}</span>
        </div>
        <div className="p-2.5">
          <span className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider">Peak Max</span>
          <span className="font-semibold text-emerald-700">{metrics.max}</span>
        </div>
        <div className="p-2.5">
          <span className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider">Trough Min</span>
          <span className="font-semibold text-stone-700">{metrics.min}</span>
        </div>
        <div className="p-2.5">
          <span className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider">Aggregate</span>
          <span className="font-semibold text-stone-900">{metrics.total}</span>
        </div>
        <div className="p-2.5 col-span-2 sm:col-span-1">
          <span className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider">Net Trend</span>
          <span className={`font-semibold ${metrics.trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
            {metrics.trend}
          </span>
        </div>
      </div>

      {/* Main Visual Display */}
      {activeView === 'chart' ? (
        <div className="p-4 bg-white relative">
          {/* Series Legend */}
          <div className="mb-3 flex flex-wrap items-center justify-center gap-4 text-xs">
            {datasets.map((ds, sIdx) => {
              const color = ds.color || DEFAULT_COLORS[sIdx % DEFAULT_COLORS.length];
              return (
                <div key={ds.name ? `${ds.name}-${sIdx}` : `ds-${sIdx}`} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="font-medium text-stone-700">{ds.name}</span>
                </div>
              );
            })}
          </div>

          {/* Hovered Point Inspection Banner */}
          <div className="h-6 mb-1 text-center">
            {hoveredPoint ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-3 py-0.5 text-[11px] font-mono text-white shadow-xs">
                <span>{hoveredPoint.label}:</span>
                <span className="text-amber-400 font-semibold">{hoveredPoint.seriesName}</span>
                <span>=</span>
                <span className="font-bold">{hoveredPoint.value}</span>
              </span>
            ) : (
              <span className="text-[11px] text-stone-400 font-mono">Hover over any data point for precision values</span>
            )}
          </div>

          {/* SVG Canvas for Line / Bar / Area / Depth */}
          {activeType === 'pie' ? (
            /* Donut / Pie View */
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
              <svg width="220" height="220" viewBox="0 0 220 220" className="overflow-visible">
                {(() => {
                  const firstDataset = datasets[0] || { name: 'Share', data: [] };
                  const total = firstDataset.data.reduce((a, b) => a + b, 0) || 1;
                  let cumulativeAngle = 0;
                  const centerX = 110;
                  const centerY = 110;
                  const radius = 80;
                  const innerRadius = 45;

                  return firstDataset.data.map((val, idx) => {
                    const sliceAngle = (val / total) * 360;
                    const startAngle = cumulativeAngle;
                    const endAngle = cumulativeAngle + sliceAngle;
                    cumulativeAngle += sliceAngle;

                    const startRad = ((startAngle - 90) * Math.PI) / 180;
                    const endRad = ((endAngle - 90) * Math.PI) / 180;

                    const x1 = centerX + radius * Math.cos(startRad);
                    const y1 = centerY + radius * Math.sin(startRad);
                    const x2 = centerX + radius * Math.cos(endRad);
                    const y2 = centerY + radius * Math.sin(endRad);

                    const ix1 = centerX + innerRadius * Math.cos(endRad);
                    const iy1 = centerY + innerRadius * Math.sin(endRad);
                    const ix2 = centerX + innerRadius * Math.cos(startRad);
                    const iy2 = centerY + innerRadius * Math.sin(startRad);

                    const largeArc = sliceAngle > 180 ? 1 : 0;
                    const d = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;
                    const color = DEFAULT_COLORS[idx % DEFAULT_COLORS.length];

                    return (
                      <path
                        key={idx}
                        d={d}
                        fill={color}
                        stroke="#fff"
                        strokeWidth="2"
                        className="transition-transform duration-200 hover:opacity-90 cursor-pointer"
                        onMouseEnter={() =>
                          setHoveredPoint({
                            label: labels[idx] || `Item ${idx + 1}`,
                            seriesName: `${Math.round((val / total) * 100)}%`,
                            value: val,
                          })
                        }
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    );
                  });
                })()}
                <circle cx="110" cy="110" r="40" fill="#ffffff" />
                <text x="110" y="106" textAnchor="middle" className="text-[10px] font-mono fill-stone-400">
                  TOTAL
                </text>
                <text x="110" y="122" textAnchor="middle" className="text-xs font-bold font-mono fill-stone-900">
                  {datasets[0]?.data.reduce((a, b) => a + b, 0) || 0}
                </text>
              </svg>

              {/* Pie breakdown list */}
              <div className="space-y-1.5 text-xs">
                {labels.slice(0, 8).map((label, idx) => {
                  const val = datasets[0]?.data[idx] || 0;
                  const total = datasets[0]?.data.reduce((a, b) => a + b, 0) || 1;
                  const pct = Math.round((val / total) * 100);
                  const color = DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 px-2 py-1 rounded hover:bg-stone-50 cursor-pointer"
                      onMouseEnter={() => setHoveredPoint({ label, seriesName: `${pct}%`, value: val })}
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-stone-700 w-24 truncate">{label}</span>
                      <span className="font-mono text-stone-900 font-semibold">{val}</span>
                      <span className="font-mono text-stone-400 text-[11px]">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* SVG Chart for Line, Bar, Area, Depth */
            <div className="w-full overflow-x-auto">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto min-w-[500px]">
                <defs>
                  {datasets.map((ds, sIdx) => {
                    const color = ds.color || DEFAULT_COLORS[sIdx % DEFAULT_COLORS.length];
                    return (
                      <linearGradient key={`grad-${sIdx}`} id={`area-grad-${sIdx}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                      </linearGradient>
                    );
                  })}
                </defs>

                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                  const y = padding.top + graphHeight * pct;
                  const val = Math.round(yMax - pct * yRange);
                  return (
                    <g key={idx}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={padding.left + graphWidth}
                        y2={y}
                        stroke="#f0ece6"
                        strokeDasharray="3 3"
                      />
                      <text x={padding.left - 8} y={y + 4} textAnchor="end" className="text-[10px] font-mono fill-stone-400">
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* X Axis Labels */}
                {labels.map((l, i) => {
                  const x = getX(i);
                  return (
                    <text
                      key={i}
                      x={x}
                      y={svgHeight - 12}
                      textAnchor="middle"
                      className="text-[10px] font-mono fill-stone-500"
                    >
                      {l}
                    </text>
                  );
                })}

                {/* Render Bar Chart */}
                {activeType === 'bar' &&
                  labels.map((_, i) => {
                    const groupWidth = (graphWidth / labels.length) * 0.7;
                    const barWidth = groupWidth / datasets.length;
                    const groupX = padding.left + (i / labels.length) * graphWidth + (graphWidth / labels.length) * 0.15;

                    return (
                      <g key={i}>
                        {datasets.map((ds, sIdx) => {
                          const val = ds.data[i] || 0;
                          const barHeight = Math.max(2, ((val - yMin) / yRange) * graphHeight);
                          const x = groupX + sIdx * barWidth;
                          const y = padding.top + graphHeight - barHeight;
                          const color = ds.color || DEFAULT_COLORS[sIdx % DEFAULT_COLORS.length];

                          return (
                            <rect
                              key={sIdx}
                              x={x}
                              y={y}
                              width={Math.max(2, barWidth - 2)}
                              height={barHeight}
                              fill={color}
                              rx="3"
                              className="transition-all duration-200 hover:opacity-80 cursor-pointer"
                              onMouseEnter={() =>
                                setHoveredPoint({
                                  label: labels[i],
                                  seriesName: ds.name,
                                  value: val,
                                })
                              }
                              onMouseLeave={() => setHoveredPoint(null)}
                            />
                          );
                        })}
                      </g>
                    );
                  })}

                {/* Render Area Chart Paths */}
                {(activeType === 'area' || activeType === 'depth') &&
                  safeDatasets.map((ds, sIdx) => {
                    if (!ds.data || ds.data.length === 0) return null;
                    const points = ds.data.map((val, i) => `${getX(i)},${getY(val)}`);
                    const areaD = `M ${getX(0)},${padding.top + graphHeight} L ${points.join(' L ')} L ${getX(
                      ds.data.length - 1
                    )},${padding.top + graphHeight} Z`;

                    return (
                      <path
                        key={`area-${sIdx}`}
                        d={areaD}
                        fill={`url(#area-grad-${sIdx})`}
                        className="transition-all duration-300"
                      />
                    );
                  })}

                {/* Render Line Chart Paths & Dots */}
                {(activeType === 'line' || activeType === 'area' || activeType === 'depth') &&
                  safeDatasets.map((ds, sIdx) => {
                    if (!ds.data || ds.data.length === 0) return null;
                    const color = ds.color || DEFAULT_COLORS[sIdx % DEFAULT_COLORS.length];
                    const points = ds.data.map((val, i) => `${getX(i)},${getY(val)}`);
                    const lineD = `M ${points.join(' L ')}`;

                    return (
                      <g key={`line-group-${sIdx}`}>
                        <path
                          d={lineD}
                          fill="none"
                          stroke={color}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-all duration-300"
                        />
                        {/* Data dots */}
                        {ds.data.map((val, i) => {
                          const cx = getX(i);
                          const cy = getY(val);
                          return (
                            <circle
                              key={i}
                              cx={cx}
                              cy={cy}
                              r="4"
                              fill="#ffffff"
                              stroke={color}
                              strokeWidth="2.5"
                              className="transition-transform duration-150 hover:scale-150 cursor-pointer"
                              onMouseEnter={() =>
                                setHoveredPoint({
                                  label: labels[i],
                                  seriesName: ds.name,
                                  value: val,
                                })
                              }
                              onMouseLeave={() => setHoveredPoint(null)}
                            />
                          );
                        })}
                      </g>
                    );
                  })}
              </svg>
            </div>
          )}
        </div>
      ) : (
        /* Data Table View */
        <div className="overflow-x-auto max-h-72 p-3">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/60 text-stone-500">
                <th className="p-2.5">Index / Label</th>
                {datasets.map((ds, sIdx) => (
                  <th key={ds.name ? `${ds.name}-${sIdx}` : `head-ds-${sIdx}`} className="p-2.5 font-bold text-stone-900">
                    {ds.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {labels.map((label, idx) => (
                <tr key={idx} className="hover:bg-stone-50/70 transition-colors">
                  <td className="p-2.5 text-stone-600 font-semibold">{label}</td>
                  {datasets.map((ds, sIdx) => (
                    <td key={ds.name ? `${ds.name}-${sIdx}-${idx}` : `col-ds-${sIdx}-${idx}`} className="p-2.5 text-stone-800">
                      {ds.data[idx] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
