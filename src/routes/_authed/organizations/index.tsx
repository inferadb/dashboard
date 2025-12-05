import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getOrganizations, createOrganization } from "@/lib/organizations";
import { ApiClientError } from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";
import type { Organization } from "@/types/api";

export const Route = createFileRoute("/_authed/organizations/")({
  loader: async () => {
    const organizations = await getOrganizations();
    return { organizations };
  },
  component: OrganizationsPage,
});

function OrganizationsPage() {
  const { organizations } = Route.useLoaderData();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgSlug, setNewOrgSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const org = await createOrganization({
        name: newOrgName,
        slug: newOrgSlug,
      });
      navigate({ to: "/organizations/$orgId", params: { orgId: org.id } });
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.apiError.error.message);
      } else {
        setError("Failed to create organization");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground">
            Manage your organizations and their resources.
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4" />
          New Organization
        </Button>
      </div>

      {/* Create form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create Organization</CardTitle>
            <CardDescription>
              Organizations are workspaces that contain teams, vaults, and clients.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="My Organization"
                    value={newOrgName}
                    onChange={(e) => {
                      setNewOrgName(e.target.value);
                      if (!newOrgSlug || newOrgSlug === generateSlug(newOrgName)) {
                        setNewOrgSlug(generateSlug(e.target.value));
                      }
                    }}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    placeholder="my-organization"
                    value={newOrgSlug}
                    onChange={(e) => setNewOrgSlug(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setNewOrgName("");
                    setNewOrgSlug("");
                    setError(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Organizations list */}
      {organizations.length === 0 && !isCreating ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No organizations yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Create your first organization to get started.
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4" />
              Create Organization
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <OrganizationCard key={org.id} organization={org} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrganizationCard({ organization }: { organization: Organization }) {
  return (
    <Link to="/organizations/$orgId" params={{ orgId: organization.id }}>
      <Card className="transition-colors hover:bg-accent/50 cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{organization.name}</CardTitle>
              <CardDescription className="text-xs">
                {organization.slug}
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Created {formatRelativeTime(organization.created_at)}</span>
            {organization.suspended_at && (
              <span className="text-destructive">Suspended</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
