#!/usr/bin/env node

/**
 * This script uses ESLint to automatically sort imports in all TypeScript files.
 * It helps maintain a consistent import order throughout the codebase.
 */

const { execSync } = require('child_process');
const { existsSync } = require('fs');
const { join } = require('path');

const eslintPath = join(__dirname, '../node_modules/.bin/eslint');

if (!existsSync(eslintPath)) {
  console.error('ESLint not found. Please run npm install first.');
  process.exit(1);
}

try {
  console.log('Sorting imports in TypeScript files...');
  execSync(`${eslintPath} --ext .ts src --fix --rule 'import/order: error'`, {
    stdio: 'inherit',
  });
  console.log('✅ Imports sorted successfully!');
} catch (error) {
  console.error('❌ Error sorting imports:', error.message);
  process.exit(1);
} 