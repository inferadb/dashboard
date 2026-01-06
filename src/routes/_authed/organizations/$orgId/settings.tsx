import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { updateOrganization, deleteOrganization } from "@/lib/organizations";
import type { Organization } from "@/types/api";

export const Route = createFileRoute("/_authed/organizations/$orgId/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const { orgId } = Route.useParams();
  const { organization } = Route.useRouteContext() as {
    organization: Organization;
  };

  const [name, setName] = useState(organization.name);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      await updateOrganization(orgId, { name });
      setSuccess("Organization updated successfully");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update organization"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteOrganization(orgId);
      navigate({ to: "/organizations" });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete organization"
      );
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-900 dark:bg-green-900/20 dark:text-green-100">
          {success}
        </div>
      )}

      {/* General Settings */}
      <Card>
        <form onSubmit={handleSave}>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>
              Basic information about this organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={organization.slug} disabled />
              <p className="text-xs text-muted-foreground">
                The slug cannot be changed after creation
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="id">Organization ID</Label>
              <Input id="id" value={organization.id} disabled />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={isSaving || name === organization.name}
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-destructive/50 p-4">
            <div>
              <p className="font-medium">Delete this organization</p>
              <p className="text-sm text-muted-foreground">
                Once deleted, all data will be permanently removed
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Organization
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Organization"
        description={`Are you sure you want to delete "${organization.name}"? This action cannot be undone. All vaults, teams, and data will be permanently deleted.`}
        confirmText="Delete Organization"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
