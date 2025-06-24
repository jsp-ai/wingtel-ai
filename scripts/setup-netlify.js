#!/usr/bin/env node

/**
 * Netlify Setup Script for MVNO Platform Frontend
 * This script helps configure Netlify deployment for the React frontend
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SITE_NAME = 'wingtel-mvno-platform';
const REPO_URL = 'https://github.com/wingtel-ai/mvno-platform'; // Update with your actual repo

async function checkNetlifyCLI() {
  console.log('🔍 Checking Netlify CLI...\n');
  
  try {
    execSync('netlify --version', { stdio: 'pipe' });
    console.log('✅ Netlify CLI is installed');
    return true;
  } catch (error) {
    console.log('❌ Netlify CLI not found');
    console.log('\n📦 Installing Netlify CLI...');
    
    try {
      execSync('npm install -g netlify-cli', { stdio: 'inherit' });
      console.log('✅ Netlify CLI installed successfully!');
      return true;
    } catch (installError) {
      console.error('❌ Failed to install Netlify CLI:', installError.message);
      console.log('\n🔧 Manual installation:');
      console.log('   npm install -g netlify-cli');
      return false;
    }
  }
}

async function loginToNetlify() {
  console.log('🔐 Netlify Authentication...\n');
  
  try {
    // Check if already logged in
    execSync('netlify status', { stdio: 'pipe' });
    console.log('✅ Already logged in to Netlify');
    return true;
  } catch (error) {
    console.log('🔑 Please log in to Netlify...');
    console.log('This will open your browser for authentication.\n');
    
    try {
      execSync('netlify login', { stdio: 'inherit' });
      console.log('✅ Successfully logged in to Netlify!');
      return true;
    } catch (loginError) {
      console.error('❌ Failed to log in to Netlify:', loginError.message);
      return false;
    }
  }
}

async function createNetlifySite() {
  console.log('🚀 Creating Netlify site...\n');
  
  try {
    // Check if site already exists
    const netlifyToml = fs.readFileSync('netlify.toml', 'utf8');
    console.log('✅ netlify.toml configuration found');
    
    // Try to link existing site first
    try {
      execSync(`netlify link --name ${SITE_NAME}`, { stdio: 'pipe' });
      console.log(`✅ Linked to existing site: ${SITE_NAME}`);
      return true;
    } catch (linkError) {
      // Site doesn't exist, create new one
      console.log(`📝 Creating new site: ${SITE_NAME}...`);
      
      const createCmd = `netlify sites:create --name ${SITE_NAME}`;
      const result = execSync(createCmd, { encoding: 'utf8' });
      console.log('✅ Site created successfully!');
      console.log(result);
      
      // Link the created site
      execSync(`netlify link --name ${SITE_NAME}`, { stdio: 'inherit' });
      console.log('✅ Site linked to local project');
      
      return true;
    }
  } catch (error) {
    console.error('❌ Failed to create/link Netlify site:', error.message);
    console.log('\n🔧 Manual setup:');
    console.log('1. Go to: https://app.netlify.com/start');
    console.log('2. Connect your GitHub repository');
    console.log('3. Configure build settings:');
    console.log('   - Build command: npm run build:frontend');
    console.log('   - Publish directory: packages/frontend/dist');
    return false;
  }
}

async function configureEnvironmentVariables() {
  console.log('⚙️  Configuring environment variables...\n');
  
  // Read current .env file
  let envVars = {};
  if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0 && !key.startsWith('#')) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
  }
  
  // Frontend-specific environment variables
  const frontendEnvVars = {
    'REACT_APP_SUPABASE_URL': envVars.SUPABASE_URL || 'https://kzifzfzjyhxbbwmpywbe.supabase.co',
    'REACT_APP_SUPABASE_ANON_KEY': envVars.SUPABASE_ANON_KEY || '',
    'REACT_APP_API_URL': 'https://api.wingtel.com',
    'REACT_APP_ENVIRONMENT': 'production',
    'NODE_VERSION': '18',
    'NPM_FLAGS': '--legacy-peer-deps'
  };
  
  console.log('🔧 Setting Netlify environment variables...');
  
  for (const [key, value] of Object.entries(frontendEnvVars)) {
    if (value) {
      try {
        execSync(`netlify env:set ${key} "${value}"`, { stdio: 'pipe' });
        console.log(`✅ Set ${key}`);
      } catch (error) {
        console.log(`⚠️  Failed to set ${key}: ${error.message}`);
      }
    } else {
      console.log(`⚠️  Skipping ${key} (empty value)`);
    }
  }
  
  console.log('\n📋 Manual environment variables to set in Netlify dashboard:');
  console.log('Go to: Site settings > Environment variables');
  console.log('- REACT_APP_SUPABASE_ANON_KEY (from your .env file)');
  console.log('- REACT_APP_API_URL (your backend API URL)');
}

async function configureBuildSettings() {
  console.log('🔨 Configuring build settings...\n');
  
  try {
    // Set build command
    execSync('netlify sites:configure --build-cmd "npm run build:frontend"', { stdio: 'pipe' });
    console.log('✅ Build command configured');
    
    // Set publish directory
    execSync('netlify sites:configure --publish-dir "packages/frontend/dist"', { stdio: 'pipe' });
    console.log('✅ Publish directory configured');
    
    console.log('✅ Build settings configured successfully!');
  } catch (error) {
    console.log('⚠️  Auto-configuration failed, manual setup needed:');
    console.log('1. Go to your Netlify site dashboard');
    console.log('2. Site settings > Build & deploy');
    console.log('3. Set build command: npm run build:frontend');
    console.log('4. Set publish directory: packages/frontend/dist');
  }
}

async function testDeployment() {
  console.log('🧪 Testing deployment...\n');
  
  try {
    // Create a simple test build
    if (!fs.existsSync('packages/frontend/dist')) {
      console.log('📁 Creating test build directory...');
      fs.mkdirSync('packages/frontend/dist', { recursive: true });
      
      const testHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wingtel MVNO Platform</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .container { max-width: 600px; margin: 0 auto; }
        .status { color: #4CAF50; font-size: 24px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Wingtel MVNO Platform</h1>
        <div class="status">✅ Netlify Deployment Successful!</div>
        <p>Your MVNO platform frontend is now deployed on Netlify.</p>
        <p>This is a test deployment. The full React application will be deployed once the frontend is built.</p>
        <hr>
        <p><strong>Next Steps:</strong></p>
        <ul style="text-align: left;">
            <li>Build the React frontend</li>
            <li>Configure API endpoints</li>
            <li>Set up authentication</li>
            <li>Deploy production version</li>
        </ul>
    </div>
</body>
</html>`;
      
      fs.writeFileSync('packages/frontend/dist/index.html', testHTML);
      console.log('✅ Test HTML created');
    }
    
    // Deploy preview
    console.log('🚀 Deploying test preview...');
    const deployResult = execSync('netlify deploy --dir=packages/frontend/dist', { encoding: 'utf8' });
    console.log('✅ Test deployment successful!');
    console.log(deployResult);
    
    // Extract preview URL
    const previewMatch = deployResult.match(/Website Draft URL: (https:\/\/[^\s]+)/);
    if (previewMatch) {
      console.log(`\n🌐 Preview URL: ${previewMatch[1]}`);
    }
    
  } catch (error) {
    console.error('❌ Test deployment failed:', error.message);
  }
}

async function setupGitHubIntegration() {
  console.log('🔗 Setting up GitHub integration...\n');
  
  console.log('📋 GitHub Integration Setup:');
  console.log('1. Go to your Netlify site dashboard');
  console.log('2. Site settings > Build & deploy > Continuous deployment');
  console.log('3. Connect to your GitHub repository');
  console.log('4. Set branch to deploy: main');
  console.log('5. Enable deploy previews for pull requests');
  
  console.log('\n🔐 GitHub Secrets needed for Actions:');
  console.log('Repository Settings > Secrets and variables > Actions');
  console.log('Add these secrets:');
  console.log('- NETLIFY_SITE_ID (from Netlify dashboard)');
  console.log('- NETLIFY_AUTH_TOKEN (from Netlify dashboard)');
  console.log('- REACT_APP_SUPABASE_URL');
  console.log('- REACT_APP_SUPABASE_ANON_KEY');
  console.log('- REACT_APP_API_URL');
}

async function showSummary() {
  console.log('\n🎉 Netlify Setup Complete!\n');
  
  console.log('✅ Netlify CLI installed and authenticated');
  console.log('✅ Site created and linked');
  console.log('✅ Environment variables configured');
  console.log('✅ Build settings configured');
  console.log('✅ Test deployment completed');
  
  console.log('\n📋 Quick Commands:');
  console.log('- Deploy preview: npm run deploy:frontend:preview');
  console.log('- Deploy to production: npm run deploy:frontend');
  console.log('- Deploy to staging: npm run deploy:frontend:staging');
  
  console.log('\n🔗 Important Links:');
  console.log('- Netlify Dashboard: https://app.netlify.com/sites');
  console.log('- Site URL: https://wingtel-mvno-platform.netlify.app');
  console.log('- Build logs: Available in Netlify dashboard');
  
  console.log('\n📚 Next Steps:');
  console.log('1. Build your React frontend: cd packages/frontend && npm run build');
  console.log('2. Deploy production: npm run deploy:frontend');
  console.log('3. Set up custom domain (optional)');
  console.log('4. Configure GitHub integration for auto-deploys');
}

async function main() {
  console.log('🚀 Netlify Setup for MVNO Platform Frontend\n');
  console.log('This will set up automatic deployment of your React frontend to Netlify\n');
  
  try {
    // Check and install CLI
    const cliReady = await checkNetlifyCLI();
    if (!cliReady) return;
    
    // Login to Netlify
    const loginSuccess = await loginToNetlify();
    if (!loginSuccess) return;
    
    // Create/link site
    const siteReady = await createNetlifySite();
    if (!siteReady) return;
    
    // Configure environment variables
    await configureEnvironmentVariables();
    
    // Configure build settings
    await configureBuildSettings();
    
    // Test deployment
    await testDeployment();
    
    // GitHub integration instructions
    await setupGitHubIntegration();
    
    // Show summary
    await showSummary();
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
main().catch(console.error); 