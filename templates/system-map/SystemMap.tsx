"use client";

import "@xyflow/react/dist/style.css";
import "./system-map.css";

import { useCallback, useMemo, useState } from "react";
import {
  Background,
  BackgroundVariant,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  type Node,
  MarkerType,
} from "@xyflow/react";
import { LayoutGrid, X, ArrowRight, Clock } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import SystemNode from "./SystemNode";
import SystemEdge from "./SystemEdge";
import ColumnGroup from "./ColumnGroup";
import CounterBar from "./CounterBar";
import { buildColumnLayout } from "./nodeLayout";
import { SYSTEM_EDGES, SYSTEM_NODES, type SystemCategory, type SystemNodeData } from "./data";
import type { SystemNodeRenderData, SystemMapNode } from "./types";
import { CATEGORY_META } from "./categoryMeta";

const nodeTypes = { system: SystemNode, group: ColumnGroup };
const edgeTypes = { system: SystemEdge };

const EDGE_COLOR_MAP: Record<string, string> = {
  auth: "#f59e0b",
  data: "#34d399",
  ai: "#a78bfa",
  http: "#38bdf8",
  deploy: "#fb7185",
};

export default function SystemMap() {
  const [activeCategory, setActiveCategory] = useState<SystemCategory | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [searchQuery, setSearchQuery] = useState("");

  const [baseNodes, setBaseNodes, onNodesChange] = useNodesState<SystemMapNode>(
    useMemo(() => buildColumnLayout(SYSTEM_NODES), []),
  );

  const handleTidy = useCallback(() => {
    setBaseNodes(buildColumnLayout(SYSTEM_NODES));
  }, [setBaseNodes]);

  const handleThemeToggle = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const selectedNode = useMemo(() => {
    return SYSTEM_NODES.find((n) => n.id === selectedNodeId) || null;
  }, [selectedNodeId]);

  // Find incoming and outgoing connections for the selected node
  const connections = useMemo(() => {
    if (!selectedNodeId) return { incoming: [], outgoing: [] };
    const incoming: SystemNodeData[] = [];
    const outgoing: SystemNodeData[] = [];

    for (const edge of SYSTEM_EDGES) {
      if (edge.target === selectedNodeId) {
        const sourceNode = SYSTEM_NODES.find((n) => n.id === edge.source);
        if (sourceNode) incoming.push(sourceNode);
      }
      if (edge.source === selectedNodeId) {
        const realTarget = SYSTEM_NODES.find((n) => n.id === edge.target);
        if (realTarget) outgoing.push(realTarget);
      }
    }
    return { incoming, outgoing };
  }, [selectedNodeId]);

  // Search logic
  const isSearching = searchQuery.trim().length > 0;
  const matchingNodeIds = useMemo(() => {
    if (!isSearching) return null;
    const query = searchQuery.toLowerCase();
    const matches = new Set<string>();

    for (const n of SYSTEM_NODES) {
      const titleMatch = n.title.toLowerCase().includes(query);
      const descMatch = n.description.toLowerCase().includes(query);
      const subMatch = n.subtitle?.toLowerCase().includes(query) || false;
      const tagMatch = n.tags?.some((t) => t.toLowerCase().includes(query)) || false;
      const catMatch = n.category.toLowerCase().includes(query);

      if (titleMatch || descMatch || subMatch || tagMatch || catMatch) {
        matches.add(n.id);
      }
    }
    return matches;
  }, [searchQuery, isSearching]);

  // Flow path highlights (Upstream & Downstream tracing)
  const tracedPaths = useMemo(() => {
    if (!hoveredNodeId) return null;
    const nodes = new Set<string>([hoveredNodeId]);
    const edges = new Set<string>();

    // Downstream recursive trace
    const traceDownstream = (currentId: string) => {
      for (const edge of SYSTEM_EDGES) {
        if (edge.source === currentId && !nodes.has(edge.target)) {
          nodes.add(edge.target);
          edges.add(edge.id);
          traceDownstream(edge.target);
        }
      }
    };

    // Upstream recursive trace
    const traceUpstream = (currentId: string) => {
      for (const edge of SYSTEM_EDGES) {
        if (edge.target === currentId && !nodes.has(edge.source)) {
          nodes.add(edge.source);
          edges.add(edge.id);
          traceUpstream(edge.source);
        }
      }
    };

    traceDownstream(hoveredNodeId);
    traceUpstream(hoveredNodeId);

    return { nodes, edges };
  }, [hoveredNodeId]);

  const nodes = useMemo<SystemMapNode[]>(
    () =>
      baseNodes.map((node) => {
        if (node.type === "group") return node; // column group stays static

        let visualState: SystemNodeRenderData["visualState"] = "normal";
        if (hoveredNodeId) {
          visualState = tracedPaths?.nodes.has(node.id) ? "focused" : "dimmed";
        } else if (isSearching) {
          visualState = matchingNodeIds?.has(node.id) ? "focused" : "dimmed";
        } else if (activeCategory) {
          visualState = node.data.category === activeCategory ? "focused" : "dimmed";
        }
        return { ...node, data: { ...node.data, visualState } };
      }),
    [baseNodes, activeCategory, hoveredNodeId, tracedPaths, isSearching, matchingNodeIds],
  );

  const edges = useMemo(() => {
    return SYSTEM_EDGES.map((edge) => {
      let visualState: SystemNodeRenderData["visualState"] = "normal";
      if (hoveredNodeId) {
        visualState = tracedPaths?.edges.has(edge.id) ? "focused" : "dimmed";
      } else if (isSearching) {
        const sourceMatches = matchingNodeIds?.has(edge.source);
        const targetMatches = matchingNodeIds?.has(edge.target);
        visualState = sourceMatches && targetMatches ? "focused" : "dimmed";
      } else if (activeCategory) {
        const sourceNode = SYSTEM_NODES.find((n) => n.id === edge.source);
        const targetNode = SYSTEM_NODES.find((n) => n.id === edge.target);
        const touchesCategory =
          sourceNode?.category === activeCategory || targetNode?.category === activeCategory;
        visualState = touchesCategory ? "normal" : "dimmed";
      }
      const color = EDGE_COLOR_MAP[edge.kind];
      return {
        ...edge,
        type: "system",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color,
          width: 9,
          height: 9,
        },
        data: { ...edge, visualState },
      };
    });
  }, [activeCategory, hoveredNodeId, tracedPaths, isSearching, matchingNodeIds]);

  const handleNodeMouseEnter = useCallback((_: unknown, node: Node) => {
    if (node.type === "group") return;
    setHoveredNodeId(node.id);
  }, []);

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNodeId(null);
  }, []);

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.type === "group") return;
    setSelectedNodeId(node.id);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  return (
    <div className={`system-map-container flex h-screen w-screen flex-col overflow-hidden text-slate-800 antialiased ${theme === "dark" ? "dark" : ""}`}>
      <CounterBar
        nodes={SYSTEM_NODES}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        theme={theme}
        onThemeToggle={handleThemeToggle}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="relative flex-1 cursor-grab active:cursor-grabbing overflow-hidden">
        {/* Background ambient decorative blobs */}
        <div
          aria-hidden
          className="ambient-blob pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-violet-200/40 blur-3xl"
        />
        <div
          aria-hidden
          className="ambient-blob pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-sky-200/40 blur-3xl"
          style={{ animationDelay: "-9s" }}
        />

        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onNodeMouseEnter={handleNodeMouseEnter}
            onNodeMouseLeave={handleNodeMouseLeave}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
            colorMode={theme}
            nodesDraggable
            nodesConnectable={false}
            elementsSelectable
            panOnDrag
            zoomOnScroll
            minZoom={0.4}
            maxZoom={1.5}
            fitView
            fitViewOptions={{ padding: 0.12 }}
            proOptions={{ hideAttribution: false }}
          >
            <Background variant={BackgroundVariant.Dots} gap={28} size={1} color={theme === "dark" ? "#334155" : "#e2e8f0"} />
          </ReactFlow>
        </ReactFlowProvider>

        {/* Floating Tidy Button */}
        <button
          type="button"
          onClick={handleTidy}
          className="system-tidy-btn absolute bottom-5 right-5 z-10 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-medium shadow-sm backdrop-blur-sm transition-colors"
        >
          <LayoutGrid className="h-3.5 w-3.5" strokeWidth={2.25} />
          Tidy
        </button>

        {/* Selected Node Details Drawer */}
        <AnimatePresence>
          {selectedNode && (
            <>
              {/* Dark Overlay backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedNodeId(null)}
                className="absolute inset-0 z-20 bg-slate-900/40 backdrop-blur-xs cursor-pointer"
              />

              {/* Slide-over Drawer Panel */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                className="system-details-drawer absolute right-0 top-0 bottom-0 z-30 flex h-full w-[384px] flex-col shadow-2xl transition-colors duration-200"
              >
                {/* Drawer Header */}
                <div className="system-details-drawer-header flex items-center justify-between p-5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                      CATEGORY_META[selectedNode.category].badge
                    }`}
                  >
                    {(() => {
                      const CatIcon = CATEGORY_META[selectedNode.category].icon;
                      return <CatIcon className="h-3 w-3" strokeWidth={2.25} />;
                    })()}
                    {selectedNode.category.replace("_", " ")}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedNodeId(null)}
                    className="close-btn flex h-7 w-7 items-center justify-center rounded-full transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Drawer Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold">{selectedNode.title}</h2>
                    {selectedNode.subtitle && (
                      <p className="drawer-subtitle mt-0.5 font-mono text-[11px]">{selectedNode.subtitle}</p>
                    )}
                    {selectedNode.status === "planned" && (
                      <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-amber-500">
                        <Clock className="h-3 w-3" />
                        Planned Feature
                      </span>
                    )}
                  </div>

                  <div className="system-details-section pt-5 space-y-2">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider">Description</h4>
                    <p className="drawer-description text-xs leading-relaxed">{selectedNode.description}</p>
                  </div>

                  {selectedNode.tags && selectedNode.tags.length > 0 && (
                    <div className="system-details-section pt-5 space-y-2.5">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider">Tags</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedNode.tags.map((tag) => (
                          <span
                            key={tag}
                            className="tag-pill rounded-full border px-2 py-0.5 text-[10px] transition-colors"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Incoming/Outgoing Connections */}
                  <div className="system-details-section pt-5 space-y-4">
                    {/* Incoming Connections */}
                    {connections.incoming.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider">Depends On (Inputs)</h4>
                        <div className="grid gap-1.5">
                          {connections.incoming.map((conn) => (
                            <button
                              key={conn.id}
                              type="button"
                              onClick={() => setSelectedNodeId(conn.id)}
                              className="connection-item-btn flex items-center justify-between rounded-lg p-2.5 text-left text-xs font-medium"
                            >
                              <span className="flex items-center gap-2">
                                {(() => {
                                  const ConnIcon = CATEGORY_META[conn.category].icon;
                                  return <ConnIcon className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />;
                                })()}
                                {conn.title}
                              </span>
                              <ArrowRight className="h-3 w-3 opacity-40" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Outgoing Connections */}
                    {connections.outgoing.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider">Connects To (Outputs)</h4>
                        <div className="grid gap-1.5">
                          {connections.outgoing.map((conn) => (
                            <button
                              key={conn.id}
                              type="button"
                              onClick={() => setSelectedNodeId(conn.id)}
                              className="connection-item-btn flex items-center justify-between rounded-lg p-2.5 text-left text-xs font-medium"
                            >
                              <span className="flex items-center gap-2">
                                {(() => {
                                  const ConnIcon = CATEGORY_META[conn.category].icon;
                                  return <ConnIcon className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />;
                                })()}
                                {conn.title}
                              </span>
                              <ArrowRight className="h-3 w-3 opacity-40" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
