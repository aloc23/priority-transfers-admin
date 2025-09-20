-- priority-transfers-admin: Full Supabase migration for demo
-- Creates/extends schema to match frontend, adds vehicle_configurator, policies, and seeds minimal fleet only.

-- Enable pgcrypto for gen_random_uuid if not enabled
create extension if not exists pgcrypto;

-- ===== Tables: ensure presence =====
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  status text default 'active',
  total_bookings int default 0,
  total_spent numeric default 0,
  last_booking date,
  created_at timestamptz default now()
);

create table if not exists drivers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique,
  phone text,
  status text default 'available',
  rating numeric default 0,
  user_id uuid references auth.users(id),
  license_number text,
  experience int default 0
);

create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid references drivers(id),
  make text,
  model text,
  plate_number text unique,
  capacity int,
  year int,
  status text default 'available',
  created_at timestamptz default now()
);

create table if not exists partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_email text,
  phone text,
  notes text,
  created_at timestamptz default now(),
  contact text,
  email text,
  status text default 'active',
  rating numeric default 0,
  address text,
  completed_bookings int default 0,
  total_revenue numeric default 0,
  commission_rate numeric default 0,
  payment_terms text,
  contract_start date,
  contract_end date
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  driver_id uuid references drivers(id),
  vehicle_id uuid references vehicles(id),
  customer_id uuid references customers(id),
  pickup text,
  dropoff text,
  scheduled_at timestamptz,
  status text default 'pending',
  created_at timestamptz default now(),
  type text,
  source text,
  price numeric,
  pickup_completed boolean default false,
  return_completed boolean default false,
  notes text
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id),
  user_id uuid references auth.users(id),
  customer_id uuid references customers(id),
  amount numeric not null,
  currency text default 'EUR',
  status text default 'unpaid',
  issued_at timestamptz default now(),
  due_date timestamptz,
  paid_at timestamptz,
  type text default 'priority',
  items jsonb,
  date date default current_date
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  category text,
  amount numeric not null,
  vendor text,
  notes text,
  expense_date date default current_date,
  created_at timestamptz default now()
);

create table if not exists income (
  id uuid primary key default gen_random_uuid(),
  source text,
  booking_id uuid references bookings(id),
  amount numeric not null,
  income_date date default current_date,
  created_at timestamptz default now()
);

create table if not exists estimations (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  from_address text,
  to_address text,
  distance numeric,
  estimated_duration int,
  service_type text,
  vehicle_type text,
  base_price numeric,
  additional_fees numeric,
  total_price numeric,
  status text default 'pending',
  valid_until date,
  notes text,
  created_at timestamptz default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users(id),
  full_name text,
  phone text,
  role text default 'admin',
  created_at timestamptz default now()
);

-- ===== Extend columns to match frontend selects =====
-- Invoices
alter table invoices add column if not exists invoice_number text;
alter table invoices add column if not exists notes text;
alter table invoices add column if not exists issued_date date;
alter table invoices add column if not exists paid_date date;

-- Customers
alter table customers add column if not exists address text;
alter table customers add column if not exists preferred_payment_method text;

-- Estimations (extended)
alter table estimations add column if not exists customer_name text;
alter table estimations add column if not exists customer_email text;
alter table estimations add column if not exists customer_phone text;
alter table estimations add column if not exists pickup_location text;
alter table estimations add column if not exists dropoff_location text;
alter table estimations add column if not exists pickup_date date;
alter table estimations add column if not exists pickup_time text;
alter table estimations add column if not exists return_date date;
alter table estimations add column if not exists return_time text;
alter table estimations add column if not exists passengers integer;
alter table estimations add column if not exists distance_km numeric;
alter table estimations add column if not exists duration_minutes integer;
alter table estimations add column if not exists estimated_price numeric;
alter table estimations add column if not exists expires_at timestamptz;

-- Partners
alter table partners add column if not exists contact_person text;

