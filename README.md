# Meteo ☀️🌧️

A modern, feature-rich weather application built with React, TypeScript, and
Vite. Meteo provides real-time weather updates, interactive dashboards, and push
notifications with a focus on performance, accessibility, and user experience.

## ✨ Features

- **Real-time Weather Data**: Get current weather conditions and forecasts
- **Interactive Dashboard**: Customizable weather widgets and visualizations
- **Push Notifications**: Stay updated with weather alerts via service workers
- **Internationalization**: Multi-language support with i18next
- **Responsive Design**: Optimized for all device sizes with Tailwind CSS
- **Accessibility**: WCAG-compliant with dedicated accessibility features
- **Dark/Light Mode**: Theme switching with system preference detection
- **Performance Optimized**: Code splitting, lazy loading, and chunk
  optimization
- **PWA Support**: Progressive Web App capabilities with offline support

## 🚀 Tech Stack

- **Framework**: React 18.2.0
- **Language**: TypeScript
- **Build Tool**: Vite 7.1.5
- **Styling**: Tailwind CSS 4.x
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM 7.x
- **Internationalization**: i18next & react-i18next
- **Maps**: Leaflet & React Leaflet
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
# Start development server (runs on http://localhost:3000)
npm run dev

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

# Run CI quality checks
npm run quality:ci

# Validate everything (type-check, lint, format, test)
npm run validate
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
│   ├── components/       # React components (UI, layout, features)
│   ├── config/           # Configuration files
│   ├── constants/        # Application constants
│   ├── contexts/         # React contexts (Error, Theme, Preferences, etc.)
│   ├── design-system/    # Design system and theme
│   ├── errors/           # Custom error classes
│   ├── hocs/             # Higher-order components
│   ├── hooks/            # Custom React hooks
│   ├── i18n/             # Internationalization setup
│   ├── optimization/     # Performance optimization utilities
│   ├── pages/            # Page components (routes)
│   ├── patterns/         # Design patterns and utilities
│   ├── providers/        # Context providers
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

---

Built with ❤️ using React and TypeScript
