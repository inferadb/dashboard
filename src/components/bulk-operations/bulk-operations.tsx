import { useState, useCallback, useMemo } from "react";
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
// Dialog components are available but not used in current implementation
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileUp,
  Loader2,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/confirm-dialog";

// Tuple type for bulk operations
export interface Tuple {
  subject_type: string;
  subject_id: string;
  relation: string;
  object_type: string;
  object_id: string;
}

// Operation result
export interface OperationResult {
  success: boolean;
  message: string;
  tuple?: Tuple;
}

export interface BulkOperationsProps {
  onImport: (tuples: Tuple[]) => Promise<OperationResult[]>;
  onBulkDelete: (tuples: Tuple[]) => Promise<OperationResult[]>;
  existingTuples?: Tuple[];
  className?: string;
}

// CSV headers for tuple format
const CSV_HEADERS = [
  "subject_type",
  "subject_id",
  "relation",
  "object_type",
  "object_id",
];

// Parse CSV to tuples
function parseCSV(content: string): {
  tuples: Tuple[];
  errors: string[];
} {
  const lines = content.trim().split("\n");
  const tuples: Tuple[] = [];
  const errors: string[] = [];

  if (lines.length === 0) {
    errors.push("Empty CSV file");
    return { tuples, errors };
  }

  // Parse header
  const headerLine = lines[0].toLowerCase().replace(/"/g, "");
  const headers = headerLine.split(",").map((h) => h.trim());

  // Validate headers
  const missingHeaders = CSV_HEADERS.filter((h) => !headers.includes(h));
  if (missingHeaders.length > 0) {
    errors.push(`Missing required headers: ${missingHeaders.join(", ")}`);
    return { tuples, errors };
  }

  // Get column indices
  const indices = {
    subject_type: headers.indexOf("subject_type"),
    subject_id: headers.indexOf("subject_id"),
    relation: headers.indexOf("relation"),
    object_type: headers.indexOf("object_type"),
    object_id: headers.indexOf("object_id"),
  };

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle quoted CSV values
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    if (values.length < 5) {
      errors.push(`Line ${i + 1}: Not enough columns`);
      continue;
    }

    const tuple: Tuple = {
      subject_type: values[indices.subject_type],
      subject_id: values[indices.subject_id],
      relation: values[indices.relation],
      object_type: values[indices.object_type],
      object_id: values[indices.object_id],
    };

    // Validate required fields
    if (
      !tuple.subject_type ||
      !tuple.subject_id ||
      !tuple.relation ||
      !tuple.object_type ||
      !tuple.object_id
    ) {
      errors.push(`Line ${i + 1}: Missing required field(s)`);
      continue;
    }

    tuples.push(tuple);
  }

  return { tuples, errors };
}

// Generate CSV from tuples
function tuplesToCSV(tuples: Tuple[]): string {
  const lines = [CSV_HEADERS.join(",")];

  for (const tuple of tuples) {
    const values = [
      tuple.subject_type,
      tuple.subject_id,
      tuple.relation,
      tuple.object_type,
      tuple.object_id,
    ].map((v) => (v.includes(",") ? `"${v}"` : v));
    lines.push(values.join(","));
  }

  return lines.join("\n");
}