-- Expenses + relationships
alter table expenses add column if not exists vehicle_id uuid;
alter table expenses add column if not exists driver_id uuid;
alter table expenses add column if not exists partner_id uuid;
alter table expenses add column if not exists booking_id uuid;
alter table expenses add column if not exists date date;
alter table expenses add column if not exists description text;
alter table expenses add column if not exists type text;
alter table expenses add column if not exists receipt_url text;
alter table expenses add column if not exists service_description text;
alter table expenses add column if not exists status text;

-- Income + relationships
alter table income add column if not exists date date;
alter table income add column if not exists description text;
alter table income add column if not exists category text;
alter table income add column if not exists type text;
alter table income add column if not exists customer_id uuid;
alter table income add column if not exists driver_id uuid;
alter table income add column if not exists vehicle_id uuid;
alter table income add column if not exists partner_id uuid;
alter table income add column if not exists status text;
alter table income add column if not exists payment_method text;

-- Profiles alias for user_id used by frontend
alter table profiles add column if not exists user_id uuid generated always as (id) stored;

-- ===== Foreign keys (drop+create to be idempotent) =====
alter table invoices drop constraint if exists invoices_customer_id_fkey;
alter table invoices add constraint invoices_customer_id_fkey foreign key (customer_id) references customers(id);

alter table invoices drop constraint if exists invoices_booking_id_fkey;
alter table invoices add constraint invoices_booking_id_fkey foreign key (booking_id) references bookings(id);

alter table expenses drop constraint if exists expenses_vehicle_id_fkey;
alter table expenses add constraint expenses_vehicle_id_fkey foreign key (vehicle_id) references vehicles(id);

alter table expenses drop constraint if exists expenses_driver_id_fkey;
alter table expenses add constraint expenses_driver_id_fkey foreign key (driver_id) references drivers(id);

alter table expenses drop constraint if exists expenses_partner_id_fkey;
alter table expenses add constraint expenses_partner_id_fkey foreign key (partner_id) references partners(id);

alter table expenses drop constraint if exists expenses_booking_id_fkey;
alter table expenses add constraint expenses_booking_id_fkey foreign key (booking_id) references bookings(id);

alter table income drop constraint if exists income_customer_id_fkey;
alter table income add constraint income_customer_id_fkey foreign key (customer_id) references customers(id);

alter table income drop constraint if exists income_driver_id_fkey;
alter table income add constraint income_driver_id_fkey foreign key (driver_id) references drivers(id);

alter table income drop constraint if exists income_vehicle_id_fkey;
alter table income add constraint income_vehicle_id_fkey foreign key (vehicle_id) references vehicles(id);

alter table income drop constraint if exists income_partner_id_fkey;
alter table income add constraint income_partner_id_fkey foreign key (partner_id) references partners(id);

alter table income drop constraint if exists income_booking_id_fkey;
alter table income add constraint income_booking_id_fkey foreign key (booking_id) references bookings(id);

-- ===== Vehicle configurator table =====
create table if not exists vehicle_configurator (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  fuel_type text,
  fuel_cost numeric default 0,
  insurance_cost numeric default 0,
  maintenance_cost numeric default 0,
  depreciation_cost numeric default 0,
  service_cost numeric default 0,
  tax_cost numeric default 0,
  lease_cost numeric default 0,
  other_costs numeric default 0,
  total_running_cost numeric generated always as (
    coalesce(fuel_cost,0)+coalesce(insurance_cost,0)+coalesce(maintenance_cost,0)+coalesce(depreciation_cost,0)+
    coalesce(service_cost,0)+coalesce(tax_cost,0)+coalesce(lease_cost,0)+coalesce(other_costs,0)
  ) stored,
  created_at timestamptz default now()
);

