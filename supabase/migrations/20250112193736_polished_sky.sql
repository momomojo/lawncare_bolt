/*
  # Lawn Care Platform Database Schema

  1. New Tables
    - `users`: Core user data and authentication
    - `companies`: Business/company information
    - `service_catalog`: Available services and pricing

  2. Enums
    - User roles (admin, customer, landscaper)
    - Account status (active, inactive, suspended)
    - Business status (active, inactive, verified)
    - Price units (fixed, hourly, sqft)
    - Service categories (mowing, trimming, landscaping, cleanup)
    - Service status (active, inactive, seasonal)

  3. Features
    - Soft deletion on all tables
    - Automatic timestamps
    - Appropriate indexes for performance
    - Row Level Security enabled
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUMs
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'customer', 'landscaper');
    CREATE TYPE account_status AS ENUM ('active', 'inactive', 'suspended');
    CREATE TYPE business_status AS ENUM ('active', 'inactive', 'verified');
    CREATE TYPE price_unit AS ENUM ('fixed', 'hourly', 'sqft');
    CREATE TYPE service_category AS ENUM ('mowing', 'trimming', 'landscaping', 'cleanup');
    CREATE TYPE service_status AS ENUM ('active', 'inactive', 'seasonal');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    user_role user_role NOT NULL DEFAULT 'customer',
    first_name TEXT,
    last_name TEXT,
    profile_image_url TEXT,
    street_address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    account_status account_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT users_phone_check CHECK (phone_number ~* '^\+?[1-9]\d{1,14}$')
);

-- Companies Table
CREATE TABLE IF NOT EXISTS companies (
    company_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(user_id),
    company_name TEXT NOT NULL,
    business_license TEXT,
    tax_id TEXT,
    founded_date DATE,
    business_email TEXT NOT NULL,
    business_phone TEXT NOT NULL,
    website_url TEXT,
    business_address TEXT NOT NULL,
    service_radius_miles INTEGER NOT NULL DEFAULT 25,
    logo_url TEXT,
    image_gallery_urls TEXT[],
    business_status business_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT companies_business_email_check CHECK (business_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT companies_business_phone_check CHECK (business_phone ~* '^\+?[1-9]\d{1,14}$'),
    CONSTRAINT companies_service_radius_check CHECK (service_radius_miles > 0)
);

-- Service Catalog Table
CREATE TABLE IF NOT EXISTS service_catalog (
    service_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(company_id),
    service_name TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    price_unit price_unit NOT NULL DEFAULT 'fixed',
    scheduling_window_days INTEGER NOT NULL DEFAULT 30,
    max_daily_bookings INTEGER,
    service_category service_category NOT NULL,
    service_status service_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT service_catalog_duration_check CHECK (duration_minutes > 0),
    CONSTRAINT service_catalog_base_price_check CHECK (base_price >= 0),
    CONSTRAINT service_catalog_scheduling_window_check CHECK (scheduling_window_days > 0),
    CONSTRAINT service_catalog_max_bookings_check CHECK (max_daily_bookings IS NULL OR max_daily_bookings > 0)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_role ON users(user_role) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_status ON users(account_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_companies_owner ON companies(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(business_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_service_company ON service_catalog(company_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_service_category ON service_catalog(service_category) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_service_status ON service_catalog(service_status) WHERE deleted_at IS NULL;

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_catalog_updated_at
    BEFORE UPDATE ON service_catalog
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_catalog ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Users policies
CREATE POLICY "Users can view their own profile"
    ON users FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Companies policies
CREATE POLICY "Anyone can view active companies"
    ON companies FOR SELECT
    TO authenticated
    USING (business_status = 'active' AND deleted_at IS NULL);

CREATE POLICY "Company owners can manage their company"
    ON companies FOR ALL
    TO authenticated
    USING (auth.uid() = owner_id);

-- Service catalog policies
CREATE POLICY "Anyone can view active services"
    ON service_catalog FOR SELECT
    TO authenticated
    USING (service_status = 'active' AND deleted_at IS NULL);

CREATE POLICY "Company owners can manage their services"
    ON service_catalog FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM companies
            WHERE companies.company_id = service_catalog.company_id
            AND companies.owner_id = auth.uid()
        )
    );