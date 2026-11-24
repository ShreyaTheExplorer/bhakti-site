create table folders (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references folders(id) on delete cascade,
  name text not null, cover_image text, sort_order int default 0);
create table songs (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid references folders(id) on delete set null,
  image_url text, video_url text, status text default 'draft', sort_order int default 0,
  created_at timestamptz default now());
create table song_translations (
  song_id uuid references songs(id) on delete cascade,
  language text default 'en',
  title text not null, lyrics text, meaning text, gist text,
  primary key (song_id, language));

alter table folders enable row level security;
alter table songs enable row level security;
alter table song_translations enable row level security;

create policy "read folders" on folders for select using (true);
create policy "admin folders" on folders for all to authenticated using (true) with check (true);
create policy "read songs" on songs for select using (status = 'published' or auth.role() = 'authenticated');
create policy "admin songs" on songs for all to authenticated using (true) with check (true);
create policy "read tr" on song_translations for select
  using (exists (select 1 from songs s where s.id = song_id and (s.status = 'published' or auth.role() = 'authenticated')));
create policy "admin tr" on song_translations for all to authenticated using (true) with check (true);

insert into storage.buckets (id, name, public) values ('images', 'images', true);
create policy "public images" on storage.objects for select using (bucket_id = 'images');
create policy "admin images" on storage.objects for all to authenticated
  using (bucket_id = 'images') with check (bucket_id = 'images');
