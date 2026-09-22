# Visueller Wortausschluss / Visual Word Exclusion

Ein interaktives Web-Werkzeug, um Stopwörter in einem Text zu bestimmen und die
verbleibenden Wörter als Kookkurrenz-Graph darzustellen.

Die Oberfläche folgt dem **LexoTerm-Tools-Design** (`pdl-lt-design/design_handoff_tools`):
Werkbank-Raster mit Modul-Leiste, Konfigurator und dominanter Ergebnisfläche,
Befehlspalette, Statuszeile, heller und dunkler Modus.

> **Hinweis:** Dieses Werkzeug befindet sich im Erprobungsstadium. Von einem
> Produktiveinsatz wird abgeraten; ein einwandfreies Funktionieren ist nicht
> zugesichert.

## Funktionen

### Rahmen
- **Zweisprachig** — Deutsch und Englisch, umschaltbar in der Kopfzeile, im
  Mobil-Menü und über die Befehlspalette
- **Drei Anordnungen** — Konfigurator links, rechts oder oben (gestapelt);
  die Wahl bleibt erhalten
- **Hell und dunkel** — `data-theme` auf `:root`, ebenfalls gespeichert; das
  Farbschema der Zeichenfläche folgt wahlweise der Oberfläche
- **Modul-Leiste** — 56 px eingeklappt, 248 px angeheftet (Pin), Flyout beim
  Überfahren
- **Befehlspalette** (`⌘K` / `Strg+K`) — jeder Befehl der Oberfläche, dazu die
  zehn häufigsten Wörter zum direkten Ausschließen
- **Statuszeile** — Textquelle und -größe, Wortzahlen, Anteil der
  ausgeblendeten Wörter, Graphgröße, gefilterte Knoten, n-Gramm-Einstellung
- **Mobil-Ansicht** unter 640 px — gestapelt, mit Schiebemenü für Navigation,
  Stapelreihenfolge, Theme und Sprache

### Wortausschluss
- Text laden: Datei (`.txt`), Einfügen oder mitgelieferter Beispieltext
- Korpus als klickbarer Fließtext, seitenweise (250–2500 Token je Seite)
- Suche im Korpus mit Trefferzähler und Sprung zum nächsten/vorigen Treffer
  (`⌘F`/`Strg+F`, `↵`, `⇧↵`)
- Platzhalter für ausgeschlossene Wörter: `_`, `·`, `—` oder ganz ausblenden
- Wortwolke der verbliebenen Wörter, Umfang einstellbar; Klick schließt aus
- Stopwortliste als Liste oder Pillen-Wolke, mit Filter, Häufigkeitsbalken,
  Standardlisten (DE/EN), eigenem Eintragsfeld und Export
- Kennzahlen-Strip: Korpus, Ausgeblendet, Stopwortliste, Spitzenwort — die
  Balken sind anklickbar und schließen ein Wort aus bzw. holen es zurück
- Export: bereinigter Text und Stopwortliste als `.txt`

### Visualisierung
- Kookkurrenz-Graph über ein gleitendes n-Gramm-Fenster (n = 2…15)
- Kantengewichtung einheitlich oder distanzbasiert (Basiswert, Bonusdistanz,
  Bonuswert)
- Satzgrenzen aus den im Text vorkommenden Satzzeichen wählbar
- Anzeigefilter: Mindesthäufigkeit, Mindestkantengewicht, Knoten- und
  Kantenbeschriftung, Farbschema
- Kennzahlen-Strip mit anklickbaren Schwellen, Knotensuche, Ansicht
  zurücksetzen, Graph einpassen
- Export: SVG, PNG (bis A4/300 dpi) und JSON

## Installation

```bash
npm install     # Abhängigkeiten
npm run dev     # Entwicklungsserver
npm run build   # Produktionsbau (tsc + vite)
npm run lint    # ESLint
```

## Technologie-Stack

- React 19 + TypeScript + Vite
- D3 (Kräftesimulation der Zeichenfläche)
- Design-Tokens aus `pdl-lt-design` — **keine** UI-Bibliothek; die Bausteine
  liegen in `src/design/`
- Noto Sans / Noto Sans Mono / Noto Serif

## Projektstruktur

```
src/
├── config/i18n.ts          # DE/EN, ein einziger Schlüsselsatz
├── data/stopwords.ts       # Standard-Stopwortlisten
├── design/                 # Bausteine: Icons, Steuerelemente, Mini-Charts
│   ├── icons.tsx           #   Inline-SVG-Set + Logo
│   ├── ui.tsx              #   Karten, Sektionen, Schaltflächen, Felder, Dialog
│   ├── widgets.tsx         #   Sparkbars, HBar, Segmented, Kbd
│   ├── styles.ts           #   gemeinsame Flächen-/Feldstile
│   └── platform.ts         #   ⌘ oder Strg
├── graph/
│   ├── ForceGraph.tsx      # D3-Kräftesimulation im SVG, Export SVG/PNG
│   └── graphThemes.ts      # Farbschemata der Zeichenfläche (echte Hexwerte!)
├── hooks/
│   ├── useTokenizer.ts     # Tokenisierung, Häufigkeiten, Textexport
│   └── useGraphBuilder.ts  # n-Gramm-Parser, Filter, Kennzahlen
├── layout/                 # Werkbank: Kopfzeile, Leiste, Konfigurator,
│   │                       # Statuszeile, Befehlspalette, Mobil, Sektionen
├── panes/                  # Ergebnisflächen: Einführung, Wortausschluss, Graph
├── state/
│   ├── workbench.ts        # Typen, Kontext, Zugriffs-Hook
│   └── WorkbenchProvider.tsx # der gesamte Zustand
├── styles/
│   ├── tokens.css          # Design-Tokens, unverändert aus dem Handoff
│   └── app.css             # Grundlagen und die wenigen eigenen Regeln
└── types/                  # Token, Platzhalter, Graph-Typen
```

## Tastenkürzel

| Kürzel | Wirkung |
| --- | --- |
| `⌘K` / `Strg+K` | Befehlspalette öffnen/schließen |
| `⌘↵` / `Strg+↵` | Graph erzeugen |
| `⌘F` / `Strg+F` | Korpussuche fokussieren |
| `↵` / `⇧↵` | nächster / voriger Treffer |
| `Esc` | Dialog oder Palette schließen |

## Geplante Erweiterungen

- Weitere Dateiformate (DOCX, PDF, XML, CoNLL)
- Lemmatisierung / Flexionsformen
- Named Entity Recognition zur gezielten Anwahl von Personen, Orten usw.
- Korpus-Auswahl aus vordefinierten Quellen (Schaltfläche ist angelegt)

## Lizenz

CC-BY-NC-SA — Urheber: Wolfgang Huang, Bayerische Akademie der Wissenschaften
