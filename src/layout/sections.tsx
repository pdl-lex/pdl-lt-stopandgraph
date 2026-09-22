// Die aufklappbaren Sektionen des Konfigurators (Handoff §3).
//
// Sie liegen in einer eigenen Datei, weil die Mobil-Ansicht dieselben
// Bausteine gestapelt zeigt — der Desktop-Konfigurator und das Mobil-Panel
// sollen nicht zwei Fassungen derselben Schalter pflegen müssen.

import { useState, type CSSProperties } from 'react';
import { formatNumber } from '../config/i18n';
import { Icon } from '../design/icons';
import {
  Callout, Dialog, Field, FilePicker, GhostButton, IconButton, MonoBadge,
  NumberInput, Pill, PrimaryButton, RangeSlider, SectionFold, Select,
  Toggle,
} from '../design/ui';
import { inputStyle } from '../design/styles';
import { Segmented } from '../design/widgets';
import { graphThemeLabels, graphThemeNames, type GraphThemeName } from '../graph/graphThemes';
import type { PlaceholderStyle } from '../types';
import type { EdgeWeighting } from '../types/graph';
import { useWorkbench, type StopwordView } from '../state/workbench';

// ── Text ────────────────────────────────────────────────────────────────────

export function PasteDialog({ onClose }: { onClose: () => void }) {
  const { t, applyText } = useWorkbench();
  const [draft, setDraft] = useState('');
  return (
    <Dialog title={t.pasteText} icon="type" width={640} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <textarea
          autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
          placeholder={t.corpusPlaceholder}
          style={{
            ...inputStyle, height: 300, padding: 10, resize: 'vertical',
            fontFamily: 'var(--lt-font-serif)', fontSize: 14, lineHeight: 1.7,
            background: 'var(--lt-bg-0)',
          }}
        />
        <PrimaryButton
          icon="check" full disabled={!draft.trim()}
          onClick={() => { applyText(draft, { kind: 'paste', name: t.sourcePasted }); onClose(); }}
        >
          {t.applyText}
        </PrimaryButton>
      </div>
    </Dialog>
  );
}

