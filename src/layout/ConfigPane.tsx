// Konfigurator, 380 px (Handoff §3): Modulkopf, aufklappbare Sektionen,
// Aktionszeile unten.
//
// Welche Sektionen erscheinen, hängt am Modul; die Aktionszeile trägt in
// jedem Modul dieselbe Primäraktion — den Graphen zu erzeugen ist das Ziel
// des Werkzeugs, und aus jeder Ansicht heraus erreichbar.

import { useState } from 'react';
import { Callout, Eyebrow, IconButton, MonoBadge, PrimaryButton } from '../design/ui';
import { kc } from '../design/platform';
import {
  CorpusDisplaySection, GraphDisplaySection, NgramSection, PasteDialog,
  StopwordSection, TextSection,
} from './sections';
import { useWorkbench, type LayoutMode } from '../state/workbench';

export function ConfigPane({ layout }: { layout: LayoutMode }) {
  const {
    t, activeModule, setActiveModule, rawText, graphBuilt, graphStale,
    buildGraph, reset, error, setError, ngramConfig,
  } = useWorkbench();
  const [pasteOpen, setPasteOpen] = useState(false);

  const moduleTitle = activeModule === 'graph' ? t.navGraph
    : activeModule === 'exclude' ? t.navExclude : t.navIntro;
  const moduleGroup = activeModule === 'intro' ? t.navStart : t.navAnalysis;
  const moduleBadge = activeModule === 'graph' ? `n-Gramm · n=${ngramConfig.windowSize}` : 'TXT';
  const moduleText = activeModule === 'graph' ? t.introStep3
    : activeModule === 'exclude' ? t.introStep2 : t.appSubtitle;

  const run = () => { buildGraph(); setActiveModule('graph'); };

  return (
    <aside
      style={{
        gridArea: 'cfg', background: 'var(--lt-bg-2)',
        borderRight: layout === 'left' ? '1px solid var(--lt-line-1)' : undefined,
        borderLeft: layout === 'right' ? '1px solid var(--lt-line-1)' : undefined,
        borderBottom: layout === 'bottom' ? '1px solid var(--lt-line-1)' : undefined,
        display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden',
      }}
    >
      <div style={{ padding: '12px 14px 10px', flexShrink: 0 }}>
        <Eyebrow>{moduleGroup}</Eyebrow>
        <h2 style={{
          margin: '4px 0 0', fontSize: 16, fontWeight: 600,
          display: 'flex', alignItems: 'baseline', gap: 8,
        }}>
          {moduleTitle}
          <MonoBadge>{moduleBadge}</MonoBadge>
        </h2>
        <p style={{ margin: '6px 0 0', fontSize: 12, lineHeight: 1.45, color: 'var(--lt-fg-3)' }}>
          {moduleText}
        </p>
      </div>

      <div className="lt-scroll" style={{
        flex: 1, minHeight: 0, overflowY: 'auto',
        padding: 12, display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {error && (
          <div onClick={() => setError('')} style={{ cursor: 'pointer' }}>
            <Callout tone="err" icon="warn">{error}</Callout>
          </div>
        )}

        <TextSection onPaste={() => setPasteOpen(true)} />

        {activeModule !== 'graph' && (
          <>
            <StopwordSection />
            <CorpusDisplaySection />
          </>
        )}

        {activeModule === 'graph' && (
          <>
            <NgramSection />
            {graphBuilt && <GraphDisplaySection />}
            <StopwordSection defaultOpen={false} />
          </>
        )}

        {graphStale && <Callout tone="warn" icon="warn">{t.graphStale}</Callout>}
      </div>

      <div style={{
        flexShrink: 0, padding: 10, borderTop: '1px solid var(--lt-line-1)',
        display: 'flex', gap: 8, background: 'var(--lt-bg-2)',
      }}>
        <PrimaryButton
          icon="play" kbd={kc('↵')} disabled={!rawText} onClick={run}
          style={{ flex: 1 }}
        >
          {graphBuilt ? t.regenerateGraph : t.generateGraph}
        </PrimaryButton>
        <IconButton
          name="refresh" size={32} onClick={reset}
          title={`${t.resetAll} — ${t.resetHint}`}
        />
      </div>

      {pasteOpen && <PasteDialog onClose={() => setPasteOpen(false)} />}
    </aside>
  );
}
