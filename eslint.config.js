// eslint.config.js - Multi-environment configuration
import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import unusedImports from 'eslint-plugin-unused-imports';
import customRules from './eslint-rules/index.js';

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
      ignoreRestSiblings: true,
    },
  ],

  // Import ordering and organization
  'custom-rules/enforce-import-order': [
    'error',
    {
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      pathGroups: [{ pattern: '@/**', group: 'internal', position: 'before' }],
      pathGroupsExcludedImportTypes: ['builtin'],
      alphabetize: { order: 'asc', caseInsensitive: true },
      newlinesBetween: 'always',
      exemptFiles: ['**/*.test.*', '**/*.spec.*', '**/*.stories.*'],
    },
  ],

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

  // Naming conventions - enforce strict naming patterns
  '@typescript-eslint/naming-convention': [
    'error',
    // Interfaces must be prefixed with I and use PascalCase (e.g., IFoo)
    {
      selector: 'interface',
      format: ['PascalCase'],
      custom: {
        regex: '^I[A-Z]',
        match: true,
      },
    },
    // Type aliases should be PascalCase and must NOT start with I (reserve I* for interfaces)
    {
      selector: 'typeAlias',
      format: ['PascalCase'],
      custom: {
        regex: '^I[A-Z]',
        match: false,
      },
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
  'custom-rules/enforce-hook-naming': 'error',
  'custom-rules/hooks-in-components-only': 'error',

  // Async error handling rules
  'custom-rules/require-await-error-handling': 'error',

  // Dependency policy rules
  'custom-rules/enforce-dependency-policies': [
    'error',
    {
      forbiddenPackages: {
        lodash: 'lodash-es',
        moment: {
          replacement: 'date-fns',
          message: 'moment.js is deprecated and has security vulnerabilities',
          deprecationDate: '2023-01-01',
          migrationGuide: 'https://github.com/date-fns/date-fns',
        },
        '@material-ui/core': '@mui/material',
        'react-router': 'react-router-dom',
      },
      exemptFiles: ['**/*.test.*', '**/*.spec.*', 'legacy/'],
      strictMode: false,
    },
  ],

  // Strict null/undefined checks
  'custom-rules/strict-null-checks': [
    'error',
    {
      requireNullChecks: true,
      requireUndefinedChecks: true,
      allowOptionalChaining: true,
      allowNullishCoalescing: true,
      strictArrayAccess: true,
      strictObjectAccess: true,
      exemptFiles: ['**/*.test.*', '**/*.spec.*'],
      allowInTests: true,
    },
  ],
  'custom-rules/no-insecure-random': 'error',
  'custom-rules/no-raw-error-throw': [
    'error',
    {
      allowedErrorClasses: [
        'DomainError',
        'ContextUnavailableError',
        'ThemeContextError',
        'ErrorContextUnavailableError',
        'PerformanceContextError',
        'WeatherServiceError',
        'GeocodingError',
        'CityNotFoundError',
        'WeatherDataFetchError',
        'PrototypePollutionError',
        'UnsafeObjectOperationError',
        'NotImplementedError',
        'DependencyInjectionError',
        'SecurityInvariantError',
        'UnauthorizedAccessError',
        'SecurityError',
        'UnauthorizedError',
        'ApplicationBootstrapError',
      ],
      allowedErrorClassPatterns: [
        '^[A-Z][a-zA-Z0-9]*DomainError$',
        '^[A-Z][a-zA-Z0-9]*ServiceError$',
      ],
    },
  ],
  'custom-rules/require-switch-default': [
    'error',
    {
      allowNever: true,
      allowInTests: true,
      exemptFiles: [],
    },
  ],

  // Decorator security vulnerability detection
  'custom-rules/detect-decorator-vulnerabilities': [
    'error',
    {
      checkDecoratorOrder: true,
      checkMetadataUsage: true,
      checkSingletonScope: true,
      checkAsyncRaceConditions: true,
      exemptFiles: ['**/*.test.*', '**/*.spec.*', 'src/security/vulnerable-decorators.ts'],
    },
  ],

  // Console usage restrictions for production code
  'custom-rules/no-console-production': [
    'error',
    {
      allowedMethods: ['error', 'warn'], // Allow error and warn for critical issues
      allowInTests: true,
      allowInDevelopment: false, // Strict even in development
      exemptFiles: [
        'scripts/**/*',
        'tools/**/*',
        'config/**/*',
        'src/utils/errorHandler.ts', // Allow in error handler
        'src/utils/performance.ts', // Allow in performance monitoring
        'src/contexts/PerformanceContext.tsx', // Allow in performance context
      ],
      exemptDirectories: ['scripts/', 'tools/', 'config/', 'eslint-rules/'],
      loggerAlternatives: ['logger', 'Logger', 'console (in development only)'],
      strictMode: false,
    },
  ],
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
  'custom-rules/enforce-async-return-types': [
    'error',
    {
      requireExplicitReturnType: true,
      allowImplicitAny: false,
      checkArrowFunctions: true,
      checkFunctionDeclarations: true,
      checkMethodDefinitions: true,
      exemptFiles: ['**/*.test.*', '**/*.spec.*', '**/*.stories.*'],
      allowedImplicitReturnTypes: ['void', 'never'],
    },
  ],
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
  'custom-rules/enforce-async-return-types': 'off',
};

// Full rules for CI
const ciRules = {
  ...baseRules,
  ...typeAwareRules,
  // Stricter rules in CI
  '@typescript-eslint/no-explicit-any': ['error', { fixToUnknown: true, ignoreRestArgs: false }],
  'react-hooks/exhaustive-deps': 'error',
};

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
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
    },
    plugins: {
      '@typescript-eslint': tseslint,
      react,
      'react-hooks': reactHooks,
      prettier,
      'unused-imports': unusedImports,
      import: importPlugin,
      'custom-rules': customRules,
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
    // Ignore patterns
    ignores: [
      'dist/**',
      'build/**',
      'node_modules/**',
      '.next/**',
      'coverage/**',
      '*.config.js',
      '*.config.ts',
    ],
  },
];
