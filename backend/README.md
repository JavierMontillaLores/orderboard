# Simple Order Query API

A minimal FastAPI backend that takes JSON input and creates SQL queries for the orders database.

## Quick Start

1. **Install dependencies:**
```bash
pip install -r requirements.txt
```

2. **Set environment variable:**
```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/orderboard"
```

3. **Run the server:**
```bash
uvicorn app.main:app --reload
```

## API Usage

### POST /query

Send a JSON payload to dynamically build and execute SQL queries:

**Example Request:**
```json
{
  "select": ["o.order_id", "o.status", "c.customer_name", "o.items"],
  "where": ["o.status = 'Pending'", "o.items > 100"],
  "order_by": ["o.last_updated DESC"],
  "limit": 10
}
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "order_id": "1000",
      "status": "Pending",
      "customer_name": "Canva",
      "items": 245
    }
  ],
  "count": 1,
  "sql": "SELECT o.order_id, o.status, c.customer_name, o.items FROM orders o LEFT JOIN customers c ON o.customer_id = c.customer_id WHERE o.status = 'Pending' AND o.items > 100 ORDER BY o.last_updated DESC LIMIT 10;"
}
```

## Testing with Postman

### Basic Setup
- **Method**: `POST`
- **URL**: `http://localhost:8000/query`
- **Headers**: `Content-Type: application/json`

### Quick Test Examples

**Test 1 - Simple Query:**
```json
{
  "select": ["o.order_id", "o.status", "c.customer_name"],
  "limit": 5
}
```

**Test 2 - With Filters:**
```json
{
  "select": ["o.order_id", "o.status", "c.customer_name", "o.items"],
  "where": ["o.status = 'Pending'"],
  "limit": 10
}
```

**Test 3 - Health Check:**
- **Method**: `GET`
- **URL**: `http://localhost:8000/`

## Query Examples

**Get all orders:**
```json
{
  "select": ["*"]
}
```

**Filter by status:**
```json
{
  "select": ["o.order_id", "o.status", "c.customer_name"],
  "where": ["o.status IN ('Pending', 'Print Ready')"]
}
```

**Aggregate queries:**
```json
{
  "select": ["c.customer_name", "COUNT(*) as order_count"],
  "group_by": ["c.customer_name"],
  "order_by": ["order_count DESC"]
}
```

**Complex filtering:**
```json
{
  "select": ["o.order_id", "o.status", "o.due_date"],
  "where": [
    "o.due_date < '2025-07-01'",
    "o.status != 'Shipped'"
  ],
  "order_by": ["o.due_date ASC"],
  "limit": 20
}
```

## Available Fields

From `orders` table (prefix with `o.`):
- order_id, customer_id, status, order_type, items, tags, due_date, last_updated, created_at, action_notes

From `customers` table (prefix with `c.`):
- customer_id, customer_name, customer_avatar

## Docker

```bash
docker build -t orderboard-backend .
docker run -p 8000:8000 -e DATABASE_URL="your_db_url" orderboard-backend
```

## Troubleshooting

**Docker Build Issues:**
If you get psycopg2 compilation errors, the Dockerfile includes the necessary system dependencies (gcc, libpq-dev).

**Database Connection:**
Make sure your DATABASE_URL is properly formatted:
```
postgresql://username:password@host:port/database_name
```

**API Documentation:**
Visit http://localhost:8000/docs for interactive API documentation.