-- ===== RLS: enable + admin policies =====
alter table customers enable row level security;
alter table drivers enable row level security;
alter table vehicles enable row level security;
alter table partners enable row level security;
alter table bookings enable row level security;
alter table invoices enable row level security;
alter table expenses enable row level security;
alter table income enable row level security;
alter table estimations enable row level security;
alter table vehicle_configurator enable row level security;
alter table profiles enable row level security;

-- one policy per table allowing admins full access
do $$
declare t text;
begin
  for t in select unnest(array['customers','drivers','vehicles','partners','bookings','invoices','expenses','income','estimations','vehicle_configurator','profiles'])
  loop
    execute format('drop policy if exists "admins %s full" on %I;', t, t);
    execute format($p$
      create policy "admins %s full" on %I
      for all
      using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
      with check (true);
    $p$, t, t);
  end loop;
end$$;

-- ===== Minimal fleet seed (for demo) =====
insert into vehicles (make, model, plate_number, year, status)
values
  ('Mercedes','Sprinter','VAN-001',2020,'available'),
  ('Volkswagen','Transporter','VAN-002',2021,'available'),
  ('Ford','Transit','VAN-003',2019,'available')
on conflict (plate_number) do nothing;

insert into vehicle_configurator (vehicle_id, fuel_type, fuel_cost, insurance_cost, maintenance_cost, depreciation_cost, service_cost, tax_cost, lease_cost, other_costs)
select id, 'Diesel', 150, 200, 100, 300, 80, 120, 0, 50 from vehicles where plate_number='VAN-001'
on conflict do nothing;

insert into vehicle_configurator (vehicle_id, fuel_type, fuel_cost, insurance_cost, maintenance_cost, depreciation_cost, service_cost, tax_cost, lease_cost, other_costs)
select id, 'Diesel', 120, 180, 90, 280, 70, 110, 0, 40 from vehicles where plate_number='VAN-002'
on conflict do nothing;

insert into vehicle_configurator (vehicle_id, fuel_type, fuel_cost, insurance_cost, maintenance_cost, depreciation_cost, service_cost, tax_cost, lease_cost, other_costs)
select id, 'Diesel', 100, 160, 85, 250, 65, 100, 0, 30 from vehicles where plate_number='VAN-003'
on conflict do nothing;

-- ===== User Settings Table =====
create table if not exists user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_name text,
  email text,
  phone text,
  address text,
  notification_preferences jsonb default '{
    "email": true,
    "sms": false,
    "push": true
  }'::jsonb,
  booking_preferences jsonb default '{
    "autoAssign": true,
    "requireConfirmation": true,
    "allowOnlineBooking": true
  }'::jsonb,
  billing_preferences jsonb default '{
    "currency": "EUR",
    "taxRate": "8.5",
    "paymentTerms": "30"
  }'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create unique constraint on user_id
alter table user_settings drop constraint if exists user_settings_user_id_key;
alter table user_settings add constraint user_settings_user_id_key unique (user_id);

-- ===== Notifications Table =====
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text,
  message text,
  related_id text,
  priority text default 'normal',
  read boolean default false,
  created_at timestamptz default now()
);

-- Create index on user_id and created_at for faster queries
create index if not exists notifications_user_id_created_at_idx on notifications (user_id, created_at desc);

-- ===== Activity History Table =====
create table if not exists activity_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  description text,
  related_id text,
  details jsonb,
  created_at timestamptz default now()
);

-- Create index on user_id and created_at for faster queries
create index if not exists activity_history_user_id_created_at_idx on activity_history (user_id, created_at desc);

-- ===== Admin profile link helper (profile rows for existing auth users) =====
-- If you've already created an auth user via dashboard, link it here (optional):
-- insert into profiles (id, full_name, role) values
--   ('<AUTH_USER_UUID>', 'Demo Admin', 'admin')
-- on conflict (id) do update set full_name=excluded.full_name, role=excluded.role;

-- NOTE: Creating an auth user with a password cannot be done in pure SQL.
-- Use the included Node script scripts/create-demo-user.mjs with your service role key.
