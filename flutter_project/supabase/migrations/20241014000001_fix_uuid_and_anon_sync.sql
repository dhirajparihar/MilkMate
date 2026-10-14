-- ====================================================================
-- DOODH DOST SUPABASE QUICK FIX: UNLOCK STANDALONE & ANON SYNC
-- Run this in your Supabase SQL Editor to enable immediate local sync
-- ====================================================================

-- 1. Unlink profiles from auth.users (allows standalone / offline profile)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. Insert the default distributor profile
INSERT INTO public.profiles (id, business_name, distributor_name, phone)
VALUES ('00000000-0000-0000-0000-000000000001', 'Doodh Dost Dairy Operations', 'Primary Distributor', '9876543210')
ON CONFLICT (id) DO NOTHING;

-- 3. Set default distributor profile on operational tables
ALTER TABLE public.products ALTER COLUMN distributor_id SET DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.shops ALTER COLUMN distributor_id SET DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.orders ALTER COLUMN distributor_id SET DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.invoices ALTER COLUMN distributor_id SET DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.payments ALTER COLUMN distributor_id SET DEFAULT '00000000-0000-0000-0000-000000000001';

-- 4. Enable Anon Read/Write Policies for seamless sync
DROP POLICY IF EXISTS "Distributor own products" ON public.products;
DROP POLICY IF EXISTS "Anon sync products" ON public.products;
CREATE POLICY "Anon sync products" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Distributor own shops" ON public.shops;
DROP POLICY IF EXISTS "Anon sync shops" ON public.shops;
CREATE POLICY "Anon sync shops" ON public.shops FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Distributor own orders" ON public.orders;
DROP POLICY IF EXISTS "Anon sync orders" ON public.orders;
CREATE POLICY "Anon sync orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Distributor own order items" ON public.order_items;
DROP POLICY IF EXISTS "Anon sync order_items" ON public.order_items;
CREATE POLICY "Anon sync order_items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Distributor own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Anon sync invoices" ON public.invoices;
CREATE POLICY "Anon sync invoices" ON public.invoices FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Distributor own invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Anon sync invoice_items" ON public.invoice_items;
CREATE POLICY "Anon sync invoice_items" ON public.invoice_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Distributor own payments" ON public.payments;
DROP POLICY IF EXISTS "Anon sync payments" ON public.payments;
CREATE POLICY "Anon sync payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Distributor own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anon sync profiles" ON public.profiles;
CREATE POLICY "Anon sync profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
