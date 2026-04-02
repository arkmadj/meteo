import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import vitePluginQRCode from './scripts/vite-plugin-qrcode.js';

export default defineConfig({
  plugins: [
    react({
      include: /\.(js|jsx|ts|tsx)$/,
    }),
    // QR code plugin for mobile access
    vitePluginQRCode(),
    // Bundle analyzer - only in analyze mode
    process.env.ANALYZE &&
      visualizer({
        filename: 'dist/bundle-analysis.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
        template: 'treemap', // 'treemap', 'sunburst', 'network'
      }),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0', // Listen on all network interfaces for mobile access
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: id => {
          // Enhanced chunk splitting function for optimal performance

          // Core vendor chunks (critical for app startup)
          if (id.includes('node_modules')) {
            // React ecosystem (critical)
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-core';
            }

            // Router (critical for navigation)
            if (id.includes('react-router')) {
              return 'router-core';
            }

            // Query management (critical for data fetching)
            if (id.includes('@tanstack/react-query')) {
              return 'query-core';
            }

            // UI libraries (can be lazy-loaded)
            if (id.includes('@heroicons') || id.includes('@fortawesome')) {
              return 'ui-icons';
            }

            // Carousel libraries (lazy-loaded with carousel components)
            if (id.includes('embla-carousel')) {
              return 'carousel-vendor';
            }

            // Internationalization (lazy-loaded)
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'i18n-vendor';
            }

            // Animation libraries (lazy-loaded)
            if (id.includes('framer-motion') || id.includes('react-spring')) {
              return 'animation-vendor';
            }

            // Chart libraries (lazy-loaded with dashboard)
            if (id.includes('chart') || id.includes('recharts') || id.includes('d3')) {
              return 'charts-vendor';
            }

            // Other vendor libraries
            return 'vendor-misc';
          }

          // Route-based chunks (lazy-loaded pages)
          if (id.includes('src/pages/')) {
            if (id.includes('HomePage')) return 'home-route';
            if (id.includes('WeatherPage')) return 'weather-route';
            if (id.includes('DashboardPage')) return 'dashboard-route';
            if (id.includes('AccessibilityPage')) return 'accessibility-route';
            if (id.includes('SettingsPage')) return 'settings-route';
            if (id.includes('AboutPage')) return 'about-route';
            if (id.includes('NotFoundPage')) return 'not-found-route';
          }

          // Feature-based UI chunks (grouped by functionality)
          if (id.includes('src/components/')) {
            // Dashboard components (heavy, lazy-loaded)
            if (id.includes('dashboard/') || id.includes('Dashboard')) {
              return 'dashboard-components';
            }

            // Showcase components (demo/testing, lazy-loaded)
            if (id.includes('Showcase') || id.includes('showcase/')) {
              return 'showcase-components';
            }

            // Demo components (development, lazy-loaded)
            if (id.includes('Demo') || id.includes('demo/')) {
              return 'demo-components';
            }

            // Test components (development, lazy-loaded)
            if (id.includes('Test') || id.includes('test/')) {
              return 'test-components';
            }

            // Accessibility components (specialized, lazy-loaded)
            if (id.includes('Accessible') || id.includes('accessibility/')) {
              return 'accessibility-components';
            }

            // Weather-specific components (core feature)
            if (
              id.includes('weather/') ||
              id.includes('Weather') ||
              id.includes('Forecast') ||
              id.includes('Temperature') ||
              id.includes('Humidity') ||
              id.includes('Pressure') ||
              id.includes('Wind') ||
              id.includes('UV')
            ) {
              return 'weather-components';
            }

            // Form components (can be lazy-loaded)
            if (
              id.includes('form/') ||
              id.includes('Form') ||
              id.includes('Input') ||
              id.includes('Select') ||
              id.includes('Checkbox') ||
              id.includes('Radio')
            ) {
              return 'form-components';
            }

            // Chart/visualization components (lazy-loaded)
            if (
              id.includes('chart/') ||
              id.includes('Chart') ||
              id.includes('Graph') ||
              id.includes('Visualization')
            ) {
              return 'chart-components';
            }

            // UI atoms (small, frequently used)
            if (id.includes('ui/atoms/')) {
              return 'ui-atoms';
            }

            // UI molecules (medium complexity)
            if (id.includes('ui/molecules/')) {
              return 'ui-molecules';
            }

            // UI organisms (complex, can be lazy-loaded)
            if (id.includes('ui/organisms/')) {
              return 'ui-organisms';
            }

            // Layout components (critical)
            if (id.includes('layout/') || id.includes('Layout')) {
              return 'layout-components';
            }

            // Navigation components (critical)
            if (id.includes('Navigation') || id.includes('nav/')) {
              return 'navigation-components';
            }

            // Other UI components
            if (id.includes('ui/')) {
              return 'ui-components';
            }
          }

          // Utility chunks (grouped by functionality)
          if (id.includes('src/utils/')) {
            // Lazy loading utilities
            if (id.includes('lazyLoad') || id.includes('lazy/')) {
              return 'lazy-utils';
            }

            // Performance utilities
            if (id.includes('performance') || id.includes('optimization')) {
              return 'performance-utils';
            }

            // API utilities
            if (id.includes('api/') || id.includes('http') || id.includes('fetch')) {
              return 'api-utils';
            }

            // Validation utilities
            if (id.includes('validation') || id.includes('sanitizer')) {
              return 'validation-utils';
            }

            // Other utilities
            return 'utils-misc';
          }

          // Context and providers (critical for app structure)
          if (id.includes('src/contexts/') || id.includes('src/providers/')) {
            return 'app-providers';
          }

          // Hooks (grouped by functionality)
          if (id.includes('src/hooks/')) {
            // API hooks
            if (id.includes('api/') || id.includes('useWeather') || id.includes('useQuery')) {
              return 'api-hooks';
            }

            // UI hooks
            if (id.includes('ui/') || id.includes('useForm') || id.includes('useModal')) {
              return 'ui-hooks';
            }

            // Other hooks
            return 'hooks-misc';
          }

          // Services (API layer)
          if (id.includes('src/services/')) {
            return 'services';
          }

          // Types (shared across chunks)
          if (id.includes('src/types/')) {
            return 'types';
          }

          // Constants and configuration
          if (id.includes('src/constants/') || id.includes('src/config/')) {
            return 'config';
          }

          // Styles (can be split by feature)
          if (id.includes('src/styles/')) {
            return 'styles';
          }

          // Router configuration
          if (id.includes('src/router/')) {
            return 'router-config';
          }

          // Default chunk for unmatched files
          return 'misc';
        },
      },
    },
  },
  css: {
    postcss: './postcss.config.js',
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCase',
    },
  },
  define: {
    global: 'globalThis',
  },
  esbuild: false,
});
