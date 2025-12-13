import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Mail, MoreHorizontal, UserPlus } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  getOrgMembers,
  getOrgInvitations,
  inviteMember,
  cancelInvitation,
  updateMemberRole,
  removeMember,
} from "@/lib/organizations";
import { formatDateTime } from "@/lib/utils";
import type { OrgMember, OrgInvitation, OrgRole } from "@/types/api";

export const Route = createFileRoute("/_authed/organizations/$orgId/members")({
  loader: async ({ params }) => {
    const [members, invitations] = await Promise.all([
      getOrgMembers(params.orgId),
      getOrgInvitations(params.orgId),
    ]);
    return { members, invitations };
  },
  component: MembersPage,
});

function MembersPage() {
  const { orgId } = Route.useParams();
  const { members: initialMembers, invitations: initialInvitations } =
    Route.useLoaderData();

  const [members, setMembers] = useState<OrgMember[]>(initialMembers);
  const [invitations, setInvitations] =
    useState<OrgInvitation[]>(initialInvitations);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState("");

  const [confirmRemove, setConfirmRemove] = useState<OrgMember | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [confirmCancelInvite, setConfirmCancelInvite] =
    useState<OrgInvitation | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsInviting(true);

    try {
      const invitation = await inviteMember(orgId, {
        email: inviteEmail,
        role: inviteRole,
      });
      setInvitations([...invitations, invitation]);
      setInviteOpen(false);
      setInviteEmail("");
      setInviteRole("member");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invitation");
    } finally {
      setIsInviting(false);
    }
  };

  const handleCancelInvitation = async () => {
    if (!confirmCancelInvite) return;
    setIsCanceling(true);

    try {
      await cancelInvitation(orgId, confirmCancelInvite.id);
      setInvitations(invitations.filter((i) => i.id !== confirmCancelInvite.id));
      setConfirmCancelInvite(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel invitation");
    } finally {
      setIsCanceling(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: "admin" | "member") => {
    try {
      const updated = await updateMemberRole(orgId, userId, newRole);
      setMembers(members.map((m) => (m.user_id === userId ? updated : m)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    }
  };

  const handleRemoveMember = async () => {
    if (!confirmRemove) return;
    setIsRemoving(true);

    try {
      await removeMember(orgId, confirmRemove.user_id);
      setMembers(members.filter((m) => m.user_id !== confirmRemove.user_id));
      setConfirmRemove(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove member");
    } finally {
      setIsRemoving(false);
    }
  };

  const getRoleBadgeVariant = (role: OrgRole) => {
    switch (role) {
      case "owner":
        return "default";
      case "admin":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Members Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Members</CardTitle>
            <CardDescription>
              People who have access to this organization
            </CardDescription>
          </div>
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleInvite}>
                <DialogHeader>
                  <DialogTitle>Invite Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to join this organization
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="colleague@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={inviteRole}
                      onValueChange={(v) => setInviteRole(v as "admin" | "member")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isInviting}>
                    {isInviting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Send Invitation
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.user_id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{member.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.user.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(member.role)}>
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(member.created_at)}
                  </TableCell>
                  <TableCell>
                    {member.role !== "owner" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              handleRoleChange(
                                member.user_id,
                                member.role === "admin" ? "member" : "admin"
                              )
                            }
                          >
                            Make {member.role === "admin" ? "Member" : "Admin"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setConfirmRemove(member)}
                          >
                            Remove from organization
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>
              Invitations that haven't been accepted yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {invitation.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{invitation.role}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(invitation.expires_at)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmCancelInvite(invitation)}
                      >
                        Cancel
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Confirm Remove Dialog */}
      <ConfirmDialog
        open={!!confirmRemove}
        onOpenChange={(open) => !open && setConfirmRemove(null)}
        title="Remove Member"
        description={`Are you sure you want to remove ${confirmRemove?.user.name} from this organization? They will lose access to all resources.`}
        confirmText="Remove"
        variant="destructive"
        isLoading={isRemoving}
        onConfirm={handleRemoveMember}
      />

      {/* Confirm Cancel Invitation Dialog */}
      <ConfirmDialog
        open={!!confirmCancelInvite}
        onOpenChange={(open) => !open && setConfirmCancelInvite(null)}
        title="Cancel Invitation"
        description={`Are you sure you want to cancel the invitation sent to ${confirmCancelInvite?.email}?`}
        confirmText="Cancel Invitation"
        variant="destructive"
        isLoading={isCanceling}
        onConfirm={handleCancelInvitation}
      />
    </div>
  );
}
