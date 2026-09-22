// Text Tokenizer - splits text into words, punctuation, and whitespace

import { Token } from '../types';

let tokenIdCounter = 0;

const generateId = (): string => {
  return `token-${++tokenIdCounter}`;
};

// Reset counter (useful for testing or when loading new text)
export const resetTokenCounter = (): void => {
  tokenIdCounter = 0;
};

export const tokenizeText = (text: string, stopwords: Set<string>): Token[] => {
  resetTokenCounter();
  const tokens: Token[] = [];
  let remaining = text;
  
  while (remaining.length > 0) {
    // Try to match whitespace first
    const whitespaceMatch = remaining.match(/^(\s+)/);
    if (whitespaceMatch) {
      tokens.push({
        id: generateId(),
        text: whitespaceMatch[1],
        type: 'whitespace',
        isStopword: false,
        normalizedText: whitespaceMatch[1],
      });
      remaining = remaining.slice(whitespaceMatch[1].length);
      continue;
    }
    
    // Try to match a word (including Unicode letters and contractions)
    const wordMatch = remaining.match(/^([\p{L}\p{N}]+(?:[''][\p{L}]+)?)/u);
    if (wordMatch) {
      const word = wordMatch[1];
      const normalized = word.toLowerCase();
      tokens.push({
        id: generateId(),
        text: word,
        type: 'word',
        isStopword: stopwords.has(normalized),
        normalizedText: normalized,
      });
      remaining = remaining.slice(word.length);
      continue;
    }
    
    // Match punctuation or any other character
    const char = remaining[0];
    const normalized = char.toLowerCase();
    tokens.push({
      id: generateId(),
      text: char,
      type: 'punctuation',
      isStopword: stopwords.has(normalized),
      normalizedText: normalized,
    });
    remaining = remaining.slice(1);
  }
  
  return tokens;
};

export interface WordFrequencyEntry {
  word: string;          // first spelling seen, for display
  count: number;
  isStopword: boolean;
  isWord: boolean;       // false for punctuation
}

// Calculate frequencies from tokens.
//
// Punctuation is counted as well — `detectPunctuation` and the status bar
// need it — but it is flagged, so the word cloud and the unique-word figure
// can leave it out. Without that flag the cloud used to display "," and "."
// among the most frequent "words".
export const calculateFrequencies = (tokens: Token[]): Map<string, WordFrequencyEntry> => {
  const frequencies = new Map<string, WordFrequencyEntry>();

  for (const token of tokens) {
    if (token.type === 'whitespace') continue;

    const normalized = token.normalizedText;
    const existing = frequencies.get(normalized);

    if (existing) {
      existing.count++;
      existing.isStopword = token.isStopword;
    } else {
      frequencies.set(normalized, {
        word: token.text, // Keep original casing for display
        count: 1,
        isStopword: token.isStopword,
        isWord: token.type === 'word',
      });
    }
  }

  return frequencies;
};

// Generate cleaned text (stopwords replaced with placeholder)
export const generateCleanedText = (tokens: Token[], placeholder: string): string => {
  return tokens.map(token => {
    if (token.isStopword) {
      if (placeholder === '') {
        return ''; // Hidden mode
      }
      // Replace each character with the placeholder
      return placeholder.repeat(token.text.length);
    }
    return token.text;
  }).join('');
};

// Generate text for download (stopwords completely removed)
export const generateDownloadText = (tokens: Token[]): string => {
  let result = '';
  let lastWasStopword = false;
  
  for (const token of tokens) {
    if (token.isStopword) {
      lastWasStopword = true;
      continue;
    }
    
    if (token.type === 'whitespace') {
      // Only add whitespace if the previous non-whitespace wasn't a stopword
      // or if this is the first token
      if (!lastWasStopword || result === '') {
        result += token.text;
      } else {
        // Add a single space to separate words
        if (result.length > 0 && !result.endsWith(' ') && !result.endsWith('\n')) {
          result += ' ';
        }
      }
    } else {
      result += token.text;
      lastWasStopword = false;
    }
  }
  
  return result.trim();
};
