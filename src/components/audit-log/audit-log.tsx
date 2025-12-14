import { useState, useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  List,
  RefreshCw,
  Search,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateTime, formatRelativeTime } from "@/lib/utils";

// Audit log entry types
export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "evaluate"
  | "schema.deploy"
  | "schema.rollback"
  | "login"
  | "logout";

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor_type: "user" | "client" | "system";
  actor_id: string;
  actor_name?: string;
  action: AuditAction;
  resource_type: string;
  resource_id: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  vault_id?: string;
  success: boolean;
}

export interface AuditLogProps {
  entries: AuditEntry[];
  onRefresh?: () => void;
  onExport?: (entries: AuditEntry[]) => void;
  isLoading?: boolean;
  className?: string;
}

// Action colors and labels
const ACTION_CONFIG: Record<
  AuditAction,
  { label: string; variant: "default" | "success" | "warning" | "destructive" }
> = {
  create: { label: "Create", variant: "success" },
  update: { label: "Update", variant: "default" },
  delete: { label: "Delete", variant: "destructive" },
  evaluate: { label: "Evaluate", variant: "default" },
  "schema.deploy": { label: "Deploy Schema", variant: "success" },
  "schema.rollback": { label: "Rollback Schema", variant: "warning" },
  login: { label: "Login", variant: "default" },
  logout: { label: "Logout", variant: "default" },
};

// Timeline entry component
function TimelineEntry({ entry }: { entry: AuditEntry }) {
  const config = ACTION_CONFIG[entry.action] || {
    label: entry.action,
    variant: "default" as const,
  };

  return (
    <div className="relative pl-8 pb-6 border-l-2 border-border last:border-l-0">
      <div
        className={cn(
          "absolute left-0 w-4 h-4 rounded-full -translate-x-[9px] border-2 border-background",
          entry.success ? "bg-green-500" : "bg-red-500"
        )}
      />
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">
            {entry.actor_name || entry.actor_id}
          </span>
          <Badge variant={config.variant}>{config.label}</Badge>
          <span className="text-muted-foreground">
            {entry.resource_type}:{entry.resource_id}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          {formatRelativeTime(entry.timestamp)}
          {entry.ip_address && <span className="ml-2">from {entry.ip_address}</span>}
        </div>
      </div>
    </div>
  );
}

