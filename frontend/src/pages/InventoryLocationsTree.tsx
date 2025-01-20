import React, { useEffect, useRef, useState } from "react";
import BackButton from "../ui/BackButton";
import chroma from "chroma-js";
import useGetUserInventoryTree from "../services/useGetUserInventoryTree";

interface GraphNode {
  id: string;
  label: string;
  title: string;
  value: number;
  font: {
    size: number;
  };
  color: string;
}

interface GraphEdge {
  from: string;
  to: string;
  value: number;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

const VIS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/vis-network/9.1.9/standalone/umd/vis-network.min.js";
const VIS_CSS = "https://unpkg.com/vis-network/styles/vis-network.css";

const loadScript = (src: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });


const UserInventoryTree: React.FC = () => {
  const { data, isLoading, isError } = useGetUserInventoryTree();
  const networkContainerRef = useRef<HTMLDivElement | null>(null);
  const [graphData, setGraphData] = useState<GraphData>({ edges: [], nodes: [] });
  const [isVisLoaded, setIsVisLoaded] = useState(false);

  useEffect(() => {
    // Load vis-network script and CSS dynamically
    const loadVisNetwork = async () => {
      try {
        // Load CSS
        const link = document.createElement("link");
        link.href = VIS_CSS;
        link.rel = "stylesheet";
        document.head.appendChild(link);

        // Load JS
        await loadScript(VIS_CDN);

        setIsVisLoaded(true);
      } catch (error) {
        console.error("Error loading vis-network:", error);
      }
    };

    loadVisNetwork();
  }, []);

  useEffect(() => {
    if (data) {
      const nodes: GraphNode[] = [];
      const edges: GraphEdge[] = [];
      const edgeCountMap = new Map<string, number>();
      const nodeMap = new Map<string, boolean>();
      const nodeLinkCountMap = new Map<string, number>();

      const colorScale = chroma.scale(["#ff69b4", "#1e90ff"]).mode("lab");
      const maxLevel = 4;
      const normalizePath = (path: string) => path.replace(/\/+$/, "").trim();

      const traverseTree = (
        node: Record<string, any>,
        parentId: string | null = null,
        level: number = 0,
        path: string = ""
      ) => {
        Object.keys(node).forEach((key) => {
          if (key !== "component" && key !== "quantity") {
            if (node[key] && typeof node[key] === "object") {
              const newPath = normalizePath(
                path ? `${path}/${key.trim()}` : key.trim()
              );

              const nodeId = newPath.replace(/\/{2,}/g, "/").trim();

              const componentsList = Object.keys(node[key])
                .filter(
                  (subKey) => subKey === "component" || subKey === "quantity"
                )
                .map((subKey) => node[key][subKey])
                .join(", ");

              const adjustedLevel = Math.min(level, maxLevel);

              const color = colorScale(adjustedLevel / maxLevel).hex();
              const fontSize = 8 + (maxLevel - adjustedLevel) * 6;
              const currentNodeCount = (nodeLinkCountMap.get(nodeId) || 0) + 1;
              nodeLinkCountMap.set(nodeId, currentNodeCount);
              const nodeSize = 10 + currentNodeCount * 20;

              if (nodeMap.has(nodeId)) {
                const existingNodeIndex = nodes.findIndex(
                  (n) => n.id === nodeId
                );
                if (existingNodeIndex !== -1) {
                  nodes[existingNodeIndex].value = nodeSize;
                }
              } else {
                nodes.push({
                  color,
                  font: { size: fontSize },
                  id: nodeId,
                  label: key,
                  title: componentsList || key,
                  value: nodeSize,
                });
                nodeMap.set(nodeId, true);
              }

              if (parentId) {
                const edgeId = `${parentId}->${nodeId}`;
                const currentCount = (edgeCountMap.get(edgeId) || 0) + 1;
                edgeCountMap.set(edgeId, currentCount);

                if (currentCount === 1 && parentId !== nodeId) {
                  edges.push({ from: parentId, to: nodeId, value: currentCount });
                } else {
                  const existingEdgeIndex = edges.findIndex(
                    (edge) => edge.from === parentId && edge.to === nodeId
                  );
                  if (existingEdgeIndex !== -1) {
                    edges[existingEdgeIndex].value = currentCount;
                  }
                }
              }

              traverseTree(node[key], nodeId, level + 1, newPath);
            }
          }
        });
      };

      traverseTree(data);
      setGraphData({ edges, nodes });
    }
  }, [data]);

  useEffect(() => {
    if (isVisLoaded && networkContainerRef.current && graphData.nodes.length > 0) {
      const { Network } = (window as any).vis;
      const network = new Network(networkContainerRef.current, graphData, {
        edges: {
          color: "#848484",
          scaling: { max: 10, min: 1 },
          width: 2,
        },
        interaction: { dragNodes: true, dragView: true, zoomView: true },
        layout: { hierarchical: false, improvedLayout: true },
        nodes: {
          scaling: {
            customScalingFunction: (min: number, max: number, total: number, value: number) => value / total,
            max: 150,
            min: 5,
          },
          shape: "dot",
        },
        physics: {
          enabled: true,
          solver: "forceAtlas2Based",
          stabilization: { iterations: 100 },
        },
      });

      network.fit({ animation: true });
    }
  }, [graphData, isVisLoaded]);

  if (isLoading) return <p>Loading inventory tree...</p>;
  if (isError) return <p>Error loading inventory tree.</p>;

  return (
    <>
      <BackButton prevPageName="Account" />
      <div
        id="network-container"
        ref={networkContainerRef}
        style={{ height: "100vh", width: "100%" }}
      />
    </>
  );
};

export default UserInventoryTree;
