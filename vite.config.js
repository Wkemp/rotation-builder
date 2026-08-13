import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// IMPORTANT: base must match your GitHub Pages repo name, e.g. '/rotation-builder/'.
// If you're deploying to a custom domain or the root of a domain, set base to '/'.
const REPO_NAME = 'rotation-builder'

export default defineConfig({
  base: `/${REPO_NAME}/`,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/favicon-32.png'],
      manifest: {
        name: 'Rotation Builder',
        short_name: 'Rotation',
        description: 'Volleyball rotation builder and cheat sheet for coaches.',
        theme_color: '#14181d',
        background_color: '#14181d',
        display: 'standalone',
        orientation: 'landscape',
        start_url: `/${REPO_NAME}/`,
        scope: `/${REPO_NAME}/`,
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff,woff2}'],
      },
    }),
  ],
})
