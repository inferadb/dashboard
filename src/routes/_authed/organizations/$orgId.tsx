import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Building2, Key, Settings, Users, Vault } from "lucide-react";
import { cn } from "@/lib/utils";
import { getOrganization } from "@/lib/organizations";

export const Route = createFileRoute("/_authed/organizations/$orgId")({
  loader: async ({ params }) => {
    const organization = await getOrganization(params.orgId);
    return { organization };
  },
  component: OrganizationLayout,
});

const tabs = [
  { name: "Overview", href: "", icon: Building2 },
  { name: "Members", href: "/members", icon: Users },
  { name: "Teams", href: "/teams", icon: Users },
  { name: "Vaults", href: "/vaults", icon: Vault },
  { name: "Clients", href: "/clients", icon: Key },
  { name: "Settings", href: "/settings", icon: Settings },
];

function OrganizationLayout() {
  const { organization } = Route.useLoaderData();
  const { orgId } = Route.useParams();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Building2 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {organization.name}
          </h1>
          <p className="text-muted-foreground text-sm">{organization.slug}</p>
        </div>
        {organization.suspended_at && (
          <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
            Suspended
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex gap-x-6 overflow-x-auto">
          {tabs.map((tab) => {
            const href =
              tab.href === ""
                ? `/organizations/${orgId}`
                : `/organizations/${orgId}${tab.href}`;
            return (
              <Link
                key={tab.name}
                to={href}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors",
                  "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                  "[&.active]:border-primary [&.active]:text-foreground"
                )}
                activeOptions={{ exact: tab.href === "" }}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <Outlet />
    </div>
  );
}
