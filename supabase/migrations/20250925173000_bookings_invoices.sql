-- =======================================================
-- 🚀 Bookings + Invoices Schema + Policies
-- =======================================================

-- 1. Ensure extensions
create extension if not exists "pgcrypto";

-- =========================
-- Customers (for FK demo)
-- =========================
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  created_at timestamptz default now()
);

-- =========================
-- Drivers (for FK demo)
-- =========================
create table if not exists drivers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  created_at timestamptz default now()
);

-- =========================
-- Vehicles (for FK demo)
-- =========================
create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plate text,
  created_at timestamptz default now()
);

-- =========================
-- Bookings
-- =========================
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  trip_type text not null, -- Transfer, Tour
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

-- =========================
-- Invoices
-- =========================
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade,
  status text default 'draft', -- draft, sent, paid
  amount numeric(10,2),
  created_at timestamptz default now()
);

-- =========================
-- Enable RLS
-- =========================
alter table customers enable row level security;
alter table drivers enable row level security;
alter table vehicles enable row level security;
alter table bookings enable row level security;
alter table invoices enable row level security;

-- =========================
-- Drop old policies
-- =========================
do $$
declare t text;
begin
  for t in select unnest(array[
    'customers','drivers','vehicles','bookings','invoices'
  ])
  loop
    execute format('drop policy if exists "full access %s" on %I;', t, t);
  end loop;
end$$;

-- =========================
-- Full Access for Authenticated Users
-- =========================
do $$
declare t text;
begin
  for t in select unnest(array[
    'customers','drivers','vehicles','bookings','invoices'
  ])
  loop
    execute format($p$
      create policy "full access %s" on %I
      for all
      using (auth.role() = 'authenticated')
      with check (true);
    $p$, t, t);
  end loop;
end$$;