import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Loader2,
  MoreHorizontal,
  Plus,
  UserPlus,
  Users,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  getVault,
  getVaultUserGrants,
  getVaultTeamGrants,
  updateVault,
  deleteVault,
  createVaultUserGrant,
  updateVaultUserGrant,
  deleteVaultUserGrant,
  createVaultTeamGrant,
  updateVaultTeamGrant,
  deleteVaultTeamGrant,
} from "@/lib/vaults";
import { getOrgMembers } from "@/lib/organizations";
import { getTeams } from "@/lib/teams";
import { formatDateTime } from "@/lib/utils";
import type {
  Vault,
  VaultUserGrant,
  VaultTeamGrant,
  VaultRole,
  OrgMember,
  Team,
} from "@/types/api";

export const Route = createFileRoute(
  "/_authed/organizations/$orgId/vaults/$vaultId"
)({
  loader: async ({ params }) => {
    const [vault, userGrants, teamGrants, orgMembers, teams] =
      await Promise.all([
        getVault(params.orgId, params.vaultId),
        getVaultUserGrants(params.orgId, params.vaultId),
        getVaultTeamGrants(params.orgId, params.vaultId),
        getOrgMembers(params.orgId),
        getTeams(params.orgId),
      ]);
    return { vault, userGrants, teamGrants, orgMembers, teams };
  },
  component: VaultDetailPage,
});

const VAULT_ROLES: VaultRole[] = ["admin", "manager", "writer", "reader"];

