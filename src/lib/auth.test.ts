import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ApiClientError } from "./api";

// Mock the api module
vi.mock("./api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  ApiClientError: class ApiClientError extends Error {
    status: number;
    apiError: { error: { code: string; message: string } };
    constructor(
      status: number,
      apiError: { error: { code: string; message: string } }
    ) {
      super(apiError.error.message);
      this.status = status;
      this.apiError = apiError;
      this.name = "ApiClientError";
    }
  },
}));

// Import after mocking
import { api } from "./api";
import {
  getCurrentUser,
  login,
  register,
  logout,
  verifyEmail,
  resendVerification,
  updateProfile,
  changePassword,
  getSessions,
  revokeSession,
  revokeOtherSessions,
} from "./auth";

describe("auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Simulate browser environment for getCurrentUser tests
    vi.stubGlobal("window", {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("getCurrentUser", () => {
    it("returns user data on success", async () => {
      const mockUser = { id: "123", email: "test@example.com", name: "Test" };
      vi.mocked(api.get).mockResolvedValueOnce(mockUser);

      const result = await getCurrentUser();

      expect(api.get).toHaveBeenCalledWith("/v1/users/me");
      expect(result).toEqual(mockUser);
    });

    it("returns null on 401 error", async () => {
      const error = new ApiClientError(401, {
        error: { code: "UNAUTHORIZED", message: "Not authenticated" },
      });
      vi.mocked(api.get).mockRejectedValueOnce(error);

      const result = await getCurrentUser();

      expect(result).toBeNull();
    });

    it("throws on non-401 errors", async () => {
      const error = new ApiClientError(500, {
        error: { code: "SERVER_ERROR", message: "Internal error" },
      });
      vi.mocked(api.get).mockRejectedValueOnce(error);

      await expect(getCurrentUser()).rejects.toThrow(ApiClientError);
    });

    it("throws on network errors", async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error("Network error"));

      await expect(getCurrentUser()).rejects.toThrow("Network error");
    });

    it("returns null during SSR (no window)", async () => {
      // Unstub window to simulate SSR
      vi.unstubAllGlobals();

      const result = await getCurrentUser();

      expect(api.get).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("login", () => {
    it("sends login credentials and returns auth response", async () => {
      const mockResponse = {
        user: { id: "123", email: "test@example.com" },
        session: { token: "abc123" },
      };
      vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

      const result = await login({
        email: "test@example.com",
        password: "password123",
      });

      expect(api.post).toHaveBeenCalledWith("/v1/auth/login/password", {
        email: "test@example.com",
        password: "password123",
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("register", () => {
    it("sends registration data and returns auth response", async () => {
      const mockResponse = {
        user: { id: "123", email: "test@example.com" },
        session: { token: "abc123" },
      };
      vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

      const result = await register({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });

      expect(api.post).toHaveBeenCalledWith("/v1/auth/register", {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("logout", () => {
    it("calls logout endpoint", async () => {
      vi.mocked(api.post).mockResolvedValueOnce(undefined);

      await logout();

      expect(api.post).toHaveBeenCalledWith("/v1/auth/logout");
    });
  });

  describe("verifyEmail", () => {
    it("sends verification token", async () => {
      vi.mocked(api.post).mockResolvedValueOnce(undefined);

      await verifyEmail("verification-token-123");

      expect(api.post).toHaveBeenCalledWith("/v1/auth/verify-email", {
        token: "verification-token-123",
      });
    });
  });

  describe("resendVerification", () => {
    it("calls resend verification endpoint", async () => {
      vi.mocked(api.post).mockResolvedValueOnce(undefined);

      await resendVerification();

      expect(api.post).toHaveBeenCalledWith("/v1/auth/resend-verification");
    });
  });

  describe("updateProfile", () => {
    it("updates user profile and returns updated user", async () => {
      const mockUser = {
        id: "123",
        email: "test@example.com",
        name: "New Name",
      };
      vi.mocked(api.patch).mockResolvedValueOnce(mockUser);

      const result = await updateProfile({ name: "New Name" });

      expect(api.patch).toHaveBeenCalledWith("/v1/users/me", {
        name: "New Name",
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe("changePassword", () => {
    it("sends password change request", async () => {
      vi.mocked(api.post).mockResolvedValueOnce(undefined);

      await changePassword({
        current_password: "oldpass",
        new_password: "newpass",
      });

      expect(api.post).toHaveBeenCalledWith("/v1/users/me/password", {
        current_password: "oldpass",
        new_password: "newpass",
      });
    });
  });

  describe("getSessions", () => {
    it("returns list of sessions", async () => {
      const mockSessions = [
        { id: "session1", created_at: "2024-01-01" },
        { id: "session2", created_at: "2024-01-02" },
      ];
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockSessions });

      const result = await getSessions();

      expect(api.get).toHaveBeenCalledWith("/v1/users/sessions");
      expect(result).toEqual(mockSessions);
    });
  });

  describe("revokeSession", () => {
    it("revokes a specific session", async () => {
      vi.mocked(api.delete).mockResolvedValueOnce(undefined);

      await revokeSession("session-123");

      expect(api.delete).toHaveBeenCalledWith("/v1/users/sessions/session-123");
    });
  });

  describe("revokeOtherSessions", () => {
    it("revokes all other sessions", async () => {
      vi.mocked(api.post).mockResolvedValueOnce(undefined);

      await revokeOtherSessions();

      expect(api.post).toHaveBeenCalledWith("/v1/users/sessions/revoke-others");
    });
  });
});
