-- Orders lifecycle groundwork for payment flow + PDF downloads.
-- Safe to run multiple times.

alter table public.orders
    add column if not exists payment_due_at timestamptz,
    add column if not exists paid_at timestamptz,
    add column if not exists payment_provider text,
    add column if not exists payment_reference text,
    add column if not exists cancel_reason text,
    add column if not exists cancelled_by_user_at timestamptz,
    add column if not exists pdf_download_url text,
    add column if not exists pdf_generated_at timestamptz;

do $$
declare
    c record;
begin
    -- Drop old status check constraints (legacy names or auto-generated names).
    for c in
        select conname
        from pg_constraint
        where conrelid = 'public.orders'::regclass
          and contype = 'c'
          and pg_get_constraintdef(oid) ilike '%status%'
          and pg_get_constraintdef(oid) ilike '%pending%'
    loop
        execute format('alter table public.orders drop constraint %I', c.conname);
    end loop;

    -- Recreate status check with payment-aware statuses.
    if not exists (
        select 1
        from pg_constraint
        where conrelid = 'public.orders'::regclass
          and conname = 'orders_status_check'
    ) then
        alter table public.orders
            add constraint orders_status_check
                check (
                    status in (
                        'awaiting_payment',
                        'pending',
                        'confirmed',
                        'in_progress',
                        'completed',
                        'cancelled',
                        'paid'
                    )
                );
    end if;
end $$;

create index if not exists idx_orders_awaiting_payment_due
    on public.orders (payment_due_at)
    where status = 'awaiting_payment';
