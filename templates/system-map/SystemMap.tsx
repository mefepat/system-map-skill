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
import { motion, AnimatePresence } from "framer-motion";
import SystemNode from "./SystemNode";
import SystemEdge from "./SystemEdge";
import CounterBar from "./CounterBar";
import { buildColumnLayout } from "./nodeLayout";
import { SYSTEM_EDGES, SYSTEM_NODES, type SystemCategory, type SystemNodeData } from "./data";
import type { SystemNodeRenderData } from "./types";
import { CATEGORY_META } from "./categoryMeta";

const nodeTypes = { system: SystemNode };
const edgeTypes = { system: SystemEdge };

export default function SystemMap() {
  const [activeCategory, setActiveCategory] = useState<SystemCategory | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const [baseNodes, setBaseNodes, onNodesChange] = useNodesState<Node<SystemNodeRenderData>>(
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
        const targetNode = SYSTEM_NODES.find((n) => n.id === edge.target);
        if (targetNode) outgoing.push(targetNode);
      }
    }
    return { incoming, outgoing };
  }, [selectedNodeId]);

  const connectedIds = useMemo(() => {
    if (!hoveredNodeId) return null;
    const ids = new Set<string>([hoveredNodeId]);
    for (const edge of SYSTEM_EDGES) {
      if (edge.source === hoveredNodeId) ids.add(edge.target);
      if (edge.target === hoveredNodeId) ids.add(edge.source);
    }
    return ids;
  }, [hoveredNodeId]);

  const nodes = useMemo<Node<SystemNodeRenderData>[]>(
    () =>
      baseNodes.map((node) => {
        let visualState: SystemNodeRenderData["visualState"] = "normal";
        if (hoveredNodeId) {
          visualState = connectedIds?.has(node.id) ? "focused" : "dimmed";
        } else if (activeCategory) {
          visualState = node.data.category === activeCategory ? "focused" : "dimmed";
        }
        return { ...node, data: { ...node.data, visualState } };
      }),
    [baseNodes, activeCategory, hoveredNodeId, connectedIds],
  );

  const edges = useMemo(() => {
    return SYSTEM_EDGES.map((edge) => {
      let visualState: SystemNodeRenderData["visualState"] = "normal";
      if (hoveredNodeId) {
        visualState =
          edge.source === hoveredNodeId || edge.target === hoveredNodeId ? "focused" : "dimmed";
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
  }, [activeCategory, hoveredNodeId]);

  const handleNodeMouseEnter = useCallback((_: React.MouseEvent, node: Node) => {
    setHoveredNodeId(node.id);
  }, []);

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNodeId(null);
  }, []);

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // Helper mapping for edge colors in case constants aren't fully resolved in edge compilation
  const EDGE_COLOR_MAP: Record<string, string> = {
    auth: "#f59e0b",
    data: "#34d399",
    ai: "#a78bfa",
    http: "#38bdf8",
    deploy: "#fb7185",
  };

  return (
    <div className={`system-map-container flex h-screen w-screen flex-col overflow-hidden text-slate-800 antialiased ${theme === "dark" ? "dark" : ""}`}>
      <CounterBar
        nodes={SYSTEM_NODES}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        theme={theme}
        onThemeToggle={handleThemeToggle}
      />

      <div className="relative flex-1 cursor-grab active:cursor-grabbing overflow-hidden">
        {/* Background ambient decorative blobs */}
        <div
          aria-hidden
          className="ambient-blob pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-violet-200/40 blur-3xl dark:bg-violet-900/10"
        />
        <div
          aria-hidden
          className="ambient-blob pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-900/10"
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
          className="system-tidy-btn absolute bottom-5 right-5 z-10 flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/90 px-3.5 py-2 text-[12px] font-medium text-slate-600 shadow-sm backdrop-blur-sm transition-colors hover:border-slate-300 hover:text-slate-900"
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
                className="system-details-drawer absolute right-0 top-0 bottom-0 z-30 flex h-full w-[384px] flex-col border-l border-slate-200 bg-white shadow-2xl transition-colors duration-200"
              >
                {/* Drawer Header */}
                <div className="system-details-drawer-header flex items-center justify-between border-b border-slate-100 p-5">
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
                    className="close-btn flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Drawer Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{selectedNode.title}</h2>
                    {selectedNode.subtitle && (
                      <p className="mt-0.5 font-mono text-[11px] text-slate-400">{selectedNode.subtitle}</p>
                    )}
                    {selectedNode.status === "planned" && (
                      <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-amber-500">
                        <Clock className="h-3 w-3" />
                        Planned Feature
                      </span>
                    )}
                  </div>

                  <div className="system-details-section border-t border-slate-100 pt-5 space-y-2">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Description</h4>
                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{selectedNode.description}</p>
                  </div>

                  {selectedNode.tags && selectedNode.tags.length > 0 && (
                    <div className="system-details-section border-t border-slate-100 pt-5 space-y-2.5">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tags</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedNode.tags.map((tag) => (
                          <span
                            key={tag}
                            className="tag-pill rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-600 transition-colors"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Incoming/Outgoing Connections */}
                  <div className="system-details-section border-t border-slate-100 pt-5 space-y-4">
                    {/* Incoming Connections */}
                    {connections.incoming.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Depends On (Inputs)</h4>
                        <div className="grid gap-1.5">
                          {connections.incoming.map((conn) => (
                            <button
                              key={conn.id}
                              type="button"
                              onClick={() => setSelectedNodeId(conn.id)}
                              className="connection-item-btn flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-2.5 text-left text-xs font-medium text-slate-700"
                            >
                              <span className="flex items-center gap-2">
                                {(() => {
                                  const ConnIcon = CATEGORY_META[conn.category].icon;
                                  return <ConnIcon className="h-3.5 w-3.5 text-slate-400" />;
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
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Connects To (Outputs)</h4>
                        <div className="grid gap-1.5">
                          {connections.outgoing.map((conn) => (
                            <button
                              key={conn.id}
                              type="button"
                              onClick={() => setSelectedNodeId(conn.id)}
                              className="connection-item-btn flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-2.5 text-left text-xs font-medium text-slate-700"
                            >
                              <span className="flex items-center gap-2">
                                {(() => {
                                  const ConnIcon = CATEGORY_META[conn.category].icon;
                                  return <ConnIcon className="h-3.5 w-3.5 text-slate-400" />;
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
