import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Copy,
  Loader2,
  MoreHorizontal,
  Plus,
  ShieldAlert,
} from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  getClient,
  getCertificates,
  updateClient,
  deleteClient,
  deactivateClient,
  activateClient,
  createCertificate,
  revokeCertificate,
} from "@/lib/clients";
import { formatDateTime } from "@/lib/utils";
import type {
  Client,
  ClientCertificate,
  CreateCertificateResponse,
} from "@/types/api";

export const Route = createFileRoute(
  "/_authed/organizations/$orgId/clients/$clientId"
)({
  loader: async ({ params }) => {
    const [client, certificates] = await Promise.all([
      getClient(params.orgId, params.clientId),
      getCertificates(params.orgId, params.clientId),
    ]);
    return { client, certificates };
  },
  component: ClientDetailPage,
});

function ClientDetailPage() {
  const navigate = useNavigate();
  const { orgId, clientId } = Route.useParams();
  const { client: initialClient, certificates: initialCertificates } =
    Route.useLoaderData();

  const [client, setClient] = useState<Client>(initialClient);
  const [certificates, setCertificates] =
    useState<ClientCertificate[]>(initialCertificates);
  const [editName, setEditName] = useState(client.name);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const [createCertOpen, setCreateCertOpen] = useState(false);
  const [certName, setCertName] = useState("");
  const [isCreatingCert, setIsCreatingCert] = useState(false);
  const [newCert, setNewCert] = useState<CreateCertificateResponse | null>(
    null
  );

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [certToRevoke, setCertToRevoke] = useState<ClientCertificate | null>(
    null
  );
  const [isRevoking, setIsRevoking] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const updated = await updateClient(orgId, clientId, { name: editName });
      setClient(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update client");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsCreatingCert(true);

    try {
      const result = await createCertificate(orgId, clientId, {
        name: certName,
      });
      setNewCert(result);
      setCertificates([...certificates, result.certificate]);
      setCertName("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create certificate"
      );
    } finally {
      setIsCreatingCert(false);
    }
  };

  const handleRevokeCertificate = async () => {
    if (!certToRevoke) return;
    setIsRevoking(true);

    try {
      await revokeCertificate(orgId, clientId, certToRevoke.id);
      setCertificates(
        certificates.map((c) =>
          c.id === certToRevoke.id ? { ...c, is_active: false } : c
        )
      );
      setCertToRevoke(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to revoke certificate"
      );
    } finally {
      setIsRevoking(false);
    }
  };

  const handleDeactivate = async () => {
    setIsDeactivating(true);

    try {
      await deactivateClient(orgId, clientId);
      setClient({ ...client, is_active: false });
      setShowDeactivateConfirm(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to deactivate client"
      );
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleActivate = async () => {
    setIsActivating(true);

    try {
      await activateClient(orgId, clientId);
      setClient({ ...client, is_active: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to activate client"
      );
    } finally {
      setIsActivating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteClient(orgId, clientId);
      navigate({ to: `/organizations/${orgId}/clients` });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete client");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <Link
        to="/organizations/$orgId/clients"
        params={{ orgId }}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Clients
      </Link>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* New Certificate Alert */}
      {newCert && (
        <Alert variant="warning">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Save your private key!</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-2">
              This is the only time you'll see this private key. Copy it now and
              store it securely.
            </p>
            <div className="flex items-center gap-2 rounded-md bg-muted p-2 font-mono text-xs">
              <code className="flex-1 break-all">{newCert.private_key}</code>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => copyToClipboard(newCert.private_key)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button size="sm" className="mt-2" onClick={() => setNewCert(null)}>
              I've saved the private key
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Client Settings */}
      <Card>
        <form onSubmit={handleSave}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Client Settings</CardTitle>
                <CardDescription>
                  Manage client name and settings
                </CardDescription>
              </div>
              <Badge variant={client.is_active ? "success" : "secondary"}>
                {client.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Client Name</Label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>
            {client.description && (
              <div className="grid gap-2">
                <Label>Description</Label>
                <p className="text-sm text-muted-foreground">
                  {client.description}
                </p>
              </div>
            )}
            <div className="grid gap-2">
              <Label>Client ID</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-md bg-muted px-3 py-2 font-mono text-sm">
                  {client.id}
                </code>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(client.id)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
          <div className="flex items-center justify-between border-t px-6 py-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Client
              </Button>
              {client.is_active ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeactivateConfirm(true)}
                >
                  Deactivate
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleActivate}
                  disabled={isActivating}
                >
                  {isActivating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Activate
                </Button>
              )}
            </div>
            <Button
              type="submit"
              disabled={isSaving || editName === client.name}
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Certificates */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Certificates</CardTitle>
            <CardDescription>
              Ed25519 certificates for client authentication
            </CardDescription>
          </div>
          <Dialog
            open={createCertOpen}
            onOpenChange={(open) => {
              setCreateCertOpen(open);
              if (!open) setNewCert(null);
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Certificate
              </Button>
            </DialogTrigger>
            <DialogContent>
              {!newCert ? (
                <form onSubmit={handleCreateCertificate}>
                  <DialogHeader>
                    <DialogTitle>Create Certificate</DialogTitle>
                    <DialogDescription>
                      Generate a new Ed25519 certificate for this client
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="certName">Certificate Name</Label>
                      <Input
                        id="certName"
                        placeholder="production-key"
                        value={certName}
                        onChange={(e) => setCertName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isCreatingCert}>
                      {isCreatingCert && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Create Certificate
                    </Button>
                  </DialogFooter>
                </form>
              ) : (
                <>
                  <DialogHeader>
                    <DialogTitle>Certificate Created</DialogTitle>
                    <DialogDescription>
                      Save the private key now - it won't be shown again
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid gap-2">
                      <Label>Key ID (kid)</Label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 rounded-md bg-muted px-3 py-2 font-mono text-xs">
                          {newCert.certificate.kid}
                        </code>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() =>
                            copyToClipboard(newCert.certificate.kid)
                          }
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Private Key (Ed25519)</Label>
                      <div className="flex items-start gap-2">
                        <code className="flex-1 break-all rounded-md bg-destructive/10 px-3 py-2 font-mono text-xs">
                          {newCert.private_key}
                        </code>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => copyToClipboard(newCert.private_key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-destructive">
                        This is the only time you'll see this key!
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => setCreateCertOpen(false)}>
                      Done
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {certificates.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No certificates yet. Create one to enable authentication.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificates.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell className="font-medium">{cert.name}</TableCell>
                    <TableCell>
                      <code className="text-xs">{cert.kid}</code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={cert.is_active ? "success" : "secondary"}>
                        {cert.is_active ? "Active" : "Revoked"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(cert.created_at)}
                    </TableCell>
                    <TableCell>
                      {cert.is_active && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setCertToRevoke(cert)}
                            >
                              Revoke certificate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Client"
        description={`Are you sure you want to delete "${client.name}"? All certificates will be revoked and the client will lose API access.`}
        confirmText="Delete Client"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={showDeactivateConfirm}
        onOpenChange={setShowDeactivateConfirm}
        title="Deactivate Client"
        description={`Are you sure you want to deactivate "${client.name}"? The client will lose API access until reactivated.`}
        confirmText="Deactivate"
        variant="destructive"
        isLoading={isDeactivating}
        onConfirm={handleDeactivate}
      />

      <ConfirmDialog
        open={!!certToRevoke}
        onOpenChange={(open) => !open && setCertToRevoke(null)}
        title="Revoke Certificate"
        description={`Are you sure you want to revoke "${certToRevoke?.name}"? This action cannot be undone.`}
        confirmText="Revoke"
        variant="destructive"
        isLoading={isRevoking}
        onConfirm={handleRevokeCertificate}
      />
    </div>
  );
}
