-- Cleanup migration: remove duplicate "All users" and "allow auth v3" policies
-- Keep only admin-based policies (via is_admin()) and self-access policies

-- BOOKINGS
drop policy if exists "All users insert" on public.bookings;
drop policy if exists "All users select" on public.bookings;
drop policy if exists "All users update" on public.bookings;
drop policy if exists "All users delete" on public.bookings;
drop policy if exists "Insert (auth)" on public.bookings;
drop policy if exists "Select (auth)" on public.bookings;
drop policy if exists "allow auth insert v3" on public.bookings;
drop policy if exists "allow auth select v3" on public.bookings;
drop policy if exists "allow auth update v3" on public.bookings;
drop policy if exists "allow auth delete v3" on public.bookings;

-- CUSTOMERS
drop policy if exists "All users insert" on public.customers;
drop policy if exists "All users select" on public.customers;
drop policy if exists "All users update" on public.customers;
drop policy if exists "All users delete" on public.customers;
drop policy if exists "Insert (auth)" on public.customers;
drop policy if exists "Select (auth)" on public.customers;
drop policy if exists "allow auth insert v3" on public.customers;
drop policy if exists "allow auth select v3" on public.customers;
drop policy if exists "allow auth update v3" on public.customers;
drop policy if exists "allow auth delete v3" on public.customers;

-- DRIVERS
drop policy if exists "All users insert" on public.drivers;
drop policy if exists "All users select" on public.drivers;
drop policy if exists "All users update" on public.drivers;
drop policy if exists "All users delete" on public.drivers;
drop policy if exists "Insert (auth)" on public.drivers;
drop policy if exists "Select (auth)" on public.drivers;
drop policy if exists "allow auth insert v3" on public.drivers;
drop policy if exists "allow auth select v3" on public.drivers;
drop policy if exists "allow auth update v3" on public.drivers;
drop policy if exists "allow auth delete v3" on public.drivers;

-- EXPENSES
drop policy if exists "All users insert" on public.expenses;
drop policy if exists "All users select" on public.expenses;
drop policy if exists "All users update" on public.expenses;
drop policy if exists "All users delete" on public.expenses;
drop policy if exists "Insert (auth)" on public.expenses;
drop policy if exists "Select (auth)" on public.expenses;
drop policy if exists "allow auth insert v3" on public.expenses;
drop policy if exists "allow auth select v3" on public.expenses;
drop policy if exists "allow auth update v3" on public.expenses;
drop policy if exists "allow auth delete v3" on public.expenses;

-- INCOME
drop policy if exists "All users insert" on public.income;
drop policy if exists "All users select" on public.income;
drop policy if exists "All users update" on public.income;
drop policy if exists "All users delete" on public.income;
drop policy if exists "Insert (auth)" on public.income;
drop policy if exists "Select (auth)" on public.income;
drop policy if exists "allow auth insert v3" on public.income;
drop policy if exists "allow auth select v3" on public.income;
drop policy if exists "allow auth update v3" on public.income;
drop policy if exists "allow auth delete v3" on public.income;

-- INVOICES
drop policy if exists "All users insert" on public.invoices;
drop policy if exists "All users select" on public.invoices;
drop policy if exists "All users update" on public.invoices;
drop policy if exists "All users delete" on public.invoices;
drop policy if exists "Insert (auth)" on public.invoices;
drop policy if exists "Select (auth)" on public.invoices;
drop policy if exists "allow auth insert v3" on public.invoices;
drop policy if exists "allow auth select v3" on public.invoices;
drop policy if exists "allow auth update v3" on public.invoices;
drop policy if exists "allow auth delete v3" on public.invoices;

-- PARTNERS
drop policy if exists "All users insert" on public.partners;
drop policy if exists "All users select" on public.partners;
drop policy if exists "All users update" on public.partners;
drop policy if exists "All users delete" on public.partners;
drop policy if exists "allow auth insert v3" on public.partners;
drop policy if exists "allow auth select v3" on public.partners;
drop policy if exists "allow auth update v3" on public.partners;
drop policy if exists "allow auth delete v3" on public.partners;

-- VEHICLE_CONFIGURATOR
drop policy if exists "All users insert" on public.vehicle_configurator;
drop policy if exists "All users select" on public.vehicle_configurator;
drop policy if exists "All users update" on public.vehicle_configurator;
drop policy if exists "All users delete" on public.vehicle_configurator;
drop policy if exists "allow auth insert v3" on public.vehicle_configurator;
drop policy if exists "allow auth select v3" on public.vehicle_configurator;
drop policy if exists "allow auth update v3" on public.vehicle_configurator;
drop policy if exists "allow auth delete v3" on public.vehicle_configurator;

-- VEHICLES
drop policy if exists "All users insert" on public.vehicles;
drop policy if exists "All users select" on public.vehicles;
drop policy if exists "All users update" on public.vehicles;
drop policy if exists "All users delete" on public.vehicles;
drop policy if exists "Insert (auth)" on public.vehicles;
drop policy if exists "Select (auth)" on public.vehicles;
drop policy if exists "allow auth insert v3" on public.vehicles;
drop policy if exists "allow auth select v3" on public.vehicles;
drop policy if exists "allow auth update v3" on public.vehicles;
drop policy if exists "allow auth delete v3" on public.vehicles;