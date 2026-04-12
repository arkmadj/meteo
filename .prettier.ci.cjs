/**
 * Strict Prettier configuration for CI/CD
 * Comprehensive formatting with validation
 */

module.exports = {
  // Basic formatting
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',

  // JSX formatting
  jsxSingleQuote: false,

  // Other formatting
  endOfLine: 'lf',
  embeddedLanguageFormatting: 'auto',

  // Strict validation for CI/CD
  requirePragma: false,
  insertPragma: false,
  proseWrap: 'preserve',
  htmlWhitespaceSensitivity: 'css',

  // Comprehensive overrides for different file types
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
        parser: 'json',
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always',
        parser: 'markdown',
      },
    },
    {
      files: '*.yml',
      options: {
        printWidth: 80,
        parser: 'yaml',
      },
    },
    {
      files: '*.yaml',
      options: {
        printWidth: 80,
        parser: 'yaml',
      },
    },
    {
      files: '*.{ts,tsx}',
      options: {
        parser: 'typescript',
        // Additional TypeScript-specific formatting
        trailingComma: 'all',
        arrowParens: 'always',
      },
    },
    {
      files: '*.{js,jsx}',
      options: {
        parser: 'babel',
        trailingComma: 'es5',
        arrowParens: 'avoid',
      },
    },
    {
      files: '*.css',
      options: {
        parser: 'css',
        printWidth: 120,
      },
    },
    {
      files: '*.scss',
      options: {
        parser: 'scss',
        printWidth: 120,
      },
    },
    {
      files: '*.html',
      options: {
        parser: 'html',
        printWidth: 120,
      },
    },
    {
      files: '*.vue',
      options: {
        parser: 'vue',
        printWidth: 100,
      },
    },
    {
      files: '*.graphql',
      options: {
        parser: 'graphql',
        printWidth: 80,
      },
    },
    {
      files: '*.{test,spec}.{js,jsx,ts,tsx}',
      options: {
        // More lenient formatting for test files
        printWidth: 120,
        trailingComma: 'es5',
        arrowParens: 'avoid',
      },
    },
    {
      files: '.storybook/**/*',
      options: {
        // Storybook-specific formatting
        printWidth: 100,
        trailingComma: 'es5',
        arrowParens: 'avoid',
      },
    },
  ],
};
