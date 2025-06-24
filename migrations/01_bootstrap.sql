-- Bootstrap database schema for MVNO platform
-- This runs automatically when Postgres container starts

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable timestamp utilities
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Users table (operators, analysts, etc.)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('operator', 'analyst', 'finance', 'support')),
    first_name TEXT,
    last_name TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Accounts (business customers that have multiple subscribers)
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL,
    account_number TEXT UNIQUE NOT NULL,
    billing_address JSONB,
    contact_info JSONB,
    credit_limit DECIMAL(10,2) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Plans catalog
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('prepaid', 'postpaid')),
    price_cents INTEGER NOT NULL,
    data_mb INTEGER,
    voice_minutes INTEGER,
    sms_count INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Subscribers (individual lines)
CREATE TABLE subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    msisdn VARCHAR(15) UNIQUE, -- phone number
    iccid VARCHAR(22) UNIQUE,  -- SIM card ID
    account_id UUID REFERENCES accounts(id),
    plan_id UUID REFERENCES plans(id),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'cancelled')),
    activation_date TIMESTAMPTZ,
    last_usage_date TIMESTAMPTZ,
    balance_cents INTEGER DEFAULT 0, -- for prepaid
    auto_pay BOOLEAN DEFAULT false,
    carrier_data JSONB, -- carrier-specific provisioning info
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Audit log for all system changes
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Command history for operator AI console
CREATE TABLE operator_commands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_id UUID NOT NULL REFERENCES users(id),
    command_text TEXT NOT NULL,
    parsed_action JSONB,
    preview_data JSONB,
    executed BOOLEAN DEFAULT false,
    execution_result JSONB,
    affected_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_subscribers_msisdn ON subscribers(msisdn);
CREATE INDEX idx_subscribers_account_id ON subscribers(account_id);
CREATE INDEX idx_subscribers_status ON subscribers(status);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX idx_audit_log_actor_id ON audit_log(actor_id);
CREATE INDEX idx_operator_commands_operator_id ON operator_commands(operator_id);
CREATE INDEX idx_users_email ON users(email);

-- Insert default admin user (password: 'admin123' hashed with bcrypt)
INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES 
('admin@wingtel.ai', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiNdSI6PMqzi', 'operator', 'Admin', 'User');

-- Insert sample plans
INSERT INTO plans (plan_code, name, description, plan_type, price_cents, data_mb, voice_minutes, sms_count) VALUES
('BASIC_PREPAID', 'Basic Prepaid', '1GB Data + Unlimited Talk & Text', 'prepaid', 2500, 1024, -1, -1),
('PREMIUM_PREPAID', 'Premium Prepaid', '5GB Data + Unlimited Talk & Text', 'prepaid', 4500, 5120, -1, -1),
('BUSINESS_POSTPAID', 'Business Postpaid', '10GB Data + Unlimited Everything', 'postpaid', 7500, 10240, -1, -1);

-- Insert test account
INSERT INTO accounts (company_name, account_number, billing_address, contact_info) VALUES
('Test Company LLC', 'ACC-001', 
 '{"street": "123 Main St", "city": "Austin", "state": "TX", "zip": "78701"}',
 '{"email": "billing@testcompany.com", "phone": "+1-512-555-0100"}');

-- Insert test subscribers
INSERT INTO subscribers (msisdn, iccid, account_id, plan_id, status) VALUES
('15125550101', '89014104277881023455', (SELECT id FROM accounts WHERE account_number = 'ACC-001'), (SELECT id FROM plans WHERE plan_code = 'BASIC_PREPAID'), 'active'),
('15125550102', '89014104277881023456', (SELECT id FROM accounts WHERE account_number = 'ACC-001'), (SELECT id FROM plans WHERE plan_code = 'PREMIUM_PREPAID'), 'active');

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscribers_updated_at BEFORE UPDATE ON subscribers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 