// Kennzahlen-Strip über der Ergebnisfläche (Handoff §4).
//
// Vier Zellen, je Eyebrow-Label, große Zahl, Mono-Unterzeile und ein
// Mini-Chart. Die Balken sind anklickbar: Im Handoff filtern sie die
// Trefferliste, hier schließen sie ein Wort aus bzw. setzen eine Schwelle.

import type { CSSProperties, ReactNode } from 'react';

export function StatStrip({
  columns = '1.2fr 1fr 1.2fr 1fr', children, style,
}: { columns?: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{
      flexShrink: 0, display: 'grid', gridTemplateColumns: columns,
      borderBottom: '1px solid var(--lt-line-1)', background: 'var(--lt-bg-0)',
      ...style,
    }}>
      {children}
    </div>
  );
}

export function Stat({
  label, value, sub, children, last = false, title,
}: {
  label: string; value: ReactNode; sub?: ReactNode;
  children?: ReactNode; last?: boolean; title?: string;
}) {
  return (
    <div
      title={title}
      style={{
        padding: '8px 14px', minWidth: 0,
        borderRight: last ? undefined : '1px solid var(--lt-line-1)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div className="lt-eyebrow" style={{ fontSize: 10 }}>{label}</div>
        <div style={{
          fontSize: 14, fontWeight: 600, marginTop: 1,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{value}</div>
        {sub != null && (
          <div style={{
            fontSize: 10.5, color: 'var(--lt-fg-3)', fontFamily: 'var(--lt-font-mono)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{sub}</div>
        )}
      </div>
      {children}
    </div>
  );
}
