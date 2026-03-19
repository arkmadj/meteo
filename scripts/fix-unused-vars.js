#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing unused variables by prefixing with underscore...\n');

// First, run lint to generate the report
console.log('Running lint to identify issues...\n');
try {
  execSync('npm run lint:ci', { stdio: 'pipe' });
  console.log('✅ No lint errors found!');
  process.exit(0);
} catch (_error) {
  // Lint errors exist, continue with fixes
}

// Read the JSON report
const reportPath = path.join(__dirname, '..', 'eslint-report.json');
if (!fs.existsSync(reportPath)) {
  console.error('❌ ESLint report not found.');
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

// Collect all unused variable issues
const fixes = [];

report.forEach(fileResult => {
  if (!fileResult.messages || fileResult.messages.length === 0) return;

  fileResult.messages.forEach(message => {
    if (
      message.ruleId === 'unused-imports/no-unused-vars' &&
      (message.message.includes('Allowed unused vars') ||
        message.message.includes('Allowed unused args') ||
        message.message.includes('Allowed unused caught'))
    ) {
      // Extract variable name
      const match = message.message.match(/'([^']+)'/);
      if (match && !match[1].startsWith('_')) {
        fixes.push({
          file: fileResult.filePath,
          line: message.line,
          column: message.column,
          varName: match[1],
        });
      }
    }
  });
});

console.log(`Found ${fixes.length} unused variables to fix\n`);

// Group by file
const fileMap = new Map();
fixes.forEach(fix => {
  if (!fileMap.has(fix.file)) {
    fileMap.set(fix.file, []);
  }
  fileMap.get(fix.file).push(fix);
});

// Fix each file
let totalFixed = 0;
fileMap.forEach((fileFixes, filePath) => {
  const relativePath = path.relative(process.cwd(), filePath);
  console.log(`Fixing ${relativePath} (${fileFixes.length} issues)...`);

  let content = fs.readFileSync(filePath, 'utf8');

  // Sort by line number descending to avoid offset issues
  fileFixes.sort((a, b) => b.line - a.line || b.column - a.column);

  fileFixes.forEach(fix => {
    const lines = content.split('\n');
    const lineIndex = fix.line - 1;
    const line = lines[lineIndex];
    const varName = fix.varName;
    const newVarName = `_${varName}`;

    // Try to replace the variable name intelligently
    // Match word boundaries to avoid partial replacements
    const regex = new RegExp(`\\b${varName}\\b`, 'g');
    const newLine = line.replace(regex, newVarName);

    if (newLine !== line) {
      lines[lineIndex] = newLine;
      content = lines.join('\n');
      totalFixed++;
    }
  });

  fs.writeFileSync(filePath, content, 'utf8');
});

console.log(`\n✅ Fixed ${totalFixed} unused variables`);
console.log('\n🔄 Running prettier to format...\n');

try {
  execSync('npm run format', { stdio: 'inherit' });
} catch (_error) {
  console.log('⚠️  Prettier formatting had some issues');
}

console.log('\n✅ Done! Run npm run lint to verify the fixes.');
