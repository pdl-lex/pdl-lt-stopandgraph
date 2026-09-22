// Ergebnisfläche „Wortausschluss" (Handoff §4): Werkzeugleiste, Kennzahlen-
// Strip, Inhalt, Fußzeile.
//
// Wo im Handoff die Treffertabelle steht, stehen hier Korpus und Wortwolke
// nebeneinander — beide sind dasselbe Material in zwei Ansichten, und in
// beiden schließt ein Klick ein Wort aus. Die Stopwortliste selbst ist ein
// Steuerelement und sitzt deshalb im Konfigurator.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { formatNumber } from '../config/i18n';
import { Icon } from '../design/icons';
import {
  EmptyState, FilePicker, GhostButton, IconButton, MonoBadge, Panel, PrimaryButton,
} from '../design/ui';
import { kc } from '../design/platform';
import { HBar, Kbd, Sparkbars } from '../design/widgets';
import { ToolbarSearch } from '../layout/sections';
import { useWorkbench } from '../state/workbench';
import { CorpusText } from './CorpusText';
import { Stat, StatStrip } from './StatStrip';
import { WordCloud } from './WordCloud';

const PAGE_SIZES = [250, 500, 1000, 2500];

/** Anteil in Prozent. Unter 10 % mit einer Nachkommastelle — ein einzelnes
 *  Wort macht selten ein volles Prozent aus, und „0 %“ sagt nichts. */
function share(value: number, total: number): string {
  const percent = (value / Math.max(total, 1)) * 100;
  return percent < 10 ? percent.toFixed(1) : String(Math.round(percent));
}

