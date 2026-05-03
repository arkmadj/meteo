// eslint.config.js - Multi-environment configuration
import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import unusedImports from 'eslint-plugin-unused-imports';
// import customRules from './eslint-rules/index.js'; // Commented out - directory doesn't exist

// Environment detection
const isCI = process.env.CI === 'true';
const isDevelopment = process.env.NODE_ENV === 'development';
const isLocal = !isCI && (isDevelopment || process.env.ESLINT_LOCAL === 'true');

// Base rules that apply everywhere
const baseRules = {
  // Critical errors that should always be caught
  'no-unused-vars': 'off', // Handled by TypeScript
  '@typescript-eslint/no-unused-vars': 'off', // Handled by unused-imports plugin
  '@typescript-eslint/no-explicit-any': ['error', { fixToUnknown: true, ignoreRestArgs: false }],
  'prefer-const': 'error',
  'no-var': 'error',
  'no-prototype-builtins': 'warn', // Warn instead of error for hasOwnProperty usage

  // Disallow implicit `this` and enforce arrow callbacks for lexical scoping
  'no-invalid-this': 'off',
  '@typescript-eslint/no-invalid-this': 'error',
  'prefer-arrow-callback': ['error', { allowNamedFunctions: false, allowUnboundThis: false }],

  // Import rules - catch unused imports while ignoring types-only imports
  'unused-imports/no-unused-imports': 'error',
  'unused-imports/no-unused-vars': [
    'error',
    {
      vars: 'all',
      varsIgnorePattern: '^_',
      args: 'after-used',
      argsIgnorePattern: '^_',
      caughtErrors: 'all',
      caughtErrorsIgnorePattern: '^_',
      ignoreRestSiblings: true,
    },
  ],

  // Import ordering and organization
  // 'custom-rules/enforce-import-order': [
  //   'error',
  //   {
  //     groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
  //     pathGroups: [{ pattern: '@/**', group: 'internal', position: 'before' }],
  //     pathGroupsExcludedImportTypes: ['builtin'],
  //     alphabetize: { order: 'asc', caseInsensitive: true },
  //     newlinesBetween: 'always',
  //     exemptFiles: ['**/*.test.*', '**/*.spec.*', '**/*.stories.*'],
  //   },
  // ],

  // Official import plugin rules for additional validation
  'import/no-unresolved': 'off', // Handled by TypeScript
  'import/named': 'off', // Handled by TypeScript
  'import/default': 'off', // Handled by TypeScript
  'import/namespace': 'off', // Handled by TypeScript
  'import/no-named-as-default': 'warn',
  'import/no-named-as-default-member': 'warn',
  'import/no-duplicates': 'error',
  'import/no-self-import': 'error',
  'import/no-cycle': ['error', { maxDepth: 10 }],
  'import/no-useless-path-segments': 'error',

  // TypeScript specific - properly handle type imports
  '@typescript-eslint/consistent-type-imports': [
    'error',
    {
      prefer: 'type-imports',
      disallowTypeAnnotations: false,
    },
  ],

  // Naming conventions - enforce naming patterns
  '@typescript-eslint/naming-convention': [
    'error',
    // Interfaces should be PascalCase (I-prefix is optional, not enforced)
    {
      selector: 'interface',
      format: ['PascalCase'],
    },
    // Type aliases should be PascalCase
    {
      selector: 'typeAlias',
      format: ['PascalCase'],
      leadingUnderscore: 'allow',
    },
    // Enums should be PascalCase
    {
      selector: 'enum',
      format: ['PascalCase'],
    },
    // Enum members should be PascalCase or UPPER_CASE
    {
      selector: 'enumMember',
      format: ['PascalCase', 'UPPER_CASE'],
    },
    // Classes should be PascalCase
    {
      selector: 'class',
      format: ['PascalCase'],
    },
    // Variables should be camelCase or PascalCase (for React components) or UPPER_CASE (for constants)
    {
      selector: 'variable',
      format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
      leadingUnderscore: 'allow',
      trailingUnderscore: 'forbid',
    },
    // Functions should be camelCase or PascalCase (for React components)
    {
      selector: 'function',
      format: ['camelCase', 'PascalCase'],
      leadingUnderscore: 'allow',
    },
    // Parameters should be camelCase (allow PascalCase for React components)
    {
      selector: 'parameter',
      format: ['camelCase', 'PascalCase'],
      leadingUnderscore: 'allow',
      trailingUnderscore: 'forbid',
    },
    // Methods should be camelCase (allow PascalCase for React component methods)
    {
      selector: 'method',
      format: ['camelCase', 'PascalCase'],
      leadingUnderscore: 'allow',
      trailingUnderscore: 'forbid',
    },
    // Object literal methods can be any format (for chunk names like 'weather-components')
    {
      selector: 'objectLiteralMethod',
      format: null,
    },
    // Properties should be camelCase or snake_case (for API responses) or UPPER_CASE (for constants)
    {
      selector: 'property',
      format: ['camelCase', 'snake_case', 'UPPER_CASE', 'PascalCase'],
      leadingUnderscore: 'allow',
      trailingUnderscore: 'forbid',
    },
    // Object literal properties can be any format (for API compatibility)
    {
      selector: 'objectLiteralProperty',
      format: null,
    },
    // Type properties can be any format (for aria attributes, data attributes, etc.)
    {
      selector: 'typeProperty',
      format: null,
    },
    // Type parameters should be PascalCase and single letter or start with T
    {
      selector: 'typeParameter',
      format: ['PascalCase'],
      custom: {
        regex: '^(T|[A-Z][a-zA-Z0-9]*|T[A-Z][a-zA-Z0-9]*)$',
        match: true,
      },
    },
  ],

  // React rules
  'react/prop-types': 'off',
  'react/react-in-jsx-scope': 'off',
  'react-hooks/rules-of-hooks': 'error',
  'react-hooks/exhaustive-deps': 'warn',

  // Custom hook rules
  // 'custom-rules/enforce-hook-naming': 'error',
  // 'custom-rules/hooks-in-components-only': 'error',

  // Async error handling rules
  // 'custom-rules/require-await-error-handling': 'error',

  // Dependency policy rules
  // 'custom-rules/enforce-dependency-policies': [
  //   'error',
  //   {
  //     forbiddenPackages: {
  //       lodash: 'lodash-es',
  //       moment: {
  //         replacement: 'date-fns',
  //         message: 'moment.js is deprecated and has security vulnerabilities',
  //         deprecationDate: '2023-01-01',
  //         migrationGuide: 'https://github.com/date-fns/date-fns',
  //       },
  //       '@material-ui/core': '@mui/material',
  //       'react-router': 'react-router-dom',
  //     },
  //     exemptFiles: ['**/*.test.*', '**/*.spec.*', 'legacy/'],
  //     strictMode: false,
  //   },
  // ],

  // Strict null/undefined checks
  // 'custom-rules/strict-null-checks': [
  //   'error',
  //   {
  //     requireNullChecks: true,
  //     requireUndefinedChecks: true,
  //     allowOptionalChaining: true,
  //     allowNullishCoalescing: true,
  //     strictArrayAccess: true,
  //     strictObjectAccess: true,
  //     exemptFiles: ['**/*.test.*', '**/*.spec.*'],
  //     allowInTests: true,
  //   },
  // ],
  // 'custom-rules/no-insecure-random': 'error',
  // 'custom-rules/no-raw-error-throw': [
  //   'error',
  //   {
  //     allowedErrorClasses: [
  //       'DomainError',
  //       'ContextUnavailableError',
  //       'ThemeContextError',
  //       'ErrorContextUnavailableError',
  //       'PerformanceContextError',
  //       'WeatherServiceError',
  //       'GeocodingError',
  //       'CityNotFoundError',
  //       'WeatherDataFetchError',
  //       'PrototypePollutionError',
  //       'UnsafeObjectOperationError',
  //       'NotImplementedError',
  //       'DependencyInjectionError',
  //       'SecurityInvariantError',
  //       'UnauthorizedAccessError',
  //       'SecurityError',
  //       'UnauthorizedError',
  //       'ApplicationBootstrapError',
  //     ],
  //     allowedErrorClassPatterns: [
  //       '^[A-Z][a-zA-Z0-9]*DomainError$',
  //       '^[A-Z][a-zA-Z0-9]*ServiceError$',
  //     ],
  //   },
  // ],
  // 'custom-rules/require-switch-default': [
  //   'error',
  //   {
  //     allowNever: true,
  //     allowInTests: true,
  //     exemptFiles: [],
  //   },
  // ],

  // Decorator security vulnerability detection
  // 'custom-rules/detect-decorator-vulnerabilities': [
  //   'error',
  //   {
  //     checkDecoratorOrder: true,
  //     checkMetadataUsage: true,
  //     checkSingletonScope: true,
  //     checkAsyncRaceConditions: true,
  //     exemptFiles: ['**/*.test.*', '**/*.spec.*', 'src/security/vulnerable-decorators.ts'],
  //   },
  // ],

  // Console usage restrictions for production code
  // 'custom-rules/no-console-production': [
  //   'error',
  //   {
  //     allowedMethods: ['error', 'warn'], // Allow error and warn for critical issues
  //     allowInTests: true,
  //     allowInDevelopment: false, // Strict even in development
  //     exemptFiles: [
  //       'scripts/**/*',
  //       'tools/**/*',
  //       'config/**/*',
  //       'src/utils/errorHandler.ts', // Allow in error handler
  //       'src/utils/performance.ts', // Allow in performance monitoring
  //       'src/contexts/PerformanceContext.tsx', // Allow in performance context
  //     ],
  //     exemptDirectories: ['scripts/', 'tools/', 'config/', 'eslint-rules/'],
  //     loggerAlternatives: ['logger', 'Logger', 'console (in development only)'],
  //     strictMode: false,
  //   },
  // ],
};

