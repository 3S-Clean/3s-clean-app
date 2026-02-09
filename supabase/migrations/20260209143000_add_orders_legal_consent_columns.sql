-- Add explicit legal-consent columns to orders.
-- Safe to run multiple times.

alter table public.orders
    add column if not exists legal_terms_read boolean not null default false,
    add column if not exists legal_privacy_read boolean not null default false,
    add column if not exists legal_accepted boolean not null default false,
    add column if not exists legal_accepted_at timestamptz,
    add column if not exists legal_version text;

create index if not exists orders_legal_accepted_created_at_idx
    on public.orders (legal_accepted, created_at desc);

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'orders_legal_accept_consistency_chk'
          and conrelid = 'public.orders'::regclass
    ) then
        alter table public.orders
            add constraint orders_legal_accept_consistency_chk
                check (
                    legal_accepted = false
                    or (
                        legal_terms_read = true
                        and legal_privacy_read = true
                        and legal_accepted_at is not null
                        and coalesce(legal_version, '') <> ''
                    )
                ) not valid;
    end if;
end $$;

alter table public.orders
    validate constraint orders_legal_accept_consistency_chk;
