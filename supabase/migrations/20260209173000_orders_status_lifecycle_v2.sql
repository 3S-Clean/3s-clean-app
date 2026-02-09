-- Orders status lifecycle v2:
-- reserved -> awaiting_payment -> expired / payment_pending -> paid -> in_progress -> completed
-- and terminal statuses: cancelled, refunded
-- Safe to run multiple times.

begin;

alter table public.orders
    add column if not exists payment_due_at timestamptz;

update public.orders
set status = 'awaiting_payment'
where status = 'pending';

update public.orders
set status = 'reserved'
where status = 'confirmed';

update public.orders
set status = 'cancelled'
where status is null
   or status not in (
       'reserved',
       'awaiting_payment',
       'expired',
       'payment_pending',
       'paid',
       'in_progress',
       'completed',
       'cancelled',
       'refunded'
   );

do $$
declare
    c record;
begin
    for c in
        select conname
        from pg_constraint
        where conrelid = 'public.orders'::regclass
          and contype = 'c'
          and pg_get_constraintdef(oid) ilike '%status%'
    loop
        execute format('alter table public.orders drop constraint %I', c.conname);
    end loop;

    alter table public.orders
        add constraint orders_status_check
            check (
                status in (
                    'reserved',
                    'awaiting_payment',
                    'expired',
                    'payment_pending',
                    'paid',
                    'in_progress',
                    'completed',
                    'cancelled',
                    'refunded'
                )
            );
end $$;

create index if not exists idx_orders_status_scheduled_date
    on public.orders (status, scheduled_date);

create index if not exists idx_orders_awaiting_payment_due
    on public.orders (payment_due_at)
    where status = 'awaiting_payment';

commit;
