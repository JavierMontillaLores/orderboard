import React, { useState, useEffect } from 'react';
import type { Order } from '../types';
import { apiService } from '../services/api';
import { transformBackendOrders } from '../utils';
import './OrderPage.css';
import OrderChart from './OrderChart';

interface OrderPageProps {
  queryResult?: any;
}

const OrderPage: React.FC<OrderPageProps> = ({ queryResult }) => {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('Due Date');
  // New state for API integration
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState('');
  const [lastSQL, setLastSQL] = useState('');
  const [dynamicColumns, setDynamicColumns] = useState<string[]>([]);
  const [rawBackendData, setRawBackendData] = useState<any[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  const [displayMode, setDisplayMode] = useState<'table' | 'chart'>('table');
  const [xKey, setXKey] = useState<string>('');
  const [yKey, setYKey] = useState<string>('');

  const isSmallTalk = lastSQL.trim().toUpperCase() === 'SMALL_TALK';

  // Calculate pagination
  const totalPages = Math.ceil(allOrders.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentOrders = allOrders.slice(startIndex, endIndex);


  // Load initial data
  useEffect(() => {
    loadInitialOrders();
  }, []);

  // Handle query results from right sidebar
  useEffect(() => {
    if (queryResult === null) {
      // Reset to initial state when queryResult is null (e.g., New Chat clicked)
      loadInitialOrders();
    } else if (queryResult) {
      processQueryResult(queryResult);
    }
  }, [queryResult]);

  const processQueryResult = (result: any) => {
    setLoading(true);
    setError(null);
    setCurrentPage(1); // Reset to first page
    setDisplayMode(result.display_mode === 'chart' ? 'chart' : 'table');
    
    if (result.display_mode === 'chart' && result.data.length > 0) {
      const keys = Object.keys(result.data[0]);
      setXKey(keys[0]); // e.g., "status"
      setYKey(keys[1]); // e.g., "count"
    } 

    try {
      if (result.sql === "SMALL_TALK") {
        setLastQuery(result.prompt || '');
        setLastSQL("SMALL_TALK");
        loadInitialOrders();
        setDynamicColumns([]); // Show all columns for small talk
      } else {
        // For actual data queries, detect columns from the actual data returned
        let transformedOrders: Order[];
        let detectedColumns: string[] = [];
        
        if (result.data && result.data.length > 0) {
          // Extract column names from the first data item
          // For query results, we show exactly what the backend returns (don't filter)
          detectedColumns = Object.keys(result.data[0]);
          
          // Create minimal Order objects with only the available data
          transformedOrders = result.data.map((item: any, index: number) => {
            const minimalOrder: Order = {
              // Always include required fields with fallbacks
              id: item.order_id || item.customer_id?.toString() || `row-${index + 1}`,
              status: item.status || 'Unknown' as any,
              customer: item.customer_name || (item.customer_id ? `Customer ${item.customer_id}` : 'Unknown'),
              orderType: item.order_type || '-',
              items: item.items || 0,
              tags: item.tags || [],
              dueDate: item.due_date || '-',
              lastUpdated: item.last_updated || '-',
              hasWarning: false,
            };
            return minimalOrder;
          });
        } else {
          transformedOrders = [];
        }
        
        setAllOrders(transformedOrders);
        setOrders(transformedOrders.slice(0, pageSize));
        setLastQuery(result.prompt || '');
        setLastSQL(result.sql);
        setDynamicColumns(detectedColumns);
        setRawBackendData(result.data); // Store raw data for table rendering
        
        // Debug logging
        console.log('Query result data:', result.data);
        console.log('Detected columns:', detectedColumns);
        console.log('Sample raw data item:', result.data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Query processing failed');
      console.error('Query processing failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadInitialOrders = async () => {
    setLoading(true);
    setError(null);
    setCurrentPage(1);
    try {
      const response = await apiService.getAllOrders();
      const transformedOrders = transformBackendOrders(response.data);
      setAllOrders(transformedOrders);
      setOrders(transformedOrders.slice(0, pageSize));
      setLastSQL(response.sql);
      
      // Also detect columns and store raw data for initial orders
      if (response.data && response.data.length > 0) {
        const unwantedColumns = ['created_at', 'action_json', 'customer_id', 'customer_avatar'];
        const detectedColumns = Object.keys(response.data[0]).filter(col => !unwantedColumns.includes(col));
        setDynamicColumns(detectedColumns);
        setRawBackendData(response.data);
      } else {
        setDynamicColumns([]);
        setRawBackendData([]);
      }
      
      setLastQuery(''); // Clear the last query
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders((prev: string[]) => 
      prev.includes(orderId) 
        ? prev.filter((id: string) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === currentOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(currentOrders.map((order: Order) => order.id));
    }
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setOrders(allOrders.slice(startIndex, endIndex));
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
    setOrders(allOrders.slice(0, newSize));
  };

  // Update orders when page changes
  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setOrders(allOrders.slice(startIndex, endIndex));
  }, [currentPage, pageSize, allOrders]);

  return (
    <div className="order-page">
      <div className="page-header">
        <h1 className="page-title">Orders</h1>
        <button className="new-order-btn">New Order</button>
      </div>

      {/* Error message */}
      {error && (
        <div className="error-message" style={{ 
          background: '#fee', 
          border: '1px solid #fcc', 
          color: '#c33',
          padding: '12px',
          borderRadius: '4px',
          margin: '16px 0'
        }}>
          Error: {error}
          <button 
            onClick={loadInitialOrders} 
            style={{ marginLeft: '12px', padding: '4px 8px' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Query info */}
      {lastQuery && (
        <div className="query-info" style={{
          background: '#f0f9ff',
          border: '1px solid #0ea5e9',
          padding: '12px',
          borderRadius: '4px',
          margin: '16px 0',
          fontSize: '14px'
        }}>
          <strong>Query:</strong> {lastQuery}
          {lastSQL && (
            <details style={{ marginTop: '8px' }}>
              <summary style={{ cursor: 'pointer', color: '#0ea5e9' }}>
                Show SQL ({orders.length} results)
              </summary>
              <code style={{ 
                display: 'block', 
                background: '#f8f9fa', 
                padding: '8px', 
                marginTop: '8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontFamily: 'monospace'
              }}>
                {lastSQL}
              </code>
            </details>
          )}
        </div>
      )}

      <div className="table-controls">
        <div className="controls-container">
          <div className="left-controls">
            <div className="traditional-controls">
              <div className="search-box">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="search-icon">
                  <path d="M7.5 1a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zm0 12a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z" fill="currentColor"/>
                  <path d="M13.354 13.646a.5.5 0 0 1-.708.708l-3.5-3.5a.5.5 0 0 1 .708-.708l3.5 3.5z" fill="currentColor"/>
                </svg>
                <input type="text" placeholder="Search orders..." />
              </div>
              <button className="filter-btn">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="filter-icon">
                  <path d="M1.5 3a.5.5 0 0 1 .5-.5h12a.5.5 0 0 1 0 1h-12a.5.5 0 0 1-.5-.5zm2 3a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 0 1h-8a.5.5 0 0 1-.5-.5zm2 3a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5z" fill="currentColor"/>
                </svg>
                Filter
              </button>
              <div className="sort-dropdown">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="sort-icon">
                  <path d="M3 4.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z" fill="currentColor"/>
                </svg>
                <span>Sort by</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option>Due Date</option>
                  <option>Order ID</option>
                  <option>Customer</option>
                  <option>Status</option>
                </select>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="dropdown-arrow">
                  <path d="M8 10.5L4 6.5h8l-4 4z" fill="currentColor"/>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="controls-right">
            <button className="view-btn">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="view-icon">
                <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="table-container">
        {displayMode === 'chart' ? (
          <OrderChart data={rawBackendData} xKey={xKey} yKey={yKey} />
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>
                  <input 
                    type="checkbox" 
                    checked={selectedOrders.length === orders.length && orders.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                {/* Dynamically render columns based on what backend returns */}
                {(() => {
                  console.log('Rendering table with dynamicColumns:', dynamicColumns);
                  
                  // If we have dynamic columns, only show those
                  if (dynamicColumns.length > 0) {
                    // Desired column order
                    const desiredOrder = [
                      'order_id',
                      'customer_name', 
                      'status',
                      'order_type',
                      'items',
                      'tags',
                      'due_date',
                      'last_updated',
                      'action_notes'
                    ];

                    // Reorder detected columns to match desired order
                    const sortedColumns = desiredOrder.filter(col => dynamicColumns.includes(col));

                  return sortedColumns.map((column) => {
                    const columnDisplayMap: Record<string, string> = {
                      'order_id': 'Order ID',
                      'status': 'Status',
                      'customer_name': 'Customer',
                      'order_type': 'Order Type',
                      'items': 'Items',
                      'tags': 'Tags',
                      'due_date': 'Due Date',
                      'last_updated': 'Last Updated',
                      'action_notes': 'Action Notes'
                    };

                    const displayName = columnDisplayMap[column] || column;

                    if (column === 'status') {
                      return (
                        <th key={column}>
                          <div className="status-header">
                            <div className="status-avatars">
                              <div className="avatar green">M</div>
                              <div className="avatar blue">J</div>
                            </div>
                            {displayName}
                          </div>
                        </th>
                      );
                    }

                    return <th key={column}>{displayName}</th>;
                  });
                }
                  
                  // Fallback: show all columns if no dynamic columns specified
                  return (
                    <>
                      <th>Order ID</th>
                      <th>
                        <div className="status-header">
                          <div className="status-avatars">
                            <div className="avatar green">M</div>
                            <div className="avatar blue">J</div>
                          </div>
                          Status
                        </div>
                      </th>
                      <th>Customer</th>
                      {!isSmallTalk && (
                        <>
                          <th>Order Type</th>
                          <th>Items</th>
                          <th>Tags</th>
                          <th>Due Date</th>
                          <th>Last Updated</th>
                          <th>Actions</th>
                        </>
                      )}
                    </>
                  );
                })()}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ 
                    textAlign: 'center', 
                    padding: '40px',
                    color: '#666'
                  }}>
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ 
                    textAlign: 'center', 
                    padding: '40px',
                    color: '#666'
                  }}>
                    {error ? 'Failed to load orders' : 'No orders found'}
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  // Find the corresponding raw backend data for this order by matching order_id
                  const rawData = rawBackendData.find((item: any) => 
                    item.order_id?.toString() === order.id?.toString() || 
                    item.customer_id?.toString() === order.id?.toString()
                  ) || {};
                  
                  return (
                  <React.Fragment key={order.id}>
                  <tr key={order.id} className={selectedOrders.includes(order.id) ? 'selected' : ''}>
                    <td>
                      <input 
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => handleSelectOrder(order.id)}
                      />
                    </td>
                    {/* Dynamically render columns based on what backend returns */}
                    {(() => {
                      // If we have dynamic columns, only show those (filtered)
                      if (dynamicColumns.length > 0) {
                        const desiredOrder = [
                          'order_id',
                          'customer_name',
                          'status',
                          'order_type',
                          'items',
                          'tags',
                          'due_date',
                          'last_updated',
                          'action_notes'
                        ];

                        const sortedColumns = desiredOrder.filter(col => dynamicColumns.includes(col));

                        return sortedColumns.map((column) => {
                          const value = rawData[column];

                          if (column === 'order_id') {
                            return (
                              <td key={column} className="order-id">
                                {order.hasWarning && (
                                  <svg className="warning-icon" /* ... */ />
                                )}
                                {value ?? order.id}
                              </td>
                            );
                          }

                          if (column === 'customer_name') {
                            const customerValue = value ?? order.customer;
                            const avatar = rawData['customer_avatar'] || customerValue?.substring(0, 2).toUpperCase();
                            return (
                              <td key={column}>
                                <div className="customer-cell">
                                  <div className="customer-avatar">{avatar}</div>
                                  {customerValue || 'Unknown'}
                                </div>
                              </td>
                            );
                          }

                          if (column === 'status') {
                            const statusValue = value ?? order.status;
                            return (
                              <td key={column}>
                                <div className="status-cell">
                                  <span className={`status-dot ${statusValue === 'Print Ready' ? 'green' : 'blue'}`} />
                                  {statusValue}
                                </div>
                              </td>
                            );
                          }

                          if (column === 'order_type') return <td key={column}>{value ?? order.orderType}</td>;
                          if (column === 'items') return <td key={column}>{value ?? order.items}</td>;

                          if (column === 'tags') {
                            const tags = Array.isArray(value) ? value : order.tags;
                            return (
                              <td key={column}>
                                <div className="tags">
                                  {tags.map((tag: string, i: number) => (
                                    <span key={i} className="tag">{tag}</span>
                                  ))}
                                </div>
                              </td>
                            );
                          }

                          if (column === 'due_date') {
                            const date = value ?? order.dueDate;
                            let display = '-';
                            try {
                              if (date && date !== '-') {
                                display = new Date(date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
                              }
                            } catch {}
                            return <td key={column}>{display}</td>;
                          }

                          if (column === 'last_updated') {
                            const timestamp = value ?? order.lastUpdated;
                            const display = timestamp && timestamp !== '-' ? new Date(timestamp).toLocaleString() : '-';
                            return <td key={column}>{display}</td>;
                          }

                          if (column === 'action_notes') {
                            return <td key={column}>{value ?? '-'}</td>;
                          }

                          // Default
                          return <td key={column}>{value !== undefined && value !== null ? value.toString() : '-'}</td>;
                        });
                      }    
                      // Fallback: show all columns if no dynamic columns specified
                      return (
                        <>
                          <td className="order-id">
                            {order.hasWarning && (
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="warning-icon">
                                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                              </svg>
                            )}
                            {order.id}
                          </td>
                          <td>
                            <div className="status-cell">
                              <span className={`status-dot ${order.status === 'Print Ready' ? 'green' : 'blue'}`}></span>
                              {order.status}
                            </div>
                          </td>
                          <td>
                            <div className="customer-cell">
                              <div className="customer-avatar">
                                {(typeof order.customer === 'string' ? order.customer : 'AI').substring(0, 2).toUpperCase()}
                              </div>
                              {typeof order.customer === 'string' ? order.customer : 'AI System Message'}
                            </div>
                          </td>
                          {!isSmallTalk && (
                            <>
                              <td>{order.orderType}</td>
                              <td>{order.items}</td>
                              <td>
                                <div className="tags">
                                  {order.tags.map((tag, tagIndex) => (
                                    <span key={tagIndex} className="tag">{tag}</span>
                                  ))}
                                </div>
                              </td>
                              <td>{order.dueDate}</td>
                              <td>{order.lastUpdated}</td>
                              <td>
                                <div className="action-buttons">
                                  <button className="action-btn"><svg>...</svg></button>
                                  <button className="action-btn"><svg>...</svg></button>
                                </div>
                              </td>
                            </>
                          )}
                        </>
                      );
                    })()}
                  </tr>
                  </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="table-footer">
        <div className="pagination-info">
          <span>{startIndex + 1} - {Math.min(endIndex, allOrders.length)} of {allOrders.length}</span>
        </div>
        <div className="pagination">
          <button 
            className="pagination-btn" 
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            ‹
          </button>
          
          {/* Page numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
            if (pageNum <= totalPages) {
              return (
                <button
                  key={pageNum}
                  className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              );
            }
            return null;
          })}
          
          {totalPages > 5 && currentPage < totalPages - 2 && <span>...</span>}
          
          <select 
            className="page-size" 
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          
          <button 
            className="pagination-btn" 
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
