import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Key, Loader2, Plus } from "lucide-react";
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
import { getClients, createClient } from "@/lib/clients";
import { formatDateTime } from "@/lib/utils";
import { CardGridSkeleton } from "@/components/loading-skeletons";
import type { Client } from "@/types/api";

export const Route = createFileRoute(
  "/_authed/organizations/$orgId/clients/"
)({
  loader: async ({ params }) => {
    const clients = await getClients(params.orgId);
    return { clients };
  },
  component: ClientsPage,
  pendingComponent: () => <CardGridSkeleton count={3} />,
});

function ClientsPage() {
  const { orgId } = Route.useParams();
  const { clients: initialClients } = Route.useLoaderData();

  const [clients, setClients] = useState<Client[]>(initialClients);
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
      const client = await createClient(orgId, {
        name,
        description: description || undefined,
      });
      setClients([...clients, client]);
      setCreateOpen(false);
      setName("");
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create client");
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
          <h2 className="text-lg font-semibold">Clients</h2>
          <p className="text-sm text-muted-foreground">
            Machine identities for API access
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create Client</DialogTitle>
                <DialogDescription>
                  Create a new client for machine-to-machine authentication
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Client Name</Label>
                  <Input
                    id="name"
                    placeholder="backend-service"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input
                    id="description"
                    placeholder="Backend API service"
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
                  Create Client
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {clients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Key className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No clients yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Create a client to enable machine-to-machine API access
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Link
              key={client.id}
              to="/organizations/$orgId/clients/$clientId"
              params={{ orgId, clientId: client.id }}
              className="block"
            >
              <Card className="transition-colors hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      {client.name}
                    </CardTitle>
                    <Badge variant={client.is_active ? "success" : "secondary"}>
                      {client.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {client.description && (
                    <CardDescription>{client.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Created {formatDateTime(client.created_at)}
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
