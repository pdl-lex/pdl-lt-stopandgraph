// Sidebar Navigation Component

import { NavLink, Stack, Text, Box, Button } from '@mantine/core';
import { UILanguage } from '../config/i18n';

export type PageType = 'stopwords' | 'visualization';

interface SidebarProps {
  activePage: PageType;
  onPageChange: (page: PageType) => void;
  onReset: () => void;
  uiLanguage: UILanguage;
}

const StopwordsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10,9 9,9 8,9" />
  </svg>
);

const VisualizationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <circle cx="3.5" cy="6" r="2" />
    <circle cx="20.5" cy="6" r="2" />
    <circle cx="3.5" cy="18" r="2" />
    <circle cx="20.5" cy="18" r="2" />
    <line x1="5.5" y1="6.8" x2="10" y2="11" />
    <line x1="18.5" y1="6.8" x2="14" y2="11" />
    <line x1="5.5" y1="17.2" x2="10" y2="13" />
    <line x1="18.5" y1="17.2" x2="14" y2="13" />
  </svg>
);

const ResetIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const navItems: { id: PageType; labelDe: string; labelEn: string; icon: React.ReactNode }[] = [
  {
    id: 'stopwords',
    labelDe: 'Wortausschluss',
    labelEn: 'Word Exclusion',
    icon: <StopwordsIcon />,
  },
  {
    id: 'visualization',
    labelDe: 'Visualisierung',
    labelEn: 'Visualization',
    icon: <VisualizationIcon />,
  },
];

export const Sidebar = ({ activePage, onPageChange, onReset, uiLanguage }: SidebarProps) => {
  return (
    <Box
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '12px 8px',
        }}
    >
      <Stack gap={4} style={{ flex: 1 }}>
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            label={uiLanguage === 'de' ? item.labelDe : item.labelEn}
            leftSection={item.icon}
            active={activePage === item.id}
            onClick={() => onPageChange(item.id)}
            styles={{
              root: {
                borderRadius: 4,
                fontWeight: activePage === item.id ? 600 : 400,
              },
            }}
          />
        ))}
      </Stack>

      <Stack gap="xs" style={{ paddingTop: 8, borderTop: '1px solid var(--mantine-color-gray-2)' }}>
        <Button
          variant="subtle"
          color="red"
          size="xs"
          leftSection={<ResetIcon />}
          onClick={onReset}
          justify="flex-start"
          fullWidth
        >
          {uiLanguage === 'de' ? 'Alles zurücksetzen' : 'Reset All'}
        </Button>
        <Text size="xs" c="dimmed" ta="center" py={4}>
          Version 0.1
        </Text>
      </Stack>
    </Box>
  );
};
