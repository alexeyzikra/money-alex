import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // Обновление ставится молча при следующем открытии приложения.
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Учёт финансов',
        short_name: 'Финансы',
        description: 'Личный трекер доходов и расходов',
        lang: 'ru',
        theme_color: '#7c3aed',
        background_color: '#f8fafc',
        // standalone — открывается без адресной строки браузера, как обычное приложение.
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            // maskable — система может обрезать иконку под свою форму;
            // фон у нас во всю площадь, поэтому обрезать нечего.
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Все файлы приложения кладутся в кэш при установке, поэтому оно
        // открывается без интернета и не зависит от того, включён ли сервер.
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
      },
      devOptions: {
        // Позволяет проверить service worker на локальном сервере,
        // не собирая каждый раз продакшен-версию.
        enabled: false,
      },
    }),
  ],
})
