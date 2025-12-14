import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { getCurrentUser } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import type { User } from "@/types/api";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authed")({
  beforeLoad: async () => {
    const user = await getCurrentUser();
    // During SSR, getCurrentUser returns null - we'll check auth client-side
    // If user is null on the client, they'll be redirected below
    return { user };
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const { user: initialUser } = Route.useRouteContext() as { user: User | null };
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(!initialUser);
  const navigate = useNavigate();

  useEffect(() => {
    // If we don't have a user (SSR case), fetch on client
    if (!initialUser) {
      getCurrentUser().then((fetchedUser) => {
        if (!fetchedUser) {
          navigate({ to: "/login" });
        } else {
          setUser(fetchedUser);
          setLoading(false);
        }
      });
    }
  }, [initialUser, navigate]);

  // Show loading state while checking auth
  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <div className="flex flex-1 flex-col lg:pl-64">
        <Header user={user} />
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
