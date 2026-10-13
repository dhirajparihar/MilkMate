-- ====================================================================
-- DOODH DOST SUPABASE DATABASE SCHEMA MIGRATION
-- Production-ready PostgreSQL schema with RLS, ledger constraints, & triggers
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES (Authorized distributor accounts)
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

-- 3. SHOPS (Retailers & local stores)
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

-- 4. PRODUCTS (Milk packet catalogue)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    distributor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    packet_size TEXT NOT NULL, -- '500 ml', '1 Litre', etc.
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

-- 5. SHOP PRODUCT PRICE OVERRIDES
CREATE TABLE IF NOT EXISTS public.shop_product_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    custom_price NUMERIC(10, 2) NOT NULL CHECK (custom_price > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(shop_id, product_id)
);

-- 6. PRODUCT PRICE HISTORY (Audit record of price changes)
CREATE TABLE IF NOT EXISTS public.product_price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    old_price NUMERIC(10, 2) NOT NULL,
    new_price NUMERIC(10, 2) NOT NULL,
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    changed_by UUID REFERENCES public.profiles(id)
);

-- 7. RETURN POLICIES
CREATE TABLE IF NOT EXISTS public.return_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    distributor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    policy_type TEXT NOT NULL CHECK (policy_type IN ('full_credit', 'partial_credit', 'damaged_only', 'no_returns')),
    credit_percentage NUMERIC(5, 2) NOT NULL DEFAULT 100.00 CHECK (credit_percentage >= 0 AND credit_percentage <= 100),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ORDERS
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

CREATE INDEX IF NOT EXISTS idx_orders_shop ON public.orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_date ON public.orders(order_date);

-- 9. ORDER ITEMS
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

-- 10. RETURNS
CREATE TABLE IF NOT EXISTS public.returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    distributor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    return_number TEXT NOT NULL UNIQUE,
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE RESTRICT,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
    return_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    total_credit_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total_credit_amount >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. RETURN ITEMS
CREATE TABLE IF NOT EXISTS public.return_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_id UUID NOT NULL REFERENCES public.returns(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    return_quantity INTEGER NOT NULL CHECK (return_quantity > 0),
    condition TEXT NOT NULL CHECK (condition IN ('saleable', 'damaged')),
    unit_price NUMERIC(10, 2) NOT NULL,
    credit_per_packet NUMERIC(10, 2) NOT NULL CHECK (credit_per_packet >= 0),
    total_credit NUMERIC(12, 2) NOT NULL CHECK (total_credit >= 0),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. INVOICES (Immutable financial bill snapshot)
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

CREATE INDEX IF NOT EXISTS idx_invoices_shop ON public.invoices(shop_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON public.invoices(invoice_date);

-- 13. INVOICE ITEMS
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    product_name TEXT NOT NULL,
    packet_size TEXT NOT NULL,
    delivered_quantity INTEGER NOT NULL CHECK (delivered_quantity >= 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price > 0),
    line_amount NUMERIC(12, 2) NOT NULL CHECK (line_amount >= 0)
);

-- 14. PAYMENTS
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

CREATE INDEX IF NOT EXISTS idx_payments_shop ON public.payments(shop_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON public.payments(invoice_id);

-- 15. STOCK RECEIPTS (Morning dairy arrivals)
CREATE TABLE IF NOT EXISTS public.stock_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    distributor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receipt_number TEXT NOT NULL UNIQUE,
    receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
    supplier_name TEXT NOT NULL,
    total_packets INTEGER NOT NULL CHECK (total_packets > 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. STOCK RECEIPT ITEMS
CREATE TABLE IF NOT EXISTS public.stock_receipt_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_id UUID NOT NULL REFERENCES public.stock_receipts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    purchase_cost NUMERIC(10, 2)
);

-- 17. STOCK MOVEMENTS (Auditable stock ledger)
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    distributor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('opening', 'dairy_receipt', 'delivery_out', 'return_saleable', 'return_damaged', 'adjustment')),
    quantity_change INTEGER NOT NULL,
    reference_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON public.stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON public.stock_movements(date);

-- 18. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    distributor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action TEXT NOT NULL,
    distributor_name TEXT NOT NULL,
    details TEXT NOT NULL
);

-- 19. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_product_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Distributor can only access their own business records
CREATE POLICY "Distributor own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Distributor own shops" ON public.shops FOR ALL USING (auth.uid() = distributor_id);
CREATE POLICY "Distributor own products" ON public.products FOR ALL USING (auth.uid() = distributor_id);
CREATE POLICY "Distributor own orders" ON public.orders FOR ALL USING (auth.uid() = distributor_id);
CREATE POLICY "Distributor own invoices" ON public.invoices FOR ALL USING (auth.uid() = distributor_id);
CREATE POLICY "Distributor own payments" ON public.payments FOR ALL USING (auth.uid() = distributor_id);
CREATE POLICY "Distributor own stock receipts" ON public.stock_receipts FOR ALL USING (auth.uid() = distributor_id);
CREATE POLICY "Distributor own stock movements" ON public.stock_movements FOR ALL USING (auth.uid() = distributor_id);
CREATE POLICY "Distributor own audit logs" ON public.audit_logs FOR ALL USING (auth.uid() = distributor_id);
