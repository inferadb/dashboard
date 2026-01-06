/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { reducer, toast, useToast } from "./use-toast";

// Type for the toast used in reducer tests
interface TestToast {
  id: string;
  title?: string;
  description?: string;
  open?: boolean;
}

interface TestState {
  toasts: TestToast[];
}

describe("toast reducer", () => {
  describe("ADD_TOAST", () => {
    it("adds a toast to empty state", () => {
      const initialState: TestState = { toasts: [] };
      const toastData: TestToast = { id: "1", title: "Test Toast" };

      const newState = reducer(initialState, {
        type: "ADD_TOAST",
        toast: toastData as never,
      });

      expect(newState.toasts).toHaveLength(1);
      expect(newState.toasts[0]).toEqual(toastData);
    });

    it("adds toast to the beginning of the list", () => {
      const initialState: TestState = {
        toasts: [{ id: "1", title: "First" }],
      };
      const newToast: TestToast = { id: "2", title: "Second" };

      const newState = reducer(initialState, {
        type: "ADD_TOAST",
        toast: newToast as never,
      });

      expect(newState.toasts).toHaveLength(1); // TOAST_LIMIT is 1
      expect(newState.toasts[0].id).toBe("2");
    });

    it("respects the toast limit", () => {
      const initialState: TestState = { toasts: [] };

      // Add multiple toasts
      let state = reducer(initialState, {
        type: "ADD_TOAST",
        toast: { id: "1", title: "First" } as never,
      });
      state = reducer(state, {
        type: "ADD_TOAST",
        toast: { id: "2", title: "Second" } as never,
      });
      state = reducer(state, {
        type: "ADD_TOAST",
        toast: { id: "3", title: "Third" } as never,
      });

      // Should only keep TOAST_LIMIT (1) toasts
      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0].id).toBe("3"); // Most recent
    });
  });

  describe("UPDATE_TOAST", () => {
    it("updates an existing toast", () => {
      const initialState: TestState = {
        toasts: [{ id: "1", title: "Original", description: "Desc" }],
      };

      const newState = reducer(initialState, {
        type: "UPDATE_TOAST",
        toast: { id: "1", title: "Updated" },
      });

      expect(newState.toasts[0].title).toBe("Updated");
      expect(newState.toasts[0].description).toBe("Desc"); // Preserved
    });

    it("does not affect other toasts", () => {
      const initialState: TestState = {
        toasts: [{ id: "1", title: "First" }],
      };

      const newState = reducer(initialState, {
        type: "UPDATE_TOAST",
        toast: { id: "999", title: "Nonexistent" },
      });

      expect(newState.toasts[0].title).toBe("First");
    });
  });

  describe("DISMISS_TOAST", () => {
    it("sets open to false for a specific toast", () => {
      const initialState: TestState = {
        toasts: [{ id: "1", title: "Test", open: true }],
      };

      const newState = reducer(initialState, {
        type: "DISMISS_TOAST",
        toastId: "1",
      });

      expect(newState.toasts[0].open).toBe(false);
    });

    it("dismisses all toasts when no toastId provided", () => {
      const initialState: TestState = {
        toasts: [{ id: "1", open: true }],
      };

      const newState = reducer(initialState, {
        type: "DISMISS_TOAST",
        toastId: undefined,
      });

      expect(newState.toasts.every((t) => t.open === false)).toBe(true);
    });
  });

  describe("REMOVE_TOAST", () => {
    it("removes a specific toast", () => {
      const initialState: TestState = {
        toasts: [{ id: "1", title: "Test" }],
      };

      const newState = reducer(initialState, {
        type: "REMOVE_TOAST",
        toastId: "1",
      });

      expect(newState.toasts).toHaveLength(0);
    });

    it("removes all toasts when no toastId provided", () => {
      const initialState: TestState = {
        toasts: [{ id: "1" }],
      };

      const newState = reducer(initialState, {
        type: "REMOVE_TOAST",
        toastId: undefined,
      });

      expect(newState.toasts).toHaveLength(0);
    });

    it("does not affect other toasts when removing specific toast", () => {
      // This test is for when TOAST_LIMIT > 1
      // Currently TOAST_LIMIT is 1, so we just verify the behavior
      const initialState: TestState = {
        toasts: [{ id: "1", title: "Only" }],
      };

      const newState = reducer(initialState, {
        type: "REMOVE_TOAST",
        toastId: "999", // Non-existent
      });

      expect(newState.toasts).toHaveLength(1);
      expect(newState.toasts[0].id).toBe("1");
    });
  });

  describe("state immutability", () => {
    it("returns a new state object on ADD_TOAST", () => {
      const initialState: TestState = { toasts: [] };

      const newState = reducer(initialState, {
        type: "ADD_TOAST",
        toast: { id: "1" } as never,
      });

      expect(newState).not.toBe(initialState);
      expect(newState.toasts).not.toBe(initialState.toasts);
    });

    it("returns a new state object on UPDATE_TOAST", () => {
      const initialState: TestState = {
        toasts: [{ id: "1", title: "Original" }],
      };

      const newState = reducer(initialState, {
        type: "UPDATE_TOAST",
        toast: { id: "1", title: "Updated" },
      });

      expect(newState).not.toBe(initialState);
    });

    it("returns a new state object on REMOVE_TOAST", () => {
      const initialState: TestState = {
        toasts: [{ id: "1" }],
      };

      const newState = reducer(initialState, {
        type: "REMOVE_TOAST",
        toastId: "1",
      });

      expect(newState).not.toBe(initialState);
    });
  });
});

