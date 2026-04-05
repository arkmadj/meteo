#!/usr/bin/env node

/**
 * Lint CI Script with Human-Readable Output
 *
 * This script wraps ESLint to provide clear, human-readable messages
 * for debugging lint errors in CI environments.
 */

const { execSync } = require('child_process');

// ANSI color codes for better visibility
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(70));
  log(`  ${title}`, colors.bright + colors.cyan);
  console.log('='.repeat(70) + '\n');
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green + colors.bright);
}

function logError(message) {
  log(`✗ ${message}`, colors.red + colors.bright);
}

function logWarning(message) {
  log(`⚠ ${message}`, colors.yellow + colors.bright);
}

function logInfo(message) {
  log(`ℹ ${message}`, colors.blue);
}

// Main execution
const startTime = Date.now();

try {
  logSection('Running ESLint in CI Mode');

  logInfo('Configuration:');
  log(`  • Environment: CI=true`, colors.dim);
  log(`  • Cache: enabled (metadata strategy)`, colors.dim);
  log(`  • Extensions: .js, .jsx, .ts, .tsx`, colors.dim);
  log(`  • Max warnings: 0 (strict mode)`, colors.dim);
  log(`  • Working directory: ${process.cwd()}`, colors.dim);
  console.log('');

  logInfo('Starting lint process...\n');

  // Run ESLint
  execSync('CI=true eslint . --cache --ext .js,.jsx,.ts,.tsx --max-warnings 0', {
    stdio: 'inherit',
    env: { ...process.env, CI: 'true' },
  });
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('');
  logSuccess(`Lint completed successfully in ${duration}s`);
  logSection('Lint CI: PASSED ✓');
  process.exit(0);
} catch (_error) {
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('');
  logError(`Lint failed after ${duration}s`);

  logSection('Lint CI: FAILED ✗');

  logError('ESLint found errors in your code.');
  console.log('');

  logInfo('Common fixes:');
  log(`  1. Run ${colors.bright}npm run lint:fix${colors.reset} to auto-fix issues`, colors.dim);
  log(`  2. Check the output above for specific file/line numbers`, colors.dim);
  log(`  3. Review ESLint configuration in eslint.config.mjs`, colors.dim);
  console.log('');

  logInfo('Debugging tips:');
  log(
    `  • View detailed JSON report: ${colors.bright}eslint-report.json${colors.reset}`,
    colors.dim
  );
  log(`  • Run locally: ${colors.bright}npm run lint${colors.reset}`, colors.dim);
  log(`  • Check specific file: ${colors.bright}eslint path/to/file.ts${colors.reset}`, colors.dim);
  console.log('');

  logWarning('CI build will fail until these issues are resolved.');
  console.log('');

  process.exit(1);
}
