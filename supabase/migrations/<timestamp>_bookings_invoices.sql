-- =======================================================
-- 🚀 Full Bookings + Invoices Workflow for Supabase
-- =======================================================

-- 1. Bookings table
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,
  driver_id uuid references drivers(id) on delete set null,
  vehicle_id uuid references vehicles(id) on delete set null,
  trip_type text check (trip_type in ('transfer', 'tour')) not null,
  service_source text check (service_source in ('internal', 'outsourced')) not null,
  pickup_location text not null,
  pickup_time timestamptz not null,
  destination text not null,
  return_trip boolean default false,
  status text check (status in ('pending', 'confirmed', 'completed', 'cancelled'))
    not null default 'pending',
  price numeric(10,2),
  created_at timestamptz default now()
);

-- 2. Invoices table
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade,
  status text check (status in ('draft', 'sent', 'paid', 'cancelled'))
    not null default 'draft',
  amount numeric(10,2),
  created_at timestamptz default now()
);

-- 3. Enable Row Level Security (RLS)
alter table bookings enable row level security;
alter table invoices enable row level security;

-- 4. Policies: Authenticated users can do everything
drop policy if exists "full access bookings" on bookings;
create policy "full access bookings" on bookings
for all using (auth.role() = 'authenticated') with check (true);

drop policy if exists "full access invoices" on invoices;
create policy "full access invoices" on invoices
for all using (auth.role() = 'authenticated') with check (true);

-- 5. Trigger: Auto-generate invoice when a booking is created
create or replace function handle_new_booking()
returns trigger as $$
begin
  insert into invoices (booking_id, amount, status)
  values (new.id, new.price, 'draft');
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_new_booking_invoice on bookings;
create trigger trigger_new_booking_invoice
after insert on bookings
for each row execute function handle_new_booking();

-- 6. Trigger: Update invoice when booking status changes
create or replace function sync_booking_invoice()
returns trigger as $$
begin
  if new.status = 'confirmed' then
    update invoices set status = 'sent'
    where booking_id = new.id and status = 'draft';
  elsif new.status = 'completed' then
    update invoices set status = 'sent'
    where booking_id = new.id and status = 'sent';
  elsif new.status = 'cancelled' then
    update invoices set status = 'cancelled'
    where booking_id = new.id;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_booking_invoice_update on bookings;
create trigger trigger_booking_invoice_update
after update of status on bookings
for each row execute function sync_booking_invoice();