import { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  MarkerType,
  Panel,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Download,
  Maximize2,
  Minimize2,
  Search,
  RefreshCw,
} from "lucide-react";

// Types for relationships
export interface Relationship {
  id: string;
  subject_type: string;
  subject_id: string;
  relation: string;
  object_type: string;
  object_id: string;
}

export interface RelationshipGraphProps {
  relationships: Relationship[];
  onRelationshipClick?: (relationship: Relationship) => void;
  onNodeClick?: (nodeId: string, nodeType: string) => void;
  className?: string;
}

// Node types with custom colors
const NODE_COLORS: Record<string, string> = {
  User: "#3b82f6", // blue
  Group: "#8b5cf6", // purple
  Document: "#10b981", // green
  Folder: "#f59e0b", // amber
  Organization: "#ef4444", // red
  Team: "#ec4899", // pink
  Resource: "#6366f1", // indigo
  default: "#64748b", // slate
};

// Custom node component
function EntityNode({
  data,
}: {
  data: { label: string; type: string; count: number };
}) {
  const color = NODE_COLORS[data.type] || NODE_COLORS.default;

  return (
    <div
      className="px-4 py-2 rounded-lg border-2 bg-card shadow-md min-w-[120px]"
      style={{ borderColor: color }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="font-medium text-sm">{data.label}</span>
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        {data.type} ({data.count})
      </div>
    </div>
  );
}

const nodeTypes = {
  entity: EntityNode,
};

// Convert relationships to graph nodes and edges
function relationshipsToGraph(relationships: Relationship[]): {
  nodes: Node[];
  edges: Edge[];
} {
  const nodeMap = new Map<string, { type: string; count: number }>();
  const edges: Edge[] = [];

  // Build node map with counts
  for (const rel of relationships) {
    const subjectKey = `${rel.subject_type}:${rel.subject_id}`;
    const objectKey = `${rel.object_type}:${rel.object_id}`;

    if (!nodeMap.has(subjectKey)) {
      nodeMap.set(subjectKey, { type: rel.subject_type, count: 0 });
    }
    nodeMap.get(subjectKey)!.count++;

    if (!nodeMap.has(objectKey)) {
      nodeMap.set(objectKey, { type: rel.object_type, count: 0 });
    }
    nodeMap.get(objectKey)!.count++;

    // Create edge
    edges.push({
      id: rel.id,
      source: subjectKey,
      target: objectKey,
      label: rel.relation,
      type: "smoothstep",
      animated: false,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "#64748b",
      },
      style: { stroke: "#64748b", strokeWidth: 2 },
      labelStyle: { fill: "#64748b", fontSize: 12 },
      labelBgStyle: { fill: "var(--card)", fillOpacity: 0.9 },
    });
  }

  // Convert node map to nodes with positions
  const nodes: Node[] = [];
  const nodesByType = new Map<string, string[]>();

  // Group nodes by type
  for (const [key, data] of nodeMap) {
    const type = data.type;
    if (!nodesByType.has(type)) {
      nodesByType.set(type, []);
    }
    nodesByType.get(type)!.push(key);
  }

  // Position nodes in a grid layout by type
  let typeIndex = 0;
  for (const [, keys] of nodesByType) {
    keys.forEach((key, index) => {
      const data = nodeMap.get(key)!;
      const [, id] = key.split(":");

      nodes.push({
        id: key,
        type: "entity",
        position: {
          x: typeIndex * 300 + 50,
          y: index * 100 + 50,
        },
        data: {
          label: id.length > 20 ? `${id.slice(0, 8)}...${id.slice(-8)}` : id,
          type: data.type,
          count: data.count,
        },
      });
    });
    typeIndex++;
  }

  return { nodes, edges };
}

