import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, Globe, Trash2 } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import type { Session } from "@/types/api";

export const Route = createFileRoute("/_authed/sessions")({
  component: SessionsPage,
});

// Mock sessions for now - will be replaced with actual API call
const mockSessions: Session[] = [
  {
    id: "1",
    user_id: "1",
    ip_address: "192.168.1.1",
    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    last_active_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    current: true,
  },
];

function SessionsPage() {
  const [sessions] = useState<Session[]>(mockSessions);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Active Sessions</h1>
        <p className="text-muted-foreground">
          Manage your active sessions and sign out from other devices.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>
            These are the devices currently logged into your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessions.map((session) => {
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
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Revoke session</span>
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sign out everywhere</CardTitle>
          <CardDescription>
            This will sign you out from all devices except this one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" disabled>
            Sign out all other sessions
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Session management API coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
