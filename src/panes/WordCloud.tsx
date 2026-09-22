// Wortwolke: Schriftgröße nach Häufigkeit, ein Klick schließt das Wort aus.
//
// Die Reihenfolge ist gemischt, damit die Wolke nicht wie eine sortierte
// Liste aussieht — aber deterministisch gemischt (Hash des Wortes) statt mit
// Math.random. Sonst sprang die ganze Wolke bei jedem Tastendruck um.

import { useMemo } from 'react';
import { formatNumber } from '../config/i18n';
import type { UILanguage } from '../config/i18n';
import type { WordCount } from '../state/workbench';

function hash(word: string): number {
  let h = 0;
  for (let i = 0; i < word.length; i += 1) h = (h * 31 + word.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function WordCloud({
  words, maxWords, onWordClick, language, hint, tone = 'primary',
}: {
  words: WordCount[];
  maxWords: number;
  onWordClick: (word: string) => void;
  language: UILanguage;
  hint: string;
  tone?: 'primary' | 'err';
}) {
  const items = useMemo(() => {
    const top = words.slice(0, maxWords);
    if (top.length === 0) return [];
    const max = top.reduce((value, item) => Math.max(value, item.count), 1);
    const min = top.reduce((value, item) => Math.min(value, item.count), Infinity);
    const span = max - min || 1;
    return top
      .map((item) => ({ ...item, level: (item.count - min) / span, order: hash(item.word) }))
      .sort((a, b) => a.order - b.order);
  }, [words, maxWords]);

  const base = tone === 'err' ? 'var(--lt-err)' : 'var(--lt-primary)';

  return (
    <div style={{ textAlign: 'center', lineHeight: 1.9, padding: '4px 2px' }}>
      {items.map((item) => (
        <span
          key={item.word}
          className="cloud-word"
          onClick={() => onWordClick(item.word)}
          title={`${item.word} · ${formatNumber(item.count, language)}× — ${hint}`}
          style={{
            fontSize: `${0.78 + item.level * 1.5}rem`,
            fontWeight: item.level > 0.55 ? 600 : item.level > 0.25 ? 500 : 400,
            color: item.level > 0.55 ? base
              : item.level > 0.2 ? 'var(--lt-fg-1)' : 'var(--lt-fg-3)',
            textDecoration: tone === 'err' ? 'line-through' : undefined,
            textDecorationColor: 'var(--lt-line-3)',
          }}
        >
          {item.word}
        </span>
      ))}
    </div>
  );
}