// Type-aware rules (expensive, CI only by default)
const typeAwareRules = {
  '@typescript-eslint/no-floating-promises': 'error',
  '@typescript-eslint/no-misused-promises': 'error',
  '@typescript-eslint/await-thenable': 'error',
  '@typescript-eslint/require-await': 'error',
  '@typescript-eslint/prefer-nullish-coalescing': 'error',
  '@typescript-eslint/prefer-optional-chain': 'error',
  '@typescript-eslint/strict-boolean-expressions': 'error',
  '@typescript-eslint/no-unnecessary-condition': 'error',
  '@typescript-eslint/prefer-includes': 'error',
  '@typescript-eslint/prefer-string-starts-ends-with': 'error',

  // Custom async return type enforcement
  // 'custom-rules/enforce-async-return-types': [
  //   'error',
  //   {
  //     requireExplicitReturnType: true,
  //     allowImplicitAny: false,
  //     checkArrowFunctions: true,
  //     checkFunctionDeclarations: true,
  //     checkMethodDefinitions: true,
  //     exemptFiles: ['**/*.test.*', '**/*.spec.*', '**/*.stories.*'],
  //     allowedImplicitReturnTypes: ['void', 'never'],
  //   },
  // ],
};

// Performance-focused rules for local development
const localRules = {
  ...baseRules,
  // Disable type-aware rules locally since project config is not enabled
  '@typescript-eslint/no-floating-promises': 'off',
  '@typescript-eslint/no-misused-promises': 'off',
  '@typescript-eslint/await-thenable': 'off',
  '@typescript-eslint/require-await': 'off',
  '@typescript-eslint/prefer-nullish-coalescing': 'off',
  '@typescript-eslint/prefer-optional-chain': 'off',
  '@typescript-eslint/strict-boolean-expressions': 'off',
  '@typescript-eslint/no-unnecessary-condition': 'off',
  '@typescript-eslint/prefer-includes': 'off',
  '@typescript-eslint/prefer-string-starts-ends-with': 'off',
  // 'custom-rules/enforce-async-return-types': 'off',
};

