import { createFileRoute, redirect } from "@tanstack/react-router";
import { getCurrentUser } from "@/lib/auth";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        throw redirect({ to: "/dashboard" });
      }
    } catch (err) {
      // Re-throw redirect errors
      if (err && typeof err === "object" && "to" in err) {
        throw err;
      }
    }
    // If not authenticated or error, redirect to login
    throw redirect({ to: "/login" });
  },
  component: () => null,
});
