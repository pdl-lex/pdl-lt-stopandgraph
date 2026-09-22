// Modul-Leiste, 56 px eingeklappt / 248 px ausgeklappt (Handoff §2).
//
// Eingeklappt zeigt sie nur Glyphen mit einer kleinen Kennzahl; beim
// Überfahren klappt sie als Flyout auf, der Pin hält sie offen. Unten stehen
// die Aktionen, die zu keinem Modul gehören: alles zurücksetzen.

import { useState } from 'react';
import { Icon, type IconName } from '../design/icons';
import { IconButton } from '../design/ui';
import { formatNumber } from '../config/i18n';
import { useWorkbench, type ModuleId } from '../state/workbench';

interface Entry {
  id: ModuleId;
  icon: IconName;
  label: 'navIntro' | 'navExclude' | 'navGraph';
  group: 'navStart' | 'navAnalysis';
}

const ENTRIES: Entry[] = [
  { id: 'intro', icon: 'book', label: 'navIntro', group: 'navStart' },
  { id: 'exclude', icon: 'type', label: 'navExclude', group: 'navAnalysis' },
  { id: 'graph', icon: 'layers', label: 'navGraph', group: 'navAnalysis' },
];

export function Rail() {
  const {
    t, language, activeModule, setActiveModule, railPinned, toggleRail,
    rawText, stopwords, filteredGraph, reset,
  } = useWorkbench();
  const [hovered, setHovered] = useState(false);
  const expanded = railPinned || hovered;

  const counts: Record<ModuleId, number | null> = {
    intro: null,
    exclude: stopwords.size || null,
    graph: filteredGraph.nodes.length || null,
  };

  return (
    <nav
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        gridArea: 'rail', position: 'relative',
        background: 'var(--lt-bg-0)', borderRight: '1px solid var(--lt-line-1)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{
        position: expanded && !railPinned ? 'absolute' : 'static',
        top: 0, left: 0, zIndex: 60,
        width: expanded ? 248 : 56, height: '100%',
        background: 'var(--lt-bg-0)',
        boxShadow: expanded && !railPinned ? 'var(--lt-shadow-pop)' : undefined,
        borderRight: expanded && !railPinned ? '1px solid var(--lt-line-1)' : undefined,
        display: 'flex', flexDirection: 'column', padding: 8, gap: 3,
        transition: 'width .18s ease', overflow: 'hidden',
      }}>
        {expanded && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 4px 8px' }}>
            <span className="lt-eyebrow" style={{ flex: 1 }}>{t.navigation}</span>
            <IconButton
              name="pin" size={22} active={railPinned}
              title={t.pinNavigation} onClick={toggleRail}
            />
          </div>
        )}

        {ENTRIES.map((entry, index) => {
          const active = activeModule === entry.id;
          const disabled = entry.id !== 'intro' && !rawText;
          const count = counts[entry.id];
          // Gruppenkopf nur beim ersten Eintrag einer Gruppe. ENTRIES ist
          // unveränderlich, deshalb genügt der Blick auf den Vorgänger.
          const header = expanded && entry.group !== ENTRIES[index - 1]?.group
            ? t[entry.group] : null;

          return (
            <div key={entry.id}>
              {header && (
                <div className="lt-eyebrow" style={{ padding: '8px 4px 4px', fontSize: 10 }}>
                  {header}
                </div>
              )}
              <button
                type="button" disabled={disabled}
                onClick={() => { setActiveModule(entry.id); setHovered(false); }}
                title={expanded ? undefined : t[entry.label]}
                style={{
                  position: 'relative',
                  display: 'flex', alignItems: 'center', gap: 10,
                  height: 40, padding: expanded ? '0 10px' : 0, width: '100%',
                  justifyContent: expanded ? 'flex-start' : 'center',
                  background: active ? 'var(--lt-primary-soft)' : 'transparent',
                  border: `1px solid ${active ? 'var(--lt-primary-line)' : 'transparent'}`,
                  borderRadius: 'var(--lt-r-sm)',
                  color: disabled ? 'var(--lt-fg-4)' : active ? 'var(--lt-primary)' : 'var(--lt-fg-2)',
                  cursor: disabled ? 'default' : 'pointer',
                  fontSize: 12.5, fontWeight: active ? 600 : 500,
                }}
              >
                <Icon name={entry.icon} size={16} />
                {expanded && <span style={{ flex: 1, textAlign: 'left' }}>{t[entry.label]}</span>}
                {count != null && (
                  <span style={{
                    position: expanded ? 'static' : 'absolute',
                    top: 4, right: 6,
                    fontFamily: 'var(--lt-font-mono)', fontSize: 9.5,
                    color: 'var(--lt-fg-4)', lineHeight: 1,
                  }}>{formatNumber(count, language)}</span>
                )}
              </button>
            </div>
          );
        })}

        <div style={{ flex: 1 }} />

        <button
          type="button" onClick={reset} title={`${t.resetAll} — ${t.resetHint}`}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            height: 40, padding: expanded ? '0 10px' : 0, width: '100%',
            justifyContent: expanded ? 'flex-start' : 'center',
            background: 'transparent', border: '1px solid transparent',
            borderRadius: 'var(--lt-r-sm)', color: 'var(--lt-fg-3)',
            cursor: 'pointer', fontSize: 12.5,
          }}
        >
          <Icon name="refresh" size={16} />
          {expanded && <span>{t.resetAll}</span>}
        </button>
      </div>
    </nav>
  );
}
