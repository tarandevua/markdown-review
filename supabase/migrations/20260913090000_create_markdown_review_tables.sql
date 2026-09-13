create table public.documents (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  source_markdown text not null,
  created_at timestamptz not null default now()
);

create table public.revisions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete restrict,
  version integer not null check (version > 0),
  values jsonb not null default '{}'::jsonb,
  rendered_markdown text not null,
  created_at timestamptz not null default now(),
  unique (document_id, version)
);

create index revisions_document_created_idx
  on public.revisions (document_id, created_at desc);

alter table public.documents enable row level security;
alter table public.revisions enable row level security;

revoke all on table public.documents from anon, authenticated;
revoke all on table public.revisions from anon, authenticated;

create or replace function public.prevent_source_markdown_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.source_markdown is distinct from old.source_markdown then
    raise exception 'A document source Markdown value is immutable';
  end if;
  return new;
end;
$$;

create trigger documents_source_markdown_immutable
before update on public.documents
for each row execute function public.prevent_source_markdown_change();

create or replace function public.prevent_revision_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'Revisions are append-only';
end;
$$;

create trigger revisions_append_only
before update or delete on public.revisions
for each row execute function public.prevent_revision_mutation();

create or replace function public.create_document_revision(
  target_document_id uuid,
  revision_values jsonb,
  completed_markdown text
)
returns setof public.revisions
language plpgsql
security definer
set search_path = ''
as $$
declare
  next_version integer;
begin
  if not exists (select 1 from public.documents where id = target_document_id) then
    raise exception 'Document not found';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(target_document_id::text, 0));

  select coalesce(max(version), 0) + 1
    into next_version
    from public.revisions
    where document_id = target_document_id;

  return query
    insert into public.revisions (document_id, version, values, rendered_markdown)
    values (target_document_id, next_version, revision_values, completed_markdown)
    returning *;
end;
$$;

revoke all on function public.create_document_revision(uuid, jsonb, text) from public, anon, authenticated;
grant execute on function public.create_document_revision(uuid, jsonb, text) to service_role;
