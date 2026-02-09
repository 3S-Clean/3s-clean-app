-- Backfill legal-consent columns from legacy customer_notes fallback block:
-- [legal-consent]
-- version: ...
-- accepted: yes|no
-- accepted_at: ISO timestamp
-- terms_read: yes|no
-- privacy_read: yes|no

with parsed as (
    select
        id,
        lower((regexp_match(customer_notes, E'(?im)^accepted:\\s*(yes|no)\\s*$'))[1]) as accepted_txt,
        lower((regexp_match(customer_notes, E'(?im)^terms_read:\\s*(yes|no)\\s*$'))[1]) as terms_txt,
        lower((regexp_match(customer_notes, E'(?im)^privacy_read:\\s*(yes|no)\\s*$'))[1]) as privacy_txt,
        (regexp_match(customer_notes, E'(?im)^accepted_at:\\s*([0-9TZ:+\\-.]+)\\s*$'))[1] as accepted_at_txt,
        nullif((regexp_match(customer_notes, E'(?im)^version:\\s*(.+)\\s*$'))[1], '') as version_txt
    from public.orders
    where customer_notes ilike '%[legal-consent]%'
)
update public.orders o
set
    legal_accepted = case
        when p.accepted_txt = 'yes' then true
        when p.accepted_txt = 'no' then false
        else o.legal_accepted
    end,
    legal_terms_read = case
        when p.terms_txt = 'yes' then true
        when p.terms_txt = 'no' then false
        else o.legal_terms_read
    end,
    legal_privacy_read = case
        when p.privacy_txt = 'yes' then true
        when p.privacy_txt = 'no' then false
        else o.legal_privacy_read
    end,
    legal_accepted_at = case
        when p.accepted_at_txt ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T' then p.accepted_at_txt::timestamptz
        else o.legal_accepted_at
    end,
    legal_version = coalesce(p.version_txt, o.legal_version)
from parsed p
where o.id = p.id;

-- Ensure accepted rows always have a version.
update public.orders
set legal_version = '2026-02-09'
where legal_accepted = true
  and (legal_version is null or btrim(legal_version) = '');
