// Gemeinsame Flächen- und Feldstile.
//
// Eigene Datei, weil Fast Refresh nur greift, wenn ein Modul ausschließlich
// Komponenten ausführt — Konstanten gehören daneben, nicht hinein.

import type { CSSProperties } from 'react';

export const cardStyle: CSSProperties = {
  background: 'var(--lt-bg-0)',
  border: '1px solid var(--lt-line-1)',
  borderRadius: 'var(--lt-r-md)',
  boxShadow: 'var(--lt-shadow-1)',
};

export const inputStyle: CSSProperties = {
  height: 30, padding: '0 9px', width: '100%',
  background: 'var(--lt-bg-1)', color: 'var(--lt-fg-1)',
  border: '1px solid var(--lt-line-2)', borderRadius: 'var(--lt-r-sm)',
  fontSize: 12.5,
};
