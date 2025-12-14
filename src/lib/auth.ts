import { api, ApiClientError } from "./api";
import type { User, AuthResponse, LoginRequest, RegisterRequest } from "@/types/api";

export async function getCurrentUser(): Promise<User | null> {
  // Skip API call during SSR - the API client uses relative URLs which don't work server-side
  // Auth will be checked client-side after hydration
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return await api.get<User>("/v1/users/me");
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  return api.post<AuthResponse>("/v1/auth/login/password", data);
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  return api.post<AuthResponse>("/v1/auth/register", data);
}

export async function logout(): Promise<void> {
  await api.post("/v1/auth/logout");
}

export async function verifyEmail(token: string): Promise<void> {
  await api.post("/v1/auth/verify-email", { token });
}

export async function resendVerification(): Promise<void> {
  await api.post("/v1/auth/resend-verification");
}

export async function updateProfile(data: { name?: string }): Promise<User> {
  return api.patch<User>("/v1/users/me", data);
}

export async function changePassword(data: {
  current_password: string;
  new_password: string;
}): Promise<void> {
  await api.post("/v1/users/me/password", data);
}

// Session management
import type { Session } from "@/types/api";
import type { PaginatedResponse } from "./api";

export async function getSessions(): Promise<Session[]> {
  const response = await api.get<PaginatedResponse<Session>>("/v1/users/sessions");
  return response.data;
}

export async function revokeSession(sessionId: string): Promise<void> {
  await api.delete(`/v1/users/sessions/${sessionId}`);
}

export async function revokeOtherSessions(): Promise<void> {
  await api.post("/v1/users/sessions/revoke-others");
}
