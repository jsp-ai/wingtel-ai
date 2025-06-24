const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Demo scenarios for AI Command Console
const DEMO_SCENARIOS = {
  churn_prediction: {
    title: "🔮 AI Churn Prediction Alert",
    description: "AI identifies high-risk subscribers based on usage patterns",
    query: "Show me subscribers likely to churn in the next 30 days",
    insights: [
      "25 subscribers showing declining usage patterns",
      "3 customers haven't used data in 14+ days",
      "12 subscribers with expired plans need intervention"
    ]
  },
  usage_anomalies: {
    title: "⚡ Usage Anomaly Detection", 
    description: "AI spots unusual usage patterns requiring attention",
    query: "Detect unusual data usage patterns this month",
    insights: [
      "Vernon Stanton (9296188183) using 200% more data than usual",
      "5 subscribers exceeding plan limits consistently",
      "Potential data overage alerts for 8 customers"
    ]
  },
  revenue_optimization: {
    title: "💰 Revenue Optimization Opportunities",
    description: "AI suggests plan upgrades and revenue improvements",
    query: "Find plan upgrade opportunities for increased revenue",
    insights: [
      "$2,400 monthly revenue potential from plan upgrades",
      "18 customers on parking plans ready for activation",
      "Premium plan adoption rate could increase by 15%"
    ]
  },
  network_insights: {
    title: "📡 Network Performance Intelligence",
    description: "AI analyzes network performance across subscriber base",
    query: "Show network performance insights for HomeFi customers",
    insights: [
      "Average 5G coverage: 94% across subscriber base",
      "Peak usage hours: 7-9 PM with 85% utilization",
      "3 geographic areas need network optimization"
    ]
  },
  customer_support: {
    title: "🎯 Proactive Customer Support",
    description: "AI predicts and prevents customer issues",
    query: "Identify customers who need proactive support",
    insights: [
      "12 subscribers with device connectivity issues",
      "SIM activation failures require immediate attention",
      "5 billing discrepancies need resolution"
    ]
  }
};

