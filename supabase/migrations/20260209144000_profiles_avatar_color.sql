-- Add avatar color to profiles + deterministic default backfill.

alter table public.profiles
    add column if not exists avatar_color text;

create or replace function public.pick_avatar_color(p_user_id uuid)
returns text
language plpgsql
immutable
as $$
declare
    colors text[] := array[
        '#EAF7FF',
        '#F2FBF7',
        '#ECFDF5',
        '#F5F3FF',
        '#FFF7ED',
        '#FDF2F8'
    ];
    v int;
    idx int;
begin
    v := abs((('x' || substr(md5(p_user_id::text), 1, 8))::bit(32))::int);
    idx := (v % array_length(colors, 1)) + 1;
    return colors[idx];
end;
$$;

update public.profiles
set avatar_color = public.pick_avatar_color(id)
where avatar_color is null;