function VaultDetailPage() {
  const navigate = useNavigate();
  const { orgId, vaultId } = Route.useParams();
  const {
    vault: initialVault,
    userGrants: initialUserGrants,
    teamGrants: initialTeamGrants,
    orgMembers,
    teams,
  } = Route.useLoaderData();

  const [vault, setVault] = useState<Vault>(initialVault);
  const [userGrants, setUserGrants] =
    useState<VaultUserGrant[]>(initialUserGrants);
  const [teamGrants, setTeamGrants] =
    useState<VaultTeamGrant[]>(initialTeamGrants);
  const [editName, setEditName] = useState(vault.name);
  const [editDescription, setEditDescription] = useState(
    vault.description || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // User grant dialog
  const [addUserGrantOpen, setAddUserGrantOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserRole, setSelectedUserRole] = useState<VaultRole>("reader");
  const [isAddingUserGrant, setIsAddingUserGrant] = useState(false);

  // Team grant dialog
  const [addTeamGrantOpen, setAddTeamGrantOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedTeamRole, setSelectedTeamRole] = useState<VaultRole>("reader");
  const [isAddingTeamGrant, setIsAddingTeamGrant] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [grantToDelete, setGrantToDelete] = useState<{
    type: "user" | "team";
    id: string;
    name: string;
  } | null>(null);
  const [isDeletingGrant, setIsDeletingGrant] = useState(false);

  const availableUsers = orgMembers.filter(
    (m: OrgMember) => !userGrants.some((g) => g.user_id === m.user_id)
  );
  const availableTeams = teams.filter(
    (t: Team) => !teamGrants.some((g) => g.team_id === t.id)
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const updated = await updateVault(orgId, vaultId, {
        name: editName,
        description: editDescription || undefined,
      });
      setVault(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update vault");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddUserGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsAddingUserGrant(true);

    try {
      const grant = await createVaultUserGrant(orgId, vaultId, {
        user_id: selectedUserId,
        role: selectedUserRole,
      });
      setUserGrants([...userGrants, grant]);
      setAddUserGrantOpen(false);
      setSelectedUserId("");
      setSelectedUserRole("reader");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add user grant");
    } finally {
      setIsAddingUserGrant(false);
    }
  };

  const handleAddTeamGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsAddingTeamGrant(true);

    try {
      const grant = await createVaultTeamGrant(orgId, vaultId, {
        team_id: selectedTeamId,
        role: selectedTeamRole,
      });
      setTeamGrants([...teamGrants, grant]);
      setAddTeamGrantOpen(false);
      setSelectedTeamId("");
      setSelectedTeamRole("reader");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add team grant");
    } finally {
      setIsAddingTeamGrant(false);
    }
  };

  const handleUpdateUserGrant = async (grantId: string, role: VaultRole) => {
    try {
      const updated = await updateVaultUserGrant(orgId, vaultId, grantId, {
        role,
      });
      setUserGrants(userGrants.map((g) => (g.id === grantId ? updated : g)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update grant");
    }
  };

  const handleUpdateTeamGrant = async (grantId: string, role: VaultRole) => {
    try {
      const updated = await updateVaultTeamGrant(orgId, vaultId, grantId, {
        role,
      });
      setTeamGrants(teamGrants.map((g) => (g.id === grantId ? updated : g)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update grant");
    }
  };

  const handleDeleteGrant = async () => {
    if (!grantToDelete) return;
    setIsDeletingGrant(true);

    try {
      if (grantToDelete.type === "user") {
        await deleteVaultUserGrant(orgId, vaultId, grantToDelete.id);
        setUserGrants(userGrants.filter((g) => g.id !== grantToDelete.id));
      } else {
        await deleteVaultTeamGrant(orgId, vaultId, grantToDelete.id);
        setTeamGrants(teamGrants.filter((g) => g.id !== grantToDelete.id));
      }
      setGrantToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete grant");
    } finally {
      setIsDeletingGrant(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteVault(orgId, vaultId);
      navigate({ to: `/organizations/${orgId}/vaults` });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete vault");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        to="/organizations/$orgId/vaults"
        params={{ orgId }}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Vaults
      </Link>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Vault Settings */}
      <Card>
        <form onSubmit={handleSave}>
          <CardHeader>
            <CardTitle>Vault Settings</CardTitle>
            <CardDescription>Manage vault name and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Vault Name</Label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    vault.suspended_at
                      ? "destructive"
                      : vault.sync_status === "synced"
                        ? "success"
                        : vault.sync_status === "pending"
                          ? "warning"
                          : "destructive"
                  }
                >
                  {vault.suspended_at
                    ? "Suspended"
                    : vault.sync_status === "synced"
                      ? "Active"
                      : vault.sync_status === "pending"
                        ? "Syncing"
                        : "Sync Failed"}
                </Badge>
              </div>
            </div>
          </CardContent>
          <div className="flex items-center justify-between border-t px-6 py-4">
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Vault
            </Button>
            <Button
              type="submit"
              disabled={
                isSaving ||
                (editName === vault.name &&
                  editDescription === (vault.description || ""))
              }
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Access Grants */}
      <Card>
        <CardHeader>
          <CardTitle>Access Grants</CardTitle>
          <CardDescription>
            Manage who can access this vault and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users">
            <TabsList>
              <TabsTrigger value="users">
                <UserPlus className="mr-2 h-4 w-4" />
                Users ({userGrants.length})
              </TabsTrigger>
              <TabsTrigger value="teams">
                <Users className="mr-2 h-4 w-4" />
                Teams ({teamGrants.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-4">
              <div className="flex justify-end mb-4">
                <Dialog
                  open={addUserGrantOpen}
                  onOpenChange={setAddUserGrantOpen}
                >
                  <DialogTrigger asChild>
                    <Button size="sm" disabled={availableUsers.length === 0}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleAddUserGrant}>
                      <DialogHeader>
                        <DialogTitle>Add User Grant</DialogTitle>
                        <DialogDescription>
                          Grant a user access to this vault
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="user">Select User</Label>
                          <select
                            id="user"
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            required
                          >
                            <option value="">Select a user...</option>
                            {availableUsers.map((m: OrgMember) => (
                              <option key={m.user_id} value={m.user_id}>
                                {m.user.name} ({m.user.email})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="role">Role</Label>
                          <Select
                            value={selectedUserRole}
                            onValueChange={(v) =>
                              setSelectedUserRole(v as VaultRole)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {VAULT_ROLES.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="submit"
                          disabled={isAddingUserGrant || !selectedUserId}
                        >
                          {isAddingUserGrant && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Add Grant
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {userGrants.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No user grants yet
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Granted</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userGrants.map((grant) => (
                      <TableRow key={grant.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{grant.user.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {grant.user.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={grant.role}
                            onValueChange={(v) =>
                              handleUpdateUserGrant(grant.id, v as VaultRole)
                            }
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {VAULT_ROLES.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDateTime(grant.created_at)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() =>
                                  setGrantToDelete({
                                    type: "user",
                                    id: grant.id,
                                    name: grant.user.name,
                                  })
                                }
                              >
                                Remove access
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="teams" className="mt-4">
              <div className="flex justify-end mb-4">
                <Dialog
                  open={addTeamGrantOpen}
                  onOpenChange={setAddTeamGrantOpen}
                >
                  <DialogTrigger asChild>
                    <Button size="sm" disabled={availableTeams.length === 0}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Team
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleAddTeamGrant}>
                      <DialogHeader>
                        <DialogTitle>Add Team Grant</DialogTitle>
                        <DialogDescription>
                          Grant a team access to this vault
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="team">Select Team</Label>
                          <select
                            id="team"
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                            value={selectedTeamId}
                            onChange={(e) => setSelectedTeamId(e.target.value)}
                            required
                          >
                            <option value="">Select a team...</option>
                            {availableTeams.map((t: Team) => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="teamRole">Role</Label>
                          <Select
                            value={selectedTeamRole}
                            onValueChange={(v) =>
                              setSelectedTeamRole(v as VaultRole)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {VAULT_ROLES.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="submit"
                          disabled={isAddingTeamGrant || !selectedTeamId}
                        >
                          {isAddingTeamGrant && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Add Grant
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {teamGrants.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No team grants yet
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Team</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Granted</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamGrants.map((grant) => (
                      <TableRow key={grant.id}>
                        <TableCell>
                          <p className="font-medium">{grant.team.name}</p>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={grant.role}
                            onValueChange={(v) =>
                              handleUpdateTeamGrant(grant.id, v as VaultRole)
                            }
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {VAULT_ROLES.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDateTime(grant.created_at)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() =>
                                  setGrantToDelete({
                                    type: "team",
                                    id: grant.id,
                                    name: grant.team.name,
                                  })
                                }
                              >
                                Remove access
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Vault"
        description={`Are you sure you want to delete "${vault.name}"? All policies and data will be permanently deleted.`}
        confirmText="Delete Vault"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={!!grantToDelete}
        onOpenChange={(open) => !open && setGrantToDelete(null)}
        title="Remove Access"
        description={`Are you sure you want to remove ${grantToDelete?.name}'s access to this vault?`}
        confirmText="Remove Access"
        variant="destructive"
        isLoading={isDeletingGrant}
        onConfirm={handleDeleteGrant}
      />
    </div>
  );
}
