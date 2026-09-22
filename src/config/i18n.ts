// Zweisprachige Oberfläche (Deutsch/Englisch).
//
// Die früher getrennten Dateien i18n.ts und i18n-graph.ts sind hier
// zusammengeführt: Es gibt nur noch einen Satz Schlüssel, damit Kopfzeile,
// Statuszeile und Befehlspalette nicht aus zwei Quellen schöpfen müssen.
// Eine neue Sprache ist ein weiterer Eintrag in `translations`.

export type UILanguage = 'de' | 'en';

export interface Translations {
  // ── Rahmen ────────────────────────────────────────────────────────────
  appTitle: string;
  appSubtitle: string;
  toolSuite: string;
  language: string;
  theme: string;
  themeLight: string;
  themeDark: string;
  layout: string;
  layoutLeft: string;
  layoutRight: string;
  layoutTop: string;
  stackConfigFirst: string;
  stackResultsFirst: string;
  pinNavigation: string;
  navigation: string;
  commands: string;
  commandPlaceholder: string;
  noCommandMatch: string;
  close: string;
  menu: string;
  resetAll: string;
  resetHint: string;

  // ── Navigation ────────────────────────────────────────────────────────
  navStart: string;
  navIntro: string;
  navExclude: string;
  navGraph: string;
  navAnalysis: string;

  // ── Einführung ────────────────────────────────────────────────────────
  introLead: string;
  introStep1: string;
  introStep2: string;
  introStep3: string;
  introNote: string;

  // ── Text / Korpus ─────────────────────────────────────────────────────
  textSection: string;
  corpusTitle: string;
  corpusEmpty: string;
  corpusPlaceholder: string;
  uploadText: string;
  selectCorpus: string;
  selectCorpusHint: string;
  sampleText: string;
  sampleTextHint: string;
  pasteText: string;
  applyText: string;
  downloadText: string;
  clearText: string;
  noTextYet: string;
  characters: string;
  sourcePasted: string;

  // ── Suche und Blättern ────────────────────────────────────────────────
  searchPlaceholder: string;
  searchNoMatch: string;
  prevMatch: string;
  nextMatch: string;
  searchHint: string;
  page: string;
  pageOf: string;
  pageSize: string;
  firstPage: string;
  prevPage: string;
  nextPage: string;
  lastPage: string;

  // ── Darstellung des Korpus ────────────────────────────────────────────
  displaySection: string;
  placeholderStyle: string;
  placeholderUnderscore: string;
  placeholderDot: string;
  placeholderDash: string;
  placeholderHidden: string;
  placeholderHelp: string;

  // ── Wortwolke ─────────────────────────────────────────────────────────
  wordCloudTitle: string;
  wordCloudEmpty: string;
  wordCloudDescription: string;
  maxWords: string;
  maxWordsHelp: string;

  // ── Stopwortliste ─────────────────────────────────────────────────────
  stopwordsTitle: string;
  stopwordsEmpty: string;
  addStopword: string;
  addStopwordPlaceholder: string;
  loadStandardList: string;
  standardListGerman: string;
  standardListEnglish: string;
  downloadStopwords: string;
  clearStopwords: string;
  viewAsList: string;
  viewAsCloud: string;
  clickToMarkStopword: string;
  clickToRestore: string;
  word: string;
  frequency: string;
  inText: string;
  notInText: string;

  // ── Kennzahlen ────────────────────────────────────────────────────────
  totalWords: string;
  uniqueWords: string;
  hiddenWords: string;
  hiddenShare: string;
  remaining: string;
  topWords: string;
  topStopwords: string;
  statCorpus: string;
  statHidden: string;
  statList: string;
  statTop: string;

  // ── Graph ─────────────────────────────────────────────────────────────
  graphTitle: string;
  graphEmpty: string;
  graphNotBuilt: string;
  graphStale: string;
  generateGraph: string;
  regenerateGraph: string;
  ngramSection: string;
  windowSize: string;
  windowSizeHelp: string;
  edgeWeighting: string;
  weightingUniform: string;
  weightingDistance: string;
  uniformValue: string;
  baseValue: string;
  bonusRange: string;
  bonusValue: string;
  bonusRangeHelp: string;
  sentenceBoundaries: string;
  sentenceBoundariesHelp: string;
  noPunctuationFound: string;
  displayFilters: string;
  minEdgeWeight: string;
  minNodeFrequency: string;
  showLabels: string;
  showEdgeLabels: string;
  graphTheme: string;
  graphStats: string;
  nodes: string;
  edges: string;
  maxFrequency: string;
  maxWeight: string;
  avgWeight: string;
  filteredOut: string;
  coverage: string;
  coverageHint: string;
  nodeTooltip: string;
  edgeTooltip: string;
  searchNode: string;
  resetView: string;
  centerGraph: string;
  export: string;
  downloadSVG: string;
  downloadPNG: string;
  downloadJSON: string;
  resolution: string;