export function ExcludePane({ onPaste }: { onPaste: () => void }) {
  const {
    t, language, tokens, rawText, placeholderStyle, toggleStopword, removeStopword,
    addStopword, stats, visibleWords, stopwordList, stopwords, maxCloudWords,
    downloadText, downloadStopwords, loadFile, loadSample,
  } = useWorkbench();

  const [search, setSearch] = useState('');
  const [matchIndex, setMatchIndex] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(500);

  const scrollRef = useRef<HTMLDivElement>(null);
  const matchRefs = useRef<Map<number, HTMLSpanElement>>(new Map());

  const n = (value: number) => formatNumber(value, language);
  const totalPages = Math.max(1, Math.ceil(tokens.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);

  // Nur ein neuer *Text* setzt die Ansicht zurück — nicht jede Änderung an
  // der Stopwortliste. Die frühere Fassung hing an `tokens`, und die werden
  // bei jedem ausgeschlossenen Wort neu berechnet: Ein Klick auf Seite 7
  // warf einen zurück auf Seite 1.
  const [seenText, setSeenText] = useState(rawText);
  if (seenText !== rawText) {
    setSeenText(rawText);
    setPage(0);
    setMatchIndex(0);
    setSearch('');
  }

  const findMatches = useCallback((query: string) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    const found: number[] = [];
    tokens.forEach((token, index) => {
      if (token.type === 'word' && token.normalizedText.includes(needle)) found.push(index);
    });
    return found;
  }, [tokens]);

  const matches = useMemo(() => findMatches(search), [findMatches, search]);

  const showPageOf = (tokenIndex: number) => {
    const target = Math.floor(tokenIndex / pageSize);
    if (target !== safePage) setPage(target);
  };

  const onSearch = (value: string) => {
    setSearch(value);
    setMatchIndex(0);
    const found = findMatches(value);
    if (found.length > 0) showPageOf(found[0]);
  };

  const step = (delta: number) => {
    if (matches.length === 0) return;
    const next = (matchIndex + delta + matches.length) % matches.length;
    setMatchIndex(next);
    showPageOf(matches[next]);
  };

  // Den aktuellen Treffer ins Bild holen: reine Wirkung auf das DOM, deshalb
  // ein Effekt — er läuft nach dem Seitenwechsel, wenn die Marke steht.
  useEffect(() => {
    const target = matches[matchIndex];
    if (target === undefined) return;
    matchRefs.current.get(target)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [matchIndex, matches, safePage]);

  const pageTokens = useMemo(
    () => tokens.slice(safePage * pageSize, safePage * pageSize + pageSize),
    [tokens, safePage, pageSize],
  );

  const matchSet = useMemo(() => new Set(matches), [matches]);
  const currentMatch = matches[matchIndex];

  if (!rawText) {
    return (
      <section style={{
        gridArea: 'main', display: 'flex', flexDirection: 'column',
        minHeight: 0, minWidth: 0, background: 'var(--lt-bg-1)',
      }}>
        <EmptyState icon="file">
          <div style={{ marginBottom: 14 }}>{t.introLead}</div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <FilePicker label={t.uploadText} accept=".txt,text/plain" onPick={loadFile} primary />
            <GhostButton icon="file" onClick={() => void loadSample()}>{t.sampleText}</GhostButton>
            <GhostButton icon="type" onClick={onPaste}>{t.pasteText}</GhostButton>
          </div>
        </EmptyState>
      </section>
    );
  }

  const topWord = visibleWords[0];
  const hiddenPct = Math.round(stats.hiddenShare * 100);
  const stopwordsInText = stopwordList.filter((item) => item.count > 0);
  const from = tokens.length === 0 ? 0 : safePage * pageSize + 1;
  const to = Math.min(tokens.length, (safePage + 1) * pageSize);

  return (
    <section style={{
      gridArea: 'main', display: 'flex', flexDirection: 'column',
      minHeight: 0, minWidth: 0, background: 'var(--lt-bg-1)',
    }}>
      {/* Werkzeugleiste */}
      <div style={{
        height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10,
        padding: '0 12px', borderBottom: '1px solid var(--lt-line-1)',
        background: 'var(--lt-bg-0)',
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>{t.corpusTitle}</span>
        <MonoBadge>
          {n(stats.totalWords)} {t.totalWords} · {n(stats.uniqueWords)} {t.uniqueWords}
          {stats.hiddenWords > 0 && ` · ${n(stats.hiddenWords)} ${t.statusHidden}`}
        </MonoBadge>

        <span style={{ flex: 1 }} />

        <ToolbarSearch
          inputId="corpus-search" value={search} onChange={onSearch}
          placeholder={t.searchPlaceholder} width={220} title={t.searchHint}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); step(e.shiftKey ? -1 : 1); }
            if (e.key === 'Escape') { e.preventDefault(); onSearch(''); }
          }}
          right={search
            ? (
              <span style={{
                fontFamily: 'var(--lt-font-mono)', fontSize: 10,
                color: matches.length ? 'var(--lt-primary)' : 'var(--lt-fg-4)', flexShrink: 0,
              }}>
                {matches.length ? `${matchIndex + 1}/${n(matches.length)}` : '0'}
              </span>
            )
            : <Kbd>{kc('F')}</Kbd>}
        />
        <IconButton
          name="chevUp" size={26} title={`${t.prevMatch} · ⇧↵`}
          disabled={matches.length === 0} onClick={() => step(-1)}
        />
        <IconButton
          name="chevDown" size={26} title={`${t.nextMatch} · ↵`}
          disabled={matches.length === 0} onClick={() => step(1)}
        />
      </div>

      {/* Kennzahlen — Balken anklicken schließt ein Wort aus bzw. holt es zurück */}
      <StatStrip columns="1.3fr 1fr 1.3fr 1fr">
        <Stat
          label={t.statCorpus}
          value={`${n(stats.totalWords)} ${t.totalWords}`}
          sub={`${n(stats.uniqueWords)} ${t.uniqueWords}`}
          title={t.topWords}
        >
          <Sparkbars
            data={visibleWords.slice(0, 12).map((item) => ({ name: item.word, count: item.count }))}
            interactive width={120} height={24} color="var(--lt-primary)"
            formatCount={n}
            onSelect={(i) => addStopword(visibleWords[i].word)}
          />
        </Stat>

        <Stat
          label={t.statHidden}
          value={n(stats.hiddenWords)}
          sub={`${hiddenPct} % ${t.hiddenShare}`}
        >
          <div style={{ width: 66, flexShrink: 0 }}>
            <HBar value={stats.hiddenWords} max={Math.max(stats.totalWords, 1)} color="var(--lt-err)" />
          </div>
        </Stat>

        <Stat
          label={t.statList}
          value={n(stopwords.size)}
          sub={`${n(stopwordsInText.length)} ${t.inText}`}
          title={t.topStopwords}
        >
          <Sparkbars
            data={stopwordsInText.slice(0, 12).map((item) => ({ name: item.word, count: item.count }))}
            interactive width={120} height={24} color="var(--lt-err)"
            formatCount={n}
            onSelect={(i) => removeStopword(stopwordsInText[i].word)}
          />
        </Stat>

        <Stat
          label={t.statTop}
          value={topWord ? topWord.word : '—'}
          sub={topWord ? `${n(topWord.count)} · ${share(topWord.count, stats.totalWords)} %` : undefined}
          last
        >
          <div style={{ width: 60, flexShrink: 0 }}>
            <HBar value={topWord?.count ?? 0} max={Math.max(stats.totalWords, 1)} />
          </div>
        </Stat>
      </StatStrip>

      {/* Inhalt: Korpus und Wortwolke */}
      <div style={{
        flex: 1, minHeight: 0, display: 'grid', gap: 12, padding: 12,
        gridTemplateColumns: 'minmax(0, 1.55fr) minmax(260px, 1fr)',
      }}>
        <Panel
          title={t.corpusTitle}
          badge={`${t.page} ${safePage + 1}/${totalPages}`}
          actions={<span style={{ fontSize: 11, color: 'var(--lt-fg-3)' }}>{t.clickToMarkStopword}</span>}
        >
          <div
            ref={scrollRef} className="lt-scroll"
            style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '10px 14px' }}
          >
            {tokens.length === 0
              ? <div style={{ color: 'var(--lt-fg-3)', fontSize: 12.5 }}>{t.corpusEmpty}</div>
              : (
                <CorpusText
                  tokens={pageTokens} startIndex={safePage * pageSize}
                  placeholderStyle={placeholderStyle}
                  onExclude={addStopword} onRestore={removeStopword}
                  excludeHint={t.clickToMarkStopword} restoreHint={t.clickToRestore}
                  matches={matchSet} currentMatch={currentMatch} matchRefs={matchRefs}
                />
              )}
          </div>
        </Panel>

        <Panel
          title={t.wordCloudTitle}
          badge={n(Math.min(visibleWords.length, maxCloudWords))}
          footer={
            <div style={{ fontSize: 11, color: 'var(--lt-fg-3)', textAlign: 'center' }}>
              {t.wordCloudDescription}
            </div>
          }
        >
          <div className="lt-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 10 }}>
            {visibleWords.length === 0
              ? <div style={{ color: 'var(--lt-fg-3)', fontSize: 12.5 }}>{t.wordCloudEmpty}</div>
              : (
                <WordCloud
                  words={visibleWords} maxWords={maxCloudWords} language={language}
                  hint={t.clickToMarkStopword} onWordClick={toggleStopword}
                />
              )}
          </div>
        </Panel>
      </div>

      {/* Fußzeile: Aktionen links, Blättern rechts */}
      <div style={{
        height: 48, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10,
        padding: '0 12px', borderTop: '1px solid var(--lt-line-1)',
        background: 'var(--lt-bg-0)', fontSize: 12, color: 'var(--lt-fg-2)',
      }}>
        <PrimaryButton icon="download" onClick={downloadText}>{t.downloadText}</PrimaryButton>
        <PrimaryButton icon="download" onClick={downloadStopwords} disabled={stopwords.size === 0}>
          {t.downloadStopwords}
        </PrimaryButton>

        <span style={{ flex: 1 }} />

        <span style={{ color: 'var(--lt-fg-3)' }}>{t.pageSize}</span>
        <select
          value={pageSize}
          onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
          aria-label={t.pageSize}
          style={{
            height: 26, padding: '0 4px', fontSize: 11.5, fontFamily: 'var(--lt-font-mono)',
            background: 'var(--lt-bg-1)', color: 'var(--lt-fg-1)',
            border: '1px solid var(--lt-line-1)', borderRadius: 'var(--lt-r-sm)',
          }}
        >
          {PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
        </select>
        <span style={{ fontFamily: 'var(--lt-font-mono)', color: 'var(--lt-fg-3)' }}>
          {n(from)}–{n(to)} {t.of} {n(tokens.length)}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PageButton icon="first" title={t.firstPage} disabled={safePage === 0} onClick={() => setPage(0)} />
          <PageButton icon="prev" title={t.prevPage} disabled={safePage === 0} onClick={() => setPage(safePage - 1)} />
          <span style={{ padding: '0 8px', fontFamily: 'var(--lt-font-mono)' }}>
            {t.page} <b>{safePage + 1}</b> {t.pageOf} {totalPages}
          </span>
          <PageButton icon="next" title={t.nextPage} disabled={safePage >= totalPages - 1} onClick={() => setPage(safePage + 1)} />
          <PageButton icon="last" title={t.lastPage} disabled={safePage >= totalPages - 1} onClick={() => setPage(totalPages - 1)} />
        </div>
      </div>
    </section>
  );
}

function PageButton({
  icon, title, disabled, onClick,
}: { icon: 'first' | 'prev' | 'next' | 'last'; title: string; disabled: boolean; onClick: () => void }) {
  const double = icon === 'first' || icon === 'last';
  const left = icon === 'first' || icon === 'prev';
  return (
    <button
      type="button" onClick={onClick} disabled={disabled} title={title} aria-label={title}
      style={{
        width: 26, height: 26, display: 'inline-flex', alignItems: 'center',
        justifyContent: 'center', background: 'transparent',
        border: '1px solid var(--lt-line-1)', borderRadius: 'var(--lt-r-xs)',
        color: disabled ? 'var(--lt-fg-4)' : 'var(--lt-fg-2)',
        cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.5 : 1, padding: 0,
      }}
    >
      <span style={{ display: 'inline-flex', transform: left ? 'rotate(180deg)' : undefined }}>
        <Icon name="chevron" size={10} />
        {double && <Icon name="chevron" size={10} style={{ marginLeft: -5 }} />}
      </span>
    </button>
  );
}
