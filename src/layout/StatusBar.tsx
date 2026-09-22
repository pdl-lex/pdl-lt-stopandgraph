// Statuszeile, 32 px (Handoff §5).
//
// Sie trägt genau die Angaben, die sonst unsichtbar blieben: woher der Text
// stammt und wie groß er ist, wie viel die Stopwortliste tatsächlich
// ausblendet, ob der gezeigte Graph noch zum Text passt und mit welchen
// n-Gramm-Einstellungen er gebaut wurde. Jede Angabe ist eine Zahl, die eine
// Entscheidung trägt — nicht Dekoration.

import type { ReactNode } from 'react';
import { formatNumber } from '../config/i18n';
import { kc } from '../design/platform';
import { Kbd } from '../design/widgets';
import { useWorkbench } from '../state/workbench';

type Tone = 'ok' | 'warn' | 'off' | 'err';

function Dot({ tone }: { tone: Tone }) {
  const color = tone === 'ok' ? 'var(--lt-primary)'
    : tone === 'warn' ? 'var(--lt-warn)'
      : tone === 'err' ? 'var(--lt-err)'
        : 'var(--lt-fg-4)';
  return <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />;
}

function Item({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <span title={title} style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '0 12px', borderRight: '1px solid var(--lt-line-1)',
      height: '100%', whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

export function StatusBar() {
  const {
    t, language, textSource, stats, stopwords, graph, filteredGraph,
    graphBuilt, graphStale, ngramConfig, display, error, loadingText,
  } = useWorkbench();

  const n = (value: number) => formatNumber(value, language);
  const sourceLabel = textSource
    ? textSource.kind === 'paste' ? t.sourcePasted : textSource.name
    : t.none;
  const hiddenPct = Math.round(stats.hiddenShare * 100);
  const filteredNodes = graph.nodes.length - filteredGraph.nodes.length;

  return (
    <footer style={{
      gridArea: 'stat', display: 'flex', alignItems: 'center',
      background: 'var(--lt-bg-0)', borderTop: '1px solid var(--lt-line-1)',
      fontFamily: 'var(--lt-font-mono)', fontSize: 11, color: 'var(--lt-fg-3)',
      overflow: 'hidden',
    }}>
      <Item title={textSource?.name}>
        <Dot tone={loadingText ? 'warn' : textSource ? 'ok' : 'off'} />
        {t.statusText}: {sourceLabel}
        {textSource && ` · ${n(stats.characters)} ${t.characters}`}
      </Item>

      {stats.totalWords > 0 && (
        <Item title={`${t.remaining}: ${n(stats.visibleWords)}`}>
          {t.statusWords}: {n(stats.totalWords)} · {n(stats.uniqueWords)} {t.uniqueWords}
        </Item>
      )}

      <Item title={stats.totalWords > 0 ? `${n(stats.hiddenWords)} ${t.statusHidden}` : undefined}>
        <Dot tone={stopwords.size > 0 ? 'ok' : 'off'} />
        {t.statusStopwords}: {n(stopwords.size)}
        {stats.totalWords > 0 && ` · ${hiddenPct} % ${t.statusHidden}`}
      </Item>

      <Item title={graphStale ? t.graphStale : undefined}>
        <Dot tone={!graphBuilt ? 'off' : graphStale ? 'warn' : 'ok'} />
        {t.statusGraph}: {graphBuilt
          ? `${n(filteredGraph.nodes.length)} ${t.nodes} · ${n(filteredGraph.edges.length)} ${t.edges}`
          : t.graphNotBuilt}
      </Item>

      {graphBuilt && filteredNodes > 0 && (
        <Item title={`${t.minNodeFrequency} ≥ ${display.minNodeFrequency} · ${t.minEdgeWeight} ≥ ${display.minEdgeWeight}`}>
          <Dot tone="warn" />
          {n(filteredNodes)} {t.filteredOut}
        </Item>
      )}

      <Item title={t.windowSizeHelp}>
        {t.statusWindow}: n={ngramConfig.windowSize} ·{' '}
        {ngramConfig.weighting.type === 'uniform' ? t.weightingUniform : t.weightingDistance}
      </Item>

      {error && (
        <Item title={error}>
          <Dot tone="err" />
          <span style={{
            maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block',
          }}>{error}</span>
        </Item>
      )}

      <span style={{ flex: 1 }} />
      <span style={{ padding: '0 12px', borderLeft: '1px solid var(--lt-line-1)' }}>UTF-8</span>
      <span style={{ padding: '0 12px', borderLeft: '1px solid var(--lt-line-1)' }}>
        {language.toUpperCase()}
      </span>
      <span style={{
        padding: '0 12px', display: 'flex', alignItems: 'center', gap: 6,
        borderLeft: '1px solid var(--lt-line-1)',
      }}>
        <Kbd>{kc('K')}</Kbd> {t.commands}
      </span>
    </footer>
  );
}
