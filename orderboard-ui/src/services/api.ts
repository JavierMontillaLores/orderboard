// API service for communicating with the AI agent and backend

export interface APIResponse<T = any> {
  success: boolean;
  data: T[];
  count: number;
  sql: string;
  args?: any;
  insights?: string;
  language?: string;
}

export interface QueryRequest {
  prompt: string;
}

export interface QueryError {
  detail: string;
}

const AI_AGENT_URL = 'http://localhost:8080';
const BACKEND_URL = 'http://localhost:8001';

class APIService {
  // Query orders using natural language via AI agent
  async queryWithAI(prompt: string, is_transcript: boolean = false): Promise<APIResponse> {
    try {
      const response = await fetch(`${AI_AGENT_URL}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, is_transcript }),
      });

      if (!response.ok) {
        const errorData: QueryError = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('AI query failed:', error);
      throw error;
    }
  }

  // Query orders directly from backend with SQL parameters
  async queryWithSQL(args: any): Promise<APIResponse> {
    try {
      const response = await fetch(`${BACKEND_URL}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(args),
      });

      if (!response.ok) {
        const errorData: QueryError = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Backend query failed:', error);
      throw error;
    }
  }

  // Get all orders (default query)
  async getAllOrders(): Promise<APIResponse> {
    const defaultArgs = {
      select: ["*"],
      from: ["orders"],
      where: [],
      group_by: [],
      order_by: ["last_updated DESC"],
      limit: 50
    };

    return this.queryWithSQL(defaultArgs);
  }

  // Health check for AI agent
  async checkAIHealth(): Promise<any> {
    try {
      const response = await fetch(`${AI_AGENT_URL}/`);
      return await response.json();
    } catch (error) {
      console.error('AI health check failed:', error);
      throw error;
    }
  }

  // Health check for backend
  async checkBackendHealth(): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/`);
      return await response.json();
    } catch (error) {
      console.error('Backend health check failed:', error);
      throw error;
    }
  }

  // Get example prompts
  async getExamples(): Promise<{ examples: string[] }> {
    try {
      const response = await fetch(`${AI_AGENT_URL}/examples`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get examples:', error);
      throw error;
    }
  }
}

export const apiService = new APIService();
export default apiService;
