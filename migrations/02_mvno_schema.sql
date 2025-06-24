-- MVNO Operations Platform Database Schema for Supabase
-- Designed for production-ready deployment with proper security and relationships

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA extensions;

-- =====================================================
-- CORE ENTITY TABLES
-- =====================================================

-- Organizations (MVNOs)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255),
    config JSONB DEFAULT '{}',
    branding JSONB DEFAULT '{}',
    billing_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users (Operators, Agents, etc.)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(320) UNIQUE NOT NULL,
    encrypted_password VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL DEFAULT 'operator',
    permissions JSONB DEFAULT '{}',
    last_sign_in_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SUBSCRIBER MANAGEMENT
-- =====================================================

-- Subscribers (End customers)
CREATE TABLE subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(320),
    phone_number VARCHAR(20),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    address JSONB,
    status VARCHAR(50) DEFAULT 'active',
    customer_since DATE DEFAULT CURRENT_DATE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plans (Service offerings)
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    plan_type VARCHAR(50) NOT NULL, -- 'prepaid', 'postpaid'
    price_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    billing_cycle_days INTEGER DEFAULT 30,
    data_allowance_mb INTEGER,
    voice_minutes INTEGER,
    sms_count INTEGER,
    features JSONB DEFAULT '{}',
    carrier_plan_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions (Active subscriber plans)
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscriber_id UUID REFERENCES subscribers(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES plans(id) ON DELETE RESTRICT,
    status VARCHAR(50) DEFAULT 'active',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT true,
    carrier_subscription_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- DEVICE & SIM MANAGEMENT
-- =====================================================

-- SIM Cards
CREATE TABLE sim_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    iccid VARCHAR(22) UNIQUE NOT NULL,
    msisdn VARCHAR(20),
    imsi VARCHAR(20),
    status VARCHAR(50) DEFAULT 'inventory',
    carrier VARCHAR(100),
    carrier_sim_id VARCHAR(255),
    subscriber_id UUID REFERENCES subscribers(id) ON DELETE SET NULL,
    activated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Devices
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscriber_id UUID REFERENCES subscribers(id) ON DELETE CASCADE,
    imei VARCHAR(20) UNIQUE,
    device_type VARCHAR(100),
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    os_version VARCHAR(50),
    last_seen_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- BILLING & PAYMENTS
-- =====================================================

-- Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    subscriber_id UUID REFERENCES subscribers(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    amount_cents INTEGER NOT NULL,
    tax_cents INTEGER DEFAULT 0,
    total_cents INTEGER DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'pending',
    due_date DATE,
    paid_at TIMESTAMP WITH TIME ZONE,
    billing_period_start DATE,
    billing_period_end DATE,
    line_items JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    subscriber_id UUID REFERENCES subscribers(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(50),
    gateway VARCHAR(50),
    gateway_transaction_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    processed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- USAGE & ANALYTICS
-- =====================================================

-- Usage Records
CREATE TABLE usage_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    subscriber_id UUID REFERENCES subscribers(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    usage_type VARCHAR(50) NOT NULL, -- 'data', 'voice', 'sms'
    amount BIGINT NOT NULL,
    unit VARCHAR(20) NOT NULL, -- 'bytes', 'seconds', 'count'
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    billing_cycle_start DATE,
    carrier_record_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- AI & AUTOMATION
-- =====================================================

-- AI Knowledge Base Documents
CREATE TABLE knowledge_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    document_type VARCHAR(100),
    source_url VARCHAR(1000),
    embeddings vector(1536), -- OpenAI embedding dimension
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Recommendations
CREATE TABLE ai_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    subscriber_id UUID REFERENCES subscribers(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    action_data JSONB,
    confidence_score DECIMAL(3,2),
    status VARCHAR(50) DEFAULT 'pending',
    applied_at TIMESTAMP WITH TIME ZONE,
    feedback VARCHAR(50), -- 'accepted', 'rejected', 'ignored'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- AUTOMATION & WORKFLOWS
-- =====================================================

-- Workflow Events
CREATE TABLE workflow_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    event_data JSONB DEFAULT '{}',
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pending'
);

-- Bulk Operations (for AI Command Console)
CREATE TABLE bulk_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    operation_type VARCHAR(100) NOT NULL,
    description TEXT,
    criteria JSONB,
    action_data JSONB,
    status VARCHAR(50) DEFAULT 'draft',
    total_count INTEGER,
    processed_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    dry_run BOOLEAN DEFAULT true,
    executed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- AUDIT & COMPLIANCE
-- =====================================================

-- Audit Log
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CARRIER INTEGRATIONS
-- =====================================================

-- Carrier Configurations
CREATE TABLE carrier_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    carrier_name VARCHAR(100) NOT NULL,
    config_type VARCHAR(50) NOT NULL, -- 'api', 'webhook', 'sftp'
    credentials JSONB, -- Encrypted
    endpoints JSONB,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Core relationship indexes
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_subscribers_organization_id ON subscribers(organization_id);
CREATE INDEX idx_subscribers_phone_number ON subscribers(phone_number);
CREATE INDEX idx_subscriptions_subscriber_id ON subscriptions(subscriber_id);
CREATE INDEX idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX idx_sim_cards_subscriber_id ON sim_cards(subscriber_id);
CREATE INDEX idx_sim_cards_iccid ON sim_cards(iccid);
CREATE INDEX idx_invoices_subscriber_id ON invoices(subscriber_id);
CREATE INDEX idx_payments_subscriber_id ON payments(subscriber_id);
CREATE INDEX idx_ai_recommendations_subscriber_id ON ai_recommendations(subscriber_id);

-- Time-based indexes for analytics
CREATE INDEX idx_usage_records_subscriber_billing_cycle ON usage_records(subscriber_id, billing_cycle_start);
CREATE INDEX idx_usage_records_recorded_at ON usage_records(recorded_at);
CREATE INDEX idx_invoices_created_at ON invoices(created_at);
CREATE INDEX idx_payments_created_at ON payments(created_at);
CREATE INDEX idx_workflow_events_triggered_at ON workflow_events(triggered_at);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Vector similarity index for AI knowledge base
CREATE INDEX ON knowledge_documents USING ivfflat (embeddings vector_cosine_ops);

-- =====================================================
-- ROW LEVEL SECURITY SETUP
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sim_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrier_configs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscribers_updated_at BEFORE UPDATE ON subscribers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sim_cards_updated_at BEFORE UPDATE ON sim_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_knowledge_documents_updated_at BEFORE UPDATE ON knowledge_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_recommendations_updated_at BEFORE UPDATE ON ai_recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bulk_operations_updated_at BEFORE UPDATE ON bulk_operations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_carrier_configs_updated_at BEFORE UPDATE ON carrier_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 