  // ── Statuszeile ───────────────────────────────────────────────────────
  statusText: string;
  statusWords: string;
  statusStopwords: string;
  statusGraph: string;
  statusWindow: string;
  statusHidden: string;
  none: string;
  of: string;

  // ── Befehlspalette: Gruppen ───────────────────────────────────────────
  groupModules: string;
  groupText: string;
  groupStopwords: string;
  groupGraph: string;
  groupView: string;
}

const de: Translations = {
  appTitle: 'Visueller Wortausschluss',
  appSubtitle: 'Stopwörter bestimmen und als Graph darstellen',
  toolSuite: 'LexoTerm Tools',
  language: 'Sprache',
  theme: 'Darstellung',
  themeLight: 'Heller Modus',
  themeDark: 'Dunkler Modus',
  layout: 'Anordnung',
  layoutLeft: 'Konfiguration links',
  layoutRight: 'Konfiguration rechts',
  layoutTop: 'Konfiguration oben',
  stackConfigFirst: 'Parameter oben',
  stackResultsFirst: 'Ergebnisse oben',
  pinNavigation: 'Navigation anheften',
  navigation: 'Navigation',
  commands: 'Befehle',
  commandPlaceholder: 'Befehl, Modul, Wort…',
  noCommandMatch: 'Kein Befehl gefunden',
  close: 'Schließen',
  menu: 'Menü',
  resetAll: 'Alles zurücksetzen',
  resetHint: 'Verwirft Text, Stopwörter und Graph.',

  navStart: 'Start',
  navIntro: 'Einführung',
  navExclude: 'Wortausschluss',
  navGraph: 'Visualisierung',
  navAnalysis: 'Analyse',

  introLead: 'Dieses Werkzeug macht sichtbar, welche Wörter einen Text tragen und welche nur Grundgerüst sind. Ausgeschlossene Wörter (Stopwörter) verschwinden aus dem Korpus, aus der Wortwolke und aus dem Graphen.',
  introStep1: 'Text laden — Datei hochladen, einfügen oder den Beispieltext nehmen.',
  introStep2: 'Wörter ausschließen — im Korpus, in der Wortwolke oder über eine Standardliste. Ein Klick in der Stopwortliste stellt ein Wort wieder her.',
  introStep3: 'Graph erzeugen — aus den verbleibenden Wörtern entsteht ein Kookkurrenz-Netz über ein gleitendes n-Gramm-Fenster.',
  introNote: 'Dieses Werkzeug befindet sich im Erprobungsstadium. Von einem Produktiveinsatz wird abgeraten; ein einwandfreies Funktionieren ist nicht zugesichert.',

  textSection: 'Text',
  corpusTitle: 'Korpus',
  corpusEmpty: 'Noch kein Text geladen',
  corpusPlaceholder: 'Text hier einfügen …',
  uploadText: 'Datei hochladen',
  selectCorpus: 'Korpus auswählen',
  selectCorpusHint: 'Vordefinierte Korpora folgen in einer späteren Fassung.',
  sampleText: 'Beispieltext',
  sampleTextHint: 'Lädt eine Novelle als Probetext.',
  pasteText: 'Text einfügen',
  applyText: 'Text übernehmen',
  downloadText: 'Text speichern',
  clearText: 'Text verwerfen',
  noTextYet: 'Kein Text geladen',
  characters: 'Zeichen',
  sourcePasted: 'Eingefügt',

  searchPlaceholder: 'Im Korpus suchen…',
  searchNoMatch: 'Keine Treffer',
  prevMatch: 'Voriger Treffer',
  nextMatch: 'Nächster Treffer',
  searchHint: '↵ weiter · ⇧↵ zurück',
  page: 'Seite',
  pageOf: 'von',
  pageSize: 'Seitengröße',
  firstPage: 'Erste Seite',
  prevPage: 'Vorige Seite',
  nextPage: 'Nächste Seite',
  lastPage: 'Letzte Seite',

  displaySection: 'Darstellung',
  placeholderStyle: 'Platzhalter',
  placeholderUnderscore: 'Unterstrich (_)',
  placeholderDot: 'Punkt (·)',
  placeholderDash: 'Strich (—)',
  placeholderHidden: 'Ganz ausblenden',
  placeholderHelp: 'Womit ausgeschlossene Wörter im Korpus ersetzt werden.',

  wordCloudTitle: 'Wortwolke',
  wordCloudEmpty: 'Laden Sie einen Text, um die Wortwolke zu sehen.',
  wordCloudDescription: 'Größe entspricht der Häufigkeit. Ein Klick schließt das Wort aus.',
  maxWords: 'Wörter in der Wolke',
  maxWordsHelp: 'Nur die häufigsten Wörter werden gezeigt.',

  stopwordsTitle: 'Stopwörter',
  stopwordsEmpty: 'Noch keine Stopwörter markiert',
  addStopword: 'Wort ausschließen',
  addStopwordPlaceholder: 'Wort eingeben und ↵…',
  loadStandardList: 'Standardliste',
  standardListGerman: 'Deutsch',
  standardListEnglish: 'Englisch',
  downloadStopwords: 'Liste speichern',
  clearStopwords: 'Liste leeren',
  viewAsList: 'Liste',
  viewAsCloud: 'Wolke',
  clickToMarkStopword: 'Klicken zum Ausschließen',
  clickToRestore: 'Klicken zum Wiederherstellen',
  word: 'Wort',
  frequency: 'Häufigkeit',
  inText: 'im Text',
  notInText: 'nicht im Text',

  totalWords: 'Wörter',
  uniqueWords: 'eindeutig',
  hiddenWords: 'Ausgeblendet',
  hiddenShare: 'des Textes',
  remaining: 'verbleibend',
  topWords: 'Häufigste Wörter',
  topStopwords: 'Häufigste Stopwörter',
  statCorpus: 'Korpus',
  statHidden: 'Ausgeblendet',
  statList: 'Stopwortliste',
  statTop: 'Spitzenwort',

  graphTitle: 'Wissensgraph',
  graphEmpty: 'Kein Graph vorhanden. Erzeugen Sie ihn aus dem aktuellen Text.',
  graphNotBuilt: 'nicht erzeugt',
  graphStale: 'Text oder Stopwörter haben sich geändert — Graph neu erzeugen.',
  generateGraph: 'Graph erzeugen',
  regenerateGraph: 'Neu erzeugen',
  ngramSection: 'n-Gramm',
  windowSize: 'Fenstergröße (n)',
  windowSizeHelp: 'Wie viele Wörter gleichzeitig im Kontextfenster stehen.',
  edgeWeighting: 'Kantengewichtung',
  weightingUniform: 'Einheitlich',
  weightingDistance: 'Distanzbasiert',
  uniformValue: 'Gewicht',
  baseValue: 'Basisgewicht',
  bonusRange: 'Bonus-Distanz',
  bonusValue: 'Bonus-Wert',
  bonusRangeHelp: 'Wörter innerhalb dieser Distanz erhalten zusätzliches Gewicht.',
  sentenceBoundaries: 'Satzgrenzen',
  sentenceBoundariesHelp: 'Bei diesen Zeichen beginnt das Fenster von vorn.',
  noPunctuationFound: 'Keine Satzzeichen im Text gefunden',
  displayFilters: 'Anzeigefilter',
  minEdgeWeight: 'Min. Kantengewicht',
  minNodeFrequency: 'Min. Worthäufigkeit',
  showLabels: 'Knotenbeschriftung',
  showEdgeLabels: 'Kantengewichte anzeigen',
  graphTheme: 'Farbschema',
  graphStats: 'Kennzahlen',
  nodes: 'Knoten',
  edges: 'Kanten',
  maxFrequency: 'Max. Häufigkeit',
  maxWeight: 'Max. Gewicht',
  avgWeight: 'Ø Gewicht',
  filteredOut: 'gefiltert',
  coverage: 'Abdeckung',
  coverageHint: 'Anteil der eindeutigen Wörter, die als Knoten im Graphen stehen.',
  nodeTooltip: 'Häufigkeit',
  edgeTooltip: 'Gewicht',
  searchNode: 'Knoten suchen…',
  resetView: 'Ansicht zurücksetzen',
  centerGraph: 'Graph einpassen',
  export: 'Export',
  downloadSVG: 'SVG',
  downloadPNG: 'PNG',
  downloadJSON: 'JSON',
  resolution: 'Auflösung',

  statusText: 'Text',
  statusWords: 'Wörter',
  statusStopwords: 'Stopwörter',
  statusGraph: 'Graph',
  statusWindow: 'Fenster',
  statusHidden: 'ausgeblendet',
  none: 'keiner',
  of: 'von',

  groupModules: 'Module',
  groupText: 'Text',
  groupStopwords: 'Stopwörter',
  groupGraph: 'Graph',
  groupView: 'Ansicht',
};

