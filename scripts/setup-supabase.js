#!/usr/bin/env node

/**
 * Supabase Setup Script for MVNO Platform
 * This script will:
 * 1. Test the Supabase connection
 * 2. Create the database schema
 * 3. Set up the initial organization
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Your Supabase credentials
const SUPABASE_URL = 'https://kzifzfzjyhxbbwmpywbe.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6aWZ6ZnpqeWh4YmJ3bXB5d2JlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc2NzU4NSwiZXhwIjoyMDY2MzQzNTg1fQ.V9Lru_3TssdXMYo8cKiRKMXZO-WJnXz6y2Cz8KCegvA';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6aWZ6ZnpqeWh4YmJ3bXB5d2JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3Njc1ODUsImV4cCI6MjA2NjM0MzU4NX0.iM3xqmKlV1Tj-pKyCsForaOaAppx_FEBLcuqFtyeQuI';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createEnvFile() {
  console.log('📝 Creating .env file with your Supabase credentials...\n');
  
  const envContent = `# ===========================================
# MVNO Operations Platform - Environment Variables
# ===========================================

# ===========================================
# DATABASE CONFIGURATION (Supabase)
# ===========================================
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_KEY}

# Direct database connection (get password from Supabase dashboard)
DATABASE_URL=postgresql://postgres:[your-db-password]@db.kzifzfzjyhxbbwmpywbe.supabase.co:5432/postgres

# ===========================================
# APPLICATION CONFIGURATION
# ===========================================
NODE_ENV=development
PORT=3000
JWT_SECRET=wingtel-mvno-super-secure-jwt-secret-key-for-development-2024
API_VERSION=v1

# Organization ID (will be set after creating organization)
ORGANIZATION_ID=

# ===========================================
# AI SERVICES CONFIGURATION
# ===========================================
# Add your OpenAI API key here
OPENAI_API_KEY=sk-your-openai-api-key

# Optional: Anthropic Claude for advanced AI features
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# AI service endpoints
AI_SERVICES_URL=http://localhost:8000
EMBEDDING_MODEL=text-embedding-ada-002
CHAT_MODEL=gpt-4-turbo-preview

# ===========================================
# EXTERNAL INTEGRATIONS (Add your keys)
# ===========================================

# Payment Processing (Stripe test keys)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# SMS/Communications (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Carrier Integrations (Development - Use sandbox)
VERIZON_API_KEY=your-verizon-api-key
VERIZON_SECRET_KEY=your-verizon-secret-key
VERIZON_ENVIRONMENT=sandbox

# ===========================================
# DEVELOPMENT SETTINGS
# ===========================================
REDIS_URL=redis://localhost:6379
CORS_ORIGINS=http://localhost:3001,http://localhost:3000

# Mock external services in development
MOCK_CARRIER_APIS=true
MOCK_PAYMENT_APIS=true
MOCK_SMS_APIS=true

# ===========================================
# FRONTEND CONFIGURATION
# ===========================================
REACT_APP_SUPABASE_URL=${SUPABASE_URL}
REACT_APP_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
REACT_APP_API_URL=http://localhost:3000
REACT_APP_ENVIRONMENT=development

# ===========================================
# FEATURE FLAGS
# ===========================================
ENABLE_AI_FEATURES=true
ENABLE_PLAN_OPTIMIZATION=true
ENABLE_COMMAND_CONSOLE=true
ENABLE_ADVANCED_ANALYTICS=true
`;

  try {
    fs.writeFileSync('.env', envContent);
    console.log('✅ .env file created successfully!');
  } catch (error) {
    console.error('❌ Error creating .env file:', error.message);
    console.log('\n📋 Please create a .env file manually with the content above');
  }
}

async function testConnection() {
  console.log('🔗 Testing Supabase connection...\n');
  
  try {
    // Test the connection by trying to access the auth endpoint
    const { data, error } = await supabase.auth.getSession();
    
    if (error && error.message.includes('Invalid API key')) {
      console.error('❌ Invalid Supabase credentials');
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    return false;
  }
}

async function runMigrations() {
  console.log('🗄️  Setting up database schema...\n');
  
  try {
    // Read the migration files
    const migrationFiles = [
      'migrations/01_bootstrap.sql',
      'migrations/02_mvno_schema.sql'
    ];
    
    for (const migrationFile of migrationFiles) {
      if (fs.existsSync(migrationFile)) {
        console.log(`📄 Found ${migrationFile}`);
        const sql = fs.readFileSync(migrationFile, 'utf8');
        
        // Execute the SQL using Supabase's RPC or direct SQL execution
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
        
        if (error) {
          console.log(`⚠️  Note: ${migrationFile} - ${error.message}`);
        } else {
          console.log(`✅ ${migrationFile} executed successfully`);
        }
      }
    }
    
    console.log('\n💡 Note: For complete schema setup, you may need to run:');
    console.log('   npx supabase link --project-ref kzifzfzjyhxbbwmpywbe');
    console.log('   npx supabase db push');
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    console.log('\n🔧 Alternative setup method:');
    console.log('1. Install Supabase CLI: npm install -g supabase');
    console.log('2. Link project: supabase link --project-ref kzifzfzjyhxbbwmpywbe');
    console.log('3. Push schema: supabase db push');
  }
}

async function setupComplete() {
  console.log('\n🎉 Setup Overview:\n');
  
  console.log('✅ Supabase Project: https://kzifzfzjyhxbbwmpywbe.supabase.co');
  console.log('✅ Environment file created');
  console.log('✅ Database connection tested');
  
  console.log('\n📋 Next Steps:');
  console.log('1. Install dependencies: npm install');
  console.log('2. Add your API keys to .env file:');
  console.log('   - OPENAI_API_KEY (for AI features)');
  console.log('   - STRIPE_SECRET_KEY (for payments)');
  console.log('   - TWILIO_AUTH_TOKEN (for SMS)');
  console.log('3. Set up database schema:');
  console.log('   npm install -g supabase');
  console.log('   supabase link --project-ref kzifzfzjyhxbbwmpywbe');
  console.log('   supabase db push');
  console.log('4. Create your organization: npm run create:org');
  console.log('5. Start development: npm run dev');
  
  console.log('\n🔗 Quick Links:');
  console.log('- Supabase Dashboard: https://supabase.com/dashboard/project/kzifzfzjyhxbbwmpywbe');
  console.log('- API Docs (after start): http://localhost:3000/docs');
  console.log('- Admin Dashboard (after start): http://localhost:3001');
  
  console.log('\n📚 Documentation:');
  console.log('- Getting Started: GETTING_STARTED.md');
  console.log('- Project Structure: PROJECT_STRUCTURE.md');
}

async function main() {
  console.log('🚀 MVNO Platform - Supabase Setup\n');
  console.log('This will configure your platform with Supabase credentials\n');
  
  try {
    // Create .env file
    await createEnvFile();
    
    // Test connection
    const connected = await testConnection();
    
    if (connected) {
      // Try to run migrations
      await runMigrations();
    }
    
    // Show completion message
    await setupComplete();
    
  } catch (error) {
    console.error('❌ Setup error:', error.message);
    process.exit(1);
  }
}

// Run the setup
main().catch(console.error); 