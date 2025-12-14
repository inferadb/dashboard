import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { getCurrentUser } from "@/lib/auth";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    // During SSR, getCurrentUser returns null - skip redirect and let client handle
    if (typeof window === "undefined") {
      return { ssrSkipped: true };
    }

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
  component: IndexPage,
});

function IndexPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle client-side redirect after SSR hydration
    getCurrentUser().then((user) => {
      if (user) {
        navigate({ to: "/dashboard" });
      } else {
        navigate({ to: "/login" });
      }
      setLoading(false);
    });
  }, [navigate]);

  // Show loading state during redirect
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return null;
}
