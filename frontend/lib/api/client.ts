export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export interface APIClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export class APIClient {
  private baseURL: string;
  private timeout: number;
  private headers: Record<string, string>;

  constructor(config: APIClientConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout || 30000;
    this.headers = {
      'Content-Type': 'application/json',
      ...config.headers
    };
  }

  async fetch<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...this.headers,
          ...options?.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new APIError(
          error.message || `API Error: ${response.statusText}`,
          response.status,
          error
        );
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof APIError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new APIError('Request timeout', 408);
        }
        throw new APIError(error.message);
      }

      throw new APIError('Unknown error occurred');
    }
  }

  get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.fetch<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.fetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.fetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.fetch<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Create a singleton instance
const apiClient = new APIClient({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== 'undefined' && window.location.origin
      ? `${window.location.origin}/api`
      : 'https://cfbfantasy.app/api'),
});

export default apiClient;