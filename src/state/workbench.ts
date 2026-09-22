// Der Vertrag der Werkbank: Typen, Kontext und Zugriffs-Hook.
//
// Getrennt vom Provider (WorkbenchProvider.tsx), weil ein Modul, das eine
// Komponente ausführt, nichts anderes ausführen sollte — sonst greift Fast
// Refresh in der Entwicklung nicht.

import { createContext, useContext } from 'react';
import type { Translations, UILanguage } from '../config/i18n';
import type { StopwordLanguage } from '../data/stopwords';
import type { getGraphStats } from '../hooks/useGraphBuilder';
import type { PlaceholderStyle, Token } from '../types';
import type { GraphData, GraphDisplayConfig, NGramConfig } from '../types/graph';

export type LayoutMode = 'left' | 'right' | 'bottom';
export type ModuleId = 'intro' | 'exclude' | 'graph';
export type Theme = 'light' | 'dark';
export type StopwordView = 'list' | 'cloud';

export interface TextSource {
  kind: 'file' | 'paste' | 'sample';
  name: string;
}

export interface WordCount { word: string; count: number }

export interface WorkbenchValue {
  // ── Rahmen ────────────────────────────────────────────────────────────
  t: Translations;
  language: UILanguage;
  setLanguage: (language: UILanguage) => void;
  theme: Theme;
  toggleTheme: () => void;
  layout: LayoutMode;
  setLayout: (layout: LayoutMode) => void;
  railPinned: boolean;
  toggleRail: () => void;
  activeModule: ModuleId;
  setActiveModule: (module: ModuleId) => void;

  // ── Text ──────────────────────────────────────────────────────────────
  rawText: string;
  textSource: TextSource | null;
  tokens: Token[];
  applyText: (text: string, source: TextSource) => void;
  loadFile: (file: File) => void;
  loadSample: () => Promise<void>;
  clearText: () => void;
  downloadText: () => void;
  loadingText: boolean;
  error: string;
  setError: (message: string) => void;

  // ── Stopwörter ────────────────────────────────────────────────────────
  stopwords: Set<string>;
  addStopword: (word: string) => void;
  removeStopword: (word: string) => void;
  toggleStopword: (word: string) => void;
  clearStopwords: () => void;
  loadStandardStopwords: (language: StopwordLanguage) => void;
  downloadStopwords: () => void;
  stopwordList: WordCount[];
  visibleWords: WordCount[];

  // ── Darstellung des Korpus ────────────────────────────────────────────
  placeholderStyle: PlaceholderStyle;
  setPlaceholderStyle: (style: PlaceholderStyle) => void;
  stopwordView: StopwordView;
  setStopwordView: (view: StopwordView) => void;
  maxCloudWords: number;
  setMaxCloudWords: (value: number) => void;

  // ── Kennzahlen ────────────────────────────────────────────────────────
  stats: {
    totalWords: number;
    uniqueWords: number;
    hiddenWords: number;
    hiddenShare: number;
    visibleWords: number;
    characters: number;
  };

  // ── Graph ─────────────────────────────────────────────────────────────
  ngramConfig: NGramConfig;
  setNgramConfig: (config: NGramConfig) => void;
  display: GraphDisplayConfig;
  setDisplay: (config: GraphDisplayConfig) => void;
  availablePunctuation: string[];
  graph: GraphData;
  filteredGraph: GraphData;
  graphStats: ReturnType<typeof getGraphStats> | null;
  graphBuilt: boolean;
  graphStale: boolean;
  buildGraph: () => void;

  reset: () => void;
}

export const WorkbenchContext = createContext<WorkbenchValue | null>(null);

export function useWorkbench(): WorkbenchValue {
  const value = useContext(WorkbenchContext);
  if (!value) throw new Error('useWorkbench außerhalb des Providers');
  return value;
}
