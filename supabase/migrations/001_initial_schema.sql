-- ============================================================
-- StockFlow — Initial Database Schema
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null unique,
  full_name    text,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================================
-- WORKSPACES (multi-tenant)
-- ============================================================
create table if not exists public.workspaces (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  logo_url    text,
  owner_id    uuid not null references public.profiles(id) on delete restrict,
  plan        text not null default 'free' check (plan in ('free', 'pro', 'enterprise')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.workspaces enable row level security;

-- ============================================================
-- WORKSPACE MEMBERS (roles)
-- ============================================================
create table if not exists public.workspace_members (
  id            uuid primary key default uuid_generate_v4(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  role          text not null default 'member' check (role in ('owner', 'admin', 'member', 'viewer')),
  created_at    timestamptz not null default now(),
  unique (workspace_id, user_id)
);

alter table public.workspace_members enable row level security;

-- Members can see other members of their workspace
create policy "Members can view workspace members"
  on public.workspace_members for select
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = workspace_members.workspace_id
        and wm.user_id = auth.uid()
    )
  );

-- Owners/admins can add members
create policy "Admins can insert workspace members"
  on public.workspace_members for insert
  with check (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = workspace_members.workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin')
    )
  );

-- Owners/admins can update members
create policy "Admins can update workspace members"
  on public.workspace_members for update
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = workspace_members.workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin')
    )
  );

-- Workspace RLS — members can read their workspaces
create policy "Members can view their workspace"
  on public.workspaces for select
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = id
        and wm.user_id = auth.uid()
    )
  );

create policy "Owners can update workspace"
  on public.workspaces for update
  using (owner_id = auth.uid());

create policy "Authenticated users can create workspaces"
  on public.workspaces for insert
  with check (auth.uid() = owner_id);

-- ============================================================
-- CATEGORIES
-- ============================================================
create table if not exists public.categories (
  id            uuid primary key default uuid_generate_v4(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  name          text not null,
  color         text not null default '#6366f1',
  created_at    timestamptz not null default now(),
  unique (workspace_id, name)
);

alter table public.categories enable row level security;

create policy "Members can view categories"
  on public.categories for select
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = categories.workspace_id
        and wm.user_id = auth.uid()
    )
  );

create policy "Members can manage categories"
  on public.categories for all
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = categories.workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin', 'member')
    )
  );

-- ============================================================
-- PRODUCTS
-- ============================================================
create table if not exists public.products (
  id                   uuid primary key default uuid_generate_v4(),
  workspace_id         uuid not null references public.workspaces(id) on delete cascade,
  sku                  text not null,
  name                 text not null,
  description          text,
  category_id          uuid references public.categories(id) on delete set null,
  quantity             integer not null default 0 check (quantity >= 0),
  unit                 text not null default 'pcs',
  cost_price           numeric(12,2) not null default 0,
  selling_price        numeric(12,2) not null default 0,
  low_stock_threshold  integer not null default 10,
  image_url            text,
  is_active            boolean not null default true,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (workspace_id, sku)
);

alter table public.products enable row level security;

create policy "Members can view products"
  on public.products for select
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = products.workspace_id
        and wm.user_id = auth.uid()
    )
  );

create policy "Members can manage products"
  on public.products for all
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = products.workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin', 'member')
    )
  );

-- ============================================================
-- INVENTORY LOGS
-- ============================================================
create table if not exists public.inventory_logs (
  id                uuid primary key default uuid_generate_v4(),
  workspace_id      uuid not null references public.workspaces(id) on delete cascade,
  product_id        uuid not null references public.products(id) on delete cascade,
  user_id           uuid not null references public.profiles(id) on delete restrict,
  action            text not null check (action in ('add', 'remove', 'adjust', 'create', 'update', 'delete')),
  quantity_before   integer not null,
  quantity_after    integer not null,
  quantity_change   integer not null,
  note              text,
  created_at        timestamptz not null default now()
);

alter table public.inventory_logs enable row level security;

create policy "Members can view inventory logs"
  on public.inventory_logs for select
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = inventory_logs.workspace_id
        and wm.user_id = auth.uid()
    )
  );

create policy "Members can insert inventory logs"
  on public.inventory_logs for insert
  with check (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = inventory_logs.workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin', 'member')
    )
  );

-- ============================================================
-- INDEXES for performance
-- ============================================================
create index if not exists idx_products_workspace on public.products(workspace_id);
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_sku on public.products(workspace_id, sku);
create index if not exists idx_inventory_logs_workspace on public.inventory_logs(workspace_id);
create index if not exists idx_inventory_logs_product on public.inventory_logs(product_id);
create index if not exists idx_inventory_logs_created on public.inventory_logs(created_at desc);
create index if not exists idx_workspace_members_user on public.workspace_members(user_id);
create index if not exists idx_workspace_members_workspace on public.workspace_members(workspace_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger handle_workspaces_updated_at
  before update on public.workspaces
  for each row execute function public.handle_updated_at();

create trigger handle_products_updated_at
  before update on public.products
  for each row execute function public.handle_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- FUNCTION: Create workspace and add owner as member
-- ============================================================
create or replace function public.create_workspace(
  p_name text,
  p_slug text
)
returns public.workspaces language plpgsql security definer as $$
declare
  v_workspace public.workspaces;
begin
  insert into public.workspaces (name, slug, owner_id)
  values (p_name, p_slug, auth.uid())
  returning * into v_workspace;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (v_workspace.id, auth.uid(), 'owner');

  return v_workspace;
end;
$$;

-- ============================================================
-- FUNCTION: Adjust stock and log it atomically
-- ============================================================
create or replace function public.adjust_stock(
  p_product_id uuid,
  p_action     text,
  p_quantity   integer,
  p_note       text default null
)
returns public.products language plpgsql security definer as $$
declare
  v_product       public.products;
  v_qty_before    integer;
  v_qty_after     integer;
begin
  select * into v_product from public.products where id = p_product_id for update;

  if not found then
    raise exception 'Product not found';
  end if;

  v_qty_before := v_product.quantity;

  case p_action
    when 'add'    then v_qty_after := v_qty_before + p_quantity;
    when 'remove' then v_qty_after := greatest(0, v_qty_before - p_quantity);
    when 'adjust' then v_qty_after := p_quantity;
    else raise exception 'Invalid action: %', p_action;
  end case;

  update public.products
  set quantity = v_qty_after
  where id = p_product_id
  returning * into v_product;

  insert into public.inventory_logs (
    workspace_id, product_id, user_id,
    action, quantity_before, quantity_after, quantity_change, note
  ) values (
    v_product.workspace_id, p_product_id, auth.uid(),
    p_action, v_qty_before, v_qty_after, (v_qty_after - v_qty_before), p_note
  );

  return v_product;
end;
$$;
