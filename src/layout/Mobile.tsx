// Mobil-Ansicht (Handoff, Abschnitt „Mobil-Ansicht"): Das Werkbank-Raster
// wird zu einer gestapelten, scrollbaren Spalte.
//
// Reduziert gegenüber dem Desktop, wie dort vorgesehen: keine Befehlspalette,
// kein Anordnungsschalter in der Kopfzeile, keine Leiste. Navigation,
// Stapelreihenfolge, Theme und Sprache ziehen ins Schiebemenü; die
// Primäraktion bleibt oben sichtbar. Die Schalter selbst sind dieselben
// Bausteine wie am Desktop (sections.tsx).

import { useMemo, useState } from 'react';
import { formatNumber, type UILanguage } from '../config/i18n';
import { Icon, Logo } from '../design/icons';
import {
  Callout, Card, EmptyState, FilePicker, GhostButton, IconButton, MonoBadge,
  PrimaryButton, SectionFold, Toggle,
} from '../design/ui';
import { Segmented } from '../design/widgets';
import { ForceGraph } from '../graph/ForceGraph';
import { CorpusText } from '../panes/CorpusText';
import { WordCloud } from '../panes/WordCloud';
import { useWorkbench, type ModuleId } from '../state/workbench';
import {
  CorpusDisplaySection, GraphDisplaySection, NgramSection, PasteDialog,
  StopwordSection, TextSection,
} from './sections';

const MOBILE_PAGE = 400;

type StackOrder = 'config' | 'results';