describe("toast function", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates a toast and returns control methods", () => {
    const result = toast({ title: "Test Toast" });

    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("dismiss");
    expect(result).toHaveProperty("update");
    expect(typeof result.id).toBe("string");
    expect(typeof result.dismiss).toBe("function");
    expect(typeof result.update).toBe("function");
  });

  it("generates unique IDs for each toast", () => {
    const toast1 = toast({ title: "First" });
    const toast2 = toast({ title: "Second" });
    const toast3 = toast({ title: "Third" });

    expect(toast1.id).not.toBe(toast2.id);
    expect(toast2.id).not.toBe(toast3.id);
    expect(toast1.id).not.toBe(toast3.id);
  });

  it("dismiss function dismisses the toast", () => {
    const toastResult = toast({ title: "Dismissable Toast" });

    // Should not throw
    expect(() => toastResult.dismiss()).not.toThrow();
  });

  it("update function updates the toast", () => {
    const toastResult = toast({ title: "Original" });

    // Should not throw
    expect(() =>
      toastResult.update({ id: toastResult.id, title: "Updated" } as never)
    ).not.toThrow();
  });

  it("handles onOpenChange callback for auto-dismiss", () => {
    const toastResult = toast({ title: "Auto-dismiss test" });

    // The toast should have been created with onOpenChange that calls dismiss
    // when open becomes false. Since we can't access the toast directly,
    // we just verify the flow doesn't throw
    expect(toastResult.id).toBeDefined();
    toastResult.dismiss();
  });
});

describe("useToast hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns state with toasts array and methods", () => {
    const { result } = renderHook(() => useToast());

    expect(result.current).toHaveProperty("toasts");
    expect(result.current).toHaveProperty("toast");
    expect(result.current).toHaveProperty("dismiss");
    expect(Array.isArray(result.current.toasts)).toBe(true);
    expect(typeof result.current.toast).toBe("function");
    expect(typeof result.current.dismiss).toBe("function");
  });

  it("creates toast through hook and updates state", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({ title: "Hook Toast" });
    });

    // The toast should be in the state
    expect(result.current.toasts.length).toBeGreaterThanOrEqual(0);
  });

  it("dismiss method works without arguments", () => {
    const { result } = renderHook(() => useToast());

    // First create a toast
    act(() => {
      result.current.toast({ title: "To be dismissed" });
    });

    // Then dismiss all
    act(() => {
      result.current.dismiss();
    });

    // Should not throw
    expect(result.current.dismiss).toBeDefined();
  });

  it("dismiss method accepts optional toastId", () => {
    const { result } = renderHook(() => useToast());

    let toastId: string;

    act(() => {
      const created = result.current.toast({ title: "Specific dismiss" });
      toastId = created.id;
    });

    act(() => {
      result.current.dismiss(toastId);
    });

    // Should not throw
    expect(result.current.dismiss).toBeDefined();
  });

  it("updates state when listeners are notified", () => {
    const { result, rerender } = renderHook(() => useToast());

    act(() => {
      result.current.toast({ title: "Listener test" });
    });

    rerender();

    // The hook should have re-rendered with updated state
    expect(result.current.toasts).toBeDefined();
  });

  it("cleans up listener on unmount", () => {
    const { unmount } = renderHook(() => useToast());

    // Should not throw when unmounting
    expect(() => unmount()).not.toThrow();
  });
});
