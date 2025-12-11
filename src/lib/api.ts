let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

export interface ApiError {
  message: string;
  status: number;
  details?: unknown;
}

export class APIException extends Error implements ApiError {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
    Object.setPrototypeOf(this, APIException.prototype);
  }
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const url = `${baseUrl}${endpoint}`;

  try {
    const res = await fetch(url, { ...options, headers });

    const contentType = res.headers.get("content-type");
    let data: unknown;

    if (contentType?.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      const errorMessage =
        typeof data === "object" && data !== null && "message" in data
          ? (data as Record<string, unknown>).message
          : typeof data === "string"
            ? data
            : `API error: ${res.status}`;

      throw new APIException(String(errorMessage), res.status, data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof APIException) {
      throw error;
    }

    if (error instanceof TypeError) {
      throw new APIException(
        "Network error. Please check your connection.",
        0,
        error.message
      );
    }

    throw new APIException(
      error instanceof Error ? error.message : "An unexpected error occurred",
      500,
      error
    );
  }
}
