#!/usr/bin/env node

/**
 * Script to create a new organization in the MVNO platform
 * Usage: npm run create:org
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createOrganization() {
  console.log('🏢 Creating new MVNO organization...\n');

  // Prompt for organization details
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const prompt = (question) => {
    return new Promise((resolve) => {
      readline.question(question, resolve);
    });
  };

  try {
    const name = await prompt('Organization name: ');
    const slug = await prompt('Organization slug (lowercase, no spaces): ') || 
                 name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const domain = await prompt('Organization domain (optional): ') || null;

    console.log('\n📋 Organization details:');
    console.log(`Name: ${name}`);
    console.log(`Slug: ${slug}`);
    console.log(`Domain: ${domain || 'Not specified'}`);

    const confirm = await prompt('\nConfirm creation? (y/N): ');
    
    if (confirm.toLowerCase() !== 'y') {
      console.log('❌ Organization creation cancelled.');
      readline.close();
      return;
    }

    // Create the organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert([
        {
          name,
          slug,
          domain,
          config: {
            timezone: 'America/New_York',
            currency: 'USD',
            date_format: 'MM/DD/YYYY'
          },
          branding: {
            primary_color: '#1976d2',
            logo_url: null,
            company_name: name
          },
          billing_settings: {
            default_payment_terms: 30,
            auto_charge: false,
            late_fee_percentage: 5.0
          }
        }
      ])
      .select()
      .single();

    if (orgError) {
      console.error('❌ Error creating organization:', orgError.message);
      readline.close();
      return;
    }

    console.log('✅ Organization created successfully!');
    console.log(`🆔 Organization ID: ${org.id}`);

    // Create default admin user
    const adminEmail = await prompt('\nAdmin email address: ');
    const adminPassword = await prompt('Admin password (8+ characters): ');

    if (adminPassword.length < 8) {
      console.log('⚠️  Password too short. Skipping admin user creation.');
    } else {
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert([
          {
            organization_id: org.id,
            email: adminEmail,
            first_name: 'Admin',
            last_name: 'User',
            role: 'operator',
            permissions: {
              subscribers: ['read', 'write', 'delete'],
              billing: ['read', 'write'],
              analytics: ['read'],
              ai_commands: ['execute']
            }
          }
        ])
        .select()
        .single();

      if (userError) {
        console.log('⚠️  Warning: Could not create admin user:', userError.message);
      } else {
        console.log('✅ Admin user created successfully!');
        console.log(`👤 User ID: ${user.id}`);
      }
    }

    // Create default plans
    const createDefaultPlans = await prompt('\nCreate default plans? (Y/n): ');
    
    if (createDefaultPlans.toLowerCase() !== 'n') {
      const defaultPlans = [
        {
          organization_id: org.id,
          name: 'Basic Prepaid',
          description: '1GB Data + Unlimited Talk & Text',
          plan_type: 'prepaid',
          price_cents: 2500,
          billing_cycle_days: 30,
          data_allowance_mb: 1024,
          voice_minutes: -1,
          sms_count: -1,
          features: {
            hotspot: false,
            international: false,
            roaming: false
          }
        },
        {
          organization_id: org.id,
          name: 'Premium Prepaid',
          description: '5GB Data + Unlimited Talk & Text',
          plan_type: 'prepaid',
          price_cents: 4500,
          billing_cycle_days: 30,
          data_allowance_mb: 5120,
          voice_minutes: -1,
          sms_count: -1,
          features: {
            hotspot: true,
            international: false,
            roaming: false
          }
        },
        {
          organization_id: org.id,
          name: 'Business Postpaid',
          description: '10GB Data + Unlimited Everything',
          plan_type: 'postpaid',
          price_cents: 7500,
          billing_cycle_days: 30,
          data_allowance_mb: 10240,
          voice_minutes: -1,
          sms_count: -1,
          features: {
            hotspot: true,
            international: true,
            roaming: true
          }
        }
      ];

      const { data: plans, error: plansError } = await supabase
        .from('plans')
        .insert(defaultPlans)
        .select();

      if (plansError) {
        console.log('⚠️  Warning: Could not create default plans:', plansError.message);
      } else {
        console.log(`✅ Created ${plans.length} default plans`);
      }
    }

    console.log('\n🎉 Setup complete! Next steps:');
    console.log(`1. Update your .env file with: ORGANIZATION_ID=${org.id}`);
    console.log('2. Start the development environment: npm run dev');
    console.log('3. Visit http://localhost:3001 to access the admin dashboard');
    console.log('\n📚 Documentation: See GETTING_STARTED.md for more details');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    readline.close();
  }
}

// Run the script
createOrganization().catch(console.error); 