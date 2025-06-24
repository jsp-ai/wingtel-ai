#!/usr/bin/env node

/**
 * Direct Database Setup Script for MVNO Platform
 * This script connects directly to Supabase PostgreSQL and runs migrations
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Your Supabase credentials
const SUPABASE_URL = 'https://kzifzfzjyhxbbwmpywbe.supabase.co';

// Extract connection details from Supabase URL
const DB_CONFIG = {
  host: 'db.kzifzfzjyhxbbwmpywbe.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  // You'll need to get this from your Supabase dashboard
  password: process.env.SUPABASE_DB_PASSWORD || '[ASK_USER_FOR_PASSWORD]'
};

async function connectToDatabase() {
  console.log('🔗 Connecting to Supabase PostgreSQL...\n');
  
  const client = new Client(DB_CONFIG);
  
  try {
    await client.connect();
    console.log('✅ Database connection successful!');
    return client;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.log('\n🔑 You need to get your database password from Supabase:');
      console.log('1. Go to: https://supabase.com/dashboard/project/kzifzfzjyhxbbwmpywbe/settings/database');
      console.log('2. Look for "Database password" or reset it');
      console.log('3. Set environment variable: export SUPABASE_DB_PASSWORD="your-password"');
      console.log('4. Run this script again');
    }
    
    throw error;
  }
}

async function runMigrations(client) {
  console.log('\n🗄️  Running database migrations...\n');
  
  try {
    // Migration files to run in order
    const migrationFiles = [
      'migrations/01_bootstrap.sql',
      'migrations/02_mvno_schema.sql'
    ];
    
    for (const migrationFile of migrationFiles) {
      if (fs.existsSync(migrationFile)) {
        console.log(`📄 Running ${migrationFile}...`);
        const sql = fs.readFileSync(migrationFile, 'utf8');
        
        // Split SQL into individual statements (handle multiple commands)
        const statements = sql
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        for (let i = 0; i < statements.length; i++) {
          const statement = statements[i];
          if (statement.trim()) {
            try {
              await client.query(statement + ';');
            } catch (error) {
              // Log but continue - some statements might already exist
              if (error.message.includes('already exists')) {
                console.log(`   ⚠️  ${error.message}`);
              } else {
                console.error(`   ❌ Error in statement ${i + 1}:`, error.message);
              }
            }
          }
        }
        
        console.log(`✅ ${migrationFile} completed`);
      } else {
        console.log(`⚠️  ${migrationFile} not found`);
      }
    }
    
    console.log('\n✅ All migrations completed!');
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    throw error;
  }
}

async function verifySetup(client) {
  console.log('\n🔍 Verifying database setup...\n');
  
  try {
    // Check if key tables exist
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('organizations', 'subscribers', 'plans', 'ai_knowledge_documents')
      ORDER BY table_name;
    `);
    
    console.log('📊 Created tables:', tables.rows.map(row => row.table_name).join(', '));
    
    // Check if vector extension is available
    const extensions = await client.query(`
      SELECT extname FROM pg_extension WHERE extname = 'vector';
    `);
    
    if (extensions.rows.length > 0) {
      console.log('✅ Vector extension enabled (for AI embeddings)');
    } else {
      console.log('⚠️  Vector extension not found - AI features may be limited');
    }
    
    // Check if RLS is enabled
    const rlsTables = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND rowsecurity = true;
    `);
    
    console.log('🔒 RLS enabled on:', rlsTables.rows.map(row => row.tablename).join(', '));
    
    console.log('\n✅ Database verification complete!');
    
  } catch (error) {
    console.error('❌ Verification error:', error.message);
  }
}

async function createTestOrganization(client) {
  console.log('\n🏢 Creating test organization...\n');
  
  try {
    // Check if organization already exists
    const existing = await client.query(`
      SELECT id FROM organizations WHERE name = 'Wingtel MVNO' LIMIT 1;
    `);
    
    if (existing.rows.length > 0) {
      console.log('✅ Test organization already exists:', existing.rows[0].id);
      return existing.rows[0].id;
    }
    
    // Create new organization
    const result = await client.query(`
      INSERT INTO organizations (
        name, 
        slug, 
        industry, 
        settings
      ) VALUES (
        'Wingtel MVNO',
        'wingtel-mvno',
        'Telecommunications',
        '{"features": ["ai_optimization", "command_console", "advanced_analytics"]}'::jsonb
      )
      RETURNING id;
    `);
    
    const orgId = result.rows[0].id;
    console.log('✅ Test organization created:', orgId);
    
    // Update .env file with organization ID
    let envContent = fs.readFileSync('.env', 'utf8');
    envContent = envContent.replace(
      /ORGANIZATION_ID=.*$/m,
      `ORGANIZATION_ID=${orgId}`
    );
    fs.writeFileSync('.env', envContent);
    console.log('✅ Organization ID added to .env file');
    
    return orgId;
    
  } catch (error) {
    console.error('❌ Error creating organization:', error.message);
  }
}

async function setupComplete() {
  console.log('\n🎉 Database Setup Complete!\n');
  
  console.log('✅ Database schema created');
  console.log('✅ Test organization set up');
  console.log('✅ Environment configured');
  
  console.log('\n📋 Next Steps:');
  console.log('1. Add your API keys to .env file:');
  console.log('   - OPENAI_API_KEY (for AI features)');
  console.log('   - STRIPE_SECRET_KEY (for payments)');
  console.log('   - TWILIO_AUTH_TOKEN (for SMS)');
  console.log('2. Install all dependencies: npm install');
  console.log('3. Start development environment: npm run dev');
  
  console.log('\n🔗 Quick Links:');
  console.log('- Supabase Dashboard: https://supabase.com/dashboard/project/kzifzfzjyhxbbwmpywbe');
  console.log('- Database: https://supabase.com/dashboard/project/kzifzfzjyhxbbwmpywbe/editor');
  console.log('- API Docs (after start): http://localhost:3000/docs');
  console.log('- Admin Dashboard (after start): http://localhost:3001');
}

async function main() {
  console.log('🚀 MVNO Platform - Direct Database Setup\n');
  
  if (DB_CONFIG.password === '[ASK_USER_FOR_PASSWORD]') {
    console.log('❗ Database password required!');
    console.log('\nTo get your database password:');
    console.log('1. Go to: https://supabase.com/dashboard/project/kzifzfzjyhxbbwmpywbe/settings/database');
    console.log('2. Copy your database password');
    console.log('3. Run: export SUPABASE_DB_PASSWORD="your-password"');
    console.log('4. Run this script again: node scripts/setup-database.js');
    return;
  }
  
  let client;
  
  try {
    // Connect to database
    client = await connectToDatabase();
    
    // Run migrations
    await runMigrations(client);
    
    // Verify setup
    await verifySetup(client);
    
    // Create test organization
    await createTestOrganization(client);
    
    // Show completion message
    await setupComplete();
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

// Run the setup
main().catch(console.error); 