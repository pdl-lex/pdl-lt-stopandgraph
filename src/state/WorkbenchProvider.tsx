// Der Zustand der Werkbank: Oberfläche (Sprache, Theme, Anordnung), Text,
// Stopwörter und Graph.
//
// Alles, was Kopfzeile, Leiste, Konfigurator, Ergebnisfläche, Statuszeile und
// Befehlspalette gemeinsam brauchen, steht hier — sonst müsste es durch drei
// Ebenen gereicht werden. Rein örtlicher Zustand (Suchfeld, Seitenzahl,
// aufgeklappte Sektion) bleibt in der jeweiligen Komponente.
//
// Die Typen und der Zugriffs-Hook liegen daneben in workbench.ts.

import {
  useCallback, useEffect, useMemo, useState, type ReactNode,
} from 'react';
import { getTranslation, type UILanguage } from '../config/i18n';
import { getStandardStopwords, type StopwordLanguage } from '../data/stopwords';
import {
  buildCooccurrenceGraph, detectPunctuation, filterGraph, getGraphStats,
} from '../hooks/useGraphBuilder';
import { calculateFrequencies, generateDownloadText, tokenizeText } from '../hooks/useTokenizer';
import type { PlaceholderStyle, Token } from '../types';
import {
  defaultGraphDisplayConfig, defaultNGramConfig,
  type GraphData, type GraphDisplayConfig, type NGramConfig,
} from '../types/graph';
import {
  WorkbenchContext,
  type LayoutMode, type ModuleId, type StopwordView, type TextSource,
  type Theme, type WordCount, type WorkbenchValue,
} from './workbench';

const EMPTY_GRAPH: GraphData = { nodes: [], edges: [] };

function readStored<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return allowed.includes(value as T) ? (value as T) : fallback;
  } catch {
    return fallback;
  }
}

function store(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* privates Fenster */ }
}

