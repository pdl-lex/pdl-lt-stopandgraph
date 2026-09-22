// Plattformabhängige Tastenkürzel-Beschriftung.

export const IS_MAC = typeof navigator !== 'undefined'
  && /mac/i.test(navigator.platform || navigator.userAgent || '');

/** Modifikator-Kürzel: ⌘ auf dem Mac, sonst „Strg". */
export function kc(key: string): string {
  return IS_MAC ? `⌘${key}` : `Strg+${key}`;
}
