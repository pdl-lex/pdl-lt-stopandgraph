// Bausteine nach dem Design-Handoff (pdl-lt-design/design_handoff_tools).
//
// Alle Farben kommen aus --lt-*; fest verdrahtete Hexwerte sind hier ein
// Fehler, sonst bricht der dunkle Modus. Die Ausnahme ist der Graph selbst
// — siehe graph/graphThemes.ts.

import {
  useEffect, useRef, useState,
  type CSSProperties, type ReactNode,
} from 'react';
import { Icon, type IconName } from './icons';
import { cardStyle, inputStyle } from './styles';
import { Kbd } from './widgets';

// ── Flächen ─────────────────────────────────────────────────────────────────

export function Card({
  children, style, className,
}: { children: ReactNode; style?: CSSProperties; className?: string }) {
  return <div className={className} style={{ ...cardStyle, padding: 14, ...style }}>{children}</div>;
}

/** Panel mit Kopfzeile: die Grundform der Ergebnisflächen (Korpus, Wortwolke). */
export function Panel({
  title, badge, actions, children, footer, style,
}: {
  title: ReactNode; badge?: ReactNode; actions?: ReactNode;
  children: ReactNode; footer?: ReactNode; style?: CSSProperties;
}) {
  return (
    <section style={{
      ...cardStyle, display: 'flex', flexDirection: 'column',
      minHeight: 0, minWidth: 0, overflow: 'hidden', ...style,
    }}>
      <header style={{
        display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
        padding: '0 10px', minHeight: 38, background: 'var(--lt-bg-1)',
        borderBottom: '1px solid var(--lt-line-1)',
      }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap' }}>{title}</span>
        {badge != null && <MonoBadge>{badge}</MonoBadge>}
        <span style={{ flex: 1 }} />
        {actions}
      </header>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
      {footer && (
        <footer style={{
          flexShrink: 0, borderTop: '1px solid var(--lt-line-1)',
          background: 'var(--lt-bg-1)', padding: '6px 10px',
        }}>{footer}</footer>
      )}
    </section>
  );
}

/** Aufklappbare Sektion mit Kopfzeile, Chevron und Mono-Abzeichen (Handoff §3). */
export function SectionFold({
  title, badge, defaultOpen = true, children,
}: { title: string; badge?: ReactNode; defaultOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ ...cardStyle, overflow: 'hidden', flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          padding: '9px 11px', background: 'var(--lt-bg-1)', border: 0,
          borderBottom: open ? '1px solid var(--lt-line-1)' : 0,
          cursor: 'pointer', textAlign: 'left', color: 'var(--lt-fg-1)',
        }}
      >
        <Icon name={open ? 'chevDown' : 'chevron'} size={11} style={{ color: 'var(--lt-fg-4)' }} />
        <span style={{ flex: 1, fontSize: 12, fontWeight: 600 }}>{title}</span>
        {badge != null && <MonoBadge>{badge}</MonoBadge>}
      </button>
      {open && (
        <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── Schaltflächen ───────────────────────────────────────────────────────────

const buttonBase: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
  height: 32, padding: '0 12px', borderRadius: 'var(--lt-r-md)',
  fontSize: 12.5, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
};

interface ButtonProps {
  children?: ReactNode;
  icon?: IconName;
  onClick?: () => void;
  disabled?: boolean;
  full?: boolean;
  kbd?: string;
  title?: string;
  style?: CSSProperties;
}

export function PrimaryButton({ children, icon, onClick, disabled, full, kbd, title, style }: ButtonProps) {
  return (
    <button
      type="button" onClick={onClick} disabled={disabled} title={title}
      style={{
        ...buttonBase,
        background: disabled ? 'var(--lt-fg-4)' : 'var(--lt-primary)',
        color: 'var(--lt-on-primary)',
        border: `1px solid ${disabled ? 'var(--lt-fg-4)' : 'var(--lt-primary)'}`,
        cursor: disabled ? 'default' : 'pointer',
        width: full ? '100%' : undefined,
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={13} />}
      {children}
      {kbd && <span style={{ opacity: 0.75, marginLeft: 2 }}><Kbd>{kbd}</Kbd></span>}
    </button>
  );
}

export function GhostButton({ children, icon, onClick, disabled, full, title, style }: ButtonProps) {
  return (
    <button
      type="button" onClick={onClick} disabled={disabled} title={title}
      style={{
        ...buttonBase,
        fontWeight: 500,
        background: 'var(--lt-bg-1)',
        color: disabled ? 'var(--lt-fg-4)' : 'var(--lt-fg-1)',
        border: '1px solid var(--lt-line-1)',
        cursor: disabled ? 'default' : 'pointer',
        width: full ? '100%' : undefined,
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={13} />}
      {children}
    </button>
  );
}

export function IconButton({
  name, onClick, title, size = 28, active = false, disabled = false, tone,
}: {
  name: IconName; onClick?: () => void; title?: string; size?: number;
  active?: boolean; disabled?: boolean; tone?: 'err';
}) {
  const color = disabled
    ? 'var(--lt-fg-4)'
    : tone === 'err' ? 'var(--lt-err)'
      : active ? 'var(--lt-primary)' : 'var(--lt-fg-2)';
  return (
    <button
      type="button" onClick={onClick} title={title} aria-label={title} disabled={disabled}
      style={{
        width: size, height: size, display: 'inline-flex', alignItems: 'center',
        justifyContent: 'center', borderRadius: 'var(--lt-r-sm)',
        background: active ? 'var(--lt-primary-soft)' : 'transparent',
        border: `1px solid ${active ? 'var(--lt-primary-line)' : 'transparent'}`,
        color, cursor: disabled ? 'default' : 'pointer', flexShrink: 0, padding: 0,
      }}
    >
      <Icon name={name} size={Math.round(size * 0.5)} />
    </button>
  );
}

// ── Eingaben ────────────────────────────────────────────────────────────────

export function Field({
  label, hint, children,
}: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--lt-fg-2)' }}>{label}</span>
      {children}
      {hint && <span style={{ fontSize: 11, color: 'var(--lt-fg-3)', lineHeight: 1.4 }}>{hint}</span>}
    </label>
  );
}

export function TextInput({
  value, onChange, placeholder, type = 'text', onKeyDown, style, inputRef,
}: {
  value: string; onChange: (value: string) => void; placeholder?: string;
  type?: string; onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  style?: CSSProperties; inputRef?: React.Ref<HTMLInputElement>;
}) {
  return (
    <input
      ref={inputRef} type={type} value={value} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)} onKeyDown={onKeyDown}
      style={{ ...inputStyle, ...style }}
    />
  );
}

