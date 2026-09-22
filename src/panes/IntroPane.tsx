// Einführung: das Modul, das ohne geladenen Text sinnvoll ist.
//
// Es erklärt den Ablauf in drei Schritten und bietet die Einstiege an, die
// sonst im Konfigurator stecken — damit der erste Klick nicht gesucht
// werden muss.

import { formatNumber } from '../config/i18n';
import { Icon, Logo } from '../design/icons';
import {
  Callout, Card, Eyebrow, FilePicker, GhostButton, MonoBadge, PrimaryButton,
} from '../design/ui';
import { useWorkbench } from '../state/workbench';

export function IntroPane({ onPaste }: { onPaste: () => void }) {
  const {
    t, language, rawText, stats, stopwords, loadFile, loadSample,
    setActiveModule, graphBuilt, filteredGraph,
  } = useWorkbench();
  const n = (value: number) => formatNumber(value, language);

  const steps = [
    { icon: 'file' as const, text: t.introStep1 },
    { icon: 'type' as const, text: t.introStep2 },
    { icon: 'layers' as const, text: t.introStep3 },
  ];

  return (
    <section
      className="lt-scroll"
      style={{
        gridArea: 'main', minHeight: 0, minWidth: 0, overflowY: 'auto',
        background: 'var(--lt-bg-1)', padding: 20,
      }}
    >
      <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Card style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <Logo size={26} />
            <div>
              <Eyebrow>{t.toolSuite}</Eyebrow>
              <h1 style={{
                margin: '2px 0 0', fontSize: 20, fontWeight: 600,
                display: 'flex', alignItems: 'baseline', gap: 8,
              }}>
                {t.appTitle}
                <MonoBadge>v{__APP_VERSION__}</MonoBadge>
              </h1>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: 'var(--lt-fg-2)' }}>
            {t.introLead}
          </p>

          <ol style={{
            listStyle: 'none', margin: '16px 0 0', padding: 0,
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {steps.map((step, index) => (
              <li key={step.icon} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{
                  width: 24, height: 24, flexShrink: 0, borderRadius: 'var(--lt-r-sm)',
                  background: 'var(--lt-primary-soft)', border: '1px solid var(--lt-primary-line)',
                  color: 'var(--lt-primary)', display: 'inline-flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name={step.icon} size={13} />
                </span>
                <span style={{ fontSize: 12.5, lineHeight: 1.55, color: 'var(--lt-fg-2)', paddingTop: 3 }}>
                  <b style={{ fontFamily: 'var(--lt-font-mono)', color: 'var(--lt-fg-3)' }}>
                    {index + 1}.
                  </b>{' '}
                  {step.text}
                </span>
              </li>
            ))}
          </ol>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 18 }}>
            {rawText ? (
              <>
                <PrimaryButton icon="type" onClick={() => setActiveModule('exclude')}>
                  {t.navExclude}
                </PrimaryButton>
                <GhostButton icon="layers" onClick={() => setActiveModule('graph')}>
                  {t.navGraph}
                </GhostButton>
              </>
            ) : (
              <>
                <FilePicker label={t.uploadText} accept=".txt,text/plain" onPick={loadFile} primary />
                <GhostButton icon="file" onClick={() => void loadSample()}>{t.sampleText}</GhostButton>
                <GhostButton icon="type" onClick={onPaste}>{t.pasteText}</GhostButton>
              </>
            )}
          </div>
        </Card>

        {rawText && (
          <Card>
            <Eyebrow>{t.graphStats}</Eyebrow>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 22, marginTop: 8 }}>
              {([
                [t.totalWords, n(stats.totalWords)],
                [t.uniqueWords, n(stats.uniqueWords)],
                [t.stopwordsTitle, n(stopwords.size)],
                [t.hiddenWords, `${Math.round(stats.hiddenShare * 100)} %`],
                [t.nodes, graphBuilt ? n(filteredGraph.nodes.length) : '—'],
                [t.edges, graphBuilt ? n(filteredGraph.edges.length) : '—'],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span className="lt-eyebrow" style={{ fontSize: 10 }}>{label}</span>
                  <span style={{ fontSize: 16, fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Callout tone="warn" icon="warn">{t.introNote}</Callout>
      </div>
    </section>
  );
}
