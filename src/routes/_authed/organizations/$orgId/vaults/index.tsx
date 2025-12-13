import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Plus, Vault } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getVaults, createVault } from "@/lib/vaults";
import { formatDateTime } from "@/lib/utils";
import { CardGridSkeleton } from "@/components/loading-skeletons";
import type { Vault as VaultType, VaultSyncStatus } from "@/types/api";

export const Route = createFileRoute(
  "/_authed/organizations/$orgId/vaults/"
)({
  loader: async ({ params }) => {
    const vaults = await getVaults(params.orgId);
    return { vaults };
  },
  component: VaultsPage,
  pendingComponent: () => <CardGridSkeleton count={3} />,
});

function getStatusBadge(status: VaultSyncStatus, suspended: boolean) {
  if (suspended) {
    return <Badge variant="destructive">Suspended</Badge>;
  }
  switch (status) {
    case "synced":
      return <Badge variant="success">Active</Badge>;
    case "pending":
      return <Badge variant="warning">Syncing</Badge>;
    case "sync_failed":
      return <Badge variant="destructive">Sync Failed</Badge>;
  }
}

function VaultsPage() {
  const { orgId } = Route.useParams();
  const { vaults: initialVaults } = Route.useLoaderData();

  const [vaults, setVaults] = useState<VaultType[]>(initialVaults);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsCreating(true);

    try {
      const vault = await createVault(orgId, {
        name,
        description: description || undefined,
      });
      setVaults([...vaults, vault]);
      setCreateOpen(false);
      setName("");
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create vault");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Vaults</h2>
          <p className="text-sm text-muted-foreground">
            Isolated environments for your authorization data
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Vault
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create Vault</DialogTitle>
                <DialogDescription>
                  Create a new vault to store authorization policies and data
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Vault Name</Label>
                  <Input
                    id="name"
                    placeholder="production"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input
                    id="description"
                    placeholder="Production environment vault"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isCreating}>
                  {isCreating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Vault
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {vaults.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Vault className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No vaults yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Create a vault to start storing authorization policies
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vaults.map((vault) => (
            <Link
              key={vault.id}
              to="/organizations/$orgId/vaults/$vaultId"
              params={{ orgId, vaultId: vault.id }}
              className="block"
            >
              <Card className="transition-colors hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Vault className="h-5 w-5" />
                      {vault.name}
                    </CardTitle>
                    {getStatusBadge(vault.sync_status, !!vault.suspended_at)}
                  </div>
                  {vault.description && (
                    <CardDescription>{vault.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Created {formatDateTime(vault.created_at)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
