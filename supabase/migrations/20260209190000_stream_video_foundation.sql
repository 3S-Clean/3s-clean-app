-- Cloudflare Stream foundation:
-- - live input mapping per order
-- - per-recording history for account tab
-- - retention fields for app-driven 7-day cleanup

begin;

create table if not exists public.order_stream_live_inputs (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references public.orders(id) on delete cascade,
    cloudflare_live_input_id text not null unique,
    cloudflare_live_input_name text,
    rtmps_url text,
    web_rtc_url text,
    hls_url text,
    dash_url text,
    live_status text not null default 'idle'
        check (live_status in ('idle', 'live', 'ended', 'error')),
    metadata jsonb not null default '{}'::jsonb,
    started_at timestamptz,
    ended_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create unique index if not exists idx_order_stream_live_inputs_order_id
    on public.order_stream_live_inputs(order_id);

create index if not exists idx_order_stream_live_inputs_status
    on public.order_stream_live_inputs(live_status);

alter table public.order_stream_live_inputs enable row level security;

drop policy if exists "Users can read own live inputs" on public.order_stream_live_inputs;
create policy "Users can read own live inputs"
on public.order_stream_live_inputs
for select
to authenticated
using (
    exists (
        select 1
        from public.orders o
        where o.id = order_stream_live_inputs.order_id
          and o.user_id = auth.uid()
    )
);

drop trigger if exists order_stream_live_inputs_updated_at on public.order_stream_live_inputs;
create trigger order_stream_live_inputs_updated_at
before update on public.order_stream_live_inputs
for each row execute function public.update_updated_at();

create table if not exists public.order_video_recordings (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references public.orders(id) on delete cascade,
    live_input_id uuid references public.order_stream_live_inputs(id) on delete set null,
    cloudflare_video_uid text not null unique,
    cloudflare_live_input_id text,
    status text not null default 'processing'
        check (status in ('processing', 'ready', 'error', 'deleted')),
    title text,
    duration_seconds numeric(10,2),
    size_bytes bigint,
    thumbnail_url text,
    preview_url text,
    hls_url text,
    dash_url text,
    recorded_at timestamptz,
    ready_at timestamptz,
    expires_at timestamptz not null default (now() + interval '7 days'),
    deleted_at timestamptz,
    delete_reason text,
    raw_payload jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_order_video_recordings_order_id
    on public.order_video_recordings(order_id);

create index if not exists idx_order_video_recordings_status
    on public.order_video_recordings(status);

create index if not exists idx_order_video_recordings_expires_at_not_deleted
    on public.order_video_recordings(expires_at)
    where deleted_at is null;

alter table public.order_video_recordings enable row level security;

drop policy if exists "Users can read own video recordings" on public.order_video_recordings;
create policy "Users can read own video recordings"
on public.order_video_recordings
for select
to authenticated
using (
    exists (
        select 1
        from public.orders o
        where o.id = order_video_recordings.order_id
          and o.user_id = auth.uid()
    )
);

drop trigger if exists order_video_recordings_updated_at on public.order_video_recordings;
create trigger order_video_recordings_updated_at
before update on public.order_video_recordings
for each row execute function public.update_updated_at();

create table if not exists public.stream_webhook_events (
    id bigserial primary key,
    event_type text not null,
    cloudflare_video_uid text,
    cloudflare_live_input_id text,
    payload jsonb not null,
    processing_error text,
    processed_at timestamptz,
    created_at timestamptz not null default now()
);

create index if not exists idx_stream_webhook_events_event_type
    on public.stream_webhook_events(event_type);

create index if not exists idx_stream_webhook_events_created_at
    on public.stream_webhook_events(created_at desc);

alter table public.stream_webhook_events enable row level security;

drop policy if exists "No direct webhook event access" on public.stream_webhook_events;
create policy "No direct webhook event access"
on public.stream_webhook_events
for select
to authenticated
using (false);

commit;
