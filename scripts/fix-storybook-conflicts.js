#!/usr/bin/env node

/**
 * Storybook Version Conflict Resolution Script
 * Fixes Vite version conflicts with Storybook dependencies
 */

const fs = require('fs');
const { execSync } = require('child_process');

const DRY_RUN = process.argv.includes('--dry-run');

console.log('🔧 Storybook Version Conflict Resolution');
console.log('=' .repeat(45));

if (DRY_RUN) {
  console.log('🔍 DRY RUN MODE - No changes will be made\n');
}

// Load current package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

console.log('🔍 Analyzing Storybook Dependencies...');

// Current Storybook packages
const storybookPackages = Object.keys(packageJson.devDependencies || {})
  .filter(pkg => pkg.startsWith('@storybook/'))
  .reduce((obj, pkg) => {
    obj[pkg] = packageJson.devDependencies[pkg];
    return obj;
  }, {});

console.log('Current Storybook packages:');
Object.entries(storybookPackages).forEach(([pkg, version]) => {
  console.log(`  ${pkg}: ${version}`);
});

// Check current Vite version
const viteVersion = packageJson.devDependencies?.vite || packageJson.dependencies?.vite;
console.log(`\nCurrent Vite version: ${viteVersion}`);

// The issue: Storybook 8.6.14 expects Vite ^4.0.0 || ^5.0.0 || ^6.0.0 but we have 7.1.5
console.log('\n🚨 Issue Identified:');
console.log('Storybook 8.6.14 expects Vite ^4.0.0 || ^5.0.0 || ^6.0.0');
console.log(`But project uses Vite ${viteVersion}`);

// Solution options
const solutions = {
  option1: {
    name: 'Downgrade Vite to compatible version',
    description: 'Downgrade Vite to 6.x to maintain compatibility',
    changes: {
      vite: '^6.0.0'
    },
    pros: ['Immediate compatibility', 'No Storybook changes needed'],
    cons: ['Lose Vite 7.x features', 'May affect other dependencies']
  },
  
  option2: {
    name: 'Upgrade Storybook to latest',
    description: 'Upgrade to Storybook 8.7+ which supports Vite 7',
    changes: {
      '@storybook/addon-a11y': '^8.7.0',
      '@storybook/addon-docs': '^8.7.0',
      '@storybook/addon-essentials': '^8.7.0',
      '@storybook/addon-interactions': '^8.7.0',
      '@storybook/addon-themes': '^8.7.0',
      '@storybook/builder-vite': '^8.7.0',
      '@storybook/cli': '^8.7.0',
      '@storybook/react': '^8.7.0',
      '@storybook/react-vite': '^8.7.0'
    },
    pros: ['Keep Vite 7.x features', 'Latest Storybook features'],
    cons: ['May introduce breaking changes', 'Need to test Storybook setup']
  },
  
  option3: {
    name: 'Use legacy peer deps (temporary)',
    description: 'Install with --legacy-peer-deps flag',
    changes: {},
    pros: ['Quick fix', 'No version changes'],
    cons: ['Not a permanent solution', 'May hide other conflicts']
  }
};

console.log('\n💡 Solution Options:');
Object.entries(solutions).forEach(([key, solution]) => {
  console.log(`\n${key.toUpperCase()}: ${solution.name}`);
  console.log(`Description: ${solution.description}`);
  console.log(`Pros: ${solution.pros.join(', ')}`);
  console.log(`Cons: ${solution.cons.join(', ')}`);
});

// Recommended solution: Option 2 (Upgrade Storybook)
const recommendedSolution = solutions.option2;
console.log(`\n🎯 Recommended Solution: ${recommendedSolution.name}`);
console.log(`Reason: Keeps project on latest Vite while updating Storybook to compatible version`);

if (!DRY_RUN) {
  console.log('\n🔄 Applying recommended solution...');
  
  // Backup package.json
  const backupName = `package.json.storybook-backup.${Date.now()}`;
  fs.writeFileSync(backupName, JSON.stringify(packageJson, null, 2));
  console.log(`💾 Backup created: ${backupName}`);
  
  // Update Storybook versions
  const newPackageJson = { ...packageJson };
  Object.entries(recommendedSolution.changes).forEach(([pkg, version]) => {
    if (newPackageJson.devDependencies[pkg]) {
      newPackageJson.devDependencies[pkg] = version;
      console.log(`🔄 Updated ${pkg} to ${version}`);
    }
  });
  
  // Write updated package.json
  fs.writeFileSync('package.json', JSON.stringify(newPackageJson, null, 2) + '\n');
  console.log('✅ Updated package.json');
  
  // Install updates
  console.log('\n📦 Installing updated dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies updated successfully');
  } catch (error) {
    console.error('❌ Installation failed:', error.message);
    console.log('💡 Trying with legacy peer deps...');
    try {
      execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
      console.log('✅ Dependencies installed with legacy peer deps');
    } catch (legacyError) {
      console.error('❌ Legacy peer deps also failed:', legacyError.message);
    }
  }
  
} else {
  console.log('\n🔍 DRY RUN - Changes that would be made:');
  Object.entries(recommendedSolution.changes).forEach(([pkg, version]) => {
    console.log(`  ${pkg}: ${storybookPackages[pkg]} -> ${version}`);
  });
}

// Additional cleanup for extraneous packages
console.log('\n🧹 Additional Cleanup Recommendations:');
console.log('The following extraneous packages should be removed:');

const extraneousPackages = [
  'async@3.2.6',
  'btoa@1.2.1',
  'duplexer@0.1.2', 
  'ejs@3.1.10',
  'escape-html@1.0.3',
  'filelist@1.0.4',
  'gzip-size@6.0.0',
  'jake@10.9.4'
];

extraneousPackages.forEach(pkg => {
  console.log(`  npm uninstall ${pkg.split('@')[0]}`);
});

console.log('\n📋 Post-Fix Verification Steps:');
console.log('1. Run: npm ls --depth=0 (should show no errors)');
console.log('2. Test Storybook: npm run storybook');
console.log('3. Test build: npm run build');
console.log('4. Run tests: npm test');
console.log('5. Check for remaining conflicts: npm audit');

console.log('\n🎯 Expected Results:');
console.log('• Resolved Vite version conflicts');
console.log('• Storybook compatible with Vite 7.x');
console.log('• Cleaner dependency tree');
console.log('• No extraneous packages');

if (DRY_RUN) {
  console.log('\n🚀 To apply fixes, run:');
  console.log('   node scripts/fix-storybook-conflicts.js');
}
