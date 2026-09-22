// Kopfzeile, 44 px (Handoff §1): Logo, Brotkrume, Befehlspalette,
// Anordnungsschalter, Sprache, Hell/Dunkel.

import { Icon, Logo } from '../design/icons';
import { IconButton } from '../design/ui';
import { kc } from '../design/platform';
import { Kbd } from '../design/widgets';
import type { UILanguage } from '../config/i18n';
import { useWorkbench, type LayoutMode, type ModuleId } from '../state/workbench';

const LAYOUTS: {
  mode: LayoutMode;
  icon: 'panelL' | 'panelR' | 'panelT';
  key: 'layoutLeft' | 'layoutRight' | 'layoutTop';
}[] = [
  { mode: 'left', icon: 'panelL', key: 'layoutLeft' },
  { mode: 'right', icon: 'panelR', key: 'layoutRight' },
  { mode: 'bottom', icon: 'panelT', key: 'layoutTop' },
];

const MODULE_LABEL: Record<ModuleId, 'navIntro' | 'navExclude' | 'navGraph'> = {
  intro: 'navIntro',
  exclude: 'navExclude',
  graph: 'navGraph',
};

export function Header({ onOpenPalette }: { onOpenPalette: () => void }) {
  const {
    t, language, setLanguage, theme, toggleTheme, layout, setLayout, activeModule,
  } = useWorkbench();

  return (
    <header style={{
      gridArea: 'head', display: 'flex', alignItems: 'center', gap: 14,
      padding: '0 12px', background: 'var(--lt-bg-0)',
      borderBottom: '1px solid var(--lt-line-1)', minWidth: 0,
    }}>
      <Logo size={18} />
      <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>{t.toolSuite}</span>
      <span style={{ color: 'var(--lt-fg-4)' }}>/</span>
      <span style={{
        fontSize: 13, color: 'var(--lt-fg-3)', whiteSpace: 'nowrap',
        overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{t.appTitle}</span>
      <span style={{ color: 'var(--lt-fg-4)' }}>/</span>
      <span style={{ fontSize: 13, color: 'var(--lt-fg-2)', whiteSpace: 'nowrap' }}>
        {t[MODULE_LABEL[activeModule]]}
      </span>

      <div style={{ flex: 1, minWidth: 8 }} />

      <button
        type="button" onClick={onOpenPalette}
        style={{
          display: 'flex', alignItems: 'center', gap: 7, width: 240, height: 26,
          padding: '0 9px', background: 'var(--lt-bg-1)',
          border: '1px solid var(--lt-line-1)', borderRadius: 'var(--lt-r-sm)',
          color: 'var(--lt-fg-3)', fontSize: 12, cursor: 'pointer', textAlign: 'left',
          flexShrink: 1, minWidth: 0,
        }}
      >
        <Icon name="search" size={12} />
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {t.commandPlaceholder}
        </span>
        <Kbd>{kc('K')}</Kbd>
      </button>

      <div style={{
        display: 'flex', gap: 2, padding: 2, background: 'var(--lt-bg-2)',
        borderRadius: 'var(--lt-r-sm)', flexShrink: 0,
      }}>
        {LAYOUTS.map(({ mode, icon, key }) => (
          <IconButton
            key={mode} name={icon} size={24} active={layout === mode}
            title={t[key]} onClick={() => setLayout(mode)}
          />
        ))}
      </div>

      <select
        value={language} onChange={(e) => setLanguage(e.target.value as UILanguage)}
        aria-label={t.language}
        style={{
          height: 26, padding: '0 4px', fontSize: 11.5, flexShrink: 0,
          background: 'var(--lt-bg-1)', color: 'var(--lt-fg-2)',
          border: '1px solid var(--lt-line-1)', borderRadius: 'var(--lt-r-sm)',
        }}
      >
        <option value="de">DE</option>
        <option value="en">EN</option>
      </select>

      <IconButton
        name={theme === 'light' ? 'moon' : 'sun'} size={28}
        title={theme === 'light' ? t.themeDark : t.themeLight}
        onClick={toggleTheme}
      />
    </header>
  );
}
