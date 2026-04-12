export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  owner_id: string;
  plan: 'free' | 'pro' | 'enterprise';
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  profile?: Profile;
}

export interface Category {
  id: string;
  workspace_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Product {
  id: string;
  workspace_id: string;
  sku: string;
  name: string;
  description: string | null;
  category_id: string | null;
  category?: Category;
  quantity: number;
  unit: string;
  cost_price: number;
  selling_price: number;
  low_stock_threshold: number;
  barcode: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type LogAction = 'add' | 'remove' | 'adjust' | 'create' | 'update' | 'delete';

export interface InventoryLog {
  id: string;
  workspace_id: string;
  product_id: string;
  product?: Product;
  user_id: string;
  profile?: Profile;
  action: LogAction;
  quantity_before: number;
  quantity_after: number;
  quantity_change: number;
  note: string | null;
  created_at: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  recentLogs: InventoryLog[];
  topProducts: Product[];
}

export interface StockAdjustment {
  product_id: string;
  action: 'add' | 'remove' | 'adjust';
  quantity: number;
  note?: string;
}

export interface Supplier {
  id: string;
  workspace_id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type POStatus = 'draft' | 'pending' | 'received' | 'cancelled';

export interface PurchaseOrder {
  id: string;
  workspace_id: string;
  supplier_id: string | null;
  supplier?: Supplier;
  po_number: string;
  status: POStatus;
  order_date: string;
  expected_delivery: string | null;
  notes: string | null;
  total_amount: number;
  items?: PurchaseOrderItem[];
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  product_id: string;
  product?: Product;
  quantity: number;
  unit_cost: number;
  received_quantity: number;
  created_at: string;
}
