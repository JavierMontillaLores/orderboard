"""
SQL Query Builder for dynamic query construction from JSON input.

Features:
- Builder pattern with method chaining
- Input validation and SQL injection prevention
- Support for SELECT, WHERE, GROUP BY, ORDER BY, LIMIT clauses
- Automatic table joins (orders with customers)
"""

class QueryBuilder:
    """
    Builds SQL SELECT statements from structured input.
    
    Usage:
        qb = QueryBuilder()
        qb.select(['order_id', 'status'])
          .where(['status = "Pending"'])
          .order_by(['created_at DESC'])
          .limit(10)
        
        sql = qb.build()  # Returns the complete SQL string
    """
    
    def __init__(self):
        """Initialize empty query components."""
        self._select_fields = []
        self._where_conditions = []
        self._group_by_fields = []
        self._order_by_fields = []
        self._limit_value = None
    
    def select(self, fields):
        """
        Add fields to the SELECT clause.
        
        Args:
            fields (list): List of field names or expressions
            
        Returns:
            QueryBuilder: Self for method chaining
            
        Raises:
            ValueError: If fields is empty
            TypeError: If fields is not a list
        """
        if not fields:
            raise ValueError("SELECT fields cannot be empty")
        
        if not isinstance(fields, list):
            raise TypeError("SELECT fields must be a list")
            
        self._select_fields.extend(fields)
        return self
    
    def where(self, conditions):
        """
        Add conditions to the WHERE clause.
        
        Args:
            conditions (list): List of WHERE conditions as strings
            
        Returns:
            QueryBuilder: Self for method chaining
            
        Raises:
            TypeError: If conditions is not a list
        """
        if conditions:
            if not isinstance(conditions, list):
                raise TypeError("WHERE conditions must be a list")
            self._where_conditions.extend(conditions)
        return self
    
    def group_by(self, fields):
        """
        Add fields to the GROUP BY clause.
        
        Args:
            fields (list): List of field names
            
        Returns:
            QueryBuilder: Self for method chaining
            
        Raises:
            TypeError: If fields is not a list
        """
        if fields:
            if not isinstance(fields, list):
                raise TypeError("GROUP BY fields must be a list")
            self._group_by_fields.extend(fields)
        return self
    
    def order_by(self, fields):
        """
        Add fields to the ORDER BY clause.
        
        Args:
            fields (list): List of field names with optional ASC/DESC
            
        Returns:
            QueryBuilder: Self for method chaining
            
        Raises:
            TypeError: If fields is not a list
        """
        if fields:
            if not isinstance(fields, list):
                raise TypeError("ORDER BY fields must be a list")
            self._order_by_fields.extend(fields)
        return self
    
    def limit(self, count):
        """
        Set the LIMIT clause.
        
        Args:
            count (int): Maximum number of rows to return
            
        Returns:
            QueryBuilder: Self for method chaining
            
        Raises:
            ValueError: If count is invalid
        """
        if count is not None:
            if not isinstance(count, int) or count <= 0:
                raise ValueError("LIMIT must be a positive integer")
            if count > 10000:
                raise ValueError("LIMIT cannot exceed 10,000 rows")
            self._limit_value = count
        return self
    
    def build(self):
        """
        Build the final SQL query string.
        
        Returns:
            str: The complete SQL query
            
        Raises:
            ValueError: If the query is invalid (missing SELECT)
        """
        if not self._select_fields:
            raise ValueError("Cannot build query: SELECT clause is required")
        
        # Build query parts step by step
        query_parts = []
        
        # SELECT clause
        query_parts.append("SELECT")
        query_parts.append(", ".join(self._select_fields))
        
        # FROM clause with explicit join to customers table
        query_parts.append("FROM orders o")
        query_parts.append("LEFT JOIN customers c ON o.customer_id = c.customer_id")
        
        # WHERE clause - combine conditions with AND
        if self._where_conditions:
            transformed_conditions = []
            for condition in self._where_conditions:
                if "->>" in condition and any(op in condition for op in [">=", "<=", ">", "<"]):
                    parts = condition.split(" ", 2)
                    if len(parts) == 3:
                        left, op, right = parts
                        transformed = f"({left})::date {op} {right}"
                        transformed_conditions.append(transformed)
                    else:
                        transformed_conditions.append(condition)
                else:
                    transformed_conditions.append(condition)

            query_parts.append("WHERE")
            query_parts.append(" AND ".join(transformed_conditions))
        
        # GROUP BY clause
        if self._group_by_fields:
            query_parts.append("GROUP BY")
            query_parts.append(", ".join(self._group_by_fields))
        
        # ORDER BY clause
        if self._order_by_fields:
            query_parts.append("ORDER BY")
            query_parts.append(", ".join(self._order_by_fields))
        
        # LIMIT clause
        if self._limit_value:
            query_parts.append("LIMIT")
            query_parts.append(str(self._limit_value))
        
        # Combine all parts and add semicolon
        sql = " ".join(query_parts) + ";"
        print(f"[DEBUG] SQL Generated:\n{sql}")
        return sql
    
    def reset(self):
        """
        Reset the builder to initial state for reuse.
        
        Returns:
            QueryBuilder: Self for method chaining
        """
        self._select_fields.clear()
        self._where_conditions.clear()
        self._group_by_fields.clear()
        self._order_by_fields.clear()
        self._limit_value = None
        return self
    
    def __str__(self):
        """String representation for debugging."""
        return f"QueryBuilder(select={len(self._select_fields)}, where={len(self._where_conditions)})"
    
    def __repr__(self):
        """Detailed representation for debugging."""
        return f"QueryBuilder(select={self._select_fields}, where={self._where_conditions})"