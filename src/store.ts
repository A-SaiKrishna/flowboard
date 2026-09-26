import { create } from "zustand";
import {
  type Edge,
  type Node,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from "@xyflow/react";
import { createNodeId } from "./nodeId";

export type FlowNodeData = {
  label: string;
  nodeType: "start" | "action" | "condition" | "end";
};

export type FlowNode = Node<FlowNodeData>;

type Snapshot = {
  nodes: FlowNode[];
  edges: Edge[];
};

type FlowState = {
  nodes: FlowNode[];
  edges: Edge[];
  past: Snapshot[];
  future: Snapshot[];
  onNodesChange: OnNodesChange<FlowNode>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (nodeType: FlowNodeData["nodeType"]) => void;
  deleteSelected: () => void;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
  exportJson: () => string;
  importJson: (raw: string) => void;
  hydrateFromStorage: () => void;
  persist: () => void;
};

const STORAGE_KEY = "flowboard-v1";

const defaultNodes: FlowNode[] = [
  {
    id: "start-1",
    type: "flow",
    position: { x: 80, y: 120 },
    data: { label: "Start", nodeType: "start" },
  },
  {
    id: "action-1",
    type: "flow",
    position: { x: 320, y: 120 },
    data: { label: "Send email", nodeType: "action" },
  },
  {
    id: "end-1",
    type: "flow",
    position: { x: 560, y: 120 },
    data: { label: "End", nodeType: "end" },
  },
];

const defaultEdges: Edge[] = [
  { id: "e-start-action", source: "start-1", target: "action-1" },
  { id: "e-action-end", source: "action-1", target: "end-1" },
];

export const labelFor = (nodeType: FlowNodeData["nodeType"]) => {
  switch (nodeType) {
    case "start":
      return "Start";
    case "action":
      return "Action";
    case "condition":
      return "Condition";
    case "end":
      return "End";
  }
};

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: defaultNodes,
  edges: defaultEdges,
  past: [],
  future: [],

  pushHistory: () => {
    const { nodes, edges, past } = get();
    set({
      past: [...past.slice(-49), { nodes, edges }],
      future: [],
    });
  },

  onNodesChange: (changes) => {
    const meaningful = changes.some(
      (c) =>
        c.type === "remove" ||
        c.type === "add" ||
        (c.type === "position" && c.dragging === false),
    );
    if (meaningful) get().pushHistory();
    set({ nodes: applyNodeChanges(changes, get().nodes) });
    get().persist();
  },

  onEdgesChange: (changes) => {
    const meaningful = changes.some(
      (c) => c.type === "remove" || c.type === "add",
    );
    if (meaningful) get().pushHistory();
    set({ edges: applyEdgeChanges(changes, get().edges) });
    get().persist();
  },

  onConnect: (connection) => {
    get().pushHistory();
    set({ edges: addEdge(connection, get().edges) });
    get().persist();
  },

  addNode: (nodeType) => {
    get().pushHistory();
    const id = createNodeId(nodeType);
    const node: FlowNode = {
      id,
      type: "flow",
      position: { x: 120 + Math.random() * 280, y: 80 + Math.random() * 220 },
      data: { label: labelFor(nodeType), nodeType },
    };
    set({ nodes: [...get().nodes, node] });
    get().persist();
  },

  deleteSelected: () => {
    const { nodes, edges } = get();
    const selectedNodeIds = new Set(
      nodes.filter((n) => n.selected).map((n) => n.id),
    );
    const selectedEdgeIds = new Set(
      edges.filter((e) => e.selected).map((e) => e.id),
    );
    if (selectedNodeIds.size === 0 && selectedEdgeIds.size === 0) return;
    get().pushHistory();
    set({
      nodes: nodes.filter((n) => !selectedNodeIds.has(n.id)),
      edges: edges.filter(
        (e) =>
          !selectedEdgeIds.has(e.id) &&
          !selectedNodeIds.has(e.source) &&
          !selectedNodeIds.has(e.target),
      ),
    });
    get().persist();
  },

  undo: () => {
    const { past, nodes, edges, future } = get();
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    set({
      past: past.slice(0, -1),
      future: [{ nodes, edges }, ...future],
      nodes: previous.nodes,
      edges: previous.edges,
    });
    get().persist();
  },

  redo: () => {
    const { past, nodes, edges, future } = get();
    if (future.length === 0) return;
    const next = future[0];
    set({
      past: [...past, { nodes, edges }],
      future: future.slice(1),
      nodes: next.nodes,
      edges: next.edges,
    });
    get().persist();
  },

  exportJson: () => {
    const { nodes, edges } = get();
    return JSON.stringify({ nodes, edges, version: 1 }, null, 2);
  },

  importJson: (raw) => {
    const parsed = JSON.parse(raw) as { nodes: FlowNode[]; edges: Edge[] };
    if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
      throw new Error("Invalid flow JSON");
    }
    get().pushHistory();
    set({ nodes: parsed.nodes, edges: parsed.edges });
    get().persist();
  },

  hydrateFromStorage: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { nodes: FlowNode[]; edges: Edge[] };
      if (Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
        set({ nodes: parsed.nodes, edges: parsed.edges });
      }
    } catch {
      // ignore corrupt storage
    }
  },

  persist: () => {
    const { nodes, edges } = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }));
  },
}));
