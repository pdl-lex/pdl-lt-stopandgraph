// Befehlspalette (Handoff §6): 580 px, mittig oben, voll tastaturbedienbar.
//
// Sie ist der zweite Weg zu jedem Befehl der Oberfläche — jede Schaltfläche
// der Werkbank hat hier ihren Zwilling, damit nichts nur hinter einem Icon
// steckt. Zusätzlich lassen sich Wörter direkt aus der Wortwolke ausschließen.

import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon, type IconName } from '../design/icons';
import { kc } from '../design/platform';
import { Kbd } from '../design/widgets';
import { useWorkbench } from '../state/workbench';

interface Command {
  group: string;
  label: string;
  icon: IconName;
  hint?: string;
  run: () => void;
}

export function CommandPalette({
  onClose, onPickFile,
}: { onClose: () => void; onPickFile: () => void }) {
  const {
    t, language, setLanguage, theme, toggleTheme, layout, setLayout, toggleRail,
    setActiveModule, rawText, loadSample, clearText, downloadText, downloadStopwords,
    loadStandardStopwords, clearStopwords, addStopword, visibleWords, stopwords,
    buildGraph, graphBuilt, reset, setStopwordView, stopwordView,
  } = useWorkbench();
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const commands = useMemo<Command[]>(() => {
    const act = (fn: () => void) => () => { fn(); onClose(); };
    const list: Command[] = [
      { group: t.groupModules, label: t.navIntro, icon: 'book', run: act(() => setActiveModule('intro')) },
      { group: t.groupModules, label: t.navExclude, icon: 'type', run: act(() => setActiveModule('exclude')) },
      { group: t.groupModules, label: t.navGraph, icon: 'layers', run: act(() => setActiveModule('graph')) },

      { group: t.groupText, label: t.uploadText, icon: 'upload', run: act(onPickFile) },
      { group: t.groupText, label: t.sampleText, icon: 'file', run: act(() => void loadSample()) },
    ];

    if (rawText) {
      list.push(
        { group: t.groupText, label: t.downloadText, icon: 'download', run: act(downloadText) },
        { group: t.groupText, label: t.clearText, icon: 'trash', run: act(clearText) },
      );
    }

    list.push(
      { group: t.groupStopwords, label: `${t.loadStandardList} · ${t.standardListGerman}`, icon: 'book', run: act(() => loadStandardStopwords('de')) },
      { group: t.groupStopwords, label: `${t.loadStandardList} · ${t.standardListEnglish}`, icon: 'book', run: act(() => loadStandardStopwords('en')) },
      {
        group: t.groupStopwords,
        label: stopwordView === 'list' ? t.viewAsCloud : t.viewAsList,
        icon: stopwordView === 'list' ? 'cloud' : 'table',
        run: act(() => setStopwordView(stopwordView === 'list' ? 'cloud' : 'list')),
      },
    );

    if (stopwords.size > 0) {
      list.push(
        { group: t.groupStopwords, label: t.downloadStopwords, icon: 'download', run: act(downloadStopwords) },
        { group: t.groupStopwords, label: t.clearStopwords, icon: 'trash', run: act(clearStopwords) },
      );
    }

    // Die zehn häufigsten verbliebenen Wörter direkt ausschließbar — das ist
    // der „Tags"-Teil der Palette aus dem Handoff, übersetzt auf dieses Modul.
    for (const item of visibleWords.slice(0, 10)) {
      list.push({
        group: t.groupStopwords,
        label: `${t.addStopword} · ${item.word}`,
        icon: 'x',
        hint: String(item.count),
        run: act(() => addStopword(item.word)),
      });
    }

    if (rawText) {
      list.push({
        group: t.groupGraph,
        label: graphBuilt ? t.regenerateGraph : t.generateGraph,
        icon: 'play', hint: kc('↵'),
        run: act(() => { buildGraph(); setActiveModule('graph'); }),
      });
    }

    list.push(
      { group: t.groupView, label: t.layoutLeft, icon: 'panelL', hint: layout === 'left' ? '✓' : undefined, run: act(() => setLayout('left')) },
      { group: t.groupView, label: t.layoutRight, icon: 'panelR', hint: layout === 'right' ? '✓' : undefined, run: act(() => setLayout('right')) },
      { group: t.groupView, label: t.layoutTop, icon: 'panelT', hint: layout === 'bottom' ? '✓' : undefined, run: act(() => setLayout('bottom')) },
      { group: t.groupView, label: t.pinNavigation, icon: 'pin', run: act(toggleRail) },
      {
        group: t.groupView,
        label: theme === 'light' ? t.themeDark : t.themeLight,
        icon: theme === 'light' ? 'moon' : 'sun',
        run: act(toggleTheme),
      },
      {
        group: t.groupView,
        label: language === 'de' ? 'English' : 'Deutsch',
        icon: 'settings',
        run: act(() => setLanguage(language === 'de' ? 'en' : 'de')),
      },
      { group: t.groupView, label: t.resetAll, icon: 'refresh', run: act(reset) },
    );

    return list;
  }, [t, language, theme, layout, rawText, graphBuilt, stopwordView, stopwords.size,
    visibleWords, onClose, onPickFile, setActiveModule, loadSample, clearText,
    downloadText, downloadStopwords, loadStandardStopwords, clearStopwords,
    addStopword, buildGraph, setLayout, toggleRail, toggleTheme, setLanguage,
    reset, setStopwordView]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? commands.filter((c) => `${c.group} ${c.label}`.toLowerCase().includes(q)) : commands;
  }, [commands, query]);

  // Bei Tastaturnavigation den markierten Eintrag in Sicht halten.
  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: 'nearest' });
  }, [cursor, query]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(c + 1, visible.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); visible[cursor]?.run(); }
    else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(8,12,10,0.42)', backdropFilter: 'blur(1.5px)',
        display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '10vh',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog" aria-modal="true" aria-label={t.commands}
        style={{
          width: 'min(580px, 92vw)', background: 'var(--lt-bg-0)',
          border: '1px solid var(--lt-line-2)', borderRadius: 'var(--lt-r-md)',
          boxShadow: 'var(--lt-shadow-pop)', overflow: 'hidden',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', gap: 9, padding: '11px 13px',
          borderBottom: '1px solid var(--lt-line-1)',
        }}>
          <Icon name="search" size={14} style={{ color: 'var(--lt-fg-3)' }} />
          <input
            ref={inputRef} value={query}
            onChange={(e) => { setQuery(e.target.value); setCursor(0); }}
            onKeyDown={onKeyDown} placeholder={t.commandPlaceholder}
            style={{
              flex: 1, border: 0, outline: 'none', background: 'transparent',
              fontSize: 14, color: 'var(--lt-fg-1)',
            }}
          />
          <Kbd>Esc</Kbd>
        </div>

        <div ref={listRef} className="lt-scroll" style={{ maxHeight: '50vh', overflowY: 'auto', padding: 6 }}>
          {visible.length === 0 && (
            <div style={{ padding: 14, fontSize: 12.5, color: 'var(--lt-fg-3)' }}>{t.noCommandMatch}</div>
          )}
          {visible.map((command, i) => {
            const header = command.group !== visible[i - 1]?.group ? command.group : null;
            return (
              <div key={`${command.group}-${command.label}`}>
                {header && <div className="lt-eyebrow" style={{ padding: '8px 8px 4px' }}>{header}</div>}
                <button
                  type="button"
                  data-active={i === cursor}
                  onMouseEnter={() => setCursor(i)}
                  onClick={command.run}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9, width: '100%',
                    padding: '7px 9px', borderRadius: 'var(--lt-r-sm)', border: 0,
                    background: i === cursor ? 'var(--lt-primary-soft)' : 'transparent',
                    color: i === cursor ? 'var(--lt-primary)' : 'var(--lt-fg-1)',
                    cursor: 'pointer', fontSize: 13, textAlign: 'left',
                  }}
                >
                  <Icon name={command.icon} size={14} />
                  <span style={{ flex: 1 }}>{command.label}</span>
                  {command.hint && <Kbd>{command.hint}</Kbd>}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