export function TextSection({ onPaste }: { onPaste: () => void }) {
  const {
    t, language, textSource, stats, loadFile, loadSample, clearText, downloadText, loadingText,
  } = useWorkbench();
  const n = (value: number) => formatNumber(value, language);

  return (
    <SectionFold
      title={t.textSection}
      badge={textSource ? `${n(stats.totalWords)} ${t.totalWords}` : '–'}
    >
      {textSource ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '7px 9px',
          background: 'var(--lt-bg-1)', border: '1px solid var(--lt-line-1)',
          borderRadius: 'var(--lt-r-sm)',
        }}>
          <Icon name="file" size={13} style={{ color: 'var(--lt-primary)' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 12, fontWeight: 500, overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{textSource.name}</div>
            <div style={{
              fontFamily: 'var(--lt-font-mono)', fontSize: 10.5, color: 'var(--lt-fg-3)',
            }}>
              {n(stats.characters)} {t.characters} · {n(stats.uniqueWords)} {t.uniqueWords}
            </div>
          </div>
          <IconButton name="download" size={26} title={t.downloadText} onClick={downloadText} />
          <IconButton name="trash" size={26} title={t.clearText} tone="err" onClick={clearText} />
        </div>
      ) : (
        <div style={{ fontSize: 12, color: 'var(--lt-fg-3)' }}>
          {loadingText ? '…' : t.noTextYet}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <FilePicker
          label={t.uploadText} accept=".txt,text/plain" onPick={loadFile} full
        />
        <GhostButton icon="file" full onClick={() => void loadSample()} title={t.sampleTextHint}>
          {t.sampleText}
        </GhostButton>
        <GhostButton icon="type" full onClick={onPaste}>{t.pasteText}</GhostButton>
        <GhostButton icon="folder" full disabled title={t.selectCorpusHint}>
          {t.selectCorpus}
        </GhostButton>
      </div>
    </SectionFold>
  );
}

// ── Stopwörter ──────────────────────────────────────────────────────────────

export function StopwordSection({ defaultOpen = true }: { defaultOpen?: boolean }) {
  const {
    t, language, stopwords, stopwordList, addStopword, removeStopword,
    loadStandardStopwords, downloadStopwords, clearStopwords,
    stopwordView, setStopwordView, stats,
  } = useWorkbench();
  const [draft, setDraft] = useState('');
  const [filter, setFilter] = useState('');
  const n = (value: number) => formatNumber(value, language);

  const query = filter.trim().toLowerCase();
  const shown = query ? stopwordList.filter((item) => item.word.includes(query)) : stopwordList;
  const inText = stopwordList.filter((item) => item.count > 0).length;
  const maxCount = stopwordList.reduce((max, item) => Math.max(max, item.count), 1);

  const submit = () => {
    if (!draft.trim()) return;
    // Mehrere Wörter auf einmal: durch Komma oder Leerzeichen getrennt.
    draft.split(/[\s,;]+/).forEach((word) => addStopword(word));
    setDraft('');
  };

  return (
    <SectionFold title={t.stopwordsTitle} badge={n(stopwords.size)} defaultOpen={defaultOpen}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px',
        background: 'var(--lt-bg-1)', border: '1px solid var(--lt-line-1)',
        borderRadius: 'var(--lt-r-sm)',
      }}>
        <Icon name="plus" size={12} style={{ color: 'var(--lt-fg-3)' }} />
        <input
          value={draft} onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}
          placeholder={t.addStopwordPlaceholder}
          aria-label={t.addStopword}
          style={{
            flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
            fontSize: 12, color: 'var(--lt-fg-1)', height: 22,
          }}
        />
        {draft.trim() && <IconButton name="check" size={22} onClick={submit} title={t.addStopword} />}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <GhostButton icon="book" full onClick={() => loadStandardStopwords('de')}>
          {t.loadStandardList} · {t.standardListGerman}
        </GhostButton>
        <GhostButton icon="book" full onClick={() => loadStandardStopwords('en')}>
          {t.loadStandardList} · {t.standardListEnglish}
        </GhostButton>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 11, color: 'var(--lt-fg-3)',
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: 3,
          background: stopwords.size ? 'var(--lt-err)' : 'var(--lt-fg-4)',
        }} />
        {t.hiddenWords} {n(stats.hiddenWords)}
        <span style={{ fontFamily: 'var(--lt-font-mono)', color: 'var(--lt-fg-4)' }}>
          · {n(inText)} {t.inText}
        </span>
        <span style={{ flex: 1 }} />
        <Segmented<StopwordView>
          value={stopwordView} onChange={setStopwordView}
          options={[{ value: 'list', label: t.viewAsList }, { value: 'cloud', label: t.viewAsCloud }]}
        />
      </div>

      {stopwords.size === 0 ? (
        <div style={{ fontSize: 12, color: 'var(--lt-fg-3)' }}>{t.stopwordsEmpty}</div>
      ) : (
        <>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px',
            background: 'var(--lt-bg-1)', border: '1px solid var(--lt-line-1)',
            borderRadius: 'var(--lt-r-sm)',
          }}>
            <Icon name="search" size={12} style={{ color: 'var(--lt-fg-3)' }} />
            <input
              value={filter} onChange={(e) => setFilter(e.target.value)}
              placeholder={t.searchPlaceholder} aria-label={t.searchPlaceholder}
              style={{
                flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
                fontSize: 12, color: 'var(--lt-fg-1)', height: 22,
              }}
            />
            <span style={{
              fontFamily: 'var(--lt-font-mono)', fontSize: 10, color: 'var(--lt-fg-4)',
            }}>{n(shown.length)}</span>
          </div>

          <div className="lt-scroll" style={{ maxHeight: 240, overflowY: 'auto', margin: '0 -2px' }}>
            {shown.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--lt-fg-3)', padding: '4px 2px' }}>
                {t.searchNoMatch}
              </div>
            )}

            {stopwordView === 'cloud' ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: 2 }}>
                {shown.map((item) => (
                  <Pill
                    key={item.word} tone={item.count > 0 ? 'err' : 'neutral'}
                    count={item.count > 0 ? item.count : undefined}
                    title={`${item.word} · ${item.count > 0 ? `${n(item.count)}× ${t.inText}` : t.notInText} — ${t.clickToRestore}`}
                    onRemove={() => removeStopword(item.word)}
                  >{item.word}</Pill>
                ))}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={headCell}>{t.word}</th>
                    <th style={headCell} colSpan={3}>{t.frequency}</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((item) => (
                    <tr
                      key={item.word} className="lt-row"
                      onClick={() => removeStopword(item.word)}
                      title={t.clickToRestore}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{
                        padding: '3px 6px', color: item.count > 0 ? 'var(--lt-err)' : 'var(--lt-fg-3)',
                        fontFamily: 'var(--lt-font-mono)', textDecoration: 'line-through',
                        textDecorationColor: 'var(--lt-line-3)',
                        maxWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{item.word}</td>
                      <td style={{ padding: '3px 6px', width: 62 }}>
                        <div style={{
                          height: 4, borderRadius: 2, background: 'var(--lt-bg-2)', overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${(item.count / maxCount) * 100}%`, height: '100%',
                            background: 'var(--lt-err-line)',
                          }} />
                        </div>
                      </td>
                      <td style={{
                        padding: '3px 6px', width: 40, textAlign: 'right',
                        fontFamily: 'var(--lt-font-mono)', fontSize: 10.5, color: 'var(--lt-fg-3)',
                      }}>{item.count}</td>
                      <td style={{ padding: '3px 4px', width: 18, color: 'var(--lt-fg-4)' }}>
                        <Icon name="x" size={9} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <GhostButton icon="download" full onClick={downloadStopwords}>
              {t.downloadStopwords}
            </GhostButton>
            <GhostButton icon="trash" full onClick={clearStopwords}>
              {t.clearStopwords}
            </GhostButton>
          </div>
        </>
      )}
    </SectionFold>
  );
}

// ── Darstellung des Korpus ──────────────────────────────────────────────────

const headCell: CSSProperties = {
  textAlign: 'left', padding: '0 6px 4px', fontSize: 10,
  letterSpacing: '0.08em', textTransform: 'uppercase',
  fontFamily: 'var(--lt-font-mono)', color: 'var(--lt-fg-4)', fontWeight: 500,
};

export function CorpusDisplaySection({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const {
    t, placeholderStyle, setPlaceholderStyle, maxCloudWords, setMaxCloudWords,
  } = useWorkbench();

  return (
    <SectionFold title={t.displaySection} badge="2" defaultOpen={defaultOpen}>
      <Field label={t.placeholderStyle} hint={t.placeholderHelp}>
        <Select<PlaceholderStyle>
          value={placeholderStyle} onChange={setPlaceholderStyle}
          options={[
            { value: 'underscore', label: t.placeholderUnderscore },
            { value: 'dot', label: t.placeholderDot },
            { value: 'dash', label: t.placeholderDash },
            { value: 'hidden', label: t.placeholderHidden },
          ]}
        />
      </Field>
      <Field label={t.maxWords} hint={t.maxWordsHelp}>
        <RangeSlider
          value={maxCloudWords} min={20} max={400} step={10}
          onChange={setMaxCloudWords} label={t.maxWords}
        />
      </Field>
    </SectionFold>
  );
}

// ── n-Gramm ─────────────────────────────────────────────────────────────────

export function NgramSection() {
  const { t, ngramConfig, setNgramConfig, availablePunctuation } = useWorkbench();
  const { weighting } = ngramConfig;

  const updateWeighting = (updates: Partial<EdgeWeighting>) => setNgramConfig({
    ...ngramConfig,
    weighting: { ...weighting, ...updates } as EdgeWeighting,
  });

  const switchType = (type: 'uniform' | 'distance') => setNgramConfig({
    ...ngramConfig,
    weighting: type === 'uniform'
      ? { type: 'uniform', value: 1 }
      : { type: 'distance', baseValue: 1, bonusRange: 2, bonusValue: 1 },
  });

  const toggleBoundary = (mark: string) => setNgramConfig({
    ...ngramConfig,
    sentenceBoundaries: ngramConfig.sentenceBoundaries.includes(mark)
      ? ngramConfig.sentenceBoundaries.filter((m) => m !== mark)
      : [...ngramConfig.sentenceBoundaries, mark],
  });

  return (
    <SectionFold title={t.ngramSection} badge={`n=${ngramConfig.windowSize}`}>
      <Field label={t.windowSize} hint={t.windowSizeHelp}>
        <RangeSlider
          value={ngramConfig.windowSize} min={2} max={15}
          onChange={(windowSize) => setNgramConfig({
            ...ngramConfig,
            windowSize,
            // Die Bonusdistanz darf das Fenster nicht überholen.
            weighting: weighting.type === 'distance'
              ? { ...weighting, bonusRange: Math.min(weighting.bonusRange, windowSize - 1) }
              : weighting,
          })}
          label={t.windowSize} marks={[2, 15]}
        />
      </Field>

      <Field label={t.edgeWeighting}>
        <Segmented<'uniform' | 'distance'>
          value={weighting.type} onChange={switchType} full
          options={[
            { value: 'uniform', label: t.weightingUniform },
            { value: 'distance', label: t.weightingDistance },
          ]}
        />
      </Field>

      {weighting.type === 'uniform' ? (
        <Field label={t.uniformValue}>
          <NumberInput
            value={weighting.value} min={1} max={10}
            onChange={(value) => updateWeighting({ value })}
          />
        </Field>
      ) : (
        <>
          <Field label={t.baseValue}>
            <NumberInput
              value={weighting.baseValue} min={1} max={10}
              onChange={(baseValue) => updateWeighting({ baseValue })}
            />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Field label={t.bonusRange}>
              <NumberInput
                value={weighting.bonusRange} min={1} max={Math.max(1, ngramConfig.windowSize - 1)}
                onChange={(bonusRange) => updateWeighting({ bonusRange })}
              />
            </Field>
            <Field label={t.bonusValue}>
              <NumberInput
                value={weighting.bonusValue} min={1} max={10}
                onChange={(bonusValue) => updateWeighting({ bonusValue })}
              />
            </Field>
          </div>
          <div style={{ fontSize: 11, color: 'var(--lt-fg-3)' }}>{t.bonusRangeHelp}</div>
        </>
      )}

      <Field label={t.sentenceBoundaries} hint={t.sentenceBoundariesHelp}>
        {availablePunctuation.length === 0 ? (
          <div style={{ fontSize: 11.5, color: 'var(--lt-fg-3)', fontStyle: 'italic' }}>
            {t.noPunctuationFound}
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {availablePunctuation.map((mark) => {
              const active = ngramConfig.sentenceBoundaries.includes(mark);
              return (
                <button
                  key={mark} type="button" onClick={() => toggleBoundary(mark)}
                  style={{
                    minWidth: 26, height: 24, padding: '0 6px',
                    fontFamily: 'var(--lt-font-mono)', fontSize: 12,
                    background: active ? 'var(--lt-primary-soft)' : 'var(--lt-bg-1)',
                    color: active ? 'var(--lt-primary-strong)' : 'var(--lt-fg-3)',
                    border: `1px solid ${active ? 'var(--lt-primary-line)' : 'var(--lt-line-1)'}`,
                    borderRadius: 'var(--lt-r-xs)', cursor: 'pointer',
                  }}
                >{mark}</button>
              );
            })}
          </div>
        )}
      </Field>
    </SectionFold>
  );
}

// ── Anzeigefilter des Graphen ───────────────────────────────────────────────

export function GraphDisplaySection() {
  const { t, language, display, setDisplay, graph, filteredGraph } = useWorkbench();
  const n = (value: number) => formatNumber(value, language);

  // Die Obergrenzen kommen aus dem **ungefilterten** Graphen — sonst schrumpft
  // der Regler mit seiner eigenen Wirkung und lässt sich nicht zurückdrehen.
  const maxFrequency = Math.max(2, ...graph.nodes.map((node) => node.frequency));
  const maxWeight = Math.max(2, ...graph.edges.map((edge) => edge.weight));

  return (
    <SectionFold title={t.displayFilters} badge={`${n(filteredGraph.nodes.length)} ${t.nodes}`}>
      <Field label={t.minNodeFrequency}>
        <RangeSlider
          value={Math.min(display.minNodeFrequency, maxFrequency)}
          min={1} max={maxFrequency} label={t.minNodeFrequency}
          onChange={(minNodeFrequency) => setDisplay({ ...display, minNodeFrequency })}
          marks={[1, maxFrequency]}
        />
      </Field>
      <Field label={t.minEdgeWeight}>
        <RangeSlider
          value={Math.min(display.minEdgeWeight, maxWeight)}
          min={1} max={maxWeight} label={t.minEdgeWeight}
          onChange={(minEdgeWeight) => setDisplay({ ...display, minEdgeWeight })}
          marks={[1, maxWeight]}
        />
      </Field>
      <Toggle
        checked={display.showLabels} label={t.showLabels}
        onChange={(showLabels) => setDisplay({ ...display, showLabels })}
      />
      <Toggle
        checked={display.showEdgeLabels} label={t.showEdgeLabels}
        onChange={(showEdgeLabels) => setDisplay({ ...display, showEdgeLabels })}
      />
      <Field label={t.graphTheme}>
        <Select<GraphThemeName>
          value={display.theme} onChange={(theme) => setDisplay({ ...display, theme })}
          options={graphThemeNames.map((name) => ({
            value: name, label: graphThemeLabels[name][language],
          }))}
        />
      </Field>
      <Field label={t.graphStats}>
        <GraphStatsRow />
      </Field>
      {graph.nodes.length > 0 && filteredGraph.nodes.length === 0 && (
        <Callout tone="warn" icon="warn">{t.graphEmpty}</Callout>
      )}
    </SectionFold>
  );
}

// ── Kennzahlen des Graphen (Konfigurator-Fuß) ───────────────────────────────

export function GraphStatsRow() {
  const { t, language, graphStats } = useWorkbench();
  if (!graphStats) return null;
  const n = (value: number) => formatNumber(value, language);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      <MonoBadge>{t.nodes} {n(graphStats.nodeCount)}</MonoBadge>
      <MonoBadge>{t.edges} {n(graphStats.edgeCount)}</MonoBadge>
      <MonoBadge>{t.maxFrequency} {n(graphStats.maxNodeFrequency)}</MonoBadge>
      <MonoBadge>{t.maxWeight} {n(graphStats.maxEdgeWeight)}</MonoBadge>
      <MonoBadge>{t.avgWeight} {graphStats.avgEdgeWeight}</MonoBadge>
    </div>
  );
}

/** Kleines Eingabefeld für die Werkzeugleisten der Ergebnisflächen. */
export function ToolbarSearch({
  value, onChange, placeholder, width = 200, inputId, onKeyDown, right, title,
}: {
  value: string; onChange: (v: string) => void; placeholder: string;
  width?: number | string; inputId?: string; title?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  right?: React.ReactNode;
}) {
  return (
    <div title={title} style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px', height: 26,
      width, background: 'var(--lt-bg-1)', border: '1px solid var(--lt-line-1)',
      borderRadius: 'var(--lt-r-sm)', flexShrink: 0, minWidth: 0,
    }}>
      <Icon name="search" size={11} style={{ color: 'var(--lt-fg-3)', flexShrink: 0 }} />
      <input
        id={inputId} value={value} placeholder={placeholder} aria-label={placeholder}
        onChange={(e) => onChange(e.target.value)} onKeyDown={onKeyDown}
        style={{
          flex: 1, minWidth: 0, height: 22, padding: 0, border: 'none', outline: 'none',
          background: 'transparent', fontSize: 12, color: 'var(--lt-fg-1)',
        }}
      />
      {right}
    </div>
  );
}
