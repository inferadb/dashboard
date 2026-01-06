import { describe, it, expect } from "vitest";
import { reducer } from "./use-toast";

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
      const toast: TestToast = { id: "1", title: "Test Toast" };

      const newState = reducer(initialState, {
        type: "ADD_TOAST",
        toast: toast as never,
      });

      expect(newState.toasts).toHaveLength(1);
      expect(newState.toasts[0]).toEqual(toast);
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
