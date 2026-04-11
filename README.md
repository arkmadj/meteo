# Meteo ☀️🌧️

A modern, feature-rich weather application built with React, TypeScript, and
Vite. Meteo provides real-time weather updates, interactive dashboards, and push
notifications with a focus on performance, accessibility, and user experience.

> **✨ Powered by TanStack Query v5** - Featuring intelligent caching, automatic
> background updates, offline-first support, and built-in performance monitoring
> for a seamless weather experience.

## ✨ Features

- **Real-time Weather Data**: Get current weather conditions and forecasts
- **Smart Data Caching**: TanStack Query for intelligent caching and automatic
  background updates
- **Interactive Dashboard**: Customizable weather widgets and visualizations
- **Offline-First**: Works without internet connection using cached data
- **Push Notifications**: Stay updated with weather alerts via service workers
- **Internationalization**: Multi-language support with i18next
- **Responsive Design**: Optimized for all device sizes with Tailwind CSS
- **Accessibility**: WCAG-compliant with dedicated accessibility features
- **Dark/Light Mode**: Theme switching with system preference detection
- **Performance Optimized**: Code splitting, lazy loading, and chunk
  optimization
- **PWA Support**: Progressive Web App capabilities with offline support
- **Developer Tools**: TanStack Query DevTools for debugging and monitoring

## 🚀 Tech Stack

### Core Technologies

- **Framework**: React 18.2.0
- **Language**: TypeScript
- **Build Tool**: Vite 7.1.5
- **Styling**: Tailwind CSS 4.x

### Data Management

- **Data Fetching**: TanStack Query v5 (React Query)
  - Smart caching with 5-minute stale time
  - Automatic background refetching
  - Offline-first query support
  - Built-in error handling and retry logic
  - Performance monitoring and cache metrics
  - DevTools for development debugging

### Other Libraries

- **Routing**: React Router DOM 7.x
- **Internationalization**: i18next & react-i18next
- **Maps**: Leaflet & React Leaflet
- **HTTP Client**: Axios 1.4.0
- **Icons**: Heroicons & Font Awesome
- **Testing**: Jest & Testing Library
- **Code Quality**: ESLint, Prettier, TypeScript

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd meteo

# Install dependencies
npm install
```

## 🛠️ Development

```bash
# Start development server (runs on http://localhost:5173)
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
│   │   └── queryClient.ts # TanStack Query configuration & cache utils
│   ├── constants/        # Application constants
│   ├── contexts/         # React contexts (Error, Theme, Preferences, etc.)
│   ├── design-system/    # Design system and theme
│   ├── errors/           # Custom error classes
│   ├── hocs/             # Higher-order components
│   ├── hooks/            # Custom React hooks
│   │   ├── api/          # API-related hooks (useWeather, etc.)
│   │   ├── app/          # App-specific hooks
│   │   ├── useWeatherQuery.ts      # Main weather query hooks
│   │   ├── useQueryErrorHandling.ts # Error handling wrapper
│   │   ├── useQueryPerformance.ts   # Performance monitoring
│   │   └── useOfflineSupport.ts     # Offline-first queries
│   ├── i18n/             # Internationalization setup
│   ├── optimization/     # Performance optimization utilities
│   ├── pages/            # Page components (routes)
│   ├── patterns/         # Design patterns and utilities
│   ├── providers/        # Context providers
│   │   └── QueryProvider.tsx # TanStack Query provider setup
│   ├── router/           # Routing configuration
│   ├── security/         # Security utilities
│   ├── services/         # Business logic services
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── main.tsx          # Application entry point
├── public/               # Static assets
├── dist/                 # Production build output
└── docs/                 # Documentation
```

## 🔄 TanStack Query Architecture

Meteo uses TanStack Query (React Query) v5 for all data fetching, providing a
robust and performant solution for managing server state.

### Key Features

- **Automatic Caching**: Data is cached for 5 minutes (stale time) and retained
  for 30 minutes (garbage collection time)
- **Background Refetching**: Stale data is automatically refetched in the
  background
- **Request Deduplication**: Multiple components requesting the same data
  trigger only one network request
- **Automatic Retries**: Failed requests are retried up to 3 times with
  exponential backoff
- **Offline Support**: Queries can work in offline-first mode with cached data
- **Error Handling**: Global error handler with user-friendly notifications
- **Performance Monitoring**: Built-in metrics for query performance and cache
  efficiency

### Available Query Hooks

```typescript
// Weather Data
useCompleteWeatherQuery(location, days, options); // Current weather + forecast
useCurrentWeatherQuery(location, options); // Current weather only
useForecastQuery(location, days, options); // Forecast only
useHistoricalWeather(location, period, options); // Historical data
useGeocodingQuery(query, options); // City search

// Cache Management
useCachedWeather(location, unit); // Get cached weather
useRefreshWeather(location); // Manual refresh
usePrefetchWeather(); // Prefetch data
useWeatherCache(); // Cache utilities

// Advanced Features
useWeatherWithAutoRefresh(params, interval); // Auto-refresh queries
useQueryErrorHandling(); // Error handling wrapper
useQueryPerformance(); // Performance monitoring
useOfflineFirstQuery(key, fn, options); // Offline-first queries
```

### Usage Example

```typescript
import { useCompleteWeatherQuery } from '@/hooks/useWeatherQuery';

function WeatherComponent({ city }: { city: string }) {
  const { data, isLoading, error, refetch } = useCompleteWeatherQuery(city, 7, {
    enabled: !!city,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
await cacheUtils.invalidateWeatherData();

// Remove specific location from cache
await cacheUtils.removeWeatherData('Paris');

// Prefetch data for instant loading
await cacheUtils.prefetchWeatherData('Tokyo', 'metric');

// Get cache statistics
const stats = cacheUtils.getCacheStats();
console.log('Active queries:', stats.activeQueries);
console.log('Cache hit rate:', stats.cacheHitRate);
```

### Configuration

Query configuration is centralized in `src/config/queryClient.ts`:

- **Stale Time**: 5 minutes (how long data is considered fresh)
- **GC Time**: 30 minutes (how long inactive data stays in cache)
- **Retry Count**: 3 attempts with exponential backoff
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

See the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please ensure all tests pass and code quality checks
are met before submitting a pull request.

```bash
# Before committing, run:
npm run validate
```

## 🔧 Configuration Files

- `vite.config.ts` - Vite configuration with optimized chunk splitting
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - ESLint rules
- `prettier.config.js` - Prettier formatting rules
- `postcss.config.js` - PostCSS configuration
- `jest.config.js` - Jest testing configuration
- `src/config/queryClient.ts` - TanStack Query configuration and cache utilities
- `src/providers/QueryProvider.tsx` - Query provider with error handling

---

Built with ❤️ using React and TypeScript
