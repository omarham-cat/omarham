-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  phone text,
  avatar_url text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    new.phone
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  image_url text,
  created_at timestamptz not null default now()
);

-- Products (sweets)
create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories on delete restrict,
  name text not null,
  description text,
  image_url text,
  calories numeric,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_products_category on public.products(category_id);

-- Product variants (weight/size options with prices)
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products on delete cascade,
  label text not null,
  weight_grams numeric not null,
  price numeric not null check (price >= 0),
  stock integer not null default 0,
  created_at timestamptz not null default now()
);

create index idx_variants_product on public.product_variants(product_id);

-- Ingredients
create table public.ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_allergen boolean not null default false,
  created_at timestamptz not null default now()
);

-- Product-Ingredient junction
create table public.product_ingredients (
  product_id uuid not null references public.products on delete cascade,
  ingredient_id uuid not null references public.ingredients on delete cascade,
  primary key (product_id, ingredient_id)
);

-- Orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete restrict,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total numeric not null check (total >= 0),
  razorpay_payment_id text,
  razorpay_order_id text,
  shipping_address jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_orders_user on public.orders(user_id);

-- Order items
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders on delete cascade,
  product_id uuid not null references public.products on delete restrict,
  variant_id uuid not null references public.product_variants on delete restrict,
  quantity integer not null check (quantity > 0),
  price_at_purchase numeric not null check (price_at_purchase >= 0),
  created_at timestamptz not null default now()
);

create index idx_order_items_order on public.order_items(order_id);

-- Catering events (gallery of past events)
create table public.catering_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  event_type text not null,
  created_at timestamptz not null default now()
);

-- Catering menu items
create table public.catering_menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  service_time text not null check (service_time in ('breakfast', 'lunch', 'snacks', 'dinner', 'late_night')),
  price_per_person numeric not null check (price_per_person >= 0),
  description text,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

-- Catering add-ons
create table public.catering_addons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  addon_type text not null,
  price numeric not null check (price >= 0),
  description text,
  created_at timestamptz not null default now()
);

-- Catering quotes
create table public.catering_quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete set null,
  num_days integer not null check (num_days > 0),
  num_guests integer not null check (num_guests > 0),
  estimated_total numeric not null default 0,
  status text not null default 'draft' check (status in ('draft', 'pending', 'reviewed', 'accepted', 'rejected')),
  contact_name text,
  contact_phone text,
  contact_email text,
  event_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_quotes_user on public.catering_quotes(user_id);

-- Quote days
create table public.quote_days (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.catering_quotes on delete cascade,
  day_number integer not null check (day_number > 0)
);

create index idx_quote_days_quote on public.quote_days(quote_id);

-- Quote day items (menu selections per service time per day)
create table public.quote_day_items (
  id uuid primary key default gen_random_uuid(),
  quote_day_id uuid not null references public.quote_days on delete cascade,
  menu_item_id uuid not null references public.catering_menu_items on delete restrict,
  service_time text not null
);

create index idx_quote_day_items_day on public.quote_day_items(quote_day_id);

-- Quote add-ons
create table public.quote_addons (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.catering_quotes on delete cascade,
  addon_id uuid not null references public.catering_addons on delete restrict,
  quantity integer not null default 1 check (quantity > 0)
);

create index idx_quote_addons_quote on public.quote_addons(quote_id);

-- ===== ROW LEVEL SECURITY =====

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.ingredients enable row level security;
alter table public.product_ingredients enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.catering_events enable row level security;
alter table public.catering_menu_items enable row level security;
alter table public.catering_addons enable row level security;
alter table public.catering_quotes enable row level security;
alter table public.quote_days enable row level security;
alter table public.quote_day_items enable row level security;
alter table public.quote_addons enable row level security;

-- Helper: check if current user is admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- Profiles: users see own, admins see all
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (public.is_admin());

-- Public read for catalog tables
create policy "Anyone can view categories" on public.categories for select using (true);
create policy "Anyone can view products" on public.products for select using (true);
create policy "Anyone can view variants" on public.product_variants for select using (true);
create policy "Anyone can view ingredients" on public.ingredients for select using (true);
create policy "Anyone can view product_ingredients" on public.product_ingredients for select using (true);
create policy "Anyone can view catering_events" on public.catering_events for select using (true);
create policy "Anyone can view catering_menu_items" on public.catering_menu_items for select using (true);
create policy "Anyone can view catering_addons" on public.catering_addons for select using (true);

-- Admin write for catalog tables
create policy "Admins can manage categories" on public.categories for all using (public.is_admin());
create policy "Admins can manage products" on public.products for all using (public.is_admin());
create policy "Admins can manage variants" on public.product_variants for all using (public.is_admin());
create policy "Admins can manage ingredients" on public.ingredients for all using (public.is_admin());
create policy "Admins can manage product_ingredients" on public.product_ingredients for all using (public.is_admin());
create policy "Admins can manage catering_events" on public.catering_events for all using (public.is_admin());
create policy "Admins can manage catering_menu_items" on public.catering_menu_items for all using (public.is_admin());
create policy "Admins can manage catering_addons" on public.catering_addons for all using (public.is_admin());

-- Orders: users see own, admins see all
create policy "Users can view own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users can insert own orders" on public.orders for insert with check (auth.uid() = user_id);
create policy "Admins can manage orders" on public.orders for all using (public.is_admin());
create policy "Users can view own order items" on public.order_items for select using (
  exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);
create policy "Users can insert own order items" on public.order_items for insert with check (
  exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);
create policy "Admins can manage order items" on public.order_items for all using (public.is_admin());

-- Catering quotes: users see own, admins see all, anyone can insert (guest quotes)
create policy "Users can view own quotes" on public.catering_quotes for select using (auth.uid() = user_id or user_id is null);
create policy "Anyone can insert quotes" on public.catering_quotes for insert with check (true);
create policy "Admins can manage quotes" on public.catering_quotes for all using (public.is_admin());

create policy "Anyone can view quote days" on public.quote_days for select using (true);
create policy "Anyone can insert quote days" on public.quote_days for insert with check (true);
create policy "Admins can manage quote days" on public.quote_days for all using (public.is_admin());

create policy "Anyone can view quote day items" on public.quote_day_items for select using (true);
create policy "Anyone can insert quote day items" on public.quote_day_items for insert with check (true);
create policy "Admins can manage quote day items" on public.quote_day_items for all using (public.is_admin());

create policy "Anyone can view quote addons" on public.quote_addons for select using (true);
create policy "Anyone can insert quote addons" on public.quote_addons for insert with check (true);
create policy "Admins can manage quote addons" on public.quote_addons for all using (public.is_admin());

-- Storage bucket for product/event images
insert into storage.buckets (id, name, public) values ('images', 'images', true)
on conflict do nothing;

create policy "Anyone can view images" on storage.objects for select using (bucket_id = 'images');
create policy "Admins can upload images" on storage.objects for insert with check (bucket_id = 'images' and public.is_admin());
create policy "Admins can update images" on storage.objects for update using (bucket_id = 'images' and public.is_admin());
create policy "Admins can delete images" on storage.objects for delete using (bucket_id = 'images' and public.is_admin());
