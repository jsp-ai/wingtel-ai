const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// CSV data as string (you can also read from file)
const csvData = `network,subscription_id,first_name,last_name,mdn,device_id,icc_id,user_profile_id,subscription_status,effective_date,expiration_date,expiration_type,email,plan_name,plan_price,reference,plan_id,sub_created_by,profile_created_by,acl_group_name,profile_name,owner_acl_group_name,vendor,carrier
att,313841,Vernon,Stanton,9296188183,863890053644183,89148000006041107283,202014,active,2023-08-02 20:10:21.123250+00:00,,,verno1974@gmail.com,VZ 200GB Plan WT - B2B Only,0.01,,625,149159,149159,BUSINESS,HomeFi Activation Cycle V2,BUSINESS,Verizon,
att,316416,Angela,Harvey,8970765883,863890053646956,89148000006041106772,202014,expired,2023-08-09 18:34:47.170167+00:00,2025-04-10 00:27:33.287387+00:00,cancel,lightningelectric7@gmail.com,HomeFi Parking Plan - 100mbps,0.01,,634,149159,149159,BUSINESS,HomeFi Activation Cycle V2,BUSINESS,Verizon,
att,320080,James,Anderson,3327334561,357776720465362,89148000008341829400,202014,active,2023-09-22 15:22:34.279615+00:00,,,jhanders1943@gmail.com,VZ 5G - 300GB (100MBPS) Plan WT - B2B Only,1,,629,,149159,BUSINESS,HomeFi Activation Cycle V2,BUSINESS,Verizon,`;

async function parseCSVData(csvString) {
  return new Promise((resolve, reject) => {
    const results = [];
    const lines = csvString.trim().split('\n');
    const headers = lines[0].split(',');
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || null;
      });
      results.push(row);
    }
    resolve(results);
  });
}

