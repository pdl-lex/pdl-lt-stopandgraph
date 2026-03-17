// Graph Settings Panel - configuration for n-gram parsing and display

import {
  Paper,
  Box,
  Title,
  Stack,
  NumberInput,
  SegmentedControl,
  MultiSelect,
  Slider,
  Switch,
  Text,
  Group,
  Badge,
  Divider,
  Tooltip,
  Button,
} from '@mantine/core';
import { UILanguage } from '../config/i18n';
import { getGraphTranslation } from '../config/i18n-graph';
import { 
  NGramConfig, 
  GraphDisplayConfig,
  EdgeWeighting,
} from '../types/graph';

interface GraphSettingsPanelProps {
  uiLanguage: UILanguage;
  ngramConfig: NGramConfig;
  displayConfig: GraphDisplayConfig;
  availablePunctuation: string[];
  graphStats: {
    nodeCount: number;
    edgeCount: number;
    maxNodeFrequency: number;
    maxEdgeWeight: number;
    avgEdgeWeight: number;
  } | null;
  onNgramConfigChange: (config: NGramConfig) => void;
  onDisplayConfigChange: (config: GraphDisplayConfig) => void;
  onGenerateGraph: () => void;
  hasTokens: boolean;
}

export const GraphSettingsPanel = ({
  uiLanguage,
  ngramConfig,
  displayConfig,
  availablePunctuation,
  graphStats,
  onNgramConfigChange,
  onDisplayConfigChange,
  onGenerateGraph,
  hasTokens,
}: GraphSettingsPanelProps) => {
  const t = getGraphTranslation(uiLanguage);
  
  const updateWeighting = (updates: Partial<EdgeWeighting>) => {
    onNgramConfigChange({
      ...ngramConfig,
      weighting: { ...ngramConfig.weighting, ...updates } as EdgeWeighting,
    });
  };
  
  const switchWeightingType = (type: 'uniform' | 'distance') => {
    if (type === 'uniform') {
      onNgramConfigChange({
        ...ngramConfig,
        weighting: { type: 'uniform', value: 1 },
      });
    } else {
      onNgramConfigChange({
        ...ngramConfig,
        weighting: { 
          type: 'distance', 
          baseValue: 1, 
          bonusRange: 2, 
          bonusValue: 1 
        },
      });
    }
  };
  
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
      <Box
        p="sm"
        style={{
          borderBottom: '1px solid #b7c8c1',
          backgroundColor: '#f8faf9',
          borderRadius: 'var(--mantine-radius-md) var(--mantine-radius-md) 0 0',
        }}
      >
        <Title order={4} style={{ color: '#003835' }}>
          {t.graphSettings}
        </Title>
      </Box>
      
      <Box p="md" style={{ flex: 1, overflowY: 'auto' }}>
        <Stack gap="lg">
          {/* N-gram Window Size */}
          <Box>
            <Text size="sm" fw={500} mb="xs">{t.windowSize}</Text>
            <Slider
              value={ngramConfig.windowSize}
              onChange={(value) => onNgramConfigChange({ 
                ...ngramConfig, 
                windowSize: value 
              })}
              min={2}
              max={15}
              step={1}
              marks={[
                { value: 2, label: '2' },
                { value: 5, label: '5' },
                { value: 10, label: '10' },
                { value: 15, label: '15' },
              ]}
              styles={{
                markLabel: { fontSize: '0.7rem' },
              }}
            />
            <Text size="xs" c="dimmed" mt="xs">{t.windowSizeHelp}</Text>
          </Box>
          
          <Divider />
          
          {/* Edge Weighting */}
          <Box>
            <Text size="sm" fw={500} mb="xs">{t.edgeWeighting}</Text>
            <SegmentedControl
              value={ngramConfig.weighting.type}
              onChange={(value) => switchWeightingType(value as 'uniform' | 'distance')}
              data={[
                { label: t.weightingUniform, value: 'uniform' },
                { label: t.weightingDistance, value: 'distance' },
              ]}
              fullWidth
              size="xs"
            />
            
            {ngramConfig.weighting.type === 'uniform' ? (
              <NumberInput
                label={t.uniformValue}
                value={ngramConfig.weighting.value}
                onChange={(value) => updateWeighting({ value: Number(value) || 1 })}
                min={1}
                max={10}
                mt="sm"
                size="xs"
              />
            ) : (
              <Stack gap="xs" mt="sm">
                <NumberInput
                  label={t.baseValue}
                  value={ngramConfig.weighting.baseValue}
                  onChange={(value) => updateWeighting({ baseValue: Number(value) || 1 })}
                  min={1}
                  max={10}
                  size="xs"
                />
                <Group grow>
                  <NumberInput
                    label={t.bonusRange}
                    value={ngramConfig.weighting.bonusRange}
                    onChange={(value) => updateWeighting({ bonusRange: Number(value) || 1 })}
                    min={1}
                    max={ngramConfig.windowSize - 1}
                    size="xs"
                  />
                  <NumberInput
                    label={t.bonusValue}
                    value={ngramConfig.weighting.bonusValue}
                    onChange={(value) => updateWeighting({ bonusValue: Number(value) || 1 })}
                    min={1}
                    max={10}
                    size="xs"
                  />
                </Group>
                <Text size="xs" c="dimmed">{t.bonusRangeHelp}</Text>
              </Stack>
            )}
          </Box>
          
          <Divider />
          
          {/* Sentence Boundaries */}
          <Box>
            <Text size="sm" fw={500} mb="xs">{t.sentenceBoundaries}</Text>
            {availablePunctuation.length > 0 ? (
              <MultiSelect
                data={availablePunctuation.map(p => ({ value: p, label: p }))}
                value={ngramConfig.sentenceBoundaries}
                onChange={(value) => onNgramConfigChange({
                  ...ngramConfig,
                  sentenceBoundaries: value,
                })}
                placeholder={t.sentenceBoundariesHelp}
                size="xs"
                clearable
              />
            ) : (
              <Text size="xs" c="dimmed" fs="italic">
                {t.noPunctuationFound}
              </Text>
            )}
          </Box>
          
          <Divider />
          
          {/* Display Filters */}
          <Box>
            <Text size="sm" fw={500} mb="xs">{t.displayFilters}</Text>
            <Stack gap="xs">
              <NumberInput
                label={t.minEdgeWeight}
                value={displayConfig.minEdgeWeight}
                onChange={(value) => onDisplayConfigChange({
                  ...displayConfig,
                  minEdgeWeight: Number(value) || 1,
                })}
                min={1}
                max={graphStats?.maxEdgeWeight || 100}
                size="xs"
              />
              <NumberInput
                label={t.minNodeFrequency}
                value={displayConfig.minNodeFrequency}
                onChange={(value) => onDisplayConfigChange({
                  ...displayConfig,
                  minNodeFrequency: Number(value) || 1,
                })}
                min={1}
                max={graphStats?.maxNodeFrequency || 100}
                size="xs"
              />
              <Switch
                label={t.showLabels}
                checked={displayConfig.showLabels}
                onChange={(e) => onDisplayConfigChange({
                  ...displayConfig,
                  showLabels: e.currentTarget.checked,
                })}
                size="sm"
              />
            </Stack>
          </Box>
          
          {/* Stats */}
          {graphStats && (
            <>
              <Divider />
              <Box>
                <Text size="sm" fw={500} mb="xs">{t.graphStats}</Text>
                <Group gap="xs" wrap="wrap">
                  <Badge variant="light" color="teal" size="sm">
                    {t.nodes}: {graphStats.nodeCount}
                  </Badge>
                  <Badge variant="light" color="teal" size="sm">
                    {t.edges}: {graphStats.edgeCount}
                  </Badge>
                  <Badge variant="light" color="gray" size="sm">
                    {t.maxWeight}: {graphStats.maxEdgeWeight}
                  </Badge>
                  <Badge variant="light" color="gray" size="sm">
                    {t.avgWeight}: {graphStats.avgEdgeWeight}
                  </Badge>
                </Group>
              </Box>
            </>
          )}
        </Stack>
      </Box>
      
      {/* Generate Button */}
      <Box
        p="sm"
        style={{
          borderTop: '1px solid #b7c8c1',
          backgroundColor: '#f8faf9',
        }}
      >
        <Button
          fullWidth
          color="teal"
          onClick={onGenerateGraph}
          disabled={!hasTokens}
          leftSection={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <circle cx="19" cy="5" r="2" />
              <circle cx="5" cy="19" r="2" />
              <circle cx="5" cy="5" r="2" />
              <circle cx="19" cy="19" r="2" />
              <line x1="12" y1="9" x2="12" y2="5" />
              <line x1="9.5" y1="13.5" x2="5.5" y2="17.5" />
              <line x1="14.5" y1="13.5" x2="18.5" y2="17.5" />
            </svg>
          }
        >
          {t.generateGraph}
        </Button>
      </Box>
    </Paper>
  );
};