export function NumberInput({
  value, onChange, min, max, step = 1,
}: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <input
      type="number" value={value} min={min} max={max} step={step}
      onChange={(e) => {
        const next = Number(e.target.value);
        if (Number.isNaN(next)) return;
        onChange(Math.min(max ?? Infinity, Math.max(min ?? -Infinity, next)));
      }}
      style={inputStyle}
    />
  );
}

export function Select<T extends string>({
  value, onChange, options, style,
}: {
  value: T; onChange: (value: T) => void;
  options: { value: T; label: string }[]; style?: CSSProperties;
}) {
  return (
    <select
      value={value} onChange={(e) => onChange(e.target.value as T)}
      style={{ ...inputStyle, ...style }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
}

/** Schalter 26×14 mit 12er-Knopf, wie im Handoff beschrieben. */
export function Toggle({
  checked, onChange, label, disabled = false,
}: { checked: boolean; onChange: (value: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: 9,
      cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.5 : 1,
    }}>
      <button
        type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        style={{
          width: 26, height: 14, flexShrink: 0, padding: 0, borderRadius: 7,
          border: `1px solid ${checked ? 'var(--lt-primary)' : 'var(--lt-line-3)'}`,
          background: checked ? 'var(--lt-primary)' : 'var(--lt-bg-2)',
          cursor: disabled ? 'default' : 'pointer', position: 'relative',
          transition: 'background .12s ease',
        }}
      >
        <span style={{
          position: 'absolute', top: 0, left: checked ? 12 : 0, width: 12, height: 12,
          borderRadius: '50%', background: checked ? 'var(--lt-on-primary)' : 'var(--lt-bg-0)',
          boxShadow: 'var(--lt-shadow-1)', transition: 'left .12s ease',
        }} />
      </button>
      <span style={{ fontSize: 12.5, flex: 1 }}>{label}</span>
    </label>
  );
}

export function RangeSlider({
  value, min, max, step = 1, onChange, label, marks,
}: {
  value: number; min: number; max: number; step?: number;
  onChange: (value: number) => void; label?: string; marks?: number[];
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input
          type="range" min={min} max={max} step={step} value={value} aria-label={label}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ flex: 1, accentColor: 'var(--lt-primary)', minWidth: 0 }}
        />
        <MonoBadge>{value}</MonoBadge>
      </div>
      {marks && (
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontFamily: 'var(--lt-font-mono)', fontSize: 10, color: 'var(--lt-fg-4)',
        }}>
          {marks.map((mark) => <span key={mark}>{mark}</span>)}
        </div>
      )}
    </div>
  );
}