export function RelationshipGraph({
  relationships,
  onRelationshipClick,
  onNodeClick,
  className,
}: RelationshipGraphProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => relationshipsToGraph(relationships),
    [relationships]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

  // Get unique entity types
  const entityTypes = useMemo(() => {
    const types = new Set<string>();
    for (const rel of relationships) {
      types.add(rel.subject_type);
      types.add(rel.object_type);
    }
    return Array.from(types).sort();
  }, [relationships]);

  // Filter nodes based on search and type
  const filteredGraph = useMemo(() => {
    let filteredRels = relationships;

    if (filterType !== "all") {
      filteredRels = filteredRels.filter(
        (r) => r.subject_type === filterType || r.object_type === filterType
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredRels = filteredRels.filter(
        (r) =>
          r.subject_id.toLowerCase().includes(term) ||
          r.object_id.toLowerCase().includes(term) ||
          r.relation.toLowerCase().includes(term)
      );
    }

    return relationshipsToGraph(filteredRels);
  }, [relationships, filterType, searchTerm]);

  // Update nodes when filter changes
  useMemo(() => {
    setNodes(filteredGraph.nodes);
    setEdges(filteredGraph.edges);
  }, [filteredGraph, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
      setSelectedEdge(null);
      const [type, id] = node.id.split(":");
      onNodeClick?.(id, type);
    },
    [onNodeClick]
  );

  const handleEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      setSelectedEdge(edge);
      setSelectedNode(null);
      const rel = relationships.find((r) => r.id === edge.id);
      if (rel) {
        onRelationshipClick?.(rel);
      }
    },
    [relationships, onRelationshipClick]
  );

  // Export as SVG
  const handleExport = useCallback(() => {
    const svgElement = document.querySelector(".react-flow__viewport");
    if (!svgElement) return;

    // Create a canvas and export
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("width", "1920");
    svg.setAttribute("height", "1080");
    svg.innerHTML = svgElement.innerHTML;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "relationship-graph.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  // Reset layout
  const handleResetLayout = useCallback(() => {
    setNodes(filteredGraph.nodes);
    setEdges(filteredGraph.edges);
  }, [filteredGraph, setNodes, setEdges]);

  return (
    <div
      className={cn(
        "relative border rounded-lg bg-card",
        isFullscreen && "fixed inset-0 z-50",
        className
      )}
      style={{ height: isFullscreen ? "100vh" : "600px" }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(node) => {
            const type = (node.data as { type: string }).type;
            return NODE_COLORS[type] || NODE_COLORS.default;
          }}
          maskColor="rgba(0, 0, 0, 0.2)"
          className="bg-card border"
        />

        {/* Toolbar */}
        <Panel position="top-left" className="flex items-center gap-2 p-2">
          <div className="flex items-center gap-2 bg-card border rounded-lg p-2 shadow-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 w-48 text-sm"
            />
          </div>

          <div className="bg-card border rounded-lg p-2 shadow-sm">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-8 w-36 text-sm">
                <SelectValue placeholder="Filter type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {entityTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleResetLayout}
            title="Reset layout"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            title="Export as SVG"
          >
            <Download className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </Panel>

        {/* Stats */}
        <Panel position="top-right" className="p-2">
          <div className="bg-card border rounded-lg p-3 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{nodes.length} nodes</Badge>
              <Badge variant="outline">{edges.length} edges</Badge>
            </div>
            <div className="flex flex-wrap gap-1">
              {entityTypes.map((type) => (
                <Badge
                  key={type}
                  className="text-xs"
                  style={{
                    backgroundColor: NODE_COLORS[type] || NODE_COLORS.default,
                    color: "white",
                  }}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        </Panel>

        {/* Node/Edge details */}
        <Panel position="bottom-right" className="p-2">
          {selectedNode && (
            <Card className="w-64 shadow-lg">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">Node Details</CardTitle>
              </CardHeader>
              <CardContent className="py-2 px-4 text-sm space-y-1">
                <div>
                  <span className="text-muted-foreground">Type:</span>{" "}
                  {(selectedNode.data as { type: string }).type}
                </div>
                <div>
                  <span className="text-muted-foreground">ID:</span>{" "}
                  {selectedNode.id.split(":")[1]}
                </div>
                <div>
                  <span className="text-muted-foreground">Connections:</span>{" "}
                  {(selectedNode.data as { count: number }).count}
                </div>
              </CardContent>
            </Card>
          )}

          {selectedEdge && (
            <Card className="w-64 shadow-lg">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">Relationship Details</CardTitle>
              </CardHeader>
              <CardContent className="py-2 px-4 text-sm space-y-1">
                <div>
                  <span className="text-muted-foreground">Relation:</span>{" "}
                  {selectedEdge.label}
                </div>
                <div>
                  <span className="text-muted-foreground">From:</span>{" "}
                  {selectedEdge.source}
                </div>
                <div>
                  <span className="text-muted-foreground">To:</span>{" "}
                  {selectedEdge.target}
                </div>
              </CardContent>
            </Card>
          )}
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default RelationshipGraph;
