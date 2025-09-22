#!/usr/bin/env node

/**
 * Supabase Client Verification Script
 * 
 * This script verifies that all files in the project are using the centralized
 * Supabase client and not creating their own instances or duplicating configuration.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Configuration
const srcDir = path.join(__dirname, '..', 'src');
const expectedImport = 'import supabase from "../utils/supabaseClient"';
const alternativeImports = [
  'import supabase from \'../utils/supabaseClient\'',
  'import { supabase } from "../utils/supabaseClient"',
  'import { supabase } from \'../utils/supabaseClient\''
];

// Issues found during verification
const issues = [];
const goodFiles = [];

/**
 * Recursively find all JavaScript/TypeScript files
 */
function findSourceFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      findSourceFiles(fullPath, files);
    } else if (item.match(/\.(js|jsx|ts|tsx)$/)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Check if a file uses Supabase and verify it's using the correct import
 */
function verifyFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(process.cwd(), filePath);
  
  // Skip if file doesn't use Supabase
  if (!content.includes('supabase') && !content.includes('createClient')) {
    return;
  }
  
  // Check for direct createClient usage (should only be in utils/supabaseClient.js)
  if (content.includes('createClient') && !filePath.includes('supabaseClient.js')) {
    if (!filePath.includes('scripts/') && !filePath.includes('test')) {
      issues.push({
        file: relativePath,
        type: 'direct-client-creation',
        message: 'Creates Supabase client directly instead of using centralized client'
      });
    }
  }
  
  // Check for environment variable usage outside of supabaseClient.js
  if ((content.includes('VITE_SUPABASE_URL') || content.includes('VITE_SUPABASE_ANON_KEY')) 
      && !filePath.includes('supabaseClient.js')) {
    issues.push({
      file: relativePath,
      type: 'env-var-usage',
      message: 'Uses Supabase environment variables directly instead of centralized client'
    });
  }
  
  // Check for correct import pattern
  const hasSupabaseImport = content.includes('import') && content.includes('supabase');
  if (hasSupabaseImport) {
    const lines = content.split('\n');
    let hasCorrectImport = false;
    let importLine = '';
    
    for (const line of lines) {
      // Check for various correct import patterns
      if (line.includes('import') && line.includes('supabase') && 
          (line.includes('utils/supabaseClient') || line.includes('./supabaseClient'))) {
        hasCorrectImport = true;
        importLine = line.trim();
        break;
      }
    }
    
    if (hasCorrectImport) {
      goodFiles.push({
        file: relativePath,
        import: importLine
      });
    } else if (content.includes('supabase.') || content.includes('supabase(')) {
      // File uses supabase but doesn't have correct import
      issues.push({
        file: relativePath,
        type: 'incorrect-import',
        message: 'Uses Supabase but not importing from centralized client'
      });
    }
  }
}

/**
 * Main verification function
 */
function verifySupabaseUsage() {
  console.log(`${colors.bold}${colors.blue}🔍 Verifying Supabase Client Usage${colors.reset}\n`);
  
  const sourceFiles = findSourceFiles(srcDir);
  
  console.log(`Found ${sourceFiles.length} source files to check...\n`);
  
  for (const file of sourceFiles) {
    verifyFile(file);
  }
  
  // Report results
  console.log(`${colors.bold}📊 Verification Results:${colors.reset}\n`);
  
  if (issues.length === 0) {
    console.log(`${colors.green}✅ All files are using the centralized Supabase client correctly!${colors.reset}\n`);
  } else {
    console.log(`${colors.red}❌ Found ${issues.length} issues:${colors.reset}\n`);
    
    for (const issue of issues) {
      const icon = issue.type === 'direct-client-creation' ? '🔴' : 
                   issue.type === 'env-var-usage' ? '🟡' : '🟠';
      console.log(`${icon} ${colors.red}${issue.file}${colors.reset}`);
      console.log(`   ${issue.message}\n`);
    }
  }
  
  if (goodFiles.length > 0) {
    console.log(`${colors.green}✅ Files using centralized client correctly (${goodFiles.length}):${colors.reset}\n`);
    for (const file of goodFiles.slice(0, 10)) { // Show first 10
      console.log(`${colors.green}✓${colors.reset} ${file.file}`);
      console.log(`   ${colors.blue}${file.import}${colors.reset}`);
    }
    if (goodFiles.length > 10) {
      console.log(`   ${colors.yellow}... and ${goodFiles.length - 10} more${colors.reset}`);
    }
  }
  
  // Check supabaseClient.js configuration
  console.log(`\n${colors.bold}🛠️  Centralized Client Configuration:${colors.reset}`);
  const clientPath = path.join(srcDir, 'utils', 'supabaseClient.js');
  if (fs.existsSync(clientPath)) {
    const clientContent = fs.readFileSync(clientPath, 'utf8');
    console.log(`${colors.green}✓${colors.reset} Found centralized client at: ${path.relative(process.cwd(), clientPath)}`);
    
    if (clientContent.includes('persistSession: true')) {
      console.log(`${colors.green}✓${colors.reset} Session persistence enabled`);
    }
    if (clientContent.includes('autoRefreshToken: true')) {
      console.log(`${colors.green}✓${colors.reset} Auto token refresh enabled`);
    }
    if (clientContent.includes('detectSessionInUrl: true')) {
      console.log(`${colors.green}✓${colors.reset} URL session detection enabled`);
    }
  } else {
    console.log(`${colors.red}✗${colors.reset} Centralized client not found!`);
  }
  
  console.log(`\n${colors.bold}📋 Summary:${colors.reset}`);
  console.log(`${colors.green}✅ Good files: ${goodFiles.length}${colors.reset}`);
  console.log(`${colors.red}❌ Issues found: ${issues.length}${colors.reset}`);
  
  return issues.length === 0;
}

// Run verification
const success = verifySupabaseUsage();
process.exit(success ? 0 : 1);
