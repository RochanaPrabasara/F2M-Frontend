// src/components/dashboards/PriceChart.tsx
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Loader2, TrendingUp } from 'lucide-react';

interface ChartPoint {
  label: string;
  price: number;
  date?: string;
}

interface PriceChartProps {
  cropName: string;
  data: ChartPoint[];
  isLoading?: boolean;
  error?: string | null;
}

// Custom glassmorphism tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length > 0) {
    const value = payload[0].value as number;
    return (
      <div
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(22,163,74,0.15)',
          borderRadius: '14px',
          padding: '10px 14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
        }}
      >
        <p style={{ fontSize: 11, color: '#78716c', marginBottom: 4, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {label}
        </p>
        <p style={{ fontSize: 16, fontWeight: 800, color: '#14532d', letterSpacing: '-0.02em' }}>
          LKR {value.toFixed(2)}
        </p>
        <div style={{ marginTop: 4, height: 2, background: 'linear-gradient(90deg,#16a34a,#4ade80)', borderRadius: 4 }} />
      </div>
    );
  }
  return null;
};

export function PriceChart({ cropName, data, isLoading, error }: PriceChartProps) {
  const prices = data.map((d) => d.price).filter((p) => p > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 500;

  const yMin = Math.max(0, Math.floor((minPrice * 0.85) / 50) * 50);
  const yMaxBase = Math.ceil((maxPrice * 1.15) / 50) * 50;
  const yMax = yMaxBase > 0 ? yMaxBase : 500;

  const tickCount = 5;
  const tickStep = Math.max(50, Math.ceil((yMax - yMin) / tickCount / 50) * 50);
  const yTicks = Array.from(
    { length: Math.ceil((yMax - yMin) / tickStep) + 1 },
    (_, i) => yMin + i * tickStep
  );

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
  const hasData = data.length > 0;

  // Trend calculation
  const priceTrend = hasData && prices.length >= 2
    ? ((prices[prices.length - 1] - prices[0]) / prices[0] * 100).toFixed(1)
    : null;
  const isTrendPositive = priceTrend ? parseFloat(priceTrend) >= 0 : true;

  return (
    <>
      <style>{`
        @keyframes chartFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .chart-container { animation: chartFadeIn 0.5s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>

      <div className="chart-container">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-green-600 flex items-center justify-center shadow-sm">
                <TrendingUp className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-bold text-stone-800">{cropName}</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1 ml-9 font-medium uppercase tracking-wider">
              Price Forecast · LKR / kg
            </p>
          </div>

          <div className="text-right">
            {hasData && !isLoading && !error && priceTrend && (
              <div className={`
                inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold
                ${isTrendPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}
              `}>
                {isTrendPositive ? '▲' : '▼'} {Math.abs(parseFloat(priceTrend))}%
              </div>
            )}
            {hasData && !isLoading && !error && (
              <p className="text-[11px] text-stone-400 mt-1">From {today}</p>
            )}
          </div>
        </div>

        {/* Chart wrapper */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #fafaf9 60%, #fff 100%)',
            border: '1px solid #e7e5e4',
            padding: '16px 8px 8px 0',
          }}
        >
          <div className="relative h-64 w-full">

            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(6px)' }}>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center shadow-md">
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                  </div>
                  <span className="text-xs font-semibold text-stone-500">Updating forecast…</span>
                </div>
              </div>
            )}

            {/* Error overlay */}
            {error && !isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(6px)' }}>
                <div className="text-center px-6">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center mx-auto mb-2">
                    <span className="text-red-500 text-lg">!</span>
                  </div>
                  <p className="text-sm text-red-600 font-semibold">{error}</p>
                  <p className="text-xs text-stone-400 mt-1">Try selecting different options</p>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && data.length === 0 && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl"
                style={{ background: 'rgba(250,250,249,0.95)' }}>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-5 w-5 text-stone-300" />
                  </div>
                  <p className="text-sm font-semibold text-stone-500">Select options to view forecast</p>
                  <p className="text-xs text-stone-400 mt-0.5">Choose a crop and region to begin</p>
                </div>
              </div>
            )}

            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.length > 0 ? data : [{ label: '', price: 0 }]}
                margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#16a34a" stopOpacity={0.25} />
                    <stop offset="60%"  stopColor="#16a34a" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#16a34a" stopOpacity={0.01} />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="#e7e5e4"
                  strokeOpacity={0.8}
                />

                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#a8a29e', fontSize: 10, fontWeight: 600 }}
                  dy={12}
                  interval={0}
                  padding={{ left: 12, right: 12 }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  domain={[yMin, yMax]}
                  ticks={yTicks}
                  tickFormatter={(v: number) => `${v}`}
                  tick={{ fill: '#a8a29e', fontSize: 10, fontWeight: 600 }}
                  dx={-4}
                  width={42}
                />

                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#16a34a', strokeWidth: 1, strokeDasharray: '4 4', strokeOpacity: 0.4 }} />

                {hasData && (
                  <ReferenceLine
                    x={data[0]?.label}
                    stroke="#16a34a"
                    strokeDasharray="4 4"
                    strokeOpacity={0.35}
                    strokeWidth={1.5}
                  />
                )}

                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#16a34a"
                  strokeWidth={2.5}
                  fill="url(#priceGradient)"
                  filter="url(#glow)"
                  dot={{
                    fill: '#16a34a',
                    strokeWidth: 2.5,
                    stroke: '#fff',
                    r: 4,
                  }}
                  activeDot={{
                    fill: '#16a34a',
                    strokeWidth: 3,
                    stroke: '#fff',
                    r: 6,
                    filter: 'url(#glow)',
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Footer legend */}
        {hasData && !isLoading && !error && (
          <div className="flex items-center justify-between mt-3 px-1">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-green-500 rounded-full" />
                <div className="w-1.5 h-1.5 rounded-full bg-green-600 ring-2 ring-green-100" />
                <span className="text-[11px] text-stone-500 font-medium">Predicted Price</span>
              </div>
            </div>
            <span className="text-[11px] text-stone-400 font-medium bg-stone-50 px-2 py-0.5 rounded-full border border-stone-100">
              {data.length} {data.length === 1 ? 'point' : 'points'}
            </span>
          </div>
        )}
      </div>
    </>
  );
}