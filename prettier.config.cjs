// prettier.config.js - Environment-aware Prettier configuration
const isCI = process.env.CI === 'true';

module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',

  // CI-specific options for consistency
  ...(isCI && {
    requirePragma: false,
    insertPragma: false,
    endOfLine: 'lf', // Enforce consistent line endings in CI
    embeddedLanguageFormatting: 'auto',
  }),

  // Local development options for flexibility
  ...(!isCI && {
    endOfLine: 'auto', // More flexible locally
    embeddedLanguageFormatting: 'off', // Faster formatting
  }),

  // File-specific overrides
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 120,
        tabWidth: 2,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 100,
        proseWrap: 'always',
      },
    },
    {
      files: '*.yml',
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
  ],
};