export function AuditLog({
  entries,
  onRefresh,
  onExport,
  isLoading = false,
  className,
}: AuditLogProps) {
  const [viewMode, setViewMode] = useState<"table" | "timeline">("table");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "timestamp", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);

  // Filter entries by action
  const filteredEntries = useMemo(() => {
    if (actionFilter === "all") return entries;
    return entries.filter((e) => e.action === actionFilter);
  }, [entries, actionFilter]);

  // Unique actions for filter
  const uniqueActions = useMemo(() => {
    const actions = new Set(entries.map((e) => e.action));
    return Array.from(actions).sort();
  }, [entries]);

  // Table columns
  const columns: ColumnDef<AuditEntry>[] = useMemo(
    () => [
      {
        accessorKey: "timestamp",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Timestamp
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span>{formatDateTime(row.original.timestamp)}</span>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(row.original.timestamp)}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "actor_name",
        header: "Actor",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span>{row.original.actor_name || row.original.actor_id}</span>
            <span className="text-xs text-muted-foreground">
              {row.original.actor_type}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => {
          const config = ACTION_CONFIG[row.original.action] || {
            label: row.original.action,
            variant: "default" as const,
          };
          return <Badge variant={config.variant}>{config.label}</Badge>;
        },
        filterFn: (row, _id, filterValue) => {
          return filterValue === "all" || row.original.action === filterValue;
        },
      },
      {
        accessorKey: "resource_type",
        header: "Resource",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span>{row.original.resource_type}</span>
            <span className="text-xs text-muted-foreground font-mono">
              {row.original.resource_id.length > 20
                ? `${row.original.resource_id.slice(0, 8)}...${row.original.resource_id.slice(-8)}`
                : row.original.resource_id}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "success",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.success ? "success" : "destructive"}>
            {row.original.success ? "Success" : "Failed"}
          </Badge>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedEntry(row.original)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredEntries,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Export handler
  const handleExport = useCallback(() => {
    if (onExport) {
      onExport(filteredEntries);
    } else {
      // Default CSV export
      const headers = [
        "timestamp",
        "actor_type",
        "actor_id",
        "actor_name",
        "action",
        "resource_type",
        "resource_id",
        "success",
        "ip_address",
      ];
      const rows = filteredEntries.map((e) => [
        e.timestamp,
        e.actor_type,
        e.actor_id,
        e.actor_name || "",
        e.action,
        e.resource_type,
        e.resource_id,
        e.success ? "true" : "false",
        e.ip_address || "",
      ]);

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join(
        "\n"
      );

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [filteredEntries, onExport]);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Audit Log</CardTitle>
            <CardDescription>
              Track all changes and access events
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "table" | "timeline")}>
              <TabsList className="h-8">
                <TabsTrigger value="table" className="px-2">
                  <List className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="timeline" className="px-2">
                  <Clock className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search audit logs..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-40">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {uniqueActions.map((action) => {
                const config = ACTION_CONFIG[action as AuditAction];
                return (
                  <SelectItem key={action} value={action}>
                    {config?.label || action}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Content */}
        {viewMode === "table" ? (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No audit entries found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}{" "}
                of {table.getFilteredRowModel().rows.length} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Timeline View */
          <div className="max-h-[600px] overflow-auto pl-4 pt-4">
            {filteredEntries.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No audit entries found.
              </p>
            ) : (
              filteredEntries
                .sort(
                  (a, b) =>
                    new Date(b.timestamp).getTime() -
                    new Date(a.timestamp).getTime()
                )
                .map((entry) => (
                  <TimelineEntry key={entry.id} entry={entry} />
                ))
            )}
          </div>
        )}
      </CardContent>

      {/* Entry Details Dialog */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Audit Entry Details</DialogTitle>
            <DialogDescription>
              {selectedEntry && formatDateTime(selectedEntry.timestamp)}
            </DialogDescription>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Action</Label>
                  <div>
                    <Badge
                      variant={
                        ACTION_CONFIG[selectedEntry.action]?.variant || "default"
                      }
                    >
                      {ACTION_CONFIG[selectedEntry.action]?.label ||
                        selectedEntry.action}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div>
                    <Badge
                      variant={selectedEntry.success ? "success" : "destructive"}
                    >
                      {selectedEntry.success ? "Success" : "Failed"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Actor</Label>
                  <div>{selectedEntry.actor_name || selectedEntry.actor_id}</div>
                  <div className="text-xs text-muted-foreground">
                    {selectedEntry.actor_type}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Resource</Label>
                  <div>{selectedEntry.resource_type}</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {selectedEntry.resource_id}
                  </div>
                </div>
                {selectedEntry.ip_address && (
                  <div>
                    <Label className="text-muted-foreground">IP Address</Label>
                    <div className="font-mono">{selectedEntry.ip_address}</div>
                  </div>
                )}
                {selectedEntry.vault_id && (
                  <div>
                    <Label className="text-muted-foreground">Vault</Label>
                    <div className="font-mono">{selectedEntry.vault_id}</div>
                  </div>
                )}
              </div>
              {selectedEntry.details && (
                <div>
                  <Label className="text-muted-foreground">Details</Label>
                  <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs">
                    {JSON.stringify(selectedEntry.details, null, 2)}
                  </pre>
                </div>
              )}
              {selectedEntry.user_agent && (
                <div>
                  <Label className="text-muted-foreground">User Agent</Label>
                  <div className="text-xs text-muted-foreground mt-1">
                    {selectedEntry.user_agent}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default AuditLog;