// Download CSV template
function downloadTemplate() {
  const template = `subject_type,subject_id,relation,object_type,object_id
User,user-123,member,Group,group-456
User,user-789,owner,Document,doc-abc`;

  const blob = new Blob([template], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tuples-template.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function BulkOperations({
  onImport,
  onBulkDelete,
  existingTuples = [],
  className,
}: BulkOperationsProps) {
  const [activeTab, setActiveTab] = useState("import");

  // Import state
  const [parsedTuples, setParsedTuples] = useState<Tuple[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<OperationResult[]>([]);
  const [showImportPreview, setShowImportPreview] = useState(false);

  // Delete state
  const [selectedForDelete, setSelectedForDelete] = useState<Set<string>>(
    new Set()
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteResults, setDeleteResults] = useState<OperationResult[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteFilter, setDeleteFilter] = useState("");

  // Handle file selection
  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setImportResults([]);

      const content = await file.text();
      const { tuples, errors } = parseCSV(content);

      setParsedTuples(tuples);
      setParseErrors(errors);
      setShowImportPreview(true);
    },
    []
  );

  // Handle import
  const handleImport = useCallback(async () => {
    if (parsedTuples.length === 0) return;

    setIsImporting(true);
    try {
      const results = await onImport(parsedTuples);
      setImportResults(results);
    } finally {
      setIsImporting(false);
    }
  }, [parsedTuples, onImport]);

  // Handle delete selection
  const handleToggleDelete = useCallback((tupleKey: string) => {
    setSelectedForDelete((prev) => {
      const next = new Set(prev);
      if (next.has(tupleKey)) {
        next.delete(tupleKey);
      } else {
        next.add(tupleKey);
      }
      return next;
    });
  }, []);

  // Handle select all for delete
  const handleSelectAll = useCallback(() => {
    const filteredTuples = existingTuples.filter(
      (t) =>
        !deleteFilter ||
        t.subject_type.toLowerCase().includes(deleteFilter.toLowerCase()) ||
        t.subject_id.toLowerCase().includes(deleteFilter.toLowerCase()) ||
        t.relation.toLowerCase().includes(deleteFilter.toLowerCase()) ||
        t.object_type.toLowerCase().includes(deleteFilter.toLowerCase()) ||
        t.object_id.toLowerCase().includes(deleteFilter.toLowerCase())
    );

    setSelectedForDelete((prev) => {
      if (prev.size === filteredTuples.length) {
        return new Set();
      }
      return new Set(filteredTuples.map(tupleToKey));
    });
  }, [existingTuples, deleteFilter]);

  // Handle bulk delete
  const handleBulkDelete = useCallback(async () => {
    const tuplesToDelete = existingTuples.filter((t) =>
      selectedForDelete.has(tupleToKey(t))
    );

    if (tuplesToDelete.length === 0) return;

    setIsDeleting(true);
    try {
      const results = await onBulkDelete(tuplesToDelete);
      setDeleteResults(results);
      setSelectedForDelete(new Set());
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [existingTuples, selectedForDelete, onBulkDelete]);

  // Filter existing tuples
  const filteredTuples = useMemo(() => {
    if (!deleteFilter) return existingTuples;
    const term = deleteFilter.toLowerCase();
    return existingTuples.filter(
      (t) =>
        t.subject_type.toLowerCase().includes(term) ||
        t.subject_id.toLowerCase().includes(term) ||
        t.relation.toLowerCase().includes(term) ||
        t.object_type.toLowerCase().includes(term) ||
        t.object_id.toLowerCase().includes(term)
    );
  }, [existingTuples, deleteFilter]);

  // Export existing tuples
  const handleExport = useCallback(() => {
    const csv = tuplesToCSV(existingTuples);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tuples-export.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [existingTuples]);

  // Import success/failure counts
  const importSuccessCount = importResults.filter((r) => r.success).length;
  const importFailureCount = importResults.filter((r) => !r.success).length;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Bulk Operations</CardTitle>
        <CardDescription>
          Import tuples from CSV or delete multiple tuples at once
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </TabsTrigger>
            <TabsTrigger value="delete">
              <Trash2 className="mr-2 h-4 w-4" />
              Bulk Delete
            </TabsTrigger>
          </TabsList>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="csv-file" className="sr-only">
                  CSV File
                </Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
              </div>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Template
              </Button>
            </div>

            {parseErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside">
                    {parseErrors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {showImportPreview && parsedTuples.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">
                    Preview ({parsedTuples.length} tuples)
                  </h4>
                  <Button onClick={handleImport} disabled={isImporting}>
                    {isImporting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileUp className="mr-2 h-4 w-4" />
                    )}
                    Import All
                  </Button>
                </div>

                <div className="max-h-64 overflow-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Relation</TableHead>
                        <TableHead>Object</TableHead>
                        {importResults.length > 0 && (
                          <TableHead>Status</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedTuples.slice(0, 100).map((tuple, i) => {
                        const result = importResults[i];
                        return (
                          <TableRow key={i}>
                            <TableCell>
                              <span className="text-muted-foreground">
                                {tuple.subject_type}:
                              </span>
                              {tuple.subject_id}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{tuple.relation}</Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-muted-foreground">
                                {tuple.object_type}:
                              </span>
                              {tuple.object_id}
                            </TableCell>
                            {importResults.length > 0 && (
                              <TableCell>
                                {result?.success ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                  <span
                                    className="flex items-center gap-1 text-destructive"
                                    title={result?.message}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </span>
                                )}
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {parsedTuples.length > 100 && (
                  <p className="text-sm text-muted-foreground">
                    Showing first 100 of {parsedTuples.length} tuples
                  </p>
                )}

                {importResults.length > 0 && (
                  <div className="flex gap-2">
                    <Badge variant="success">
                      {importSuccessCount} successful
                    </Badge>
                    {importFailureCount > 0 && (
                      <Badge variant="destructive">
                        {importFailureCount} failed
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Delete Tab */}
          <TabsContent value="delete" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Filter tuples..."
                  value={deleteFilter}
                  onChange={(e) => setDeleteFilter(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={selectedForDelete.size === 0}
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete ({selectedForDelete.size})
              </Button>
            </div>

            <div className="max-h-96 overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={
                          selectedForDelete.size === filteredTuples.length &&
                          filteredTuples.length > 0
                        }
                        onChange={handleSelectAll}
                        className="rounded border-input"
                      />
                    </TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Relation</TableHead>
                    <TableHead>Object</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTuples.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground"
                      >
                        No tuples found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTuples.slice(0, 100).map((tuple) => {
                      const key = tupleToKey(tuple);
                      return (
                        <TableRow
                          key={key}
                          className={cn(
                            selectedForDelete.has(key) && "bg-destructive/10"
                          )}
                        >
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedForDelete.has(key)}
                              onChange={() => handleToggleDelete(key)}
                              className="rounded border-input"
                            />
                          </TableCell>
                          <TableCell>
                            <span className="text-muted-foreground">
                              {tuple.subject_type}:
                            </span>
                            {tuple.subject_id}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{tuple.relation}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-muted-foreground">
                              {tuple.object_type}:
                            </span>
                            {tuple.object_id}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {filteredTuples.length > 100 && (
              <p className="text-sm text-muted-foreground">
                Showing first 100 of {filteredTuples.length} tuples
              </p>
            )}

            {deleteResults.length > 0 && (
              <div className="flex gap-2">
                <Badge variant="success">
                  {deleteResults.filter((r) => r.success).length} deleted
                </Badge>
                {deleteResults.filter((r) => !r.success).length > 0 && (
                  <Badge variant="destructive">
                    {deleteResults.filter((r) => !r.success).length} failed
                  </Badge>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Confirm Bulk Delete"
        description={`Are you sure you want to delete ${selectedForDelete.size} tuple${selectedForDelete.size !== 1 ? "s" : ""}? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleBulkDelete}
      />
    </Card>
  );
}

// Helper to create unique key for tuple
function tupleToKey(tuple: Tuple): string {
  return `${tuple.subject_type}:${tuple.subject_id}#${tuple.relation}@${tuple.object_type}:${tuple.object_id}`;
}

export default BulkOperations;
