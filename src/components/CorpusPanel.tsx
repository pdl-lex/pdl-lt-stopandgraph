// Corpus Panel - displays the text with clickable words, paginated

import {
  Paper,
  Title,
  Text,
  Box,
  ScrollArea,
  Tooltip,
  Group,
  TextInput,
  ActionIcon,
  Badge,
  Select,
  FileButton,
  Button,
  Menu,
  Divider,
} from '@mantine/core';
import { Token, PlaceholderStyle, placeholderChars } from '../types';
import { UILanguage, getTranslation } from '../config/i18n';
import { useMemo, useState, useRef, useEffect, useCallback } from 'react';

const PAGE_SIZE = 500; // tokens per page

interface StatsData {
  totalWords: number;
  uniqueWords: number;
  hiddenWords: number;
}

interface CorpusPanelProps {
  tokens: Token[];
  placeholderStyle: PlaceholderStyle;
  onPlaceholderStyleChange: (style: PlaceholderStyle) => void;
  onWordClick: (word: string) => void;
  onFileUpload: (file: File | null) => void;
  onDownloadText: () => void;
  hasText: boolean;
  uiLanguage: UILanguage;
  stats: StatsData;
}

export const CorpusPanel = ({
  tokens,
  placeholderStyle,
  onPlaceholderStyleChange,
  onWordClick,
  onFileUpload,
  onDownloadText,
  hasText,
  uiLanguage,
  stats,
}: CorpusPanelProps) => {
  const t = getTranslation(uiLanguage);
  const placeholder = placeholderChars[placeholderStyle];

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const matchRefs = useRef<Map<number, HTMLSpanElement>>(new Map());

  const totalPages = useMemo(() => Math.max(1, Math.ceil(tokens.length / PAGE_SIZE)), [tokens.length]);

  // Reset page and search when tokens change (new text loaded)
  useEffect(() => {
    setCurrentPage(0);
    setCurrentMatchIndex(0);
    setSearchQuery('');
  }, [tokens]);

  // Find matching token indices (global, across all pages)
  const matchingIndices = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const indices: number[] = [];
    tokens.forEach((token, index) => {
      if (token.type === 'word' && token.normalizedText.includes(query)) {
        indices.push(index);
      }
    });
    return indices;
  }, [tokens, searchQuery]);

  // Reset match index when search changes
  useEffect(() => {
    setCurrentMatchIndex(0);
  }, [searchQuery]);

  // Navigate to correct page and scroll when match changes
  useEffect(() => {
    if (matchingIndices.length === 0) return;
    const globalIdx = matchingIndices[currentMatchIndex];
    const targetPage = Math.floor(globalIdx / PAGE_SIZE);
    if (targetPage !== currentPage) {
      setCurrentPage(targetPage);
      return; // scroll will happen after the page re-renders (effect re-runs with new currentPage)
    }
    const element = matchRefs.current.get(globalIdx);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentMatchIndex, currentPage, matchingIndices]);

  // Scroll to top when page changes (unless it's a search-driven page change)
  const prevPageRef = useRef(currentPage);
  useEffect(() => {
    if (prevPageRef.current !== currentPage && matchingIndices.length === 0) {
      scrollAreaRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
    prevPageRef.current = currentPage;
  }, [currentPage, matchingIndices.length]);

  const goToNextMatch = useCallback(() => {
    if (matchingIndices.length > 0) {
      setCurrentMatchIndex((prev) => (prev + 1) % matchingIndices.length);
    }
  }, [matchingIndices.length]);

  const goToPrevMatch = useCallback(() => {
    if (matchingIndices.length > 0) {
      setCurrentMatchIndex((prev) => (prev - 1 + matchingIndices.length) % matchingIndices.length);
    }
  }, [matchingIndices.length]);

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) goToPrevMatch();
      else goToNextMatch();
    }
  }, [goToNextMatch, goToPrevMatch]);

  const placeholderOptions = [
    { value: 'underscore', label: t.placeholderUnderscore },
    { value: 'dot', label: t.placeholderDot },
    { value: 'dash', label: t.placeholderDash },
    { value: 'hidden', label: t.placeholderHidden },
  ];

  // Render only the tokens for the current page
  const renderedContent = useMemo(() => {
    const startIdx = currentPage * PAGE_SIZE;
    const pageSlice = tokens.slice(startIdx, startIdx + PAGE_SIZE);

    if (pageSlice.length === 0) {
      return (
        <Text c="dimmed" ta="center" py="xl">
          {t.corpusEmpty}
        </Text>
      );
    }

    matchRefs.current.clear();

    return pageSlice.map((token, localIdx) => {
      const globalIdx = startIdx + localIdx;

      if (token.type === 'whitespace') {
        if (token.text.includes('\n')) {
          const parts = token.text.split('\n');
          return parts.map((part, idx) => (
            <span key={`${token.id}-${idx}`}>
              {part}
              {idx < parts.length - 1 && <br />}
            </span>
          ));
        }
        return <span key={token.id}>{token.text}</span>;
      }

      const isMatch = matchingIndices.includes(globalIdx);
      const isCurrentMatch = isMatch && matchingIndices[currentMatchIndex] === globalIdx;

      if (token.isStopword) {
        if (placeholderStyle === 'hidden') return null;
        return (
          <Tooltip key={token.id} label={`${token.text} – ${t.clickToRestore}`} position="top" withArrow>
            <span
              onClick={() => onWordClick(token.normalizedText)}
              style={{ color: '#999', cursor: 'pointer', userSelect: 'none', transition: 'color 0.15s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#006844'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#999'; }}
            >
              {placeholder.repeat(token.text.length)}
            </span>
          </Tooltip>
        );
      }

      return (
        <Tooltip key={token.id} label={t.clickToMarkStopword} position="top" withArrow openDelay={300}>
          <span
            ref={isMatch ? (el) => { if (el) matchRefs.current.set(globalIdx, el); } : undefined}
            onClick={() => onWordClick(token.normalizedText)}
            style={{
              cursor: 'pointer',
              borderRadius: '2px',
              transition: 'background-color 0.15s ease',
              backgroundColor: isCurrentMatch
                ? 'rgba(0, 104, 68, 0.4)'
                : isMatch
                  ? 'rgba(0, 104, 68, 0.15)'
                  : 'transparent',
              padding: isMatch ? '0 2px' : undefined,
            }}
            onMouseEnter={(e) => {
              if (!isCurrentMatch) {
                e.currentTarget.style.backgroundColor = isMatch
                  ? 'rgba(0, 104, 68, 0.25)'
                  : 'rgba(0, 104, 68, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isCurrentMatch
                ? 'rgba(0, 104, 68, 0.4)'
                : isMatch
                  ? 'rgba(0, 104, 68, 0.15)'
                  : 'transparent';
            }}
          >
            {token.text}
          </span>
        </Tooltip>
      );
    });
  }, [tokens, currentPage, placeholderStyle, placeholder, onWordClick, t, matchingIndices, currentMatchIndex]);

  return (
    <Paper
      shadow="sm"
      radius="md"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #b7c8c1',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        p="sm"
        style={{
          borderBottom: '1px solid #b7c8c1',
          backgroundColor: '#f8faf9',
          borderRadius: 'var(--mantine-radius-md) var(--mantine-radius-md) 0 0',
          flexShrink: 0,
        }}
      >
        {/* Row 1: Title + action buttons */}
        <Group justify="space-between" align="center" mb="xs">
          <Title order={4} style={{ color: '#003835' }}>
            {t.corpusTitle}
          </Title>

          <Group gap="xs">
            <FileButton onChange={onFileUpload} accept=".txt,text/plain">
              {(props) => (
                <Button
                  {...props}
                  variant="subtle"
                  color="teal"
                  size="xs"
                  leftSection={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="17,8 12,3 7,8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  }
                >
                  {t.uploadText}
                </Button>
              )}
            </FileButton>

            <Button
              variant="subtle"
              color="gray"
              size="xs"
              disabled
              leftSection={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                </svg>
              }
            >
              {t.selectCorpus}
            </Button>

            <Button
              variant="subtle"
              color="gray"
              size="xs"
              disabled={!hasText}
              onClick={onDownloadText}
              leftSection={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7,10 12,15 17,10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              }
            >
              {t.downloadText}
            </Button>
          </Group>
        </Group>

        {/* Row 2: Stats badges */}
        {stats.totalWords > 0 && (
          <Group gap="xs" mb="xs">
            <Badge variant="light" color="gray" size="sm">
              {uiLanguage === 'de' ? 'Wörter' : 'Words'}: {stats.totalWords.toLocaleString()}
            </Badge>
            <Badge variant="light" color="teal" size="sm">
              {uiLanguage === 'de' ? 'Eindeutig' : 'Unique'}: {stats.uniqueWords.toLocaleString()}
            </Badge>
            {stats.hiddenWords > 0 && (
              <Badge variant="filled" color="red" size="sm">
                {uiLanguage === 'de' ? 'Ausgeblendet' : 'Hidden'}: {stats.hiddenWords.toLocaleString()}
              </Badge>
            )}
          </Group>
        )}

        {/* Row 3: Search + placeholder style */}
        <Group gap="sm">
          <TextInput
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            onKeyDown={handleSearchKeyDown}
            size="xs"
            style={{ flex: 1 }}
            rightSection={
              matchingIndices.length > 0 ? (
                <Badge size="xs" variant="light" color="teal">
                  {currentMatchIndex + 1}/{matchingIndices.length}
                </Badge>
              ) : searchQuery ? (
                <Badge size="xs" variant="light" color="gray">0</Badge>
              ) : null
            }
            rightSectionWidth={60}
            leftSection={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            }
          />

          <Group gap={4}>
            <ActionIcon variant="subtle" color="teal" size="sm" disabled={matchingIndices.length === 0} onClick={goToPrevMatch}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15,18 9,12 15,6" />
              </svg>
            </ActionIcon>
            <ActionIcon variant="subtle" color="teal" size="sm" disabled={matchingIndices.length === 0} onClick={goToNextMatch}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9,18 15,12 9,6" />
              </svg>
            </ActionIcon>
          </Group>

          <Divider orientation="vertical" />

          <Select
            value={placeholderStyle}
            onChange={(value) => onPlaceholderStyleChange(value as PlaceholderStyle)}
            data={placeholderOptions}
            size="xs"
            w={140}
            allowDeselect={false}
          />
        </Group>
      </Box>

      {/* Content */}
      <ScrollArea
        ref={scrollAreaRef}
        style={{ flex: 1 }}
        p="md"
        type="auto"
        offsetScrollbars
      >
        <Box
          style={{
            fontFamily: '"Noto Serif", Georgia, serif',
            fontSize: '1rem',
            lineHeight: 1.8,
            color: '#1a1a1a',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {renderedContent}
        </Box>
      </ScrollArea>

      {/* Pagination footer */}
      {totalPages > 1 && (
        <Box
          px="sm"
          py="xs"
          style={{
            borderTop: '1px solid #b7c8c1',
            backgroundColor: '#f8faf9',
            flexShrink: 0,
          }}
        >
          <Group justify="center" gap="sm">
            <ActionIcon
              variant="subtle"
              color="teal"
              size="sm"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15,18 9,12 15,6" />
              </svg>
            </ActionIcon>

            <Text size="xs" c="dimmed">
              {uiLanguage === 'de' ? 'Seite' : 'Page'} {currentPage + 1} / {totalPages}
            </Text>

            <ActionIcon
              variant="subtle"
              color="teal"
              size="sm"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9,18 15,12 9,6" />
              </svg>
            </ActionIcon>
          </Group>
        </Box>
      )}
    </Paper>
  );
};
