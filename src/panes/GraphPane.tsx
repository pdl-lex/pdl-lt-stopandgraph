// Ergebnisfläche „Visualisierung" (Handoff §4): Werkzeugleiste, Kennzahlen-
// Strip, Zeichenfläche, Fußzeile mit Export.
//
// Die Balken im Kennzahlen-Strip filtern, wie im Handoff vorgesehen: Ein
// Klick setzt die Mindesthäufigkeit bzw. das Mindestgewicht — dieselbe
// Geste, die dort die Trefferliste einschränkt.

import { useMemo, useRef, useState } from 'react';
import { formatNumber } from '../config/i18n';
import {
  Callout, Dialog, EmptyState, Field, GhostButton, IconButton, MonoBadge,
  PrimaryButton, Select,
} from '../design/ui';
import { kc } from '../design/platform';
import { HBar, Sparkbars } from '../design/widgets';
import { ForceGraph, type ForceGraphHandle } from '../graph/ForceGraph';
import { ToolbarSearch } from '../layout/sections';
import { useWorkbench } from '../state/workbench';
import { Stat, StatStrip } from './StatStrip';

const PNG_PRESETS = [
  { value: '1920x1080', label: '1920 × 1080 (Full HD)' },
  { value: '2560x1440', label: '2560 × 1440 (2K)' },
  { value: '3840x2160', label: '3840 × 2160 (4K)' },
  { value: '2480x3508', label: '2480 × 3508 (A4, 300 dpi)' },
];

const THRESHOLDS = [1, 2, 3, 4, 5, 6];

/** Welcher Balken ist markiert? Ein über die Regler gesetzter Wert außerhalb
 *  der Stufen markiert keinen — sonst blieben alle Balken blass. */
function activeIn(steps: number[], value: number): number | null {
  const index = steps.indexOf(value);
  return index >= 0 ? index : null;
}

