// Header Component - slim bar matching LexoTerm design

import { Group, Title, Select, Box, Burger } from '@mantine/core';
import { UILanguage, getTranslation } from '../config/i18n';

interface HeaderProps {
  uiLanguage: UILanguage;
  setUILanguage: (lang: UILanguage) => void;
  mobileNavOpened: boolean;
  toggleMobileNav: () => void;
}

const AppLogoIcon = () => (
  <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
    <circle cx="10" cy="16" r="3.5" fill="#b7c8c1" />
    <circle cx="24" cy="8" r="3.5" fill="#b7c8c1" />
    <circle cx="24" cy="24" r="3.5" fill="#b7c8c1" />
    <line x1="13.2" y1="15" x2="20.8" y2="9.6" stroke="#b7c8c1" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="13.2" y1="17" x2="20.8" y2="22.4" stroke="#b7c8c1" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const Header = ({
  uiLanguage,
  setUILanguage,
  mobileNavOpened,
  toggleMobileNav,
}: HeaderProps) => {
  const t = getTranslation(uiLanguage);

  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '10px 16px',
      }}
    >
      <Group justify="space-between" align="center" style={{ width: '100%' }}>
        {/* Left: logo + title */}
        <Group gap="sm" align="center">
          <AppLogoIcon />
          <Title
            order={1}
            style={{
              color: '#fff',
              fontSize: '1.05rem',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              lineHeight: 1,
            }}
          >
            {t.appTitle}
          </Title>
        </Group>

        {/* Right: language select + mobile burger */}
        <Group gap="sm" align="center">
          <Select
            size="xs"
            value={uiLanguage}
            onChange={(value) => value && setUILanguage(value as UILanguage)}
            data={[
              { value: 'de', label: 'DE' },
              { value: 'en', label: 'EN' },
            ]}
            styles={{
              input: {
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(183, 200, 193, 0.3)',
                color: '#fff',
                minHeight: 28,
                height: 28,
                padding: '0 28px 0 10px',
              },
            }}
            w={62}
            comboboxProps={{ withinPortal: true }}
          />

          <Burger
            opened={mobileNavOpened}
            onClick={toggleMobileNav}
            color="#b7c8c1"
            size="sm"
            hiddenFrom="sm"
          />
        </Group>
      </Group>
    </Box>
  );
};
