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

  // Overrides for different file types
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always',
      },
    },
    {
      files: '*.yml',
      options: {
        printWidth: 80,
      },
    },
    {
      files: '*.yaml',
      options: {
        printWidth: 80,
      },
    },
  ],
};
