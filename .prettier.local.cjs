/**
 * Fast Prettier configuration for local development
 * Optimized for speed with minimal checks
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

  // Performance optimizations for local development
  // Skip validation for faster formatting
  requirePragma: false,
  insertPragma: false,
  proseWrap: 'preserve',
  htmlWhitespaceSensitivity: 'css',
};
