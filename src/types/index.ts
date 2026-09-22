// Type definitions for the Stopword Tool

export interface Token {
  id: string;
  text: string;
  type: 'word' | 'punctuation' | 'whitespace';
  isStopword: boolean;
  normalizedText: string; // lowercase for comparison
}

export type PlaceholderStyle = 'underscore' | 'dot' | 'dash' | 'hidden';

export const placeholderChars: Record<PlaceholderStyle, string> = {
  underscore: '_',
  dot: '·',
  dash: '—',
  hidden: '',
};