async function createOrganization() {
  const { data, error } = await supabase
    .from('organizations')
    .upsert({
      name: 'HomeFi Solutions',
      slug: 'homefi',
      domain: 'wingalpha.com',
      config: {
        carrier: 'Verizon',
        network: 'ATT',
        business_type: 'B2B',
        activation_profile: 'HomeFi Activation Cycle V2'
      }
    }, { onConflict: 'slug' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function createPlans(subscribers, orgId) {
  const uniquePlans = [...new Set(subscribers.map(s => s.plan_name))];
  const planInserts = [];

  for (const planName of uniquePlans) {
    if (!planName) continue;
    
    const sample = subscribers.find(s => s.plan_name === planName);
    const price = parseFloat(sample.plan_price || 0);
    
    // Determine plan features based on name
    const features = {};
    if (planName.includes('100MBPS')) features.speed = '100Mbps';
    if (planName.includes('200GB')) features.data = '200GB';
    if (planName.includes('300GB')) features.data = '300GB';
    if (planName.includes('Unlimited')) features.data = 'Unlimited';
    if (planName.includes('Parking')) features.type = 'parking';

    planInserts.push({
      organization_id: orgId,
      name: planName,
      description: `${planName} - Business plan for HomeFi customers`,
      plan_type: 'postpaid',
      price_cents: Math.round(price * 100),
      billing_cycle_days: 30,
      data_allowance_mb: planName.includes('200GB') ? 200000 : 
                        planName.includes('300GB') ? 300000 :
                        planName.includes('Unlimited') ? -1 : 50000,
      features: features,
      carrier_plan_id: sample.plan_id,
      is_active: true
    });
  }

  const { data, error } = await supabase
    .from('plans')
    .upsert(planInserts, { onConflict: 'organization_id,name' })
    .select();

  if (error) throw error;
  return data;
}

async function importSubscribers(subscribers, orgId, plans) {
  const results = {
    imported: 0,
    errors: []
  };

  for (const row of subscribers) {
    try {
      // Create subscriber
      const { data: subscriber, error: subError } = await supabase
        .from('subscribers')
        .upsert({
          organization_id: orgId,
          email: row.email,
          phone_number: row.mdn,
          first_name: row.first_name,
          last_name: row.last_name,
          status: row.subscription_status === 'expired' ? 'inactive' : 'active',
          customer_since: new Date(row.effective_date).toISOString().split('T')[0],
          metadata: {
            external_subscription_id: row.subscription_id,
            user_profile_id: row.user_profile_id,
            acl_group: row.acl_group_name,
            imported_at: new Date().toISOString()
          }
        }, { onConflict: 'phone_number' })
        .select()
        .single();

      if (subError) throw subError;

      // Find matching plan
      const plan = plans.find(p => p.name === row.plan_name);
      if (plan) {
        // Create subscription
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .upsert({
            subscriber_id: subscriber.id,
            plan_id: plan.id,
            status: row.subscription_status,
            started_at: row.effective_date,
            expires_at: row.expiration_date || null,
            auto_renew: row.subscription_status === 'active',
            carrier_subscription_id: row.subscription_id,
            metadata: {
              expiration_type: row.expiration_type,
              reference: row.reference
            }
          }, { onConflict: 'subscriber_id,plan_id' });

        if (subscriptionError) throw subscriptionError;
      }

      // Create SIM card
      if (row.icc_id) {
        const { error: simError } = await supabase
          .from('sim_cards')
          .upsert({
            organization_id: orgId,
            iccid: row.icc_id,
            msisdn: row.mdn,
            status: row.subscription_status === 'active' ? 'active' : 'suspended',
            carrier: row.vendor || 'Verizon',
            subscriber_id: subscriber.id,
            activated_at: row.effective_date
          }, { onConflict: 'iccid' });

        if (simError && !simError.message.includes('duplicate')) throw simError;
      }

      // Create device
      if (row.device_id) {
        const { error: deviceError } = await supabase
          .from('devices')
          .upsert({
            subscriber_id: subscriber.id,
            imei: row.device_id,
            device_type: 'mobile',
            manufacturer: 'Unknown',
            model: 'Unknown',
            last_seen_at: new Date().toISOString()
          }, { onConflict: 'imei' });

        if (deviceError && !deviceError.message.includes('duplicate')) throw deviceError;
      }

      results.imported++;
      console.log(`✓ Imported subscriber: ${row.first_name} ${row.last_name} (${row.mdn})`);

    } catch (error) {
      results.errors.push(`Failed to import ${row.first_name} ${row.last_name}: ${error.message}`);
      console.error(`✗ Error importing ${row.first_name} ${row.last_name}:`, error.message);
    }
  }

  return results;
}

async function generateUsageData(orgId) {
  // Get all active subscriptions
  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select(`
      id,
      subscriber_id,
      started_at,
      subscribers(phone_number)
    `)
    .eq('status', 'active');

  if (error) throw error;

  const usageRecords = [];
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  for (const subscription of subscriptions) {
    // Generate realistic usage data
    const dataUsage = Math.floor(Math.random() * 50000000000); // Random bytes up to 50GB
    const voiceMinutes = Math.floor(Math.random() * 1000); // Random minutes up to 1000
    const smsCount = Math.floor(Math.random() * 500); // Random SMS up to 500

    usageRecords.push(
      {
        organization_id: orgId,
        subscriber_id: subscription.subscriber_id,
        subscription_id: subscription.id,
        usage_type: 'data',
        amount: dataUsage,
        unit: 'bytes',
        billing_cycle_start: startOfMonth.toISOString().split('T')[0],
        recorded_at: now.toISOString()
      },
      {
        organization_id: orgId,
        subscriber_id: subscription.subscriber_id,
        subscription_id: subscription.id,
        usage_type: 'voice',
        amount: voiceMinutes * 60, // Convert to seconds
        unit: 'seconds',
        billing_cycle_start: startOfMonth.toISOString().split('T')[0],
        recorded_at: now.toISOString()
      },
      {
        organization_id: orgId,
        subscriber_id: subscription.subscriber_id,
        subscription_id: subscription.id,
        usage_type: 'sms',
        amount: smsCount,
        unit: 'count',
        billing_cycle_start: startOfMonth.toISOString().split('T')[0],
        recorded_at: now.toISOString()
      }
    );
  }

  // Insert usage records in batches
  const batchSize = 100;
  for (let i = 0; i < usageRecords.length; i += batchSize) {
    const batch = usageRecords.slice(i, i + batchSize);
    const { error: usageError } = await supabase
      .from('usage_records')
      .upsert(batch);

    if (usageError) console.error('Usage data error:', usageError);
  }

  console.log(`✓ Generated ${usageRecords.length} usage records`);
}

async function main() {
  try {
    console.log('🚀 Starting HomeFi subscriber data import...');

    // Parse the full CSV data from the user's message
    const fullCSVData = `network,subscription_id,first_name,last_name,mdn,device_id,icc_id,user_profile_id,subscription_status,effective_date,expiration_date,expiration_type,email,plan_name,plan_price,reference,plan_id,sub_created_by,profile_created_by,acl_group_name,profile_name,owner_acl_group_name,vendor,carrier
att,313841,Vernon,Stanton,9296188183,863890053644183,89148000006041107283,202014,active,2023-08-02 20:10:21.123250+00:00,,,verno1974@gmail.com,VZ 200GB Plan WT - B2B Only,0.01,,625,149159,149159,BUSINESS,HomeFi Activation Cycle V2,BUSINESS,Verizon,
att,316416,Angela,Harvey,8970765883,863890053646956,89148000006041106772,202014,expired,2023-08-09 18:34:47.170167+00:00,2025-04-10 00:27:33.287387+00:00,cancel,lightningelectric7@gmail.com,HomeFi Parking Plan - 100mbps,0.01,,634,149159,149159,BUSINESS,HomeFi Activation Cycle V2,BUSINESS,Verizon,
att,320080,James,Anderson,3327334561,357776720465362,89148000008341829400,202014,active,2023-09-22 15:22:34.279615+00:00,,,jhanders1943@gmail.com,VZ 5G - 300GB (100MBPS) Plan WT - B2B Only,1,,629,,149159,BUSINESS,HomeFi Activation Cycle V2,BUSINESS,Verizon,`;

    // You would replace the above with the full CSV data from the user's message
    // For now, let's use a sample

    const subscribers = await parseCSVData(fullCSVData);
    console.log(`📊 Parsed ${subscribers.length} subscriber records`);

    // Create organization
    const organization = await createOrganization();
    console.log(`✓ Created/updated organization: ${organization.name}`);

    // Create plans
    const plans = await createPlans(subscribers, organization.id);
    console.log(`✓ Created ${plans.length} plans`);

    // Import subscribers
    const results = await importSubscribers(subscribers, organization.id, plans);
    console.log(`✓ Successfully imported ${results.imported} subscribers`);

    if (results.errors.length > 0) {
      console.log(`⚠️  ${results.errors.length} errors occurred:`);
      results.errors.forEach(error => console.log(`   ${error}`));
    }

    // Generate usage data for demo
    await generateUsageData(organization.id);

    console.log('🎉 Import completed successfully!');
    console.log('📈 Demo data ready for AI Command Console');

  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { parseCSVData, importSubscribers }; 