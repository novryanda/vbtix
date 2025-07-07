#!/usr/bin/env node

/**
 * Setup Script for Cron Environment Variables
 * 
 * This script helps generate and setup environment variables for cron jobs
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

function generateCronSecret() {
  return crypto.randomBytes(32).toString('hex');
}

function setupEnvironmentVariables() {
  console.log('🔧 Setting up Cron Environment Variables');
  console.log('=========================================\n');

  // Generate CRON_SECRET
  const cronSecret = generateCronSecret();
  
  console.log('🔐 Generated CRON_SECRET:');
  console.log(`CRON_SECRET=${cronSecret}\n`);

  // Check if .env.local exists
  const envLocalPath = path.join(process.cwd(), '.env.local');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  let envContent = '';
  
  if (fs.existsSync(envLocalPath)) {
    envContent = fs.readFileSync(envLocalPath, 'utf8');
    console.log('📄 Found existing .env.local file');
  } else {
    console.log('📄 Creating new .env.local file');
  }

  // Check if CRON_SECRET already exists
  if (envContent.includes('CRON_SECRET=')) {
    console.log('⚠️  CRON_SECRET already exists in .env.local');
    console.log('   Please update it manually if needed.');
  } else {
    // Add CRON_SECRET to .env.local
    const cronSecretLine = `\n# Cron job authentication secret\nCRON_SECRET=${cronSecret}\n`;
    
    fs.writeFileSync(envLocalPath, envContent + cronSecretLine);
    console.log('✅ Added CRON_SECRET to .env.local');
  }

  // Update .env.example if it exists
  if (fs.existsSync(envExamplePath)) {
    let exampleContent = fs.readFileSync(envExamplePath, 'utf8');
    
    if (!exampleContent.includes('CRON_SECRET=')) {
      const cronSecretExample = `\n# Cron job authentication secret\nCRON_SECRET=your-cron-secret-here\n`;
      fs.writeFileSync(envExamplePath, exampleContent + cronSecretExample);
      console.log('✅ Added CRON_SECRET to .env.example');
    }
  }

  console.log('\n📋 Next Steps:');
  console.log('==============');
  console.log('1. Add the CRON_SECRET to your production environment variables');
  console.log('2. Configure your cron service to use the secret in Authorization header');
  console.log('3. Test the cron endpoint with the secret');
  
  console.log('\n🧪 Test Commands:');
  console.log('================');
  console.log('# Test without authentication (if CRON_SECRET not set)');
  console.log('curl -X GET "http://localhost:3001/api/cron/cleanup-pending-tickets?dryRun=true"');
  
  console.log('\n# Test with authentication');
  console.log(`curl -X GET "http://localhost:3001/api/cron/cleanup-pending-tickets?dryRun=true" \\`);
  console.log(`     -H "Authorization: Bearer ${cronSecret}"`);

  console.log('\n🚀 Production Setup:');
  console.log('===================');
  console.log('1. Vercel: Add CRON_SECRET to environment variables');
  console.log('2. Railway: railway variables set CRON_SECRET=' + cronSecret);
  console.log('3. Netlify: Add CRON_SECRET to site environment variables');
  console.log('4. GitHub Actions: Add CRON_SECRET to repository secrets');

  console.log('\n📝 Cron Schedule Examples:');
  console.log('=========================');
  console.log('Daily at 2 AM:   0 2 * * *');
  console.log('Weekly Sunday:   0 3 * * 0');
  console.log('Every 6 hours:   0 */6 * * *');
  console.log('Every hour:      0 * * * *');

  console.log('\n✅ Setup completed!');
}

// Run setup
try {
  setupEnvironmentVariables();
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}
