// eslint.config.with-custom-rules.js - ESLint config with custom no-direct-date rule
import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

import customRules from './eslint-rules/index.js';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'custom-rules': customRules,
    },
    rules: {
      // Standard rules
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      
      // Custom date rule - strict configuration
      'custom-rules/no-direct-date': [
        'error',
        {
          // No allowed methods - enforce DateUtils for everything
          allowedMethods: [],
          
          // DateUtils import path
          dateUtilsImport: '@/utils/DateUtils',
          
          // Files to exempt from this rule
          exemptFiles: [
            'node_modules/',
            'dist/',
            'build/',
            // Exempt DateUtils itself
            'utils/DateUtils.ts',
            'utils/DateUtils.js',
          ],
          
          // Allow in test files for mocking/testing purposes
          allowInTests: true,
        },
      ],
    },
  },
  {
    // Stricter rules for production code
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    ignores: ['**/*.test.*', '**/*.spec.*', '**/__tests__/**'],
    rules: {
      'custom-rules/no-direct-date': [
        'error',
        {
          allowedMethods: [],
          dateUtilsImport: '@/utils/DateUtils',
          exemptFiles: ['utils/DateUtils.ts'],
          allowInTests: false, // Strict in production code
        },
      ],
    },
  },
  {
    // More lenient for test files
    files: ['**/*.{test,spec}.{js,jsx,ts,tsx}', '**/__tests__/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'custom-rules/no-direct-date': [
        'warn', // Warning instead of error
        {
          allowedMethods: ['now'], // Allow Date.now() in tests
          dateUtilsImport: '@/utils/DateUtils',
          exemptFiles: [],
          allowInTests: true,
        },
      ],
    },
  },
  {
    // Legacy code exemptions
    files: ['legacy/**/*.{js,jsx,ts,tsx}', 'vendor/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'custom-rules/no-direct-date': 'off', // Disable for legacy code
    },
  },
  {
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
