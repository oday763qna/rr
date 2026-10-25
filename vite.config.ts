import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
const [owner, repository] = process.env.GITHUB_REPOSITORY?.split('/') ?? [];
const isUserSite = Boolean(owner && repository === `${owner}.github.io`);
const base = process.env.GITHUB_ACTIONS === 'true' && repository && !isUserSite ? `/${repository}/` : '/';
export default defineConfig({
  base,
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate', includeAssets: ['icon.svg'],
    manifest: { name: 'OD Tasks', short_name: 'OD Tasks', description: 'A calm space for your day.', theme_color: '#f6f7fb', background_color: '#f6f7fb', display: 'standalone', start_url: base, icons: [{ src: `${base}icon.svg`, sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }] },
    workbox: { globPatterns: ['**/*.{js,css,html,svg,woff2}'] }
  })]
});