export function MobileView() {
  const {
    t, language, setLanguage, theme, toggleTheme, activeModule, setActiveModule,
    rawText, tokens, stats, stopwords, visibleWords, maxCloudWords, placeholderStyle,
    addStopword, removeStopword, toggleStopword, loadFile, loadSample,
    graph, filteredGraph, graphBuilt, graphStale, buildGraph, display, textSource,
    downloadText, downloadStopwords, reset, error, loadingText,
  } = useWorkbench();

  const [menuOpen, setMenuOpen] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [order, setOrder] = useState<StackOrder>('config');
  const [page, setPage] = useState(0);

  const n = (value: number) => formatNumber(value, language);
  const totalPages = Math.max(1, Math.ceil(tokens.length / MOBILE_PAGE));
  const safePage = Math.min(page, totalPages - 1);
  const pageTokens = tokens.slice(safePage * MOBILE_PAGE, (safePage + 1) * MOBILE_PAGE);

  const labels = useMemo(
    () => ({ frequency: t.nodeTooltip, weight: t.edgeTooltip }),
    [t.nodeTooltip, t.edgeTooltip],
  );

  const modules: { id: ModuleId; label: string }[] = [
    { id: 'intro', label: t.navIntro },
    { id: 'exclude', label: t.navExclude },
    { id: 'graph', label: t.navGraph },
  ];

  const config = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <TextSection onPaste={() => setPasteOpen(true)} />
      {activeModule === 'graph' ? (
        <>
          <NgramSection />
          {graphBuilt && <GraphDisplaySection />}
          <StopwordSection defaultOpen={false} />
        </>
      ) : (
        <>
          <StopwordSection defaultOpen={false} />
          <CorpusDisplaySection />
        </>
      )}
    </div>
  );

  const results = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {activeModule === 'intro' && (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{t.appTitle}</div>
          <div style={{ fontSize: 12, lineHeight: 1.55, color: 'var(--lt-fg-3)' }}>
            {t.introLead}
          </div>
          <ul style={{ margin: '10px 0 0', paddingLeft: 18, fontSize: 12, lineHeight: 1.6, color: 'var(--lt-fg-3)' }}>
            <li>{t.introStep1}</li>
            <li>{t.introStep2}</li>
            <li>{t.introStep3}</li>
          </ul>
        </Card>
      )}

      {activeModule !== 'intro' && !rawText && (
        <Card style={{ padding: 0 }}>
          <EmptyState icon="file">
            <div style={{ marginBottom: 12 }}>{loadingText ? '…' : t.noTextYet}</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <FilePicker label={t.uploadText} accept=".txt,text/plain" onPick={loadFile} primary />
              <GhostButton icon="file" onClick={() => void loadSample()}>{t.sampleText}</GhostButton>
            </div>
          </EmptyState>
        </Card>
      )}

      {rawText && (
        <SectionFold
          title={t.graphStats}
          badge={`${n(stats.totalWords)} ${t.totalWords}`}
          defaultOpen={false}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
            {([
              [t.totalWords, n(stats.totalWords)],
              [t.uniqueWords, n(stats.uniqueWords)],
              [t.hiddenWords, `${n(stats.hiddenWords)} · ${Math.round(stats.hiddenShare * 100)} %`],
              [t.stopwordsTitle, n(stopwords.size)],
              [t.nodes, graphBuilt ? n(filteredGraph.nodes.length) : '—'],
              [t.edges, graphBuilt ? n(filteredGraph.edges.length) : '—'],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span className="lt-eyebrow" style={{ fontSize: 10 }}>{label}</span>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <GhostButton icon="download" onClick={downloadText}>{t.downloadText}</GhostButton>
            <GhostButton icon="download" disabled={stopwords.size === 0} onClick={downloadStopwords}>
              {t.downloadStopwords}
            </GhostButton>
          </div>
        </SectionFold>
      )}

      {activeModule === 'exclude' && rawText && (
        <>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
              background: 'var(--lt-bg-1)', borderBottom: '1px solid var(--lt-line-1)',
            }}>
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>{t.corpusTitle}</span>
              <MonoBadge>{t.page} {safePage + 1}/{totalPages}</MonoBadge>
              <span style={{ flex: 1 }} />
              <IconButton
                name="chevLeft" size={34} title={t.prevPage}
                disabled={safePage === 0} onClick={() => setPage(safePage - 1)}
              />
              <IconButton
                name="chevron" size={34} title={t.nextPage}
                disabled={safePage >= totalPages - 1} onClick={() => setPage(safePage + 1)}
              />
            </div>
            <div className="lt-scroll" style={{ maxHeight: '48vh', overflowY: 'auto', padding: 12 }}>
              <CorpusText
                tokens={pageTokens} startIndex={safePage * MOBILE_PAGE}
                placeholderStyle={placeholderStyle}
                onExclude={addStopword} onRestore={removeStopword}
                excludeHint={t.clickToMarkStopword} restoreHint={t.clickToRestore}
              />
            </div>
          </Card>

          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
              background: 'var(--lt-bg-1)', borderBottom: '1px solid var(--lt-line-1)',
            }}>
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>{t.wordCloudTitle}</span>
              <MonoBadge>{n(Math.min(visibleWords.length, maxCloudWords))}</MonoBadge>
            </div>
            <div className="lt-scroll" style={{ maxHeight: '40vh', overflowY: 'auto', padding: 10 }}>
              {visibleWords.length === 0
                ? <div style={{ fontSize: 12, color: 'var(--lt-fg-3)' }}>{t.wordCloudEmpty}</div>
                : (
                  <WordCloud
                    words={visibleWords} maxWords={maxCloudWords} language={language}
                    hint={t.clickToMarkStopword} onWordClick={toggleStopword}
                  />
                )}
            </div>
          </Card>
        </>
      )}

      {activeModule === 'graph' && rawText && (
        graphBuilt ? (
          <>
            {graphStale && <Callout tone="warn" icon="warn">{t.graphStale}</Callout>}
            <Card style={{ padding: 0, height: '58vh', overflow: 'hidden' }}>
              {filteredGraph.nodes.length === 0
                ? (
                  <div style={{ padding: 16 }}>
                    <Callout tone="warn" icon="warn">{t.graphEmpty}</Callout>
                  </div>
                )
                : (
                  <ForceGraph
                    data={filteredGraph} config={display} uiTheme={theme} labels={labels}
                  />
                )}
            </Card>
            <div style={{ fontFamily: 'var(--lt-font-mono)', fontSize: 11, color: 'var(--lt-fg-3)' }}>
              {n(filteredGraph.nodes.length)} {t.nodes} · {n(filteredGraph.edges.length)} {t.edges}
              {' · '}{n(graph.nodes.length - filteredGraph.nodes.length)} {t.filteredOut}
            </div>
          </>
        ) : (
          <Card style={{ padding: 0 }}>
            <EmptyState icon="layers">
              <div style={{ marginBottom: 12 }}>{t.graphEmpty}</div>
              <PrimaryButton icon="play" onClick={buildGraph}>{t.generateGraph}</PrimaryButton>
            </EmptyState>
          </Card>
        )
      )}
    </div>
  );

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--lt-bg-1)', color: 'var(--lt-fg-1)',
    }}>
      {/* Kopfzeile 52 px, Hit-Targets ≥ 44 px */}
      <header style={{
        height: 52, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 8px', background: 'var(--lt-bg-0)',
        borderBottom: '1px solid var(--lt-line-1)',
      }}>
        <button
          type="button" onClick={() => setMenuOpen(true)} aria-label={t.menu}
          style={{
            width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: 0, color: 'var(--lt-fg-2)', cursor: 'pointer',
          }}
        >
          <Icon name="menu" size={18} />
        </button>
        <Logo size={16} />
        <span style={{
          flex: 1, fontSize: 12.5, color: 'var(--lt-fg-2)', minWidth: 0,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {t.toolSuite} / {modules.find((m) => m.id === activeModule)?.label}
        </span>
        {rawText
          ? (
            <PrimaryButton
              icon="play"
              onClick={() => { buildGraph(); setActiveModule('graph'); }}
            >
              {graphBuilt ? t.regenerateGraph : t.generateGraph}
            </PrimaryButton>
          )
          : (
            <FilePicker
              label={t.uploadText} accept=".txt,text/plain" onPick={loadFile} primary
            />
          )}
      </header>

      <div className="lt-scroll" style={{
        flex: 1, minHeight: 0, overflowY: 'auto',
        padding: 12, display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {error && <Callout tone="err" icon="warn">{error}</Callout>}
        {order === 'config' ? <>{config}{results}</> : <>{results}{config}</>}
      </div>

      {/* Statuszeile 34 px */}
      <footer style={{
        height: 34, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10,
        padding: '0 12px', background: 'var(--lt-bg-0)',
        borderTop: '1px solid var(--lt-line-1)',
        fontFamily: 'var(--lt-font-mono)', fontSize: 10.5, color: 'var(--lt-fg-3)',
        whiteSpace: 'nowrap', overflow: 'hidden',
      }}>
        <span style={{
          overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {t.statusText}: {textSource ? textSource.name : t.none}
        </span>
        <span style={{ flex: 1 }} />
        <span>
          {t.statusStopwords}: {n(stopwords.size)}
          {' · '}
          {t.statusGraph}: {graphBuilt ? n(filteredGraph.nodes.length) : t.graphNotBuilt}
        </span>
      </footer>

      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(8,12,10,0.42)' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 316, maxWidth: '86vw', height: '100%', background: 'var(--lt-bg-0)',
              boxShadow: 'var(--lt-shadow-pop)', display: 'flex', flexDirection: 'column',
              padding: 12, gap: 6, overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 8 }}>
              <span className="lt-eyebrow" style={{ flex: 1 }}>{t.navigation}</span>
              <IconButton name="x" size={32} onClick={() => setMenuOpen(false)} title={t.close} />
            </div>

            {modules.map((module) => {
              const disabled = module.id !== 'intro' && !rawText;
              const active = activeModule === module.id;
              return (
                <button
                  key={module.id} type="button" disabled={disabled}
                  onClick={() => { setActiveModule(module.id); setMenuOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', minHeight: 44, padding: '0 10px',
                    background: active ? 'var(--lt-primary-soft)' : 'transparent',
                    border: 0, borderRadius: 'var(--lt-r-sm)', width: '100%',
                    color: disabled ? 'var(--lt-fg-4)' : active ? 'var(--lt-primary)' : 'var(--lt-fg-1)',
                    fontSize: 13.5, textAlign: 'left', cursor: disabled ? 'default' : 'pointer',
                  }}
                >
                  {module.label}
                </button>
              );
            })}

            <div style={{ height: 1, background: 'var(--lt-line-1)', margin: '8px 0' }} />

            <div className="lt-eyebrow" style={{ padding: '0 2px 6px' }}>{t.layout}</div>
            <Segmented<StackOrder>
              value={order} onChange={setOrder} full
              options={[
                { value: 'config', label: t.stackConfigFirst },
                { value: 'results', label: t.stackResultsFirst },
              ]}
            />

            <div style={{ height: 1, background: 'var(--lt-line-1)', margin: '8px 0' }} />

            <div className="lt-eyebrow" style={{ padding: '0 2px 6px' }}>{t.theme}</div>
            <div style={{ minHeight: 44, display: 'flex', alignItems: 'center' }}>
              <Toggle checked={theme === 'dark'} onChange={toggleTheme} label={t.themeDark} />
            </div>

            <div style={{ minHeight: 44, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ flex: 1, fontSize: 12.5 }}>{t.language}</span>
              <select
                value={language} onChange={(e) => setLanguage(e.target.value as UILanguage)}
                aria-label={t.language}
                style={{
                  height: 36, padding: '0 8px', fontSize: 13,
                  background: 'var(--lt-bg-1)', color: 'var(--lt-fg-1)',
                  border: '1px solid var(--lt-line-2)', borderRadius: 'var(--lt-r-sm)',
                }}
              >
                <option value="de">Deutsch</option>
                <option value="en">English</option>
              </select>
            </div>

            <div style={{ flex: 1, minHeight: 12 }} />
            <GhostButton icon="refresh" full onClick={() => { reset(); setMenuOpen(false); }}>
              {t.resetAll}
            </GhostButton>
          </div>
        </div>
      )}

      {pasteOpen && <PasteDialog onClose={() => setPasteOpen(false)} />}
    </div>
  );
}
