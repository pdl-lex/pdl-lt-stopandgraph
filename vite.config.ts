import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Die Version steht in package.json und soll nicht ein zweites Mal im Quelltext
// stehen; die Oberfläche liest sie als __APP_VERSION__.
const { version } = JSON.parse(readFileSync('./package.json', 'utf8')) as { version: string };

export default defineConfig({
  base: '/', // eigene Subdomain, kein Unterpfad — siehe Caddyfile
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
});
