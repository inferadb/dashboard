import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Loader2, MoreHorizontal, UserPlus } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  getTeam,
  getTeamMembers,
  updateTeam,
  deleteTeam,
  addTeamMember,
  updateTeamMember,
  removeTeamMember,
} from "@/lib/teams";
import { getOrgMembers } from "@/lib/organizations";
import { formatDateTime } from "@/lib/utils";
import type { Team, TeamMember, OrgMember } from "@/types/api";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authed/organizations/$orgId/teams/$teamId"
)({
  loader: async ({ params }) => {
    const [team, members, orgMembers] = await Promise.all([
      getTeam(params.orgId, params.teamId),
      getTeamMembers(params.orgId, params.teamId),
      getOrgMembers(params.orgId),
    ]);
    return { team, members, orgMembers };
  },
  component: TeamDetailPage,
});

function TeamDetailPage() {
  const navigate = useNavigate();
  const { orgId, teamId } = Route.useParams();
  const {
    team: initialTeam,
    members: initialMembers,
    orgMembers,
  } = Route.useLoaderData();

  const [team, setTeam] = useState<Team>(initialTeam);
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [editName, setEditName] = useState(team.name);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isManager, setIsManager] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const availableMembers = orgMembers.filter(
    (om: OrgMember) => !members.some((m) => m.user_id === om.user_id)
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const updated = await updateTeam(orgId, teamId, { name: editName });
      setTeam(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update team");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsAdding(true);

    try {
      const member = await addTeamMember(orgId, teamId, {
        user_id: selectedUserId,
        is_manager: isManager,
      });
      setMembers([...members, member]);
      setAddMemberOpen(false);
      setSelectedUserId("");
      setIsManager(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleManager = async (member: TeamMember) => {
    try {
      const updated = await updateTeamMember(orgId, teamId, member.user_id, {
        manager: !member.is_manager,
      });
      setMembers(members.map((m) => (m.user_id === member.user_id ? updated : m)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update member");
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    setIsRemoving(true);

    try {
      await removeTeamMember(orgId, teamId, memberToRemove.user_id);
      setMembers(members.filter((m) => m.user_id !== memberToRemove.user_id));
      setMemberToRemove(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove member");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteTeam(orgId, teamId);
      navigate({ to: `/organizations/${orgId}/teams` });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete team");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        to="/organizations/$orgId/teams"
        params={{ orgId }}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Teams
      </Link>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Team Settings */}
      <Card>
        <form onSubmit={handleSave}>
          <CardHeader>
            <CardTitle>Team Settings</CardTitle>
            <CardDescription>Manage team name and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>
            {team.description && (
              <div className="grid gap-2">
                <Label>Description</Label>
                <p className="text-sm text-muted-foreground">
                  {team.description}
                </p>
              </div>
            )}
          </CardContent>
          <div className="flex items-center justify-between border-t px-6 py-4">
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Team
            </Button>
            <Button type="submit" disabled={isSaving || editName === team.name}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Members</CardTitle>
            <CardDescription>People in this team</CardDescription>
          </div>
          <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
            <DialogTrigger asChild>
              <Button disabled={availableMembers.length === 0}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleAddMember}>
                <DialogHeader>
                  <DialogTitle>Add Team Member</DialogTitle>
                  <DialogDescription>
                    Add an organization member to this team
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="member">Select Member</Label>
                    <select
                      id="member"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      required
                    >
                      <option value="">Select a member...</option>
                      {availableMembers.map((m: OrgMember) => (
                        <option key={m.user_id} value={m.user_id}>
                          {m.user.name} ({m.user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="manager"
                      checked={isManager}
                      onChange={(e) => setIsManager(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="manager">Make team manager</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isAdding || !selectedUserId}>
                    {isAdding && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Add Member
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No members in this team yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Added</TableHead>
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
                      <Badge variant={member.is_manager ? "default" : "outline"}>
                        {member.is_manager ? "Manager" : "Member"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(member.created_at)}
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
                            onClick={() => handleToggleManager(member)}
                          >
                            {member.is_manager
                              ? "Remove manager role"
                              : "Make manager"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setMemberToRemove(member)}
                          >
                            Remove from team
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
        title="Delete Team"
        description={`Are you sure you want to delete "${team.name}"? This will remove all team grants from vaults.`}
        confirmText="Delete Team"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={!!memberToRemove}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
        title="Remove Member"
        description={`Are you sure you want to remove ${memberToRemove?.user.name} from this team?`}
        confirmText="Remove"
        variant="destructive"
        isLoading={isRemoving}
        onConfirm={handleRemoveMember}
      />
    </div>
  );
}
