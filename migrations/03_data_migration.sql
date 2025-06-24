-- Data Migration Script for MVNO Platform
-- Use this to import existing subscriber data from BeQuick or other systems

-- =====================================================
-- TEMPORARY IMPORT TABLES
-- =====================================================

-- Temporary table for importing existing subscriber data
CREATE TEMP TABLE temp_subscriber_import (
    external_id VARCHAR(255),
    email VARCHAR(320),
    phone_number VARCHAR(20),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    status VARCHAR(50),
    plan_name VARCHAR(255),
    plan_price DECIMAL(10,2),
    billing_cycle INTEGER,
    subscription_start_date DATE,
    last_payment_date DATE,
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(50),
    iccid VARCHAR(22),
    msisdn VARCHAR(20),
    imsi VARCHAR(20),
    device_imei VARCHAR(20),
    carrier VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'
);

-- =====================================================
-- MIGRATION FUNCTIONS
-- =====================================================

-- Function to migrate subscriber data from temp table
CREATE OR REPLACE FUNCTION migrate_subscriber_data(org_id UUID)
RETURNS TABLE (
    migrated_subscribers INTEGER,
    migrated_plans INTEGER,
    migrated_subscriptions INTEGER,
    migrated_sim_cards INTEGER,
    errors TEXT[]
) AS $$
DECLARE
    subscriber_count INTEGER := 0;
    plan_count INTEGER := 0;
    subscription_count INTEGER := 0;
    sim_count INTEGER := 0;
    error_list TEXT[] := ARRAY[]::TEXT[];
    rec RECORD;
    new_subscriber_id UUID;
    new_plan_id UUID;
    new_subscription_id UUID;
    new_sim_id UUID;
BEGIN
    -- Migrate unique plans first
    FOR rec IN (
        SELECT DISTINCT 
            plan_name,
            plan_price,
            billing_cycle
        FROM temp_subscriber_import 
        WHERE plan_name IS NOT NULL
    ) LOOP
        BEGIN
            INSERT INTO plans (
                organization_id,
                name,
                description,
                plan_type,
                price_cents,
                billing_cycle_days,
                is_active
            ) VALUES (
                org_id,
                rec.plan_name,
                'Migrated from existing system',
                'postpaid', -- Default, adjust as needed
                (rec.plan_price * 100)::INTEGER,
                rec.billing_cycle,
                true
            ) ON CONFLICT DO NOTHING;
            
            plan_count := plan_count + 1;
        EXCEPTION WHEN OTHERS THEN
            error_list := array_append(error_list, 'Plan migration error: ' || SQLERRM);
        END;
    END LOOP;

    -- Migrate subscribers and related data
    FOR rec IN (SELECT * FROM temp_subscriber_import) LOOP
        BEGIN
            -- Insert subscriber
            INSERT INTO subscribers (
                organization_id,
                email,
                phone_number,
                first_name,
                last_name,
                status,
                customer_since,
                address,
                metadata
            ) VALUES (
                org_id,
                rec.email,
                rec.phone_number,
                rec.first_name,
                rec.last_name,
                COALESCE(rec.status, 'active'),
                COALESCE(rec.subscription_start_date, CURRENT_DATE),
                jsonb_build_object(
                    'line1', rec.address_line1,
                    'line2', rec.address_line2,
                    'city', rec.city,
                    'state', rec.state,
                    'zip', rec.zip_code,
                    'country', rec.country
                ),
                jsonb_build_object(
                    'external_id', rec.external_id,
                    'imported_at', NOW(),
                    'original_data', rec.metadata
                )
            ) RETURNING id INTO new_subscriber_id;
            
            subscriber_count := subscriber_count + 1;

            -- Get plan ID for subscription
            SELECT id INTO new_plan_id 
            FROM plans 
            WHERE organization_id = org_id 
            AND name = rec.plan_name
            LIMIT 1;

            -- Insert subscription if plan exists
            IF new_plan_id IS NOT NULL THEN
                INSERT INTO subscriptions (
                    subscriber_id,
                    plan_id,
                    status,
                    started_at,
                    auto_renew
                ) VALUES (
                    new_subscriber_id,
                    new_plan_id,
                    COALESCE(rec.status, 'active'),
                    COALESCE(rec.subscription_start_date, CURRENT_DATE),
                    true
                ) RETURNING id INTO new_subscription_id;
                
                subscription_count := subscription_count + 1;
            END IF;

            -- Insert SIM card if ICCID provided
            IF rec.iccid IS NOT NULL THEN
                INSERT INTO sim_cards (
                    organization_id,
                    iccid,
                    msisdn,
                    imsi,
                    status,
                    carrier,
                    subscriber_id,
                    activated_at
                ) VALUES (
                    org_id,
                    rec.iccid,
                    rec.msisdn,
                    rec.imsi,
                    'active',
                    COALESCE(rec.carrier, 'Unknown'),
                    new_subscriber_id,
                    COALESCE(rec.subscription_start_date, CURRENT_DATE)
                ) RETURNING id INTO new_sim_id;
                
                sim_count := sim_count + 1;
            END IF;

            -- Insert device if IMEI provided
            IF rec.device_imei IS NOT NULL THEN
                INSERT INTO devices (
                    subscriber_id,
                    imei,
                    device_type,
                    last_seen_at
                ) VALUES (
                    new_subscriber_id,
                    rec.device_imei,
                    'mobile',
                    NOW()
                );
            END IF;

        EXCEPTION WHEN OTHERS THEN
            error_list := array_append(error_list, 
                'Subscriber migration error for ' || COALESCE(rec.email, rec.phone_number) || ': ' || SQLERRM);
        END;
    END LOOP;

    RETURN QUERY SELECT 
        subscriber_count,
        plan_count,
        subscription_count,
        sim_count,
        error_list;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VALIDATION FUNCTIONS
