-- Reassign ownership to postgres
alter table if exists public.bookings owner to postgres;
alter table if exists public.customers owner to postgres;
alter table if exists public.drivers owner to postgres;
alter table if exists public.vehicles owner to postgres;
alter table if exists public.partners owner to postgres;
alter table if exists public.invoices owner to postgres;
alter table if exists public.expenses owner to postgres;
alter table if exists public.income owner to postgres;
alter table if exists public.estimations owner to postgres;
alter table if exists public.profiles owner to postgres;
alter table if exists public.vehicle_configurator owner to postgres;
alter table if exists public.user_settings owner to postgres;
alter table if exists public.notifications owner to postgres;
alter table if exists public.activity_history owner to postgres;

-- Enable RLS
alter table if exists public.bookings enable row level security;
alter table if exists public.customers enable row level security;
alter table if exists public.drivers enable row level security;
alter table if exists public.vehicles enable row level security;
alter table if exists public.partners enable row level security;
alter table if exists public.invoices enable row level security;
alter table if exists public.expenses enable row level security;
alter table if exists public.income enable row level security;
alter table if exists public.estimations enable row level security;
alter table if exists public.profiles enable row level security;
alter table if exists public.vehicle_configurator enable row level security;
alter table if exists public.user_settings enable row level security;
alter table if exists public.notifications enable row level security;
alter table if exists public.activity_history enable row level security;

-- Drop + recreate policies (any authenticated user gets full access)
do $$
declare t text;
begin
  for t in select unnest(array[
    'bookings','customers','drivers','vehicles','partners',
    'invoices','expenses','income','estimations',
    'profiles','vehicle_configurator','user_settings',
    'notifications','activity_history'
  ])
  loop
    execute format('drop policy if exists "full access on %s" on %I;', t, t);
    execute format($p$
      create policy "full access on %s"
      on %I
      for all
      to authenticated
      using (true)
      with check (true);
    $p$, t, t);
  end loop;
end$$;