/** Pille mit × — im Handoff die Darstellung ein-/ausgeschlossener Tags. */
export function Pill({
  children, tone = 'err', onRemove, title, count,
}: {
  children: ReactNode; tone?: 'primary' | 'err' | 'neutral';
  onRemove?: () => void; title?: string; count?: ReactNode;
}) {
  const colors = tone === 'primary'
    ? { fg: 'var(--lt-primary-strong)', bg: 'var(--lt-primary-soft)', line: 'var(--lt-primary-line)' }
    : tone === 'err'
      ? { fg: 'var(--lt-err)', bg: 'var(--lt-err-soft)', line: 'var(--lt-err-line)' }
      : { fg: 'var(--lt-fg-2)', bg: 'var(--lt-bg-2)', line: 'var(--lt-line-2)' };
  const content = (
    <>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {children}
      </span>
      {count != null && <span style={{ opacity: 0.6 }}>{count}</span>}
      {onRemove && <Icon name="x" size={8} style={{ opacity: 0.55 }} />}
    </>
  );

  const shape: CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: onRemove ? '2px 5px 2px 7px' : '2px 7px',
    background: colors.bg, color: colors.fg, border: `1px solid ${colors.line}`,
    borderRadius: 'var(--lt-r-xs)', fontSize: 11, fontFamily: 'var(--lt-font-mono)',
    lineHeight: 1.35, maxWidth: '100%',
  };

  if (!onRemove) return <span title={title} style={shape}>{content}</span>;

  return (
    <button type="button" title={title} onClick={onRemove} style={{ ...shape, cursor: 'pointer' }}>
      {content}
    </button>
  );
}

// ── Auszeichnungen ──────────────────────────────────────────────────────────

export function MonoBadge({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <span title={title} style={{
      fontFamily: 'var(--lt-font-mono)', fontSize: 10.5, color: 'var(--lt-fg-3)',
      background: 'var(--lt-bg-2)', padding: '1px 6px', borderRadius: 'var(--lt-r-xs)',
      whiteSpace: 'nowrap', flexShrink: 0,
    }}>{children}</span>
  );
}

type Tone = 'primary' | 'info' | 'warn' | 'err' | 'neutral';

