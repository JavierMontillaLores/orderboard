/* ===================================
   TYPE DEFINITIONS
   ================================== */

// User related types
export interface User {
  id?: string;
  name: string;
  role: string;
  avatar: string;
  email?: string;
}

// Order related types
export type OrderStatus = 'Print Ready' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Order {
  id: string;
  status: OrderStatus;
  customer: string;
  orderType: string;
  items: number;
  tags: string[];
  dueDate: string;
  lastUpdated: string;
  hasWarning?: boolean;
  priority?: 'low' | 'medium' | 'high';
  assignedTo?: User[];
  insight?: string;
}

// Component prop types
export interface HeaderProps {
  user: User;
  onUserMenuClick?: () => void;
}

export interface SidebarProps {
  activeItem?: string;
  isCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
}

export interface OrderPageProps {
  orders?: Order[];
  loading?: boolean;
  error?: string;
}

// Utility types
export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface SortConfig {
  field: keyof Order;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  status?: OrderStatus[];
  customer?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// API Response types
export interface APIResponse<T = any> {
  success: boolean;
  data: T[];
  count: number;
  sql: string;
  args?: any;
  insights?: string;
}

export interface QueryRequest {
  prompt: string;
}

export interface QueryError {
  detail: string;
}

// Backend order data structure (from database)
export interface BackendOrder {
  order_id: string;
  customer_id?: number;
  status: string;
  order_type?: string;
  items?: number;
  tags?: string[];
  due_date?: string;
  last_updated?: string;
  created_at?: string;
  action_notes?: string;
  customer_name?: string; // From JOIN with customers table
}

// UI state types
export interface OrderPageState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  isAIMode: boolean;
  lastQuery: string;
  lastSQL: string;
}