export function WorkbenchProvider({ children }: { children: ReactNode }) {
  // ── Oberfläche ──────────────────────────────────────────────────────────
  const [language, setLanguage] = useState<UILanguage>(
    () => readStored('lt.language', ['de', 'en'] as const, 'de'));
  const [theme, setTheme] = useState<Theme>(
    () => readStored('lt.theme', ['light', 'dark'] as const, 'light'));
  const [layout, setLayout] = useState<LayoutMode>(
    () => readStored('lt.layout', ['left', 'right', 'bottom'] as const, 'left'));
  const [railPinned, setRailPinned] = useState(false);
  const [activeModule, setActiveModule] = useState<ModuleId>('intro');

  // ── Inhalt ──────────────────────────────────────────────────────────────
  const [rawText, setRawText] = useState('');
  const [textSource, setTextSource] = useState<TextSource | null>(null);
  const [loadingText, setLoadingText] = useState(false);
  const [error, setError] = useState('');
  const [stopwords, setStopwords] = useState<Set<string>>(new Set());

  const [placeholderStyle, setPlaceholderStyle] = useState<PlaceholderStyle>('underscore');
  const [stopwordView, setStopwordView] = useState<StopwordView>('list');
  const [maxCloudWords, setMaxCloudWords] = useState(100);

  const [ngramConfig, setNgramConfig] = useState<NGramConfig>(defaultNGramConfig);
  const [display, setDisplay] = useState<GraphDisplayConfig>(defaultGraphDisplayConfig);
  const [graph, setGraph] = useState<GraphData>(EMPTY_GRAPH);

  // Woraus der vorhandene Graph gebaut wurde. `tokens` und `ngramConfig` sind
  // memoisiert bzw. unveränderlich — ein Identitätsvergleich genügt, um zu
  // erkennen, dass der gezeigte Graph nicht mehr zum Text passt.
  const [builtFrom, setBuiltFrom] = useState<{ tokens: Token[]; config: NGramConfig } | null>(null);

  const t = useMemo(() => getTranslation(language), [language]);

  // Theme und Sprache hängen an :root, wie im Handoff vorgesehen.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    store('lt.theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    store('lt.language', language);
  }, [language]);

  useEffect(() => { store('lt.layout', layout); }, [layout]);

  // ── Abgeleitetes ────────────────────────────────────────────────────────
  const tokens = useMemo(
    () => (rawText ? tokenizeText(rawText, stopwords) : []),
    [rawText, stopwords],
  );

  const frequencies = useMemo(() => calculateFrequencies(tokens), [tokens]);

  const visibleWords = useMemo(() => {
    const result: WordCount[] = [];
    frequencies.forEach((value) => {
      if (value.isWord && !value.isStopword) result.push({ word: value.word, count: value.count });
    });
    return result.sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));
  }, [frequencies]);

  const stopwordList = useMemo(() => {
    const result: WordCount[] = [];
    frequencies.forEach((value, key) => {
      if (value.isStopword) result.push({ word: key, count: value.count });
    });
    // Stopwörter, die im Text gar nicht vorkommen, gehören trotzdem in die
    // Liste — sonst verschwände eine geladene Standardliste beinahe ganz.
    stopwords.forEach((word) => {
      if (!frequencies.has(word)) result.push({ word, count: 0 });
    });
    return result.sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));
  }, [frequencies, stopwords]);

  const stats = useMemo(() => {
    // Nur Wörter zählen; Satzzeichen sind zwar Token, aber keine Wörter.
    const content = tokens.filter((token) => token.type === 'word');
    const hidden = content.filter((token) => token.isStopword).length;
    let unique = 0;
    frequencies.forEach((entry) => { if (entry.isWord) unique += 1; });
    return {
      totalWords: content.length,
      uniqueWords: unique,
      hiddenWords: hidden,
      hiddenShare: content.length > 0 ? hidden / content.length : 0,
      visibleWords: content.length - hidden,
      characters: rawText.length,
    };
  }, [tokens, frequencies, rawText.length]);

  const availablePunctuation = useMemo(() => detectPunctuation(tokens), [tokens]);

  const filteredGraph = useMemo(
    () => filterGraph(graph, display.minEdgeWeight, display.minNodeFrequency),
    [graph, display.minEdgeWeight, display.minNodeFrequency],
  );

  const graphStats = useMemo(
    () => (graph.nodes.length === 0 ? null : getGraphStats(filteredGraph)),
    [graph.nodes.length, filteredGraph],
  );

  const graphBuilt = builtFrom !== null;
  const graphStale = builtFrom !== null
    && (builtFrom.tokens !== tokens || builtFrom.config !== ngramConfig);

  // ── Aktionen ────────────────────────────────────────────────────────────
  const applyText = useCallback((text: string, source: TextSource) => {
    setRawText(text);
    setTextSource(text ? source : null);
    setGraph(EMPTY_GRAPH);
    setBuiltFrom(null);
    setError('');
    // Der nächste Schritt nach dem Laden ist immer der Wortausschluss; die
    // Einführung hat dann ihren Zweck erfüllt.
    if (text) setActiveModule('exclude');
  }, []);

  const loadFile = useCallback((file: File) => {
    setLoadingText(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      applyText(String(e.target?.result ?? ''), { kind: 'file', name: file.name });
      setLoadingText(false);
    };
    reader.onerror = () => {
      setError(`${file.name}: ${reader.error?.message ?? 'read error'}`);
      setLoadingText(false);
    };
    reader.readAsText(file);
  }, [applyText]);

  const loadSample = useCallback(async () => {
    setLoadingText(true);
    try {
      // Relativ zur Basis, damit der Beispieltext auch unter einem
      // Unterpfad gefunden wird (siehe vite.config.ts / Caddyfile).
      const response = await fetch(`${import.meta.env.BASE_URL}novelle.txt`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      applyText(await response.text(), { kind: 'sample', name: 'novelle.txt' });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingText(false);
    }
  }, [applyText]);

  const clearText = useCallback(() => {
    setRawText('');
    setTextSource(null);
    setGraph(EMPTY_GRAPH);
    setBuiltFrom(null);
  }, []);

  const addStopword = useCallback((word: string) => {
    const normalized = word.trim().toLowerCase();
    if (!normalized) return;
    setStopwords((prev) => {
      if (prev.has(normalized)) return prev;
      const next = new Set(prev);
      next.add(normalized);
      return next;
    });
  }, []);

  const removeStopword = useCallback((word: string) => {
    const normalized = word.trim().toLowerCase();
    setStopwords((prev) => {
      if (!prev.has(normalized)) return prev;
      const next = new Set(prev);
      next.delete(normalized);
      return next;
    });
  }, []);

  const toggleStopword = useCallback((word: string) => {
    const normalized = word.trim().toLowerCase();
    if (!normalized) return;
    setStopwords((prev) => {
      const next = new Set(prev);
      if (next.has(normalized)) next.delete(normalized);
      else next.add(normalized);
      return next;
    });
  }, []);

  const clearStopwords = useCallback(() => setStopwords(new Set()), []);

  const loadStandardStopwords = useCallback((stopwordLanguage: StopwordLanguage) => {
    const standard = getStandardStopwords(stopwordLanguage);
    setStopwords((prev) => {
      const next = new Set(prev);
      standard.forEach((word) => next.add(word.toLowerCase()));
      return next;
    });
  }, []);

  const download = useCallback((content: string, filename: string, type: string) => {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const downloadStopwords = useCallback(() => {
    const content = stopwordList.map((item) => item.word).sort().join('\n');
    download(content, 'stopwords.txt', 'text/plain;charset=utf-8');
  }, [download, stopwordList]);

  const downloadText = useCallback(() => {
    download(generateDownloadText(tokens), 'cleaned_text.txt', 'text/plain;charset=utf-8');
  }, [download, tokens]);

  const buildGraph = useCallback(() => {
    setGraph(buildCooccurrenceGraph(tokens, ngramConfig));
    setBuiltFrom({ tokens, config: ngramConfig });
  }, [tokens, ngramConfig]);

  const reset = useCallback(() => {
    setRawText('');
    setTextSource(null);
    setStopwords(new Set());
    setGraph(EMPTY_GRAPH);
    setBuiltFrom(null);
    setNgramConfig(defaultNGramConfig);
    setDisplay(defaultGraphDisplayConfig);
    setPlaceholderStyle('underscore');
    setError('');
    setActiveModule('intro');
  }, []);

  const value: WorkbenchValue = {
    t, language, setLanguage,
    theme, toggleTheme: () => setTheme((v) => (v === 'light' ? 'dark' : 'light')),
    layout, setLayout,
    railPinned, toggleRail: () => setRailPinned((v) => !v),
    activeModule, setActiveModule,

    rawText, textSource, tokens, applyText, loadFile, loadSample, clearText,
    downloadText, loadingText, error, setError,

    stopwords, addStopword, removeStopword, toggleStopword, clearStopwords,
    loadStandardStopwords, downloadStopwords, stopwordList, visibleWords,

    placeholderStyle, setPlaceholderStyle,
    stopwordView, setStopwordView,
    maxCloudWords, setMaxCloudWords,

    stats,

    ngramConfig, setNgramConfig, display, setDisplay, availablePunctuation,
    graph, filteredGraph, graphStats, graphBuilt, graphStale, buildGraph,

    reset,
  };

  return <WorkbenchContext.Provider value={value}>{children}</WorkbenchContext.Provider>;
}
