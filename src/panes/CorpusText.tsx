// Der Korpus als klickbarer Fließtext.
//
// Eigener Baustein, weil Desktop und Mobil-Ansicht denselben Text zeigen —
// nur die Werkzeugleiste darum herum unterscheidet sich. Gerendert wird
// immer nur eine Seite; bei 50 000 Token wäre alles auf einmal zu viel für
// den Browser.

import { useMemo, type RefObject } from 'react';
import { placeholderChars, type PlaceholderStyle, type Token } from '../types';

export function CorpusText({
  tokens, startIndex, placeholderStyle, onExclude, onRestore,
  matches, currentMatch, matchRefs, excludeHint, restoreHint,
}: {
  tokens: Token[];
  startIndex: number;
  placeholderStyle: PlaceholderStyle;
  onExclude: (word: string) => void;
  onRestore: (word: string) => void;
  excludeHint: string;
  restoreHint: string;
  matches?: Set<number>;
  currentMatch?: number;
  matchRefs?: RefObject<Map<number, HTMLSpanElement>>;
}) {
  const placeholder = placeholderChars[placeholderStyle];

  const content = useMemo(() => {
    matchRefs?.current.clear();
    return tokens.map((token, offset) => {
      const index = startIndex + offset;

      if (token.type === 'whitespace') return <span key={token.id}>{token.text}</span>;

      // Satzzeichen sind nicht anklickbar: Ein versehentlich ausgeschlossener
      // Punkt würde die Satzgrenzen des n-Gramm-Fensters aushebeln.
      if (token.type === 'punctuation') {
        return <span key={token.id} style={{ color: 'var(--lt-fg-3)' }}>{token.text}</span>;
      }

      if (token.isStopword) {
        if (placeholderStyle === 'hidden') return null;
        return (
          <span
            key={token.id} className="corpus-stop"
            title={`${token.text} — ${restoreHint}`}
            onClick={() => onRestore(token.normalizedText)}
          >
            {placeholder.repeat(token.text.length)}
          </span>
        );
      }

      const isMatch = matches?.has(index) ?? false;
      const isCurrent = index === currentMatch;
      return (
        <span
          key={token.id}
          ref={isMatch && matchRefs
            ? (el) => { if (el) matchRefs.current.set(index, el); }
            : undefined}
          className={`corpus-word${isCurrent ? ' is-current' : isMatch ? ' is-hit' : ''}`}
          title={excludeHint}
          onClick={() => onExclude(token.normalizedText)}
        >
          {token.text}
        </span>
      );
    });
  }, [tokens, startIndex, placeholderStyle, placeholder, matches, currentMatch,
    matchRefs, onExclude, onRestore, excludeHint, restoreHint]);

  return <div className="corpus-text">{content}</div>;
}
