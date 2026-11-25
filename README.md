# Meteo ☀️🌧️

A modern, feature-rich weather application built with React, TypeScript, and
Vite. Meteo provides real-time weather updates, interactive dashboards, and push
notifications with a focus on performance, accessibility, and user experience.

**🌐 Live Demo:** [meteo.ahmadjinadu.com](https://meteo.ahmadjinadu.com/)

Weather, forecast, geocoding, historical and air-quality data come from the free
[Open-Meteo](https://open-meteo.com/) APIs, so no API key is needed to run the
app locally.

## ✨ Features

- **Real-time Weather Data**: Current conditions, multi-day forecasts and
  historical data, with adaptive auto-refresh
- **Interactive Dashboard**: Drag-and-drop weather widgets (react-grid-layout)
- **City Comparison**: Compare weather across locations side by side
- **Maps**: Leaflet weather map with temperature and air-quality heatmaps and
  radar playback
- **Air Quality & Pollen**: AQI details and pollen data
- **Offline Support**: Falls back to the last fetched data when offline
- **Push Notifications**: Weather alerts via service worker and Web Push (VAPID)
- **Internationalization**: English, Spanish, French and German via i18next
- **Responsive Design**: Optimized for all device sizes with Tailwind CSS
- **Accessibility**: WCAG-compliant with dedicated accessibility features
- **Dark/Light Mode**: Theme switching with system preference detection
- **Performance Optimized**: Code splitting, lazy loading, and chunk
  optimization
- **PWA Support**: Progressive Web App capabilities with offline support
- **Developer Tools**: TanStack Query DevTools and a terminal QR code for
  testing on mobile devices

## 🚀 Tech Stack

### Core Technologies

- **Framework**: React 18.2.0
- **Language**: TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **Hosting**: Cloudflare Workers (via `@cloudflare/vite-plugin`)

### Data Management

- **Data Fetching**: TanStack Query v5 (React Query)
  - Always-fresh weather data with configurable auto-refresh
  - Request deduplication and retry logic
  - Offline-first query support
  - Performance monitoring and cache statistics
  - DevTools for development debugging
- **Weather API**: [Open-Meteo](https://open-meteo.com/) (forecast, archive,
  geocoding, air quality)

### Other Libraries

- **Routing**: React Router DOM 7.x
- **Internationalization**: i18next & react-i18next
- **Maps**: Leaflet & React Leaflet
- **Dashboard Layout**: react-grid-layout
- **Carousels**: Embla Carousel
- **HTTP Client**: Axios 1.4.0
- **Icons**: Heroicons & Font Awesome
- **Testing**: Jest, Testing Library & jest-axe
- **Code Quality**: ESLint, Prettier, TypeScript, Husky & lint-staged

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/arkmadj/meteo.git
cd meteo

# Install dependencies
npm install
```

### Environment Variables

All variables are optional. Create a `.env.local` (or `.env.development`) file
in the project root to set them.

| Variable                     | Purpose                                                |
| ---------------------------- | ------------------------------------------------------ |
| `VITE_ENABLE_QUERY_DEVTOOLS` | Show TanStack Query DevTools in development (`true`)   |
| `VITE_VAPID_PUBLIC_KEY`      | Public VAPID key for Web Push subscriptions            |
| `VITE_VAPID_SUBJECT`         | VAPID subject (`mailto:` or `https:` URL)              |
| `VITE_API_BASE_URL`          | Base URL for the internal HTTP client (default `/api`) |
| `VITE_ERROR_REPORTING_URL`   | Endpoint that receives client error reports            |
| `VITE_APP_VERSION`           | Version string attached to error reports               |

## 🛠️ Development

```bash
# Start development server (http://localhost:5173, also exposed on your LAN
# with a QR code printed in the terminal for mobile testing)
npm run dev

# Start with TanStack Query DevTools enabled
VITE_ENABLE_QUERY_DEVTOOLS=true npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Type checking
npm run type-check

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

### TanStack Query DevTools

To enable the TanStack Query DevTools in development:

1. Create a `.env.development` file in the project root
2. Add: `VITE_ENABLE_QUERY_DEVTOOLS=true`
3. Start the dev server: `npm run dev`
4. Look for the TanStack Query icon in the bottom-left corner of your browser

The DevTools allow you to:

- Inspect all active queries and their state
- Browse cached data
- Manually trigger refetches
- Monitor query performance
- Debug query lifecycle events

## 🏗️ Build

```bash
# Production build
npm run build

# Build with bundle analysis
npm run build:analyze

# Preview production build
npm run preview
```

## 🚢 Deployment

### Cloudflare Workers

The live demo runs on Cloudflare Workers. The Cloudflare Vite plugin is
configured in `vite.config.ts` and the Worker is named in `wrangler.jsonc`.

```bash
npm run build
npx wrangler deploy
```

### Docker

A multi-stage `Dockerfile` builds the app and serves it with unprivileged nginx
on port 8080. `Dockerfile.dev` runs the Vite dev server.

```bash
# Production image (http://localhost:8080)
docker compose up prod --build

# Development server with file sync (http://localhost:5173)
docker compose watch dev
```

## 📊 Code Quality

```bash
# Run all quality checks (lint, format, type-check)
npm run quality:local

# Run CI quality checks (with human-readable output)
npm run quality:ci

# Run CI lint check with detailed debug messages
npm run lint:ci:text

# Validate everything (type-check, lint, format, test)
npm run validate
```

### Debugging Lint Errors

The `lint:ci:text` command provides human-readable output with helpful debugging
information:

- **Configuration details**: Shows the exact settings used for linting
- **Execution time**: Displays how long the lint process took
- **Success/failure messages**: Clear visual indicators with colors
- **Common fixes**: Actionable suggestions when errors are found
- **Debugging tips**: Links to reports and commands for investigation

Example output when errors are found:

```
✗ Lint failed after 2.81s

✗ ESLint found errors in your code.

ℹ Common fixes:
  1. Run npm run lint:fix to auto-fix issues
  2. Check the output above for specific file/line numbers
  3. Review ESLint configuration in eslint.config.mjs
```

## 📈 Analysis Tools

```bash
# Analyze bundle size
npm run analyze:bundle

# Analyze source maps
npm run analyze:source-map

# Check for unused dependencies
npm run analyze:deps

# Find unused files
npm run analyze:unused
```

## 🏛️ Project Structure

```
meteo/
├── src/
│   ├── api/              # API integration layer
│   │   ├── clients/      # HTTP client configuration
│   │   ├── services/     # API service classes (WeatherService, etc.)
│   │   └── types/        # API-specific types
│   ├── components/       # React components (UI, layout, features)
│   ├── config/           # Configuration files
│   │   ├── queryClient.ts # TanStack Query configuration & cache utils
│   │   └── vapid.ts      # Web Push VAPID key configuration
│   ├── constants/        # Application constants
│   ├── contexts/         # React contexts (Error, Theme, Preferences, etc.)
│   ├── design-system/    # Design system and theme
│   ├── errors/           # Custom error classes
│   ├── hocs/             # Higher-order components
│   ├── hooks/            # Custom React hooks
│   │   ├── api/          # API-related hooks (useWeather, etc.)
│   │   ├── app/          # App-specific hooks (state, actions, formatting)
│   │   ├── useWeatherQuery.ts      # Main weather query hooks
│   │   ├── useQueryErrorHandling.ts # Error handling wrapper
│   │   ├── useQueryPerformance.ts   # Performance monitoring
│   │   └── useOfflineSupport.ts     # Offline-first queries
│   ├── i18n/             # i18n setup and locales (en, es, fr, de)
│   ├── optimization/     # Performance optimization utilities
│   ├── pages/            # Route pages (Home, Weather, Dashboard, Compare, Map, …)
│   ├── patterns/         # Design patterns and utilities
│   ├── providers/        # Context providers
│   │   └── QueryProvider.tsx # TanStack Query provider setup
│   ├── router/           # Routing configuration
│   ├── security/         # Security utilities
│   ├── services/         # Business logic services
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── main.tsx          # Application entry point
├── public/               # Static assets, PWA manifest and service worker (sw.js)
├── scripts/              # Build and lint helper scripts
└── dist/                 # Production build output
```

## 🔄 TanStack Query Architecture

Meteo uses TanStack Query (React Query) v5 for all data fetching, providing a
robust and performant solution for managing server state.

### Key Features

- **Fresh Data by Default**: Weather queries use a stale time and GC time of
  `0`, so every mount fetches current data rather than serving old forecasts
- **Auto-Refresh**: Weather queries refetch on an adaptive interval and when the
  network reconnects
- **Request Deduplication**: Multiple components requesting the same data
  trigger only one network request
- **Automatic Retries**: Failed queries are retried up to 3 times with
  exponential backoff (4xx client errors are not retried)
- **Offline Support**: Queries can work in offline-first mode with cached data
- **Error Handling**: Global error handler with user-friendly notifications
- **Performance Monitoring**: Built-in metrics for query performance and cache
  efficiency

### Available Query Hooks

```typescript
// Weather data — src/hooks/useWeatherQuery.ts
useCompleteWeatherQuery(location, days, options); // Current weather + forecast
useWeatherQuery(location, options); // Current weather only
useForecastQuery(location, days, options); // Forecast only
useGeocodingQuery(query, options); // City search
useReverseGeocodingQuery(lat, lon, options); // Coordinates → place name

// Cache management — src/hooks/useWeatherQuery.ts
useCachedWeather(location, unit); // Read cached weather
useRefreshWeather(); // Manual refresh
usePrefetchWeather(); // Prefetch data

// Lower-level API hooks — src/hooks/api/useWeather.ts
useHistoricalWeather(location, period); // Historical data
useWeatherCache(); // Cache utilities
useWeatherWithAutoRefresh(params, interval); // Auto-refresh queries

// Advanced features
useQueryErrorHandling(); // Error handling wrapper
useQueryPerformance(); // Performance monitoring
useOfflineFirstWeatherQuery(location); // Offline-first current weather
useOfflineFirstForecastQuery(location, days); // Offline-first forecast
```

### Usage Example

```typescript
import { useCompleteWeatherQuery } from '@/hooks/useWeatherQuery';

function WeatherComponent({ city }: { city: string }) {
  const { data, isLoading, error, refetch } = useCompleteWeatherQuery(city, 7, {
    enabled: !!city,
    autoRefresh: true,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>{data?.current.city}</h2>
      <p>Temperature: {data?.current.temperature}°C</p>
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}
```

### Cache Management

```typescript
import { cacheUtils } from '@/config/queryClient';

// Invalidate all weather data (marks as stale, triggers refetch)
cacheUtils.invalidateWeatherData();

// Remove specific location from cache
cacheUtils.removeWeatherData('Paris');

// Prefetch data for instant loading
await cacheUtils.prefetchWeatherData('Tokyo', 'metric');

// Get cache statistics
const stats = cacheUtils.getCacheStats();
console.log('Active queries:', stats.activeQueries);
console.log('Stale queries:', stats.staleQueries);
```

### Configuration

Query configuration is centralized in `src/config/queryClient.ts`:

- **Stale Time**: 0 (data is always considered stale)
- **GC Time**: 0 (inactive weather data is not kept)
- **Retry Count**: 3 attempts with exponential backoff, capped at 30 seconds
- **Network Mode**: Online (queries only run when online)
- **Refetch on Window Focus**: Disabled (for mobile data saving)

## 🌐 Browser Support

- Chrome (last version)
- Firefox (last version)
- Safari (last version)
- Edge (last version)

Production builds support:

- > 0.2% market share
- Not dead browsers
- Not Opera Mini

## 📝 License

Licensed under the GNU General Public License v3.0. See the [LICENSE](LICENSE)
file for details.

## 🤝 Contributing

Contributions are welcome! Please ensure all tests pass and code quality checks
are met before submitting a pull request. Husky runs lint-staged on commit, and
GitHub Actions runs type checking, linting, formatting and tests on every push
and pull request to `main`.

```bash
# Before committing, run:
npm run validate
```

## 🔧 Configuration Files

- `vite.config.ts` - Vite configuration with optimized chunk splitting
- `wrangler.jsonc` - Cloudflare Workers configuration
- `tsconfig.json` - TypeScript configuration
- `eslint.config.mjs` - ESLint rules
- `prettier.config.cjs` - Prettier formatting rules
- `postcss.config.cjs` - PostCSS configuration
- `jest.config.cjs` - Jest testing configuration
- `Dockerfile`, `Dockerfile.dev`, `compose.yaml`, `nginx.conf` - Container setup
- `src/config/queryClient.ts` - TanStack Query configuration and cache utilities
- `src/providers/QueryProvider.tsx` - Query provider with error handling

---

Built with ❤️ using React and TypeScript
