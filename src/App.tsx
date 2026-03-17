// Main Application Component

import { useState, useMemo, useCallback } from 'react';
import {
  MantineProvider,
  AppShell,
  Box,
  Stack,
  Group,
  Paper,
  Drawer,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import '@mantine/core/styles.css';
import { theme } from './config/theme';
import { useAppState } from './hooks/useAppState';
import { generateDownloadText } from './hooks/useTokenizer';
import {
  buildCooccurrenceGraph,
  filterGraph,
  getGraphStats,
  detectPunctuation,
} from './hooks/useGraphBuilder';
import { Header } from './components/Header';
import { Sidebar, PageType } from './components/Sidebar';
import { CorpusPanel } from './components/CorpusPanel';
import { TextInputPanel } from './components/TextInputPanel';
import { WordCloudPanel } from './components/WordCloudPanel';
import { StopwordsPanel } from './components/StopwordsPanel';
import { GraphSettingsPanel } from './components/GraphSettingsPanel';
import { ForceGraph } from './components/ForceGraph';
import { StopwordLanguage } from './data/stopwords';
import {
  NGramConfig,
  GraphDisplayConfig,
  GraphData,
  defaultNGramConfig,
  defaultGraphDisplayConfig,
} from './types/graph';

const PADDING = 20; // px gap from viewport edge (all sides)

function App() {
  const {
    rawText,
    tokens,
    setRawText,
    stopwords,
    addStopword,
    removeStopword,
    loadStandardStopwords,
    uiLanguage,
    setUILanguage,
    placeholderStyle,
    setPlaceholderStyle,
    stopwordViewMode,
    setStopwordViewMode,
    visibleWordFrequencies,
    stopwordList,
    stats,
    resetAll,
  } = useAppState();

  const [mobileNavOpened, { toggle: toggleMobileNav, close: closeMobileNav }] = useDisclosure(false);
  const isMobile = useMediaQuery('(max-width: 768px)') ?? false;
  const [activePage, setActivePage] = useState<PageType>('stopwords');

  const [ngramConfig, setNgramConfig] = useState<NGramConfig>(defaultNGramConfig);
  const [displayConfig, setDisplayConfig] = useState<GraphDisplayConfig>(defaultGraphDisplayConfig);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });

  const availablePunctuation = useMemo(() => detectPunctuation(tokens), [tokens]);

  const handleGenerateGraph = useCallback(() => {
    const fullGraph = buildCooccurrenceGraph(tokens, ngramConfig);
    setGraphData(fullGraph);
  }, [tokens, ngramConfig]);

  const filteredGraph = useMemo(
    () => filterGraph(graphData, displayConfig.minEdgeWeight, displayConfig.minNodeFrequency),
    [graphData, displayConfig.minEdgeWeight, displayConfig.minNodeFrequency]
  );

  const graphStats = useMemo(
    () => (filteredGraph.nodes.length === 0 ? null : getGraphStats(filteredGraph)),
    [filteredGraph]
  );

  const handleCorpusWordClick = (word: string) => {
    const normalized = word.toLowerCase();
    if (stopwords.has(normalized)) removeStopword(normalized);
    else addStopword(normalized);
  };

  const handleFileUpload = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setRawText(e.target?.result as string);
      setGraphData({ nodes: [], edges: [] });
    };
    reader.readAsText(file);
  };

  const handleDownloadStopwords = () => {
    const content = stopwordList.map((item) => item.word).sort().join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stopwords.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadText = () => {
    const blob = new Blob([generateDownloadText(tokens)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cleaned_text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    resetAll();
    setGraphData({ nodes: [], edges: [] });
    setActivePage('stopwords');
    closeMobileNav();
  };

  const handlePageChange = (page: PageType) => {
    setActivePage(page);
    closeMobileNav();
  };

  const sidebarContent = (
    <Sidebar
      activePage={activePage}
      onPageChange={handlePageChange}
      onReset={handleReset}
      uiLanguage={uiLanguage}
    />
  );

  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      {/* AppShell without a fixed header — everything lives inside Main */}
      <AppShell padding={PADDING}>
        <AppShell.Main style={{ backgroundColor: '#f5f7f6' }}>
          {/* Full-height flex column that fills the padded viewport */}
          <Box
            style={{
              height: `calc(100vh - ${PADDING * 2}px)`,
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--mantine-spacing-md)',
            }}
          >
            {/* ── Title bar (rounded box) ── */}
            <Paper
              shadow="sm"
              radius="md"
              style={{
                backgroundColor: '#003835',
                flexShrink: 0,
                overflow: 'hidden',
              }}
            >
              <Header
                uiLanguage={uiLanguage}
                setUILanguage={setUILanguage}
                mobileNavOpened={mobileNavOpened}
                toggleMobileNav={toggleMobileNav}
              />
            </Paper>

            {/* Mobile nav drawer */}
            <Drawer
              opened={mobileNavOpened}
              onClose={closeMobileNav}
              size={240}
              padding="md"
              title={uiLanguage === 'de' ? 'Navigation' : 'Navigation'}
            >
              {sidebarContent}
            </Drawer>

            {/* ── Content row (fills remaining height) ── */}
            <Box style={{ flex: 1, minHeight: 0 }}>
              <Group align="flex-start" gap="md" wrap="nowrap" style={{ height: '100%' }}>

                {/* Sidebar box – visible on sm+ */}
                <Box visibleFrom="sm" style={{ width: 220, flexShrink: 0, height: '100%' }}>
                  <Paper
                    shadow="sm"
                    radius="md"
                    style={{
                      height: '100%',
                      border: '1px solid #b7c8c1',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {sidebarContent}
                  </Paper>
                </Box>

                {/* Main content */}
                <Box style={{ flex: 1, minWidth: 0, height: '100%' }}>
                  {activePage === 'stopwords' ? (
                    /* ── Wortausschluss ── */
                    <Stack gap="sm" style={{ height: '100%' }}>
                      {/* CSS Grid for correct height propagation; stack on mobile */}
                      <Box
                        style={{
                          flex: 1,
                          minHeight: 0,
                          display: 'grid',
                          gridTemplateColumns: isMobile ? '1fr' : '7fr 5fr',
                          gridTemplateRows: isMobile ? 'auto' : '1fr',
                          gap: 'var(--mantine-spacing-md)',
                        }}
                      >
                        <Box style={{ minWidth: 0, minHeight: isMobile ? 500 : 0 }}>
                          {rawText ? (
                            <CorpusPanel
                              tokens={tokens}
                              placeholderStyle={placeholderStyle}
                              onPlaceholderStyleChange={setPlaceholderStyle}
                              onWordClick={handleCorpusWordClick}
                              onFileUpload={handleFileUpload}
                              onDownloadText={handleDownloadText}
                              hasText={rawText.length > 0}
                              uiLanguage={uiLanguage}
                              stats={stats}
                            />
                          ) : (
                            <TextInputPanel
                              value={rawText}
                              onChange={setRawText}
                              onFileUpload={handleFileUpload}
                              uiLanguage={uiLanguage}
                            />
                          )}
                        </Box>

                        <Stack gap="md" style={{ minWidth: 0 }}>
                          <Box style={{ flex: 1, minHeight: isMobile ? 300 : 0 }}>
                            <WordCloudPanel
                              words={visibleWordFrequencies}
                              onWordClick={addStopword}
                              uiLanguage={uiLanguage}
                            />
                          </Box>
                          <Box style={{ flex: 1, minHeight: isMobile ? 300 : 0 }}>
                            <StopwordsPanel
                              stopwords={stopwordList}
                              onWordClick={removeStopword}
                              viewMode={stopwordViewMode}
                              setViewMode={setStopwordViewMode}
                              onLoadStandardList={(lang: StopwordLanguage) => loadStandardStopwords(lang)}
                              onDownloadStopwords={handleDownloadStopwords}
                              uiLanguage={uiLanguage}
                            />
                          </Box>
                        </Stack>
                      </Box>
                    </Stack>
                  ) : (
                    /* ── Visualisierung ── */
                    <Box
                      style={{
                        height: '100%',
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : '7fr 5fr',
                        gridTemplateRows: isMobile ? 'auto' : '1fr',
                        gap: 'var(--mantine-spacing-md)',
                      }}
                    >
                      <Box style={{ minWidth: 0, minHeight: isMobile ? 500 : 0 }}>
                        <ForceGraph
                          data={filteredGraph}
                          displayConfig={displayConfig}
                          uiLanguage={uiLanguage}
                        />
                      </Box>

                      <Box style={{ minWidth: 0, overflowY: 'auto' }}>
                        <GraphSettingsPanel
                          uiLanguage={uiLanguage}
                          ngramConfig={ngramConfig}
                          displayConfig={displayConfig}
                          availablePunctuation={availablePunctuation}
                          graphStats={graphStats}
                          onNgramConfigChange={setNgramConfig}
                          onDisplayConfigChange={setDisplayConfig}
                          onGenerateGraph={handleGenerateGraph}
                          hasTokens={tokens.length > 0}
                        />
                      </Box>
                    </Box>
                  )}
                </Box>
              </Group>
            </Box>
          </Box>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}

export default App;