// Full rules for CI
const ciRules = {
  ...baseRules,
  ...typeAwareRules,
  // Stricter rules in CI
  '@typescript-eslint/no-explicit-any': ['error', { fixToUnknown: true, ignoreRestArgs: false }],
  'react-hooks/exhaustive-deps': 'error',
  // Disable rules that require strictNullChecks (not enabled in tsconfig.json)
  '@typescript-eslint/no-unnecessary-condition': 'off',
  '@typescript-eslint/strict-boolean-expressions': 'off',
  '@typescript-eslint/prefer-nullish-coalescing': 'off',
  // Disable these rules for now - can be enabled later for gradual adoption
  '@typescript-eslint/require-await': 'off',
  '@typescript-eslint/prefer-optional-chain': 'off',
  '@typescript-eslint/prefer-includes': 'off',
};

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: ['scripts/**/*'], // Ignore scripts - handled by separate config below
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        // Conditional project configuration
        ...(isCI && {
          project: './tsconfig.json',
          tsconfigRootDir: import.meta.dirname,
        }),
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        prompt: 'readonly',
        btoa: 'readonly',
        atob: 'readonly',
        performance: 'readonly',
        screen: 'readonly',
        // DOM types
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLCanvasElement: 'readonly',
        HTMLLabelElement: 'readonly',
        HTMLImageElement: 'readonly',
        HTMLAnchorElement: 'readonly',
        HTMLSelectElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        HTMLTableElement: 'readonly',
        HTMLTableRowElement: 'readonly',
        HTMLSpanElement: 'readonly',
        HTMLLIElement: 'readonly',
        HTMLUListElement: 'readonly',
        SVGSVGElement: 'readonly',
        CanvasRenderingContext2D: 'readonly',
        MouseEvent: 'readonly',
        KeyboardEvent: 'readonly',
        ErrorEvent: 'readonly',
        PromiseRejectionEvent: 'readonly',
        Node: 'readonly',
        Element: 'readonly',
        Event: 'readonly',
        Option: 'readonly',
        JSX: 'readonly',
        // Web APIs
        IntersectionObserver: 'readonly',
        IntersectionObserverInit: 'readonly',
        MutationObserver: 'readonly',
        PerformanceObserver: 'readonly',
        AbortController: 'readonly',
        AbortSignal: 'readonly',
        Blob: 'readonly',
        File: 'readonly',
        FormData: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        Response: 'readonly',
        Request: 'readonly',
        RequestCredentials: 'readonly',
        ShareData: 'readonly',
        CryptoKey: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
        WebGLRenderingContext: 'readonly',
        Console: 'readonly',
        Storage: 'readonly',
        StorageEvent: 'readonly',
        BeforeUnloadEvent: 'readonly',
        MediaQueryListEvent: 'readonly',
        CustomEvent: 'readonly',
        UIEvent: 'readonly',
        EventTarget: 'readonly',
        EventListener: 'readonly',
        NotificationPermission: 'readonly',
        PushSubscription: 'readonly',
        GeolocationPosition: 'readonly',
        GeolocationPositionError: 'readonly',
        GeolocationError: 'readonly',
        PermissionState: 'readonly',
        PermissionStatus: 'readonly',
        HTMLHeadingElement: 'readonly',
        HTMLElementEventMap: 'readonly',
        GlobalEventHandlersEventMap: 'readonly',
        Keyframe: 'readonly',
        PropertyIndexedKeyframes: 'readonly',
        KeyframeAnimationOptions: 'readonly',
        CSS: 'readonly',
        getComputedStyle: 'readonly',
        queueMicrotask: 'readonly',
        requestIdleCallback: 'readonly',
        // Service Worker & Notifications
        ServiceWorkerRegistration: 'readonly',
        Notification: 'readonly',
        PushSubscriptionOptionsInit: 'readonly',
        // Mutation Observer
        MutationRecord: 'readonly',
        // IndexedDB
        indexedDB: 'readonly',
        IDBDatabase: 'readonly',
        IDBOpenDBRequest: 'readonly',
        IDBTransactionMode: 'readonly',
        IDBTransaction: 'readonly',
        IDBValidKey: 'readonly',
        // WebSocket & SSE
        WebSocket: 'readonly',
        EventSource: 'readonly',
        // Media
        Navigator: 'readonly',
        MediaQueryList: 'readonly',
        // Crypto
        BufferSource: 'readonly',
        // React
        React: 'readonly',
        // Node.js types
        NodeJS: 'readonly',
        // Node.js (for scripts and config files)
        process: 'readonly',
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      prettier,
      'unused-imports': unusedImports,
      import: importPlugin,
      // 'custom-rules': customRules,
    },
    rules: isLocal ? localRules : ciRules,
    settings: {
      react: {
        version: 'detect',
      },
      // Caching configuration
      cache: true,
      cacheLocation: '.eslintcache',
      cacheStrategy: isCI ? 'metadata' : 'content',
    },
  },
  {
    files: ['src/utils/**/*'],
    rules: {
      // Allow internal imports within the utils directory itself
      'no-restricted-imports': 'off',
    },
  },
  {
    files: [
      'legacy/**/*',
      'src/legacy/**/*',
      '**/*.legacy.ts',
      '**/*.legacy.tsx',
      '**/*.legacy.js',
      '**/*.legacy.jsx',
    ],
    rules: {
      // Permit `any` in designated legacy files to reduce churn; migrate over time
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    // Node.js scripts and config files
    files: [
      'scripts/**/*.js',
      '*.config.js',
      '*.config.mjs',
      '*.config.cjs',
      '.*.js',
      '.*.cjs',
      'babel.config.js',
      'jest.config.js',
      'jest.config.cjs',
      'postcss.config.js',
      'postcss.config.cjs',
      'prettier.config.js',
      'prettier.config.cjs',
    ],
    languageOptions: {
      globals: {
        process: 'readonly',
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
  {
    // Service Worker files
    files: ['**/sw.js', '**/service-worker.js', 'public/**/*.js'],
    languageOptions: {
      globals: {
        self: 'readonly',
        caches: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        Response: 'readonly',
        Request: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
  {
    // Test files
    files: [
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/setupTests.ts',
      '**/setupTests.js',
    ],
    languageOptions: {
      globals: {
        jest: 'readonly',
        expect: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        global: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  // Configuration for scripts directory (uses tsconfig.node.json)
  {
    files: ['scripts/**/*.{ts,js}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        // Use tsconfig.node.json for scripts
        ...(isCI && {
          project: './tsconfig.node.json',
          tsconfigRootDir: import.meta.dirname,
        }),
      },
      globals: {
        // Node.js globals
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
        global: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier,
      'unused-imports': unusedImports,
      import: importPlugin,
      react: react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...(isCI ? ciRules : localRules),
      // Disable React rules for scripts
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'jsx-a11y/alt-text': 'off',
      // Allow console in scripts
      'no-console': 'off',
    },
  },
  {
    // Ignore patterns
    ignores: [
      'dist/**',
      'build/**',
      'node_modules/**',
      '.next/**',
      'coverage/**',
      '**/*.example.ts',
      '**/*.example.tsx',
      '**/*.demo.ts',
      '**/*.demo.tsx',
      '**/examples/**',
      '**/demos/**',
      'src/types/conditional-type-inference.ts',
      'src/utils/cancellationToken.weatherExample.ts',
      'src/utils/cancellablePipeline.utils.ts',
      'src/patterns/**',
      // Config files
      '.eslintrc.js',
      '.prettierrc.js',
      '.prettierrc.cjs',
      '.lintstagedrc.js',
      '.lintstaged.local.js',
      'babel.config.js',
      'jest.config.js',
      'jest.config.cjs',
      'postcss.config.js',
      'postcss.config.cjs',
      'tailwind.config.js',
      'prettier.config.js',
      'prettier.config.cjs',
      '.prettier.ci.js',
      '.prettier.ci.cjs',
      '.prettier.local.js',
      '.prettier.local.cjs',
      'eslint.config.js',
      'eslint.config.mjs',
      'vite.config.ts',
      // Other files
      'public/sw.js',
      'scripts/fix-storybook-conflicts.js',
      'scripts/fix-unused-vars.js',
      'eslint-report.json',
      '.eslintcache',
    ],
  },
];