-- =====================================================

-- Function to validate imported data
CREATE OR REPLACE FUNCTION validate_import_data()
RETURNS TABLE (
    validation_type VARCHAR(50),
    issue_count INTEGER,
    sample_issues TEXT[]
) AS $$
BEGIN
    -- Check for missing required fields
    RETURN QUERY
    SELECT 
        'missing_email' as validation_type,
        COUNT(*)::INTEGER as issue_count,
        ARRAY_AGG(phone_number ORDER BY phone_number LIMIT 5) as sample_issues
    FROM temp_subscriber_import 
    WHERE email IS NULL OR email = '';

    RETURN QUERY
    SELECT 
        'missing_phone' as validation_type,
        COUNT(*)::INTEGER as issue_count,
        ARRAY_AGG(email ORDER BY email LIMIT 5) as sample_issues
    FROM temp_subscriber_import 
    WHERE phone_number IS NULL OR phone_number = '';

    -- Check for duplicate phone numbers
    RETURN QUERY
    SELECT 
        'duplicate_phone' as validation_type,
        COUNT(*)::INTEGER as issue_count,
        ARRAY_AGG(phone_number ORDER BY phone_number LIMIT 5) as sample_issues
    FROM (
        SELECT phone_number, COUNT(*) as cnt
        FROM temp_subscriber_import 
        WHERE phone_number IS NOT NULL
        GROUP BY phone_number
        HAVING COUNT(*) > 1
    ) dups;

    -- Check for duplicate emails
    RETURN QUERY
    SELECT 
        'duplicate_email' as validation_type,
        COUNT(*)::INTEGER as issue_count,
        ARRAY_AGG(email ORDER BY email LIMIT 5) as sample_issues
    FROM (
        SELECT email, COUNT(*) as cnt
        FROM temp_subscriber_import 
        WHERE email IS NOT NULL
        GROUP BY email
        HAVING COUNT(*) > 1
    ) dups;

    -- Check for invalid phone number formats
    RETURN QUERY
    SELECT 
        'invalid_phone_format' as validation_type,
        COUNT(*)::INTEGER as issue_count,
        ARRAY_AGG(phone_number ORDER BY phone_number LIMIT 5) as sample_issues
    FROM temp_subscriber_import 
    WHERE phone_number IS NOT NULL 
    AND phone_number !~ '^\+?[1-9]\d{1,14}$';

    -- Check for invalid email formats
    RETURN QUERY
    SELECT 
        'invalid_email_format' as validation_type,
        COUNT(*)::INTEGER as issue_count,
        ARRAY_AGG(email ORDER BY email LIMIT 5) as sample_issues
    FROM temp_subscriber_import 
    WHERE email IS NOT NULL 
    AND email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- EXAMPLE USAGE
-- =====================================================

/*
-- Example: Import CSV data into temp table
COPY temp_subscriber_import FROM '/path/to/subscriber_export.csv' DELIMITER ',' CSV HEADER;

-- Validate the data
SELECT * FROM validate_import_data();

-- Run the migration (replace with your organization ID)
SELECT * FROM migrate_subscriber_data('YOUR_ORG_ID_HERE');

-- Clean up temp table when done
DROP TABLE temp_subscriber_import;
*/

-- =====================================================
-- POST-MIGRATION VERIFICATION QUERIES
-- =====================================================

-- Function to generate migration summary report
CREATE OR REPLACE FUNCTION migration_summary_report(org_id UUID)
RETURNS TABLE (
    metric VARCHAR(50),
    count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'total_subscribers' as metric, COUNT(*)::INTEGER as count
    FROM subscribers WHERE organization_id = org_id;

    RETURN QUERY
    SELECT 'active_subscribers' as metric, COUNT(*)::INTEGER as count
    FROM subscribers WHERE organization_id = org_id AND status = 'active';

    RETURN QUERY
    SELECT 'total_plans' as metric, COUNT(*)::INTEGER as count
    FROM plans WHERE organization_id = org_id;

    RETURN QUERY
    SELECT 'active_subscriptions' as metric, COUNT(*)::INTEGER as count
    FROM subscriptions s
    JOIN subscribers sub ON s.subscriber_id = sub.id
    WHERE sub.organization_id = org_id AND s.status = 'active';

    RETURN QUERY
    SELECT 'sim_cards_assigned' as metric, COUNT(*)::INTEGER as count
    FROM sim_cards WHERE organization_id = org_id AND subscriber_id IS NOT NULL;

    RETURN QUERY
    SELECT 'devices_registered' as metric, COUNT(*)::INTEGER as count
    FROM devices d
    JOIN subscribers s ON d.subscriber_id = s.id
    WHERE s.organization_id = org_id;
END;
$$ LANGUAGE plpgsql; 