const TONES: Record<Tone, { fg: string; bg: string; line: string }> = {
  primary: { fg: 'var(--lt-primary-strong)', bg: 'var(--lt-primary-soft)', line: 'var(--lt-primary-line)' },
  info: { fg: 'var(--lt-info)', bg: 'var(--lt-info-soft)', line: 'var(--lt-info-line)' },
  warn: { fg: 'var(--lt-warn)', bg: 'var(--lt-warn-soft)', line: 'var(--lt-warn-line)' },
  err: { fg: 'var(--lt-err)', bg: 'var(--lt-err-soft)', line: 'var(--lt-err-line)' },
  neutral: { fg: 'var(--lt-fg-2)', bg: 'var(--lt-bg-2)', line: 'var(--lt-line-2)' },
};

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: Tone }) {
  const c = TONES[tone];
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, color: c.fg, background: c.bg,
      border: `1px solid ${c.line}`, padding: '2px 7px',
      borderRadius: 'var(--lt-r-xs)', whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

export function Callout({
  children, tone = 'info', icon,
}: { children: ReactNode; tone?: Tone; icon?: IconName }) {
  const c = TONES[tone];
  return (
    <div style={{
      display: 'flex', gap: 8, alignItems: 'flex-start',
      background: c.bg, border: `1px solid ${c.line}`, color: c.fg,
      borderRadius: 'var(--lt-r-sm)', padding: '9px 11px', fontSize: 12, lineHeight: 1.45,
    }}>
      {icon && <Icon name={icon} size={13} style={{ flexShrink: 0, marginTop: 1 }} />}
      <div style={{ minWidth: 0 }}>{children}</div>
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="lt-eyebrow">{children}</div>;
}

export function EmptyState({ icon, children }: { icon?: IconName; children: ReactNode }) {
  return (
    <div style={{
      flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 8,
      alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center',
      color: 'var(--lt-fg-3)', fontSize: 12.5, lineHeight: 1.5,
    }}>
      {icon && <Icon name={icon} size={22} style={{ color: 'var(--lt-fg-4)' }} />}
      <div style={{ maxWidth: 340 }}>{children}</div>
    </div>
  );
}

// ── Modal ───────────────────────────────────────────────────────────────────

/** Modaler Dialog. Esc und Klick auf den Hintergrund schließen. */
export function Dialog({
  title, icon, onClose, children, width = 560,
}: { title: string; icon?: IconName; onClose: () => void; children: ReactNode; width?: number }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(8,12,10,0.42)', backdropFilter: 'blur(1.5px)',
        display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '7%',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog" aria-modal="true" aria-label={title}
        style={{
          width: `min(${width}px, 92vw)`, maxHeight: '80vh',
          background: 'var(--lt-bg-2)', border: '1px solid var(--lt-line-2)',
          borderRadius: 'var(--lt-r-md)', boxShadow: 'var(--lt-shadow-pop)',
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
          background: 'var(--lt-bg-0)', borderBottom: '1px solid var(--lt-line-1)', flexShrink: 0,
        }}>
          {icon && <Icon name={icon} size={15} style={{ color: 'var(--lt-primary)' }} />}
          <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{title}</span>
          <IconButton name="x" size={24} onClick={onClose} title="Esc" />
        </div>
        <div className="lt-scroll" style={{ padding: 16, overflowY: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

/** Versteckter Datei-Eingang plus auslösende Schaltfläche. */
export function FilePicker({
  label, icon = 'upload', accept, disabled = false, onPick, full, primary = false,
}: {
  label: string; icon?: IconName; accept?: string; disabled?: boolean;
  onPick: (file: File) => void; full?: boolean; primary?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const Button = primary ? PrimaryButton : GhostButton;
  return (
    <>
      <input
        ref={ref} type="file" accept={accept} style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';           // dieselbe Datei erneut zulassen
          if (file) onPick(file);
        }}
      />
      <Button icon={icon} disabled={disabled} full={full} onClick={() => ref.current?.click()}>
        {label}
      </Button>
    </>
  );
}