async function generateDemoInsights() {
  try {
    console.log('🎭 Generating AI Command Console Demo Scenarios...\n');
    
    // Get real data for authentic insights
    const { data: org } = await supabase
      .from('organizations')
      .select('*')
      .eq('slug', 'homefi')
      .single();

    const { data: subscriberStats } = await supabase
      .from('subscribers')
      .select('status, created_at')
      .eq('organization_id', org.id);

    const { data: planStats } = await supabase
      .from('plans')
      .select('name, price_cents')
      .eq('organization_id', org.id);

    const { data: activeSubscriptions } = await supabase
      .from('subscriptions')
      .select(`
        status,
        started_at,
        expires_at,
        subscribers(first_name, last_name, phone_number),
        plans(name, price_cents)
      `)
      .eq('status', 'active');

    const { data: expiredSubscriptions } = await supabase
      .from('subscriptions')
      .select(`
        status,
        expires_at,
        subscribers(first_name, last_name, phone_number),
        plans(name, price_cents)
      `)
      .eq('status', 'expired');

    // Generate real insights from actual data
    const totalSubscribers = subscriberStats?.length || 0;
    const activeCount = activeSubscriptions?.length || 0;
    const expiredCount = expiredSubscriptions?.length || 0;
    const totalRevenue = activeSubscriptions?.reduce((sum, sub) => 
      sum + (sub.plans?.price_cents || 0), 0) / 100;

    console.log(`📊 HOMEFI MVNO PLATFORM - AI COMMAND CONSOLE DEMO`);
    console.log(`=${'='.repeat(60)}`);
    console.log(`🏢 Organization: ${org?.name || 'HomeFi Solutions'}`);
    console.log(`👥 Total Subscribers: ${totalSubscribers}`);
    console.log(`✅ Active: ${activeCount} | ❌ Expired: ${expiredCount}`);
    console.log(`💰 Monthly Revenue: $${totalRevenue?.toFixed(2) || '0.00'}`);
    console.log(`📅 Data as of: ${new Date().toLocaleDateString()}\n`);

    // Scenario 1: Churn Prediction
    console.log(`${DEMO_SCENARIOS.churn_prediction.title}`);
    console.log(`${'-'.repeat(50)}`);
    console.log(`🤖 AI Query: "${DEMO_SCENARIOS.churn_prediction.query}"`);
    console.log(`\n📈 AI Analysis Results:`);
    
    // Real churn insights
    const highRiskCustomers = expiredSubscriptions?.filter(sub => {
      const expiryDate = new Date(sub.expires_at);
      const now = new Date();
      const daysSinceExpiry = (now - expiryDate) / (1000 * 60 * 60 * 24);
      return daysSinceExpiry > 30;
    }) || [];

    console.log(`   • ${expiredCount} subscribers with expired plans need attention`);
    console.log(`   • ${highRiskCustomers.length} customers expired >30 days (high churn risk)`);
    console.log(`   • Potential revenue loss: $${(expiredCount * 75).toFixed(2)}/month`);
    
    if (expiredSubscriptions?.length > 0) {
      const sample = expiredSubscriptions[0];
      console.log(`   • Example: ${sample.subscribers?.first_name} ${sample.subscribers?.last_name} (${sample.subscribers?.phone_number})`);
    }

    console.log(`\n💡 AI Recommendations:`);
    console.log(`   ✓ Launch targeted retention campaign for expired customers`);
    console.log(`   ✓ Offer 20% discount for plan reactivation`);
    console.log(`   ✓ Proactive outreach to prevent future churn\n`);

    // Scenario 2: Revenue Optimization
    console.log(`${DEMO_SCENARIOS.revenue_optimization.title}`);
    console.log(`${'-'.repeat(50)}`);
    console.log(`🤖 AI Query: "${DEMO_SCENARIOS.revenue_optimization.query}"`);
    console.log(`\n📈 AI Analysis Results:`);

    const parkingPlanUsers = activeSubscriptions?.filter(sub => 
      sub.plans?.name?.includes('Parking')) || [];
    const lowValuePlans = activeSubscriptions?.filter(sub => 
      (sub.plans?.price_cents || 0) < 500) || [];

    console.log(`   • ${parkingPlanUsers.length} customers on parking plans (upgrade opportunity)`);
    console.log(`   • ${lowValuePlans.length} customers on low-value plans`);
    console.log(`   • Potential monthly revenue increase: $${(parkingPlanUsers.length * 74).toFixed(2)}`);
    
    if (parkingPlanUsers.length > 0) {
      const sample = parkingPlanUsers[0];
      console.log(`   • Example: ${sample.subscribers?.first_name} ${sample.subscribers?.last_name} ready for full plan activation`);
    }

    console.log(`\n💡 AI Recommendations:`);
    console.log(`   ✓ Auto-upgrade parking plan customers to 100MBPS plans`);
    console.log(`   ✓ Offer usage-based plan recommendations`);
    console.log(`   ✓ Bundle additional services for higher ARPU\n`);

    // Scenario 3: Network Performance
    console.log(`${DEMO_SCENARIOS.network_insights.title}`);
    console.log(`${'-'.repeat(50)}`);
    console.log(`🤖 AI Query: "${DEMO_SCENARIOS.network_insights.query}"`);
    console.log(`\n📈 AI Analysis Results:`);
    
    console.log(`   • 94% of subscribers have excellent 5G coverage`);
    console.log(`   • Average network speed: 85 Mbps (exceeding 100MBPS plan spec)`);
    console.log(`   • Peak usage: 7-9 PM with 85% network utilization`);
    console.log(`   • Carrier: Verizon (primary) | AT&T (backup)`);

    console.log(`\n💡 AI Recommendations:`);
    console.log(`   ✓ Expand coverage in identified weak signal areas`);
    console.log(`   ✓ Load balance during peak hours`);
    console.log(`   ✓ Proactive speed test campaigns for customer satisfaction\n`);

    // Scenario 4: Customer Support Intelligence
    console.log(`${DEMO_SCENARIOS.customer_support.title}`);
    console.log(`${'-'.repeat(50)}`);
    console.log(`🤖 AI Query: "${DEMO_SCENARIOS.customer_support.query}"`);
    console.log(`\n📈 AI Analysis Results:`);

    const recentCustomers = subscriberStats?.filter(sub => {
      const signupDate = new Date(sub.created_at);
      const now = new Date();
      const daysSinceSignup = (now - signupDate) / (1000 * 60 * 60 * 24);
      return daysSinceSignup < 7;
    }) || [];

    console.log(`   • ${recentCustomers.length} new customers in last 7 days (need onboarding support)`);
    console.log(`   • 2 potential SIM activation issues detected`);
    console.log(`   • 5 customers with data usage anomalies`);
    console.log(`   • Customer satisfaction score: 4.2/5 (based on usage patterns)`);

    console.log(`\n💡 AI Recommendations:`);
    console.log(`   ✓ Proactive onboarding for new customers`);
    console.log(`   ✓ Automated SIM activation monitoring`);
    console.log(`   ✓ Usage alerts before customers hit limits\n`);

    // Demo Command Examples
    console.log(`🎯 INTERACTIVE AI COMMAND EXAMPLES`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Try these natural language queries:`);
    console.log(`\n🗣️  "Show me customers using more than 100GB this month"`);
    console.log(`🗣️  "Which plans generate the most revenue?"`);
    console.log(`🗣️  "Find customers who need plan upgrades"`);
    console.log(`🗣️  "Alert me about network issues in real-time"`);
    console.log(`🗣️  "Generate a churn prevention campaign"`);
    console.log(`🗣️  "What's my customer lifetime value by plan?"`);
    console.log(`🗣️  "Show usage trends for the last 3 months"`);
    console.log(`🗣️  "Which customers are my best advocates?"`);

    console.log(`\n🚀 Demo completed! Your HomeFi data showcases enterprise-grade MVNO operations.`);
    
    return {
      totalSubscribers,
      activeCount,
      expiredCount,
      totalRevenue,
      scenarios: DEMO_SCENARIOS
    };

  } catch (error) {
    console.error('❌ Demo generation failed:', error);
    return null;
  }
}

async function createDemoAlerts() {
  console.log('\n🚨 CREATING REALISTIC DEMO ALERTS...\n');
  
  try {
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', 'homefi')
      .single();

    const alerts = [
      {
        organization_id: org.id,
        type: 'churn_risk',
        severity: 'high',
        title: 'High Churn Risk Detected',
        description: '25 subscribers showing declining usage patterns in the last 14 days',
        metadata: {
          affected_count: 25,
          potential_revenue_loss: 1875,
          recommended_action: 'targeted_retention_campaign'
        },
        created_at: new Date().toISOString()
      },
      {
        organization_id: org.id,
        type: 'revenue_opportunity',
        severity: 'medium',
        title: 'Plan Upgrade Opportunity',
        description: '18 customers on parking plans ready for full activation',
        metadata: {
          affected_count: 18,
          potential_revenue_gain: 1332,
          recommended_action: 'automated_plan_upgrade'
        },
        created_at: new Date().toISOString()
      },
      {
        organization_id: org.id,
        type: 'usage_anomaly',
        severity: 'medium',
        title: 'Usage Spike Detected',
        description: 'Vernon Stanton using 340% more data than baseline',
        metadata: {
          subscriber_phone: '9296188183',
          usage_increase: '340%',
          recommended_action: 'plan_upgrade_suggestion'
        },
        created_at: new Date().toISOString()
      },
      {
        organization_id: org.id,
        type: 'network_performance',
        severity: 'low',
        title: 'Network Optimization Opportunity',
        description: '3 geographic clusters showing suboptimal performance',
        metadata: {
          affected_areas: ['Dallas North', 'Houston West', 'Austin Central'],
          avg_speed_degradation: '15%',
          recommended_action: 'network_capacity_expansion'
        },
        created_at: new Date().toISOString()
      }
    ];

    // Note: This would normally insert into an alerts table
    console.log('📢 Demo Alerts Generated:');
    alerts.forEach((alert, index) => {
      console.log(`\n${index + 1}. ${alert.title}`);
      console.log(`   Severity: ${alert.severity.toUpperCase()}`);
      console.log(`   ${alert.description}`);
    });

    return alerts;

  } catch (error) {
    console.error('❌ Alert creation failed:', error);
    return [];
  }
}

if (require.main === module) {
  generateDemoInsights().then(() => {
    return createDemoAlerts();
  });
}

module.exports = { generateDemoInsights, createDemoAlerts, DEMO_SCENARIOS }; 