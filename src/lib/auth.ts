import { api, ApiClientError } from "./api";
import type { User, AuthResponse, LoginRequest, RegisterRequest } from "@/types/api";

export async function getCurrentUser(): Promise<User | null> {
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
