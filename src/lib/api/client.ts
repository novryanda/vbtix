/**
 * API client for making requests to the backend
 */

const API_BASE_URL = "/api";

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Array<{ message: string }>;
  message?: string;
};

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
};

/**
 * Make a request to the API
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = "GET",
    body,
    headers = {},
    params,
  } = options;

  // Build URL with query parameters
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });
    const queryString = queryParams.toString();
    if (queryString) {
      url = `${url}?${queryString}`;
    }
  }

  // Build request options
  const requestOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  // Add body for non-GET requests
  if (method !== "GET" && body !== undefined) {
    requestOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, requestOptions);
    const data = await response.json();

    return data as ApiResponse<T>;
  } catch (error) {
    console.error(`API request error for ${endpoint}:`, error);
    return {
      success: false,
      error: "Failed to connect to the server",
    };
  }
}
