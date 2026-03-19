// eslint.multi-env.config.js - Multi-environment configuration example
import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-plugin-prettier';

// Environment detection
const isCI = process.env.CI === 'true';
const isDevelopment = process.env.NODE_ENV === 'development';
const isLocal = !isCI && (isDevelopment || process.env.ESLINT_LOCAL === 'true');

// Base rules that apply everywhere
const baseRules = {
  // Critical errors that should always be caught
  'no-unused-vars': 'off', // Handled by TypeScript
  '@typescript-eslint/no-unused-vars': 'error',
  '@typescript-eslint/no-explicit-any': 'warn',
  'prefer-const': 'error',
  'no-var': 'error',

  // React rules
  'react/prop-types': 'off',
  'react/react-in-jsx-scope': 'off',
  'react-hooks/rules-of-hooks': 'error',
  'react-hooks/exhaustive-deps': 'warn',
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
};

// Performance-focused rules for local development
const localRules = {
  ...baseRules,
  // Only enable critical type-aware rules locally
  '@typescript-eslint/no-floating-promises': 'error',
  '@typescript-eslint/no-misused-promises': 'error',
  // Disable expensive rules for speed
  '@typescript-eslint/prefer-nullish-coalescing': 'off',
  '@typescript-eslint/prefer-optional-chain': 'off',
  '@typescript-eslint/strict-boolean-expressions': 'off',
};

// Full rules for CI
const ciRules = {
  ...baseRules,
  ...typeAwareRules,
  // Stricter rules in CI
  '@typescript-eslint/no-explicit-any': 'error',
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
