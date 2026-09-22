// Farbschemata der Zeichenfläche.
//
// Diese Farben sind **echte Hexwerte und bleiben es**. Sie dürfen nicht durch
// --lt-*-Variablen ersetzt werden, so naheliegend das nach der Umstellung auf
// die Design-Tokens auch wirkt: Ein exportiertes SVG steht für sich allein —
// in einer Bilddatei löst `var(--lt-bg-0)` nichts mehr auf, die Fläche bliebe
// leer. Dasselbe bei PNG: `ctx.fillStyle = 'var(...)'` ist wirkungslos.
//
// Das Handoff sagt zu Graphfarben nichts; die Zeichenfläche hat ihre eigene
// Palette, wie es bei Visualisierungen üblich ist. „Auto" folgt dem Theme der
// Oberfläche, damit der dunkle Modus nicht auf eine weiße Fläche stößt.

export type GraphThemeName = 'auto' | 'evergreen' | 'night' | 'monochrome';

export interface GraphTheme {
  name: GraphThemeName;
  labelDe: string;
  labelEn: string;
  background: string;
  /** Knotenfarbe von selten (klein) nach häufig (groß). */
  nodeLow: string;
  nodeHigh: string;
  nodeStroke: string;
  edge: string;
  labelColor: string;
  edgeLabelColor: string;
  highlight: string;
}

const EVERGREEN: GraphTheme = {
  name: 'evergreen',
  labelDe: 'Immergrün (hell)',
  labelEn: 'Evergreen (light)',
  background: '#ffffff',
  nodeLow: '#a7d6bd',
  nodeHigh: '#143b29',
  nodeStroke: '#ffffff',
  edge: '#9fb3a9',
  labelColor: '#0d1411',
  edgeLabelColor: '#6c7672',
  highlight: '#b6791f',
};

const NIGHT: GraphTheme = {
  name: 'night',
  labelDe: 'Nacht (dunkel)',
  labelEn: 'Night (dark)',
  background: '#0e1412',
  nodeLow: '#1c5238',
  nodeHigh: '#79bf9b',
  nodeStroke: '#0e1412',
  edge: '#3e4944',
  labelColor: '#e9efeb',
  edgeLabelColor: '#7d8782',
  highlight: '#d8a652',
};

const MONOCHROME: GraphTheme = {
  name: 'monochrome',
  labelDe: 'Monochrom (Druck)',
  labelEn: 'Monochrome (print)',
  background: '#ffffff',
  nodeLow: '#c8c8c8',
  nodeHigh: '#1a1a1a',
  nodeStroke: '#ffffff',
  edge: '#999999',
  labelColor: '#1a1a1a',
  edgeLabelColor: '#666666',
  highlight: '#000000',
};

/** `auto` ist kein eigenes Schema, sondern die Wahl nach dem UI-Theme.
 *
 *  Gibt immer dieselbe Instanz zurück: Die Zeichenfläche baut sich neu auf,
 *  wenn sich das Farbschema ändert — ein bei jedem Aufruf frisch erzeugtes
 *  Objekt hieße, sie baut sich bei jedem Render neu auf. */
export function getGraphTheme(name: GraphThemeName, uiTheme: 'light' | 'dark'): GraphTheme {
  if (name === 'auto') return uiTheme === 'dark' ? NIGHT : EVERGREEN;
  if (name === 'night') return NIGHT;
  if (name === 'monochrome') return MONOCHROME;
  return EVERGREEN;
}

export const graphThemeNames: GraphThemeName[] = ['auto', 'evergreen', 'night', 'monochrome'];

export const graphThemeLabels: Record<GraphThemeName, { de: string; en: string }> = {
  auto: { de: 'Wie Oberfläche', en: 'Follow interface' },
  evergreen: { de: EVERGREEN.labelDe, en: EVERGREEN.labelEn },
  night: { de: NIGHT.labelDe, en: NIGHT.labelEn },
  monochrome: { de: MONOCHROME.labelDe, en: MONOCHROME.labelEn },
};