export function GraphPane() {
  const {
    t, language, theme, graph, filteredGraph, graphStats, graphBuilt, graphStale,
    display, setDisplay, buildGraph, rawText, stats, textSource,
  } = useWorkbench();
  const canvasRef = useRef<ForceGraphHandle>(null);
  const [search, setSearch] = useState('');
  const [pngOpen, setPngOpen] = useState(false);
  const [preset, setPreset] = useState(PNG_PRESETS[0].value);

  const n = (value: number) => formatNumber(value, language);

  const labels = useMemo(
    () => ({ frequency: t.nodeTooltip, weight: t.edgeTooltip }),
    [t.nodeTooltip, t.edgeTooltip],
  );

  const matches = search.trim()
    ? filteredGraph.nodes
      .filter((node) => node.label.toLowerCase().includes(search.trim().toLowerCase()))
      .slice(0, 8)
    : [];

  if (!graphBuilt) {
    return (
      <section style={{
        gridArea: 'main', display: 'flex', flexDirection: 'column',
        minHeight: 0, minWidth: 0, background: 'var(--lt-bg-1)',
      }}>
        <EmptyState icon="layers">
          <div style={{ marginBottom: 14 }}>{rawText ? t.graphEmpty : t.introStep3}</div>
          <PrimaryButton icon="play" kbd={kc('↵')} disabled={!rawText} onClick={buildGraph}>
            {t.generateGraph}
          </PrimaryButton>
        </EmptyState>
      </section>
    );
  }

  const nodesByFrequency = THRESHOLDS.map((threshold) => ({
    name: `≥ ${threshold}`,
    count: graph.nodes.filter((node) => node.frequency >= threshold).length,
  }));
  const edgesByWeight = THRESHOLDS.map((threshold) => ({
    name: `≥ ${threshold}`,
    count: graph.edges.filter((edge) => edge.weight >= threshold).length,
  }));

  const coverage = stats.uniqueWords > 0
    ? Math.round((filteredGraph.nodes.length / Math.max(stats.uniqueWords, 1)) * 100)
    : 0;

  const exportName = textSource
    ? textSource.name.replace(/\.[^.]+$/, '')
    : 'graph';

  const exportPng = () => {
    const [width, height] = preset.split('x').map(Number);
    canvasRef.current?.exportPNG(width, height, `${exportName}_${width}x${height}.png`);
    setPngOpen(false);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(filteredGraph, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section style={{
      gridArea: 'main', display: 'flex', flexDirection: 'column',
      minHeight: 0, minWidth: 0, background: 'var(--lt-bg-0)',
    }}>
      {/* Werkzeugleiste */}
      <div style={{
        height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10,
        padding: '0 12px', borderBottom: '1px solid var(--lt-line-1)',
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>{t.graphTitle}</span>
        <MonoBadge>
          {n(filteredGraph.nodes.length)} {t.nodes} · {n(filteredGraph.edges.length)} {t.edges}
          {graphStats && ` · ${t.avgWeight} ${graphStats.avgEdgeWeight}`}
        </MonoBadge>
        {graphStale && (
          <button
            type="button" onClick={buildGraph} title={t.regenerateGraph}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 8px',
              background: 'var(--lt-warn-soft)', border: '1px solid var(--lt-warn-line)',
              color: 'var(--lt-warn)', borderRadius: 'var(--lt-r-xs)', fontSize: 11,
              cursor: 'pointer', textAlign: 'left',
            }}
          >
            {t.graphStale}
          </button>
        )}

        <span style={{ flex: 1 }} />

        <div style={{ position: 'relative' }}>
          <ToolbarSearch
            value={search} onChange={setSearch} placeholder={t.searchNode} width={200}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setSearch('');
              if (e.key === 'Enter' && matches[0]) {
                canvasRef.current?.focusNode(matches[0].id);
                setSearch('');
              }
            }}
          />
          {matches.length > 0 && (
            <div style={{
              position: 'absolute', top: 30, left: 0, right: 0, zIndex: 30,
              background: 'var(--lt-bg-0)', border: '1px solid var(--lt-line-2)',
              borderRadius: 'var(--lt-r-sm)', boxShadow: 'var(--lt-shadow-pop)', overflow: 'hidden',
            }}>
              {matches.map((node) => (
                <button
                  key={node.id} type="button"
                  onClick={() => { canvasRef.current?.focusNode(node.id); setSearch(''); }}
                  style={{
                    display: 'flex', width: '100%', textAlign: 'left', padding: '6px 9px',
                    background: 'transparent', border: 0, cursor: 'pointer',
                    fontSize: 12.5, color: 'var(--lt-fg-1)', gap: 8,
                  }}
                >
                  <span style={{ flex: 1 }}>{node.label}</span>
                  <span style={{ fontFamily: 'var(--lt-font-mono)', color: 'var(--lt-fg-3)' }}>
                    {node.frequency}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <IconButton name="refresh" title={t.resetView} onClick={() => canvasRef.current?.resetView()} />
        <IconButton name="grid" title={t.centerGraph} onClick={() => canvasRef.current?.centerGraph()} />
      </div>

      {/* Kennzahlen */}
      <StatStrip columns="1.3fr 1.3fr 1fr 1fr">
        <Stat
          label={t.nodes}
          value={n(filteredGraph.nodes.length)}
          sub={`${t.minNodeFrequency} ≥ ${display.minNodeFrequency} · ${t.of} ${n(graph.nodes.length)}`}
        >
          <Sparkbars
            data={nodesByFrequency} interactive width={120} height={24}
            color="var(--lt-primary)" formatCount={n}
            activeIndex={activeIn(THRESHOLDS, display.minNodeFrequency)}
            onSelect={(i) => setDisplay({ ...display, minNodeFrequency: THRESHOLDS[i] })}
          />
        </Stat>

        <Stat
          label={t.edges}
          value={n(filteredGraph.edges.length)}
          sub={`${t.minEdgeWeight} ≥ ${display.minEdgeWeight} · ${t.of} ${n(graph.edges.length)}`}
        >
          <Sparkbars
            data={edgesByWeight} interactive width={120} height={24}
            color="var(--lt-info)" formatCount={n}
            activeIndex={activeIn(THRESHOLDS, display.minEdgeWeight)}
            onSelect={(i) => setDisplay({ ...display, minEdgeWeight: THRESHOLDS[i] })}
          />
        </Stat>

        <Stat
          label={t.avgWeight}
          value={graphStats ? String(graphStats.avgEdgeWeight) : '—'}
          sub={graphStats ? `${t.maxWeight} ${n(graphStats.maxEdgeWeight)}` : undefined}
        >
          <div style={{ width: 60, flexShrink: 0 }}>
            <HBar
              value={graphStats?.avgEdgeWeight ?? 0}
              max={Math.max(graphStats?.maxEdgeWeight ?? 1, 1)}
              color="var(--lt-info)"
            />
          </div>
        </Stat>

        <Stat
          label={t.coverage}
          value={`${coverage} %`}
          sub={`${n(filteredGraph.nodes.length)} ${t.of} ${n(stats.uniqueWords)}`}
          title={t.coverageHint}
          last
        >
          <div style={{ width: 60, flexShrink: 0 }}>
            <HBar value={coverage} max={100} />
          </div>
        </Stat>
      </StatStrip>

      {/* Zeichenfläche */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        {filteredGraph.nodes.length === 0 ? (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: 24,
          }}>
            <Callout tone="warn" icon="warn">{t.graphEmpty}</Callout>
          </div>
        ) : (
          <ForceGraph
            ref={canvasRef} data={filteredGraph} config={display}
            uiTheme={theme} labels={labels}
          />
        )}
      </div>

      {/* Fußzeile */}
      <div style={{
        height: 48, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 12px', borderTop: '1px solid var(--lt-line-1)',
      }}>
        <span className="lt-eyebrow">{t.export}</span>
        <GhostButton
          icon="download" onClick={() => canvasRef.current?.exportSVG(`${exportName}.svg`)}
        >{t.downloadSVG}</GhostButton>
        <GhostButton icon="image" onClick={() => setPngOpen(true)}>{t.downloadPNG}</GhostButton>
        <GhostButton icon="download" onClick={exportJSON}>{t.downloadJSON}</GhostButton>

        <span style={{ flex: 1 }} />

        <PrimaryButton icon="play" onClick={buildGraph} kbd={kc('↵')}>
          {t.regenerateGraph}
        </PrimaryButton>
      </div>

      {pngOpen && (
        <Dialog title={t.downloadPNG} icon="image" width={420} onClose={() => setPngOpen(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label={t.resolution}>
              <Select value={preset} onChange={setPreset} options={PNG_PRESETS} />
            </Field>
            <PrimaryButton icon="download" full onClick={exportPng}>{t.downloadPNG}</PrimaryButton>
          </div>
        </Dialog>
      )}
    </section>
  );
}
