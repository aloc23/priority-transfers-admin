-- === FUNCTIONS ===
create or replace function public.is_admin()
returns boolean
language sql stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

-- === ENABLE RLS ON ALL TABLES ===
alter table public.bookings enable row level security;
alter table public.customers enable row level security;
alter table public.drivers enable row level security;
alter table public.expenses enable row level security;
alter table public.income enable row level security;
alter table public.invoices enable row level security;
alter table public.partners enable row level security;
alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.vehicle_configurator enable row level security;
alter table public.vehicles enable row level security;

-- === ADMIN FULL ACCESS POLICIES ===
-- Bookings
create policy admin_bookings_full
  on public.bookings
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Customers
create policy admin_customers_full
  on public.customers
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Drivers
create policy admin_drivers_full
  on public.drivers
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Expenses
create policy admin_expenses_full
  on public.expenses
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Income
create policy admin_income_full
  on public.income
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Invoices
create policy admin_invoices_full
  on public.invoices
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Partners
create policy admin_partners_full
  on public.partners
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Vehicle Configurator
create policy admin_vehicle_configurator_full
  on public.vehicle_configurator
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Vehicles
create policy admin_vehicles_full
  on public.vehicles
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Profiles (admins can manage any profile)
create policy admin_profiles_full
  on public.profiles
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- User Settings (admins can manage any row)
create policy admin_user_settings_full
  on public.user_settings
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- === OPTIONAL SELF POLICIES ===
-- Let each user manage their own profile
create policy self_profile_select
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

create policy self_profile_update
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Let each user manage their own settings
create policy self_user_settings
  on public.user_settings
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());