// Werkbank-Raster nach dem Handoff: Kopfzeile 44, Leiste 56↔248,
// Konfigurator 380, Statuszeile 32 — in drei umschaltbaren Anordnungen.

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import './styles/tokens.css';
import './styles/app.css';
import { useIsMobile } from './design/useIsMobile';
import { CommandPalette } from './layout/CommandPalette';
import { ConfigPane } from './layout/ConfigPane';
import { Header } from './layout/Header';
import { MobileView } from './layout/Mobile';
import { Rail } from './layout/Rail';
import { StatusBar } from './layout/StatusBar';
import { PasteDialog } from './layout/sections';
import { ExcludePane } from './panes/ExcludePane';
import { GraphPane } from './panes/GraphPane';
import { IntroPane } from './panes/IntroPane';
import { WorkbenchProvider } from './state/WorkbenchProvider';
import { useWorkbench, type LayoutMode } from './state/workbench';

function gridFor(layout: LayoutMode, railWidth: number): CSSProperties {
  if (layout === 'right') {
    return {
      gridTemplateColumns: `${railWidth}px 1fr 380px`,
      gridTemplateRows: '44px 1fr 32px',
      gridTemplateAreas: '"head head head" "rail main cfg" "stat stat stat"',
    };
  }
  if (layout === 'bottom') {
    return {
      gridTemplateColumns: `${railWidth}px 1fr`,
      gridTemplateRows: '44px minmax(300px, 46%) 1fr 32px',
      gridTemplateAreas: '"head head" "rail cfg" "rail main" "stat stat"',
    };
  }
  return {
    gridTemplateColumns: `${railWidth}px 380px 1fr`,
    gridTemplateRows: '44px 1fr 32px',
    gridTemplateAreas: '"head head head" "rail cfg main" "stat stat stat"',
  };
}

function Workbench() {
  const {
    layout, railPinned, activeModule, rawText, buildGraph, setActiveModule,
  } = useWorkbench();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      } else if (meta && e.key === 'Enter') {
        e.preventDefault();
        if (rawText) { buildGraph(); setActiveModule('graph'); }
      } else if (meta && e.key.toLowerCase() === 'f') {
        // Nur abfangen, wenn es ein Suchfeld zu treffen gibt — sonst bleibt
        // die Suche des Browsers, wo sie hingehört.
        const field = document.getElementById('corpus-search') as HTMLInputElement | null;
        if (field) { e.preventDefault(); field.focus(); field.select(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [buildGraph, rawText, setActiveModule]);

  if (isMobile) return <MobileView />;

  return (
    <div style={{
      width: '100%', height: '100%', display: 'grid',
      color: 'var(--lt-fg-1)', background: 'var(--lt-bg-1)',
      transition: 'grid-template-columns .18s ease',
      ...gridFor(layout, railPinned ? 248 : 56),
    }}>
      <Header onOpenPalette={() => setPaletteOpen(true)} />
      <Rail />
      <ConfigPane layout={layout} />
      {activeModule === 'intro' && <IntroPane onPaste={() => setPasteOpen(true)} />}
      {activeModule === 'exclude' && <ExcludePane onPaste={() => setPasteOpen(true)} />}
      {activeModule === 'graph' && <GraphPane />}
      <StatusBar />

      {paletteOpen && (
        <CommandPalette
          onClose={() => setPaletteOpen(false)}
          onPickFile={() => fileRef.current?.click()}
        />
      )}
      {pasteOpen && <PasteDialog onClose={() => setPasteOpen(false)} />}

      <HiddenFileInput inputRef={fileRef} />
    </div>
  );
}

/** Dateiwahl für die Befehlspalette: Ein Klick auf „Datei hochladen" dort
 *  muss denselben Dialog öffnen wie die Schaltfläche im Konfigurator. */
function HiddenFileInput({ inputRef }: { inputRef: React.RefObject<HTMLInputElement | null> }) {
  const { loadFile } = useWorkbench();
  return (
    <input
      ref={inputRef} type="file" accept=".txt,text/plain" style={{ display: 'none' }}
      onChange={(e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (file) loadFile(file);
      }}
    />
  );
}

export default function App() {
  return (
    <WorkbenchProvider>
      <Workbench />
    </WorkbenchProvider>
  );
}
