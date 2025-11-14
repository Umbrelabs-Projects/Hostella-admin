let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://your-api.com";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  const res = await fetch(`${baseUrl}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `API error: ${res.status}`);
  }

  try {
    return (await res.json()) as T;
  } catch {
    throw new Error("Failed to parse JSON response");
  }
}
