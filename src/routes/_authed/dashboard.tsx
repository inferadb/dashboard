import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Key, Users, Vault } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { User } from "@/types/api";

export const Route = createFileRoute("/_authed/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = Route.useRouteContext() as { user: User | null };

  // During SSR, user is null - parent layout will show loading state
  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {user.name}
        </h1>
        <p className="text-muted-foreground">
          Manage your authorization infrastructure from one place.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Manage your organizations and team members
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/organizations">View all</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vaults</CardTitle>
            <Vault className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Authorization policy containers
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/organizations">Manage</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Group-based access management
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/organizations">Manage</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Service identities and certificates
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/organizations">Manage</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Getting started guide */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
              1
            </div>
            <div>
              <h3 className="font-medium">Create an Organization</h3>
              <p className="text-sm text-muted-foreground">
                Organizations are workspaces that contain teams, vaults, and
                clients.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
              2
            </div>
            <div>
              <h3 className="font-medium">Set up a Vault</h3>
              <p className="text-sm text-muted-foreground">
                Vaults are containers for authorization policies and
                relationships.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
              3
            </div>
            <div>
              <h3 className="font-medium">Create a Client</h3>
              <p className="text-sm text-muted-foreground">
                Clients are service identities that can access your vaults via
                the API.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
