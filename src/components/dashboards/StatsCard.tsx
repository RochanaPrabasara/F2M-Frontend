// src/components/dashboards/StatsCard.tsx
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Color = 'green' | 'amber' | 'blue' | 'purple';

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: Color;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const colorConfig: Record<Color, {
  gradient: string;
  iconBg: string;
  glow: string;
  bar: string;
}> = {
  green: {
    gradient: 'from-green-50 via-white to-white',
    iconBg: 'bg-green-600',
    glow: 'shadow-green-100',
    bar: 'bg-green-500',
  },
  amber: {
    gradient: 'from-amber-50 via-white to-white',
    iconBg: 'bg-amber-500',
    glow: 'shadow-amber-100',
    bar: 'bg-amber-500',
  },
  blue: {
    gradient: 'from-blue-50 via-white to-white',
    iconBg: 'bg-blue-600',
    glow: 'shadow-blue-100',
    bar: 'bg-blue-500',
  },
  purple: {
    gradient: 'from-violet-50 via-white to-white',
    iconBg: 'bg-violet-600',
    glow: 'shadow-violet-100',
    bar: 'bg-violet-500',
  },
};

function useCountUp(value: string, duration = 1400) {
  const [display, setDisplay] = useState(value);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const match = value.match(/[\d,]+(\.\d+)?/);
    if (!match) { setDisplay(value); return; }

    const rawNum = parseFloat(match[0].replace(/,/g, ''));
    if (isNaN(rawNum)) { setDisplay(value); return; }

    const prefix = value.slice(0, match.index);
    const suffix = value.slice((match.index ?? 0) + match[0].length);
    const isDecimal = match[0].includes('.');
    const decimalPlaces = isDecimal ? (match[0].split('.')[1]?.length ?? 0) : 0;
    const hasCommas = match[0].includes(',');

    const formatNum = (n: number): string => {
      const fixed = n.toFixed(decimalPlaces);
      if (hasCommas) {
        const parts = fixed.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
      }
      return fixed;
    };

    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(`${prefix}${formatNum(eased * rawNum)}${suffix}`);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(value);
      }
    };

    setDisplay(`${prefix}${formatNum(0)}${suffix}`);
    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current !== null) cancelAnimationFrame(frameRef.current); };
  }, [value, duration]);

  return display;
}

export function StatsCard({ title, value, icon: Icon, color, trend }: StatsCardProps) {
  const cfg = colorConfig[color];
  const animatedValue = useCountUp(value);

  return (
    <>
      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes barGrow {
          from { width: 0%; }
        }
        .stats-card { animation: cardIn 0.45s cubic-bezier(0.16,1,0.3,1) both; }
        .stats-bar  { animation: barGrow 0.9s 0.2s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>

      <div className={`
        stats-card group relative overflow-hidden
        bg-gradient-to-br ${cfg.gradient}
        rounded-2xl border border-stone-100
        shadow-lg ${cfg.glow}
        hover:shadow-xl hover:-translate-y-0.5
        transition-all duration-300 ease-out
        p-5 cursor-default
      `}>
        {/* Top row: icon + trend */}
        <div className="flex items-start justify-between mb-4">
          <div className={`
            ${cfg.iconBg} text-white p-2.5 rounded-xl shadow-md
            group-hover:scale-110 transition-transform duration-300
          `}>
            <Icon className="h-5 w-5" />
          </div>

          {trend && (
            <div className={`
              flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold
              ${trend.isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}
            `}>
              {trend.isPositive
                ? <ArrowUpRight className="h-3 w-3" />
                : <ArrowDownRight className="h-3 w-3" />
              }
              {trend.value}%
            </div>
          )}
        </div>

        {/* Label + animated count */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-stone-900 tabular-nums tracking-tight">
            {animatedValue}
          </h3>
        </div>

        {/* Accent bar */}
        <div className="mt-4 h-0.5 bg-stone-100 rounded-full overflow-hidden">
          <div className={`stats-bar h-full ${cfg.bar} rounded-full`} style={{ width: '60%' }} />
        </div>
      </div>
    </>
  );
}