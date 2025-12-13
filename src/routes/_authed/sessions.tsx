import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, Globe, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { getSessions, revokeSession, revokeOtherSessions } from "@/lib/auth";
import { formatRelativeTime } from "@/lib/utils";
import type { Session } from "@/types/api";

export const Route = createFileRoute("/_authed/sessions")({
  loader: async () => {
    const sessions = await getSessions();
    return { sessions };
  },
  component: SessionsPage,
});

function SessionsPage() {
  const { sessions: initialSessions } = Route.useLoaderData();
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [error, setError] = useState("");

  const [sessionToRevoke, setSessionToRevoke] = useState<Session | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [showRevokeAllConfirm, setShowRevokeAllConfirm] = useState(false);
  const [isRevokingAll, setIsRevokingAll] = useState(false);

  const getDeviceIcon = (userAgent: string | null) => {
    if (!userAgent) return Globe;
    if (userAgent.includes("Mobile") || userAgent.includes("Android")) {
      return Smartphone;
    }
    return Monitor;
  };

  const getDeviceName = (userAgent: string | null) => {
    if (!userAgent) return "Unknown device";
    if (userAgent.includes("Macintosh")) return "macOS";
    if (userAgent.includes("Windows")) return "Windows";
    if (userAgent.includes("Linux")) return "Linux";
    if (userAgent.includes("iPhone")) return "iPhone";
    if (userAgent.includes("Android")) return "Android";
    return "Unknown device";
  };

  const getBrowserName = (userAgent: string | null) => {
    if (!userAgent) return "Unknown browser";
    if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) return "Chrome";
    if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) return "Safari";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Edg")) return "Edge";
    return "Unknown browser";
  };

  const handleRevokeSession = async () => {
    if (!sessionToRevoke) return;
    setIsRevoking(true);
    setError("");

    try {
      await revokeSession(sessionToRevoke.id);
      setSessions(sessions.filter((s) => s.id !== sessionToRevoke.id));
      setSessionToRevoke(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke session");
    } finally {
      setIsRevoking(false);
    }
  };

  const handleRevokeAll = async () => {
    setIsRevokingAll(true);
    setError("");

    try {
      await revokeOtherSessions();
      setSessions(sessions.filter((s) => s.current));
      setShowRevokeAllConfirm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke sessions");
    } finally {
      setIsRevokingAll(false);
    }
  };

  const otherSessions = sessions.filter((s) => !s.current);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Active Sessions</h1>
        <p className="text-muted-foreground">
          Manage your active sessions and sign out from other devices.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>
            These are the devices currently logged into your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No active sessions found.
            </p>
          ) : (
            sessions.map((session) => {
              const DeviceIcon = getDeviceIcon(session.user_agent);
              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <DeviceIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {getDeviceName(session.user_agent)} &middot;{" "}
                          {getBrowserName(session.user_agent)}
                        </p>
                        {session.current && (
                          <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{session.ip_address || "Unknown IP"}</span>
                        <span>&middot;</span>
                        <span>
                          Last active {formatRelativeTime(session.last_active_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!session.current && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => setSessionToRevoke(session)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Revoke session</span>
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {otherSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sign out everywhere</CardTitle>
            <CardDescription>
              This will sign you out from all devices except this one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => setShowRevokeAllConfirm(true)}
            >
              Sign out all other sessions
            </Button>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={!!sessionToRevoke}
        onOpenChange={(open) => !open && setSessionToRevoke(null)}
        title="Revoke Session"
        description={`This will sign out the ${getDeviceName(sessionToRevoke?.user_agent ?? null)} device. Any unsaved work on that device may be lost.`}
        confirmText="Revoke Session"
        variant="destructive"
        isLoading={isRevoking}
        onConfirm={handleRevokeSession}
      />

      <ConfirmDialog
        open={showRevokeAllConfirm}
        onOpenChange={setShowRevokeAllConfirm}
        title="Sign Out All Other Sessions"
        description={`This will sign out ${otherSessions.length} other session${otherSessions.length === 1 ? "" : "s"}. Any unsaved work on those devices may be lost.`}
        confirmText="Sign Out All"
        variant="destructive"
        isLoading={isRevokingAll}
        onConfirm={handleRevokeAll}
      />
    </div>
  );
}
