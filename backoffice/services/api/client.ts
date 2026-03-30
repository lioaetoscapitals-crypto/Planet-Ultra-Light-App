type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  token?: string;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body } = options;

  await new Promise((resolve) => setTimeout(resolve, 250));

  return {
    path,
    method,
    body
  } as T;
}
