import { QueryClient, QueryFunction } from "@tanstack/react-query";

const throwIfResNotOk = async (res: Response) => {
  if (!res.ok) {
    console.error('[API ERROR] Response not OK:', {
      status: res.status,
      statusText: res.statusText,
      url: res.url,
      headers: Object.fromEntries(res.headers.entries())
    });
    
    const errorBody = await res.text();
    console.error('[API ERROR] Response body:', errorBody.substring(0, 500));
    
    let json;
    try {
      json = JSON.parse(errorBody);
    } catch {
      json = { message: errorBody || `Request failed with status ${res.status}` };
    }
    throw new Error(json.message || `Request failed with status ${res.status}`);
  }
};

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    console.log('[API REQUEST] Fetching:', url);
    
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: "include",
    });

    // Log response details BEFORE checking content type
    const contentType = res.headers.get('content-type');
    console.log('[API RESPONSE] Status:', res.status);
    console.log('[API RESPONSE] Content-Type:', contentType);
    console.log('[API RESPONSE] URL:', res.url);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    
    // Check if response is JSON
    if (!contentType || !contentType.includes('application/json')) {
      console.error('[API ERROR] Non-JSON response detected');
      const text = await res.text();
      console.error('[API ERROR] Response preview:', text.substring(0, 200));
      throw new Error(`Expected JSON response but got ${contentType}. Response: ${text.substring(0, 200)}`);
    }
    
    const data = await res.json();
    console.log('[API SUCCESS] Data received for:', url);
    return data;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
