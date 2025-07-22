# AI Agent - Natural Language to SQL Query Service

A FastAPI service that converts natural language prompts into SQL queries for order data analysis.

## Overview

This AI Agent acts as an intelligent interface between users and the Order Query Backend. It accepts natural language prompts, converts them to structured query arguments, and returns SQL results.

**Current Status**: The service uses placeholder logic for prompt parsing. The `prompt_to_args()` function contains TODO items for LLM integration (OpenAI, Anthropic, etc.).

## Workflow

1. **Receive Prompt**: Accept natural language description of desired query
2. **Parse Intent**: Convert prompt to SQL query arguments (TODO: implement with LLM)
3. **Backend Call**: Send structured arguments to backend API
4. **Return Results**: Combine generated SQL, arguments, and query results

## API Endpoints

### 1. Query Endpoint

**POST** `/query`

Convert natural language to SQL query and execute.

#### Request Body
```json
{
  "prompt": "Show me pending orders"
}
```

#### Response
```json
{
  "success": true,
  "data": [
    {
      "order_id": 1001,
      "status": "Pending",
      "customer_name": "Acme Corp",
      "due_date": "2025-07-01T00:00:00"
    }
  ],
  "count": 1,
  "sql": "SELECT o.order_id, o.status, c.customer_name, o.due_date FROM orders o JOIN customers c ON o.customer_id = c.customer_id WHERE o.status = 'Pending' ORDER BY o.due_date ASC LIMIT 20",
  "args": {
    "select": ["o.order_id", "o.status", "c.customer_name", "o.due_date"],
    "where": ["o.status = 'Pending'"],
    "order_by": ["o.due_date ASC"],
    "limit": 20
  }
}
```

### 2. Health Check

**GET** `/`

Check service status and configuration.

#### Response
```json
{
  "status": "healthy",
  "message": "AI Agent is running",
  "backend_url": "http://backend:8000/query",
  "docs": "/docs"
}
```

### 3. Example Prompts

**GET** `/examples`

Get sample prompts for testing.

#### Response
```json
{
  "examples": [
    "Show me pending orders",
    "What are the revenue numbers by customer?",
    "List customers and their order counts",
    "Show me recent orders",
    "Which customers have the most sales?"
  ]
}
```

## Example Usage

### cURL Examples

#### 1. Revenue Analysis
```bash
curl -X POST "http://localhost:8001/query" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What are the revenue numbers by customer?"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "data": [
    {"customer_name": "Acme Corp", "order_count": 5, "total_items": 150},
    {"customer_name": "Beta Inc", "order_count": 3, "total_items": 75}
  ],
  "count": 2,
  "sql": "SELECT c.customer_name, COUNT(o.order_id) as order_count, SUM(o.items) as total_items FROM orders o JOIN customers c ON o.customer_id = c.customer_id GROUP BY c.customer_name ORDER BY total_items DESC LIMIT 10",
  "args": {
    "select": ["c.customer_name", "COUNT(o.order_id) as order_count", "SUM(o.items) as total_items"],
    "group_by": ["c.customer_name"],
    "order_by": ["total_items DESC"],
    "limit": 10
  }
}
```

#### 2. Pending Orders
```bash
curl -X POST "http://localhost:8001/query" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Show me pending orders"
  }'
```

#### 3. Recent Activity
```bash
curl -X POST "http://localhost:8001/query" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Show me recent orders"
  }'
```

### Python Example

```python
import httpx
import asyncio

async def query_orders():
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:8001/query",
            json={"prompt": "What are the revenue numbers by customer?"}
        )
        data = response.json()
        
        print(f"Generated SQL: {data['sql']}")
        print(f"Results count: {data['count']}")
        
        for row in data['data']:
            print(f"Customer: {row['customer_name']}, Orders: {row['order_count']}")

# Run the async function
asyncio.run(query_orders())
```

### JavaScript/Node.js Example

```javascript
const axios = require('axios');

async function queryOrders() {
  try {
    const response = await axios.post('http://localhost:8001/query', {
      prompt: 'Show me pending orders'
    });
    
    const { data, sql, count } = response.data;
    
    console.log(`Generated SQL: ${sql}`);
    console.log(`Found ${count} results:`);
    
    data.forEach(order => {
      console.log(`Order ${order.order_id}: ${order.status} - ${order.customer_name}`);
    });
    
  } catch (error) {
    console.error('Query failed:', error.response?.data || error.message);
  }
}

queryOrders();
```

## Supported Query Types

The current placeholder logic recognizes these prompt patterns:

| Pattern | Example Prompt | Generated Query |
|---------|---------------|-----------------|
| **Revenue/Sales** | "revenue numbers by customer" | Groups by customer with sales totals |
| **Pending Orders** | "show me pending orders" | Filters for pending status, sorted by due date |
| **Customer Analysis** | "list customers and their order counts" | Customer summary with order counts |
| **Default (Recent)** | Any other prompt | Recent orders sorted by last updated |

## Running the Service

### Docker (Recommended)
```bash
# Build the image
docker build -t ai-agent .

# Run the container
docker run -p 8001:8000 -e BACKEND_URL=http://backend:8000/query ai-agent
```

### Local Development
```bash
# Install dependencies
pip install -r requirements.txt

# Set backend URL (optional)
export BACKEND_URL=http://localhost:8000/query

# Run the service
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BACKEND_URL` | `http://backend:8000/query` | URL of the backend query API |

## API Documentation

Once running, visit:
- **Interactive Docs**: http://localhost:8001/docs
- **Alternative Docs**: http://localhost:8001/redoc

## Error Handling

### Common Errors

#### Backend Connection Error (502)
```json
{
  "detail": "Backend API error: Connection refused"
}
```
**Solution**: Ensure the backend service is running and accessible.

#### Invalid Request (422)
```json
{
  "detail": [
    {
      "loc": ["body", "prompt"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```
**Solution**: Include required `prompt` field in request body.

#### Agent Processing Error (500)
```json
{
  "detail": "Agent processing error: Unexpected error message"
}
```
**Solution**: Check logs for detailed error information.

## Development Notes

### TODO: LLM Integration

The `prompt_to_args()` function currently uses simple keyword matching. To implement actual LLM integration:

1. **Choose Provider**: OpenAI GPT-4, Anthropic Claude, or open-source models
2. **Add Dependencies**: Install relevant SDK (`openai`, `anthropic`, etc.)
3. **Environment Setup**: Add API keys and configuration
4. **Prompt Engineering**: Design prompts for SQL query generation
5. **Response Parsing**: Extract structured arguments from LLM responses

### Example LLM Integration (OpenAI)
```python
import openai

def prompt_to_args(prompt: str) -> dict:
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "Convert natural language to SQL query arguments..."},
            {"role": "user", "content": prompt}
        ]
    )
    # Parse response and return structured arguments
    return parse_llm_response(response.choices[0].message.content)
```

## Architecture

```
User Input (Natural Language)
         ↓
    AI Agent (FastAPI)
         ↓
  prompt_to_args() [TODO: LLM]
         ↓
Backend Query API (FastAPI)
         ↓
    Database (PostgreSQL)
         ↓
    Results + SQL
```

## Contributing

1. Implement LLM integration in `prompt_to_args()`
2. Add more sophisticated prompt patterns
3. Enhance error handling and validation
4. Add request/response logging
5. Implement authentication if needed

---

For backend API documentation, see: `../backend/README.md`
