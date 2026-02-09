-- Keep orders after account deletion and allow PII anonymization.

do $$
begin
    if exists (
        select 1
        from information_schema.table_constraints
        where table_schema = 'public'
          and table_name = 'orders'
          and constraint_name = 'orders_user_id_fkey'
    ) then
        alter table public.orders
            drop constraint orders_user_id_fkey;
    end if;

    alter table public.orders
        add constraint orders_user_id_fkey
            foreign key (user_id) references auth.users(id)
            on delete set null;
end $$;

alter table public.orders
    alter column customer_email drop not null,
    alter column customer_phone drop not null,
    alter column customer_address drop not null,
    alter column customer_notes drop not null;

alter table public.orders
    add column if not exists anonymized_at timestamptz;
