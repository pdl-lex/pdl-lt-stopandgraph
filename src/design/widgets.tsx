// Mini-Charts und kleine Steuerelemente aus dem Design-Handoff.
//
// Die Sparkbars sind kein Schmuck: Ein Klick auf einen Balken setzt einen
// Filter (Handoff §4) — hier schließt er ein Wort aus bzw. setzt eine
// Schwelle. Deshalb tragen sie Trefferflächen und einen Tooltip.

import { useState, type CSSProperties, type ReactNode } from 'react';

export interface SparkDatum { name: string; count: number; pct?: number }

export function Sparkbars({
  data, max, color = 'var(--lt-primary)', width = 120, height = 26, gap = 2,
  interactive = false, activeIndex = null, onSelect, formatCount,
}: {
  data: SparkDatum[]; max?: number; color?: string; width?: number; height?: number;
  gap?: number; interactive?: boolean; activeIndex?: number | null;
  onSelect?: (index: number) => void; formatCount?: (value: number) => string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  if (data.length === 0) {
    return <div style={{ width, height, opacity: 0.4, fontSize: 10.5, color: 'var(--lt-fg-3)' }}>—</div>;
  }
  const top = max ?? Math.max(...data.map((d) => d.count), 1);
  const barWidth = (width - gap * (data.length - 1)) / data.length;
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div style={{ position: 'relative', display: 'inline-block', lineHeight: 0 }}>
      <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
        {data.map((d, i) => {
          const h = Math.max(2, (d.count / top) * height);
          const isActive = activeIndex === i;
          const isHover = hover === i;
          const faded = (activeIndex != null && !isActive) || (hover != null && !isHover);
          return (
            <rect
              key={`bar-${d.name}-${i}`} x={i * (barWidth + gap)} y={height - h}
              width={barWidth} height={h} fill={color} rx={1}
              opacity={faded ? 0.26 : isActive || isHover ? 1 : 0.85}
              style={{ transition: 'opacity .1s' }}
            />
          );
        })}
        {interactive && data.map((d, i) => (
          <rect
            key={`hit-${d.name}-${i}`} x={i * (barWidth + gap)} y={0}
            width={barWidth} height={height} fill="transparent"
            style={{ cursor: onSelect ? 'pointer' : 'default' }}
            onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
            onClick={onSelect ? () => onSelect(i) : undefined}
          />
        ))}
      </svg>
      {interactive && hover != null && (
        <SparkTip
          d={data[hover]} total={total} formatCount={formatCount}
          x={hover * (barWidth + gap) + barWidth / 2}
        />
      )}
    </div>
  );
}

function SparkTip({
  d, total, x, formatCount,
}: { d: SparkDatum; total: number; x: number; formatCount?: (v: number) => string }) {
  const pct = d.pct != null ? d.pct : Math.round((d.count / Math.max(total, 1)) * 100);
  const n = formatCount ?? ((v: number) => String(v));
  return (
    <div style={{
      position: 'absolute', left: x, bottom: 'calc(100% + 6px)', transform: 'translateX(-50%)',
      background: 'var(--lt-fg-1)', color: 'var(--lt-bg-0)', padding: '4px 8px',
      borderRadius: 'var(--lt-r-sm)', fontSize: 11, whiteSpace: 'nowrap', pointerEvents: 'none',
      boxShadow: 'var(--lt-shadow-pop)', zIndex: 50, lineHeight: 1.3,
    }}>
      <span style={{ fontWeight: 600 }}>{d.name}</span>
      <span style={{ opacity: 0.7 }}> · {n(d.count)} · {pct}%</span>
    </div>
  );
}

export function HBar({
  value, max, color = 'var(--lt-primary)', track = 'var(--lt-bg-2)', height = 5, radius = 3,
}: { value: number; max: number; color?: string; track?: string; height?: number; radius?: number }) {
  const width = Math.min(100, Math.max(0, (value / Math.max(max, 1)) * 100));
  return (
    <div style={{ height, background: track, borderRadius: radius, overflow: 'hidden', width: '100%' }}>
      <div style={{ width: `${width}%`, height: '100%', background: color, borderRadius: radius }} />
    </div>
  );
}

export function Segmented<T extends string>({
  options, value, onChange, full = false,
}: {
  options: { value: T; label: string }[];
  value: T; onChange: (value: T) => void; full?: boolean;
}) {
  return (
    <div style={{
      display: full ? 'flex' : 'inline-flex', padding: 2, gap: 2,
      background: 'var(--lt-bg-2)', border: '1px solid var(--lt-line-1)',
      borderRadius: 'var(--lt-r-sm)',
    }}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value} type="button" onClick={() => onChange(option.value)}
            style={{
              appearance: 'none', border: 'none', cursor: 'pointer', font: 'inherit',
              fontSize: 12, fontWeight: active ? 600 : 500, padding: '3px 12px',
              borderRadius: 'calc(var(--lt-r-sm) - 2px)', flex: full ? 1 : undefined,
              background: active ? 'var(--lt-bg-0)' : 'transparent',
              color: active ? 'var(--lt-fg-1)' : 'var(--lt-fg-3)',
              boxShadow: active ? 'var(--lt-shadow-1)' : 'none',
              whiteSpace: 'nowrap',
            }}
          >{option.label}</button>
        );
      })}
    </div>
  );
}

const kbdStyle: CSSProperties = {
  fontFamily: 'var(--lt-font-mono)', fontSize: 11, padding: '1px 6px',
  border: '1px solid var(--lt-line-2)', borderBottomWidth: 2, borderRadius: 'var(--lt-r-xs)',
  color: 'var(--lt-fg-2)', background: 'var(--lt-bg-0)', whiteSpace: 'nowrap',
};

export function Kbd({ children }: { children: ReactNode }) {
  return <span style={kbdStyle}>{children}</span>;
}
