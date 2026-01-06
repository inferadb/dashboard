import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ApiClientError } from "./api";

// We need to test the ApiClient class, but it's not exported directly
// So we'll test through the exported `api` instance and the ApiClientError class

describe("ApiClientError", () => {
  it("creates an error with status and apiError", () => {
    const apiError = {
      error: {
        code: "NOT_FOUND",
        message: "Resource not found",
      },
    };

    const error = new ApiClientError(404, apiError);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiClientError);
    expect(error.status).toBe(404);
    expect(error.apiError).toEqual(apiError);
    expect(error.message).toBe("Resource not found");
    expect(error.name).toBe("ApiClientError");
  });

  it("includes error details when provided", () => {
    const apiError = {
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: {
          field: "email",
          reason: "Invalid format",
        },
      },
    };

    const error = new ApiClientError(400, apiError);

    expect(error.apiError.error.details).toEqual({
      field: "email",
      reason: "Invalid format",
    });
  });

  it("can be caught as an Error", () => {
    const apiError = {
      error: {
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      },
    };

    const error = new ApiClientError(401, apiError);

    expect(() => {
      throw error;
    }).toThrow(Error);
  });

  it("can be identified with instanceof", () => {
    const apiError = {
      error: {
        code: "SERVER_ERROR",
        message: "Internal server error",
      },
    };

    const error = new ApiClientError(500, apiError);

    try {
      throw error;
    } catch (e) {
      expect(e instanceof ApiClientError).toBe(true);
      if (e instanceof ApiClientError) {
        expect(e.status).toBe(500);
      }
    }
  });
});

describe("ApiClient", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  // Import api after mocking fetch
  const getApi = async () => {
    // Clear module cache to get fresh import with mocked fetch
    const { api } = await import("./api");
    return api;
  };

  describe("get", () => {
    it("makes a GET request with correct headers", async () => {
      const mockResponse = { data: "test" };
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const api = await getApi();
      const result = await api.get("/test");

      expect(global.fetch).toHaveBeenCalledWith("/test", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it("appends query parameters", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      } as Response);

      const api = await getApi();
      await api.get("/test", { foo: "bar", baz: "qux" });

      expect(global.fetch).toHaveBeenCalledWith(
        "/test?foo=bar&baz=qux",
        expect.any(Object)
      );
    });

    it("throws ApiClientError on non-ok response", async () => {
      const errorResponse = {
        error: {
          code: "NOT_FOUND",
          message: "Not found",
        },
      };

      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve(errorResponse),
      } as Response);

      const api = await getApi();

      await expect(api.get("/test")).rejects.toThrow(ApiClientError);

      try {
        await api.get("/test");
        expect.fail("Should have thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(ApiClientError);
        if (e instanceof ApiClientError) {
          expect(e.status).toBe(404);
          expect(e.apiError.error.code).toBe("NOT_FOUND");
        }
      }
    });
  });

  describe("post", () => {
    it("makes a POST request with JSON body", async () => {
      const mockResponse = { id: "123" };
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const api = await getApi();
      const result = await api.post("/test", { name: "test" });

      expect(global.fetch).toHaveBeenCalledWith("/test", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "test" }),
      });
      expect(result).toEqual(mockResponse);
    });

    it("handles POST without body", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      } as Response);

      const api = await getApi();
      await api.post("/test");

      expect(global.fetch).toHaveBeenCalledWith("/test", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: undefined,
      });
    });
  });

  describe("patch", () => {
    it("makes a PATCH request with JSON body", async () => {
      const mockResponse = { id: "123", name: "updated" };
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const api = await getApi();
      const result = await api.patch("/test/123", { name: "updated" });

      expect(global.fetch).toHaveBeenCalledWith("/test/123", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "updated" }),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("delete", () => {
    it("makes a DELETE request", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: () => Promise.resolve(undefined),
      } as Response);

      const api = await getApi();
      const result = await api.delete("/test/123");

      expect(global.fetch).toHaveBeenCalledWith("/test/123", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      expect(result).toBeUndefined();
    });
  });

  describe("error handling", () => {
    it("handles JSON parse errors gracefully", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: () => Promise.reject(new Error("Invalid JSON")),
      } as Response);

      const api = await getApi();

      try {
        await api.get("/test");
        expect.fail("Should have thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(ApiClientError);
        if (e instanceof ApiClientError) {
          expect(e.status).toBe(500);
          expect(e.apiError.error.code).toBe("UNKNOWN_ERROR");
          expect(e.apiError.error.message).toBe("Internal Server Error");
        }
      }
    });
  });
});
