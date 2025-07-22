/* ===================================
   UTILITY FUNCTIONS
   ================================== */

import type { Order, SortConfig, FilterConfig, BackendOrder } from '../types';

/**
 * Formats a date string for display
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit'
    });
  } catch {
    return dateString;
  }
};

/**
 * Transform backend order data to frontend Order format
 */
export const transformBackendOrder = (backendOrder: BackendOrder): Order => {
  return {
    id: backendOrder.order_id,
    status: backendOrder.status as any, // Cast to OrderStatus - could add validation
    customer: backendOrder.customer_name || `Customer ${backendOrder.customer_id}`,
    orderType: backendOrder.order_type || 'Standard',
    items: backendOrder.items || 0,
    tags: backendOrder.tags || [],
    dueDate: backendOrder.due_date ? formatDate(backendOrder.due_date) : '',
    lastUpdated: backendOrder.last_updated ? formatRelativeTime(backendOrder.last_updated) : '',
    hasWarning: false, // Could add logic based on status or due date
    insight: (backendOrder as any).insight || '',
  };
};

/**
 * Transform array of backend orders to frontend format
 */
export const transformBackendOrders = (backendOrders: BackendOrder[]): Order[] => {
  return backendOrders.map(transformBackendOrder);
};

/**
 * Formats a relative time string (e.g., "10 min ago")
 */
export const formatRelativeTime = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return formatDate(timestamp);
  } catch {
    return timestamp;
  }
};

/**
 * Sorts orders based on the given configuration
 */
export const sortOrders = (orders: Order[], config: SortConfig): Order[] => {
  return [...orders].sort((a, b) => {
    const aValue = a[config.field];
    const bValue = b[config.field];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return config.direction === 'asc' ? comparison : -comparison;
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      const comparison = aValue - bValue;
      return config.direction === 'asc' ? comparison : -comparison;
    }
    
    return 0;
  });
};

/**
 * Filters orders based on the given criteria
 */
export const filterOrders = (orders: Order[], filters: FilterConfig): Order[] => {
  return orders.filter(order => {
    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(order.status)) {
        return false;
      }
    }
    
    // Customer filter
    if (filters.customer) {
      if (!order.customer.toLowerCase().includes(filters.customer.toLowerCase())) {
        return false;
      }
    }
    
    // Date range filter
    if (filters.dateRange) {
      const orderDate = new Date(order.dueDate);
      if (orderDate < filters.dateRange.start || orderDate > filters.dateRange.end) {
        return false;
      }
    }
    
    return true;
  });
};

/**
 * Searches orders based on a query string
 */
export const searchOrders = (orders: Order[], query: string): Order[] => {
  if (!query.trim()) return orders;
  
  const searchTerm = query.toLowerCase();
  
  return orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm) ||
    order.customer.toLowerCase().includes(searchTerm) ||
    order.orderType.toLowerCase().includes(searchTerm) ||
    order.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  );
};

/**
 * Gets the status color class for styling
 */
export const getStatusColorClass = (status: Order['status']): string => {
  switch (status) {
    case 'Print Ready':
      return 'status-ready';
    case 'In Progress':
      return 'status-progress';
    case 'Completed':
      return 'status-completed';
    case 'Cancelled':
      return 'status-cancelled';
    default:
      return 'status-default';
  }
};

/**
 * Debounces a function call
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
