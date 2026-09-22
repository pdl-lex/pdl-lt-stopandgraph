# Style Guide — LexoTerm Tools (Werkbank)

Die verbindliche Vorgabe ist der Design-Handoff in
`pdl-lt-design/design_handoff_tools`. Dieses Dokument hält fest, wie er in
diesem Repo umgesetzt ist — es ersetzt ihn nicht.

## Technologie

- React 19 + TypeScript, Vite
- **Keine UI-Bibliothek.** Die Bausteine stehen in `src/design/`; sie sind
  klein genug, um sie zu lesen, und hängen an nichts außer den Tokens.
- D3 nur für die Kräftesimulation der Zeichenfläche

## Farben: ausschließlich Tokens

`src/styles/tokens.css` ist unverändert aus dem Handoff übernommen und die
Quelle der Wahrheit. **Fest verdrahtete Hexwerte in Komponenten sind ein
Fehler** — sie brechen den dunklen Modus.

```tsx
// richtig
<div style={{ background: 'var(--lt-bg-0)', color: 'var(--lt-fg-1)' }} />

// falsch
<div style={{ background: '#ffffff', color: '#1a1a1a' }} />
```

Kern der Palette:

| Zweck | Token |
| --- | --- |
| Flächen | `--lt-bg-0` (Karten) · `--lt-bg-1` (Seite) · `--lt-bg-2` (Konfigurator) |
| Linien | `--lt-line-1` · `--lt-line-2` · `--lt-line-3` |
| Text | `--lt-fg-1` … `--lt-fg-4` |
| Primär | `--lt-primary`, `--lt-primary-soft`, `--lt-primary-line`, `--lt-on-primary` |
| Status | `--lt-warn` · `--lt-err` · `--lt-info` (je `-soft` / `-line`) |
| Radien | `--lt-r-xs` 3 · `sm` 5 · `md` 7 · `lg` 10 · `xl` 14 |
| Schatten | `--lt-shadow-1` · `-2` · `-pop` |

Eine einzige Ergänzung steht in `app.css`: `--lt-primary-strong`. Im hellen
Modus ist das `--lt-g-700`, im dunklen `--lt-g-300` — kräftige Schrift auf
`--lt-primary-soft` wäre sonst im dunklen Modus Dunkel auf Dunkel.

### Ausnahme: die Zeichenfläche

`src/graph/graphThemes.ts` führt **echte Hexwerte**, und das bleibt so: Ein
exportiertes SVG steht für sich allein, in einer Bilddatei löst
`var(--lt-bg-0)` nichts mehr auf. Dasselbe bei PNG — `ctx.fillStyle =
'var(...)'` ist wirkungslos.

## Typografie

- **Noto Sans** — Oberfläche
- **Noto Sans Mono** — Kennzahlen, Dateinamen, Kürzel, Tastenbadges
  (`.lt-mono`, `--lt-font-mono`)
- **Noto Serif** — der Korpus selbst (`.corpus-text`)

Größen: Kopfzeile und Werkzeugleisten 13, Fließtext der Bedienung 12–12,5,
Mono-Abzeichen 10,5–11, Eyebrow 10–11 in Versalien (`.lt-eyebrow`).

## Raster

```
Kopfzeile   44 px
Leiste      56 px eingeklappt ↔ 248 px angeheftet
Konfigurator 380 px
Statuszeile 32 px
```

Drei Anordnungen (`gridFor` in `App.tsx`):

| Modus | Spalten | Bereiche |
| --- | --- | --- |
| `left` | `rail 380px 1fr` | `head / rail cfg main / stat` |
| `right` | `rail 1fr 380px` | `head / rail main cfg / stat` |
| `bottom` | `rail 1fr` | `head / rail cfg / rail main / stat` |

Unter 640 px (`useIsMobile`) gilt die gestapelte Mobil-Ansicht.

## Bausteine

| Baustein | Datei | Wofür |
| --- | --- | --- |
| `Card`, `Panel`, `SectionFold` | `design/ui.tsx` | Flächen, Panels mit Kopfzeile, aufklappbare Sektionen |
| `PrimaryButton`, `GhostButton`, `IconButton` | `design/ui.tsx` | Aktion gefüllt, Konfiguration umrandet |
| `Field`, `TextInput`, `NumberInput`, `Select`, `Toggle`, `RangeSlider` | `design/ui.tsx` | Eingaben |
| `Pill`, `Badge`, `MonoBadge`, `Callout`, `Eyebrow`, `EmptyState` | `design/ui.tsx` | Auszeichnungen |
| `Dialog`, `FilePicker` | `design/ui.tsx` | Modal, Dateiwahl |
| `Sparkbars`, `HBar`, `Segmented`, `Kbd` | `design/widgets.tsx` | Mini-Charts, Umschalter |
| `Icon`, `Logo` | `design/icons.tsx` | dünnstrichiges SVG-Set |
| `Stat`, `StatStrip` | `panes/StatStrip.tsx` | Kennzahlen über der Ergebnisfläche |

**Konvention:** Aktionen sind gefüllt (`PrimaryButton`), Konfiguration ist
umrandet (`GhostButton`). Sparkbars im Kennzahlen-Strip sind interaktiv: Ein
Klick auf einen Balken setzt einen Filter oder schließt ein Wort aus.

## Zustand

Alles Gemeinsame steht im Werkbank-Kontext (`state/`); örtlicher Zustand —
Suchfeld, Seitenzahl, aufgeklappte Sektion — bleibt in der Komponente.
Gespeichert werden nur Sprache, Theme und Anordnung (`lt.language`,
`lt.theme`, `lt.layout`).

Die Typen und der Hook liegen in `workbench.ts`, der Provider daneben in
`WorkbenchProvider.tsx`: Ein Modul, das eine Komponente ausführt, soll nichts
anderes ausführen — sonst greift Fast Refresh nicht.

## Mehrsprachigkeit

`src/config/i18n.ts` trägt einen einzigen Schlüsselsatz für DE und EN. Neue
Zeichenketten kommen in die `Translations`-Schnittstelle und damit in beide
Sprachen — TypeScript erzwingt die Vollständigkeit. Zahlen laufen über
`formatNumber(wert, sprache)`, damit 30.513 nicht als 30,513 erscheint.

## Was nicht zu tun ist

- Keine Hexwerte außerhalb von `graphThemes.ts`
- `tokens.css` nicht ändern — Ergänzungen gehören in `app.css`
- Keine deutschen Festtexte in Komponenten; alles über `t.*`
- `Math.max(...array)` nicht auf Token- oder Knotenlisten anwenden; ein langer
  Text sprengt damit den Aufrufstapel (`reduce` verwenden)
