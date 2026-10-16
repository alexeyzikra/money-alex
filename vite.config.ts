import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// На GitHub Pages сайт лежит не в корне домена, а в подпапке с именем
// репозитория: username.github.io/money-alex/. Поэтому все ссылки на файлы
// должны начинаться с этого пути. Если переименуешь репозиторий — поменяй
// здесь, и всё остальное подхватится само.
const base = '/money-alex/'

// https://vite.dev/config/
export default defineConfig({
  base,
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
        // Адрес, который откроется при запуске с домашнего экрана,
        // и граница, внутри которой приложение считает страницы "своими".
        start_url: base,
        scope: base,
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
