-- Gallery images
create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  src text not null,
  alt text not null default '',
  category text not null default 'Sweets',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.gallery_images enable row level security;
create policy "Anyone can view gallery" on public.gallery_images for select using (true);
create policy "Admins can manage gallery" on public.gallery_images for all using (public.is_admin());

-- Testimonials
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null default '',
  rating integer not null default 5 check (rating >= 1 and rating <= 5),
  text text not null,
  type text not null default 'sweets' check (type in ('sweets', 'catering')),
  event_detail text,
  created_at timestamptz not null default now()
);

alter table public.testimonials enable row level security;
create policy "Anyone can view testimonials" on public.testimonials for select using (true);
create policy "Admins can manage testimonials" on public.testimonials for all using (public.is_admin());