const en: Translations = {
  appTitle: 'Visual Word Exclusion',
  appSubtitle: 'Choose stopwords and turn the rest into a graph',
  toolSuite: 'LexoTerm Tools',
  language: 'Language',
  theme: 'Appearance',
  themeLight: 'Light mode',
  themeDark: 'Dark mode',
  layout: 'Layout',
  layoutLeft: 'Configuration left',
  layoutRight: 'Configuration right',
  layoutTop: 'Configuration on top',
  stackConfigFirst: 'Parameters first',
  stackResultsFirst: 'Results first',
  pinNavigation: 'Pin navigation',
  navigation: 'Navigation',
  commands: 'Commands',
  commandPlaceholder: 'Command, module, word…',
  noCommandMatch: 'No command found',
  close: 'Close',
  menu: 'Menu',
  resetAll: 'Reset everything',
  resetHint: 'Discards text, stopwords and graph.',

  navStart: 'Start',
  navIntro: 'Introduction',
  navExclude: 'Word exclusion',
  navGraph: 'Visualisation',
  navAnalysis: 'Analysis',

  introLead: 'This tool shows which words carry a text and which are mere scaffolding. Excluded words (stopwords) disappear from the corpus, from the word cloud and from the graph.',
  introStep1: 'Load a text — upload a file, paste it, or take the sample text.',
  introStep2: 'Exclude words — in the corpus, in the word cloud, or from a standard list. A click in the stopword list restores a word.',
  introStep3: 'Build the graph — the remaining words form a co-occurrence network over a sliding n-gram window.',
  introNote: 'This tool is experimental. Production use is discouraged; correct operation is not guaranteed.',

  textSection: 'Text',
  corpusTitle: 'Corpus',
  corpusEmpty: 'No text loaded yet',
  corpusPlaceholder: 'Paste text here …',
  uploadText: 'Upload file',
  selectCorpus: 'Select corpus',
  selectCorpusHint: 'Predefined corpora will follow in a later version.',
  sampleText: 'Sample text',
  sampleTextHint: 'Loads a novella as a trial text.',
  pasteText: 'Paste text',
  applyText: 'Use this text',
  downloadText: 'Save text',
  clearText: 'Discard text',
  noTextYet: 'No text loaded',
  characters: 'characters',
  sourcePasted: 'Pasted',

  searchPlaceholder: 'Search the corpus…',
  searchNoMatch: 'No matches',
  prevMatch: 'Previous match',
  nextMatch: 'Next match',
  searchHint: '↵ next · ⇧↵ previous',
  page: 'Page',
  pageOf: 'of',
  pageSize: 'Page size',
  firstPage: 'First page',
  prevPage: 'Previous page',
  nextPage: 'Next page',
  lastPage: 'Last page',

  displaySection: 'Display',
  placeholderStyle: 'Placeholder',
  placeholderUnderscore: 'Underscore (_)',
  placeholderDot: 'Dot (·)',
  placeholderDash: 'Dash (—)',
  placeholderHidden: 'Hide entirely',
  placeholderHelp: 'What replaces excluded words in the corpus.',

  wordCloudTitle: 'Word cloud',
  wordCloudEmpty: 'Load a text to see the word cloud.',
  wordCloudDescription: 'Size follows frequency. A click excludes the word.',
  maxWords: 'Words in the cloud',
  maxWordsHelp: 'Only the most frequent words are shown.',

  stopwordsTitle: 'Stopwords',
  stopwordsEmpty: 'No stopwords marked yet',
  addStopword: 'Exclude a word',
  addStopwordPlaceholder: 'Type a word and press ↵…',
  loadStandardList: 'Standard list',
  standardListGerman: 'German',
  standardListEnglish: 'English',
  downloadStopwords: 'Save list',
  clearStopwords: 'Clear list',
  viewAsList: 'List',
  viewAsCloud: 'Cloud',
  clickToMarkStopword: 'Click to exclude',
  clickToRestore: 'Click to restore',
  word: 'Word',
  frequency: 'Frequency',
  inText: 'in the text',
  notInText: 'not in the text',

  totalWords: 'Words',
  uniqueWords: 'unique',
  hiddenWords: 'Hidden',
  hiddenShare: 'of the text',
  remaining: 'remaining',
  topWords: 'Most frequent words',
  topStopwords: 'Most frequent stopwords',
  statCorpus: 'Corpus',
  statHidden: 'Hidden',
  statList: 'Stopword list',
  statTop: 'Top word',

  graphTitle: 'Knowledge graph',
  graphEmpty: 'No graph yet. Build one from the current text.',
  graphNotBuilt: 'not built',
  graphStale: 'Text or stopwords have changed — rebuild the graph.',
  generateGraph: 'Build graph',
  regenerateGraph: 'Rebuild',
  ngramSection: 'n-gram',
  windowSize: 'Window size (n)',
  windowSizeHelp: 'How many words share the context window.',
  edgeWeighting: 'Edge weighting',
  weightingUniform: 'Uniform',
  weightingDistance: 'Distance-based',
  uniformValue: 'Weight',
  baseValue: 'Base weight',
  bonusRange: 'Bonus distance',
  bonusValue: 'Bonus value',
  bonusRangeHelp: 'Words within this distance get extra weight.',
  sentenceBoundaries: 'Sentence boundaries',
  sentenceBoundariesHelp: 'The window starts over at these characters.',
  noPunctuationFound: 'No punctuation found in the text',
  displayFilters: 'Display filters',
  minEdgeWeight: 'Min. edge weight',
  minNodeFrequency: 'Min. word frequency',
  showLabels: 'Node labels',
  showEdgeLabels: 'Show edge weights',
  graphTheme: 'Colour scheme',
  graphStats: 'Key figures',
  nodes: 'Nodes',
  edges: 'Edges',
  maxFrequency: 'Max. frequency',
  maxWeight: 'Max. weight',
  avgWeight: 'Avg. weight',
  filteredOut: 'filtered',
  coverage: 'Coverage',
  coverageHint: 'Share of unique words that appear as nodes in the graph.',
  nodeTooltip: 'Frequency',
  edgeTooltip: 'Weight',
  searchNode: 'Find a node…',
  resetView: 'Reset view',
  centerGraph: 'Fit graph',
  export: 'Export',
  downloadSVG: 'SVG',
  downloadPNG: 'PNG',
  downloadJSON: 'JSON',
  resolution: 'Resolution',

  statusText: 'Text',
  statusWords: 'Words',
  statusStopwords: 'Stopwords',
  statusGraph: 'Graph',
  statusWindow: 'Window',
  statusHidden: 'hidden',
  none: 'none',
  of: 'of',

  groupModules: 'Modules',
  groupText: 'Text',
  groupStopwords: 'Stopwords',
  groupGraph: 'Graph',
  groupView: 'View',
};

export const translations: Record<UILanguage, Translations> = { de, en };

export function getTranslation(language: UILanguage): Translations {
  return translations[language] ?? translations.de;
}

/** Zahlen in der jeweiligen Sprache — 30.513 gegen 30,513. */
export function formatNumber(value: number, language: UILanguage): string {
  return value.toLocaleString(language === 'de' ? 'de-DE' : 'en-GB');
}

/** Byte-Angaben für die Statuszeile: 47 KB, 1,2 MB. */
export function formatBytes(bytes: number, language: UILanguage): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${formatNumber(Math.round(bytes / 1024), language)} KB`;
  return `${(bytes / (1024 * 1024)).toLocaleString(language === 'de' ? 'de-DE' : 'en-GB', {
    maximumFractionDigits: 1,
  })} MB`;
}
