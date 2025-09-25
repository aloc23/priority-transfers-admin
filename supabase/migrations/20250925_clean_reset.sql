-- =======================================================
-- 🚀 Clean Reset Migration for Supabase Project
-- Ensures schema + policies are consistent with the app
-- =======================================================

-- 1. Drop all existing objects in public schema
drop schema if exists public cascade;
create schema public;

-- 2. Extensions
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- 3. Profiles (users)
create table profiles (
  id uuid primary key,
  full_name text,
  role text default 'admin',
  created_at timestamptz default now()
);

-- Insert Alan + Info users as admins
insert into profiles (id, full_name, role)
values
  ('183f5372-6df8-42d8-9ef7-7b2da0b538a4', 'Alan Clarke', 'admin'),
  ('d272f8a2-8239-4b05-832f-e9e4488907c9', 'Info User', 'admin')
on conflict (id) do update set full_name = excluded.full_name, role = excluded.role;

-- 4. Customers
create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  created_at timestamptz default now()
);

-- 5. Drivers
create table drivers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  license_number text,
  created_at timestamptz default now()
);

-- 6. Vehicles
create table vehicles (
  id uuid primary key default gen_random_uuid(),
  registration text not null,
  make text,
  model text,
  capacity int,
  created_at timestamptz default now()
);

-- 7. Partners
create table partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text,
  created_at timestamptz default now()
);

-- 8. Bookings
create table bookings (
  id uuid primary key default gen_random_uuid(),
  trip_type text not null, -- Transfer, Tour, etc.
  service_source text not null, -- Internal, Outsourced
  customer_id uuid references customers(id) on delete set null,
  driver_id uuid references drivers(id) on delete set null,
  vehicle_id uuid references vehicles(id) on delete set null,
  pickup_location text not null,
  pickup_time timestamptz not null,
  destination text not null,
  return_trip boolean default false,
  status text default 'pending', -- pending, confirmed, completed
  price numeric(10,2),
  created_at timestamptz default now()
);

-- 9. Invoices
create table invoices (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade,
  amount numeric(10,2),
  status text default 'draft', -- draft, sent, paid
  created_at timestamptz default now()
);

-- 10. Expenses
create table expenses (
  id uuid primary key default gen_random_uuid(),
  description text,
  amount numeric(10,2),
  created_at timestamptz default now()
);

-- 11. Income
create table income (
  id uuid primary key default gen_random_uuid(),
  description text,
  amount numeric(10,2),
  created_at timestamptz default now()
);

-- 12. Estimations
create table estimations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,
  description text,
  estimated_amount numeric(10,2),
  created_at timestamptz default now()
);

-- =======================================================
-- 🔒 Row Level Security (RLS)
-- =======================================================
alter table profiles enable row level security;
alter table customers enable row level security;
alter table drivers enable row level security;
alter table vehicles enable row level security;
alter table partners enable row level security;
alter table bookings enable row level security;
alter table invoices enable row level security;
alter table expenses enable row level security;
alter table income enable row level security;
alter table estimations enable row level security;

-- =======================================================
-- ✅ Policies: Full access for all authenticated users
-- =======================================================
do $$
declare t text;
begin
  for t in select unnest(array[
    'profiles','customers','drivers','vehicles',
    'partners','bookings','invoices',
    'expenses','income','estimations'
  ])
  loop
    execute format('drop policy if exists "full access %s" on %I;', t, t);
    execute format($p$
      create policy "full access %s" on %I
      for all
      using (auth.role() = 'authenticated')
      with check (true);
    $p$, t, t);
  end loop;
end$$;
