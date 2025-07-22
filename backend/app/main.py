"""
Order Query API

A FastAPI application that converts JSON query specifications into SQL 
and executes them against an orders database.

Features:
- RESTful API design with automatic documentation
- JSON input validation using Pydantic models
- Dynamic SQL query generation
- Database integration with PostgreSQL
- CORS support for frontend integration
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel, Field
from typing import List, Optional

from .database import get_db
from .query_builder import QueryBuilder

# Create FastAPI application with metadata
app = FastAPI(
    title="Order Query API",
    description="Convert JSON query specifications to SQL and return results",
    version="1.0.0"
)

# Configure CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # Configure specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryPayload(BaseModel):
    """
    Request model for dynamic query construction.
    
    Defines the structure and validation rules for incoming JSON queries.
    """
    select: List[str] = Field(
        ...,  # Required field
        min_items=1,
        description="Fields to select (e.g., ['o.order_id', 'c.customer_name'])",
        example=["o.order_id", "o.status", "c.customer_name"]
    )
    where: Optional[List[str]] = Field(
        None,
        description="WHERE conditions as SQL strings",
        example=["o.status = 'Pending'", "o.items > 100"]
    )
    group_by: Optional[List[str]] = Field(
        None,
        description="Fields to group by",
        example=["c.customer_name"]
    )
    order_by: Optional[List[str]] = Field(
        None,
        description="Fields to order by with optional ASC/DESC",
        example=["o.last_updated DESC"]
    )
    limit: Optional[int] = Field(
        None,
        gt=0,  # Must be greater than 0
        le=1000,  # Maximum of 1000 results
        description="Maximum number of results to return",
        example=10
    )

@app.post("/query")
def execute_query(payload: QueryPayload, db: Session = Depends(get_db)):
    """
    Execute a dynamic SQL query based on JSON input.
    
    Takes a JSON specification and converts it to SQL, executes the query
    against the database, and returns the results with metadata.
    
    Args:
        payload: JSON query specification following QueryPayload schema
        db: Database session injected by FastAPI dependency system
        
    Returns:
        dict: Query results with success status, data, count, and SQL
        
    Raises:
        HTTPException: 
            - 400 for query validation errors
            - 500 for database execution errors
    """
    try:
        # Initialize query builder and apply JSON specifications
        query_builder = QueryBuilder()
        query_builder.select(payload.select)
        
        # Apply optional clauses based on input
        if payload.where:
            query_builder.where(payload.where)
        
        if payload.group_by:
            query_builder.group_by(payload.group_by)
        
        if payload.order_by:
            query_builder.order_by(payload.order_by)
        
        if payload.limit:
            query_builder.limit(payload.limit)

        # Generate SQL string from builder
        sql = query_builder.build()
        
        # Execute query against database
        result = db.execute(text(sql))
        rows = [dict(row._mapping) for row in result]
        
        # Return structured response with metadata
        return {
            "success": True,
            "data": rows,
            "count": len(rows),
            "sql": sql,  # Include generated SQL for debugging
        }
        
    except ValueError as e:
        # Handle query validation errors (bad input)
        raise HTTPException(
            status_code=400,
            detail=f"Query validation error: {str(e)}"
        )
    except Exception as e:
        # Handle database and other unexpected errors
        raise HTTPException(
            status_code=500,
            detail=f"Query execution failed: {str(e)}"
        )

@app.get("/")
def health_check():
    """
    Simple health check and API information endpoint.
    
    Returns basic API status and links to documentation.
    """
    return {
        "status": "healthy",
        "message": "Order Query API is running",
        "docs": "/docs",
        "version": "1.0.0"
    }

# Allow running the app directly with Python
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)