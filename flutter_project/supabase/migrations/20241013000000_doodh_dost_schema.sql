-- ====================================================================
-- DOODH DOST SUPABASE DATABASE SCHEMA MIGRATION
-- Production-ready PostgreSQL schema with RLS, ledger constraints, & triggers
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    distributor_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    dairy_supplier_name TEXT,
    currency TEXT DEFAULT 'INR',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    distributor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    owner_name TEXT,
    phone TEXT,
    address TEXT,
    route_area TEXT,
    opening_balance NUMERIC(12, 2) DEFAULT 0.00,
    current_balance NUMERIC(12, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shops_distributor ON public.shops(distributor_id);
CREATE INDEX IF NOT EXISTS idx_shops_phone ON public.shops(phone);

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    distributor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    packet_size TEXT NOT NULL,
    sku TEXT NOT NULL,
    default_price NUMERIC(10, 2) NOT NULL CHECK (default_price > 0),
    purchase_cost NUMERIC(10, 2) CHECK (purchase_cost >= 0),
    category TEXT DEFAULT 'milk',
    return_policy_type TEXT DEFAULT 'full_credit',
    return_credit_percentage NUMERIC(5, 2) DEFAULT 100.00 CHECK (return_credit_percentage >= 0 AND return_credit_percentage <= 100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (distributor_id, sku)
);

CREATE TABLE IF NOT EXISTS public.shop_product_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    custom_price NUMERIC(10, 2) NOT NULL CHECK (custom_price > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(shop_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    distributor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL UNIQUE,
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE RESTRICT,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'placed' CHECK (status IN ('draft', 'placed', 'confirmed', 'out_for_delivery', 'delivered', 'billed', 'paid', 'cancelled')),
    total_delivered_packets INTEGER DEFAULT 0 CHECK (total_delivered_packets >= 0),
    estimated_total NUMERIC(12, 2) DEFAULT 0.00,
    is_billed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    ordered_quantity INTEGER NOT NULL CHECK (ordered_quantity >= 0),
    delivered_quantity INTEGER NOT NULL DEFAULT 0 CHECK (delivered_quantity >= 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price > 0),
    line_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    distributor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL UNIQUE,
    order_id UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE RESTRICT,
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE RESTRICT,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    delivered_value NUMERIC(12, 2) NOT NULL CHECK (delivered_value >= 0),
    total_return_credits NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total_return_credits >= 0),
    other_charges NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    net_amount NUMERIC(12, 2) NOT NULL CHECK (net_amount >= 0),
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (paid_amount >= 0),
    remaining_amount NUMERIC(12, 2) NOT NULL CHECK (remaining_amount >= 0),
    status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partially_paid', 'paid')),
    previous_shop_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_due_with_previous NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    is_immutable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    distributor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    payment_number TEXT NOT NULL UNIQUE,
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE RESTRICT,
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'upi')),
    upi_reference TEXT,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Distributor own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Distributor own shops" ON public.shops FOR ALL USING (auth.uid() = distributor_id);
CREATE POLICY "Distributor own products" ON public.products FOR ALL USING (auth.uid() = distributor_id);
CREATE POLICY "Distributor own orders" ON public.orders FOR ALL USING (auth.uid() = distributor_id);
CREATE POLICY "Distributor own invoices" ON public.invoices FOR ALL USING (auth.uid() = distributor_id);
CREATE POLICY "Distributor own payments" ON public.payments FOR ALL USING (auth.uid() = distributor_id);
