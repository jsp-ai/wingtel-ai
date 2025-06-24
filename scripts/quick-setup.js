#!/usr/bin/env node

/**
 * Quick Setup Script for Wingtel MVNO Demo
 * 
 * This script validates the environment and guides users through
 * setting up the demo for the CEO presentation.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.cyan}🔄${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.magenta}🚀 ${msg}${colors.reset}\n`)
};

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log.success(`${description} exists`);
    return true;
  } else {
    log.error(`${description} missing: ${filePath}`);
    return false;
  }
}

function checkCommand(command, description) {
  try {
    execSync(`${command} --version`, { stdio: 'ignore' });
    log.success(`${description} is installed`);
    return true;
  } catch (error) {
    log.error(`${description} not found. Please install ${command}`);
    return false;
  }
}

function checkEnvironmentVariables() {
  const envFile = '.env';
  const envTemplate = 'env.template';
  
  if (!fs.existsSync(envFile)) {
    if (fs.existsSync(envTemplate)) {
      log.warning('No .env file found, but template exists');
      log.info('Run: cp env.template .env');
      log.info('Then edit .env with your actual values');
      return false;
    } else {
      log.error('No .env file or template found');
      return false;
    }
  }
  
  const envContent = fs.readFileSync(envFile, 'utf8');
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'DATABASE_URL'
  ];
  
  const missingVars = requiredVars.filter(varName => {
    const regex = new RegExp(`^${varName}=.+`, 'm');
    return !regex.test(envContent) || envContent.includes(`${varName}=your-`);
  });
  
  if (missingVars.length > 0) {
    log.warning(`Missing or placeholder values for: ${missingVars.join(', ')}`);
    log.info('Please update your .env file with actual values');
    return false;
  }
  
  log.success('Environment variables configured');
  return true;
}

async function main() {
  log.header('Wingtel MVNO Demo Setup Validation');
  
  let allGood = true;
  
  // Check system requirements
  log.step('Checking system requirements...');
  allGood &= checkCommand('node', 'Node.js');
  allGood &= checkCommand('npm', 'npm');
  allGood &= checkCommand('docker', 'Docker');
  allGood &= checkCommand('docker-compose', 'Docker Compose');
  
  // Check project structure
  log.step('Checking project structure...');
  allGood &= checkFile('package.json', 'Root package.json');
  allGood &= checkFile('docker-compose.yml', 'Docker Compose file');
  allGood &= checkFile('backend/package.json', 'Backend package.json');
  allGood &= checkFile('frontend/package.json', 'Frontend package.json');
  allGood &= checkFile('ai-services/requirements.txt', 'AI services requirements');
  allGood &= checkFile('ai-services/main.py', 'AI services main');
  
  // Check demo data and scripts
  log.step('Checking demo components...');
  allGood &= checkFile('data/homefi-subscribers.csv', 'Subscriber data');
  allGood &= checkFile('scripts/import-full-data.js', 'Data import script');
  allGood &= checkFile('scripts/demo-scenarios.js', 'Demo scenarios');
  allGood &= checkFile('DEMO_SETUP.md', 'Demo setup guide');
  
  // Check environment configuration
  log.step('Checking environment configuration...');
  allGood &= checkEnvironmentVariables();
  
  console.log('\n' + '='.repeat(60));
  
  if (allGood) {
    log.success('🎉 All checks passed! Ready for demo setup');
    console.log('\n📋 Next steps:');
    console.log('1. Start infrastructure: npm run dev');
    console.log('2. Set up Supabase: npm run setup:supabase');
    console.log('3. Import demo data: node scripts/import-full-data.js');
    console.log('4. Run demo scenarios: node scripts/demo-scenarios.js');
    console.log('5. Open frontend: http://localhost:3001');
    console.log('6. View API docs: http://localhost:3000/api/docs');
    console.log('7. Test AI services: http://localhost:8000/docs');
    
    console.log('\n🎯 Demo Features:');
    console.log('• 200+ real subscriber records loaded');
    console.log('• 5 AI scenarios ready for presentation');
    console.log('• Natural language query interface');
    console.log('• Real-time analytics dashboard');
    console.log('• Revenue optimization insights');
    
    console.log('\n💡 For detailed setup: cat DEMO_SETUP.md');
    
  } else {
    log.error('❌ Setup validation failed');
    console.log('\n🔧 Required fixes:');
    console.log('1. Install missing dependencies');
    console.log('2. Configure environment variables');
    console.log('3. Ensure all files are in place');
    console.log('4. Run this script again to validate');
    
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkFile, checkCommand, checkEnvironmentVariables }; 