import 'vis-network/styles/vis-network.css';

import React, { useEffect, useRef, useState } from 'react';

import BackButton from "../ui/BackButton";
import { Network } from 'vis-network/standalone';
import chroma from 'chroma-js'; // Importing chroma-js for color interpolation
import useGetUserInventoryTree from '../services/useGetUserInventoryTree';

const UserInventoryTree = () => {
  const { data, isLoading, isError } = useGetUserInventoryTree();
  const networkContainerRef = useRef(null);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });

  useEffect(() => {
    if (data) {
      const nodes = [];
      const edges = [];
      const edgeCountMap = new Map();
      const nodeMap = new Map(); // Map to track unique nodes per path
      const nodeLinkCountMap = new Map();

      // Define color scale from hot pink to cool blue
      const colorScale = chroma.scale(['#ff69b4', '#1e90ff']).mode('lab'); // Hot pink to cool blue
      const maxLevel = 4; // Number of distinct levels

      const traverseTree = (node, parentId = null, level = 0, path = '') => {
        Object.keys(node).forEach((key) => {
          if (key !== 'component' && key !== 'quantity') {
            // Create a unique node ID based on the top-level node and current path
            const topNode = path.split('/')[1] || key;
            const nodeId = `${topNode.trim()}/${path.trim()}/${key.trim()}`; // Ensure uniqueness by including the full path
            const componentsList = Object.keys(node[key])
              .filter(subKey => subKey === 'component' || subKey === 'quantity')
              .map(subKey => node[key][subKey])
              .join(', ');

            // Ensure level is capped between 0 and maxLevel to prevent overflow
            const adjustedLevel = Math.min(level, maxLevel);

            // Use chroma-js to interpolate colors based on the level
            const color = colorScale(adjustedLevel / maxLevel).hex();

            // Calculate font size based on inverted level (larger at higher levels)
            const fontSize = 8 + (maxLevel - adjustedLevel) * 6; // Base size 14, decreasing by 4 units per level
            const currentNodeCount = (nodeLinkCountMap.get(nodeId) || 0) + 1;
            nodeLinkCountMap.set(nodeId, currentNodeCount);
            const nodeSize = 10 + currentNodeCount * 20; // <-- Adjust this number to control the scaling
            console.log(nodeSize)

            if (nodeMap.has(nodeId)) {
              const existingNodeIndex = nodes.findIndex(n => n.id === nodeId);
              if (existingNodeIndex !== -1) {
                nodes[existingNodeIndex].value = nodeSize;
              }
            } else {
              nodes.push({
                id: nodeId,
                label: key,
                title: componentsList ? componentsList : key,
                color: color,
                value: nodeSize, // Adjust node size based on linkage count
                font: {
                  size: fontSize
                }
              });
              nodeMap.set(nodeId, true);
            }

            if (parentId) {
              const edgeId = `${parentId}->${nodeId}`;
              const currentCount = edgeCountMap.get(edgeId) || 0;
              edgeCountMap.set(edgeId, currentCount + 1);

              edges.push({ from: parentId, to: nodeId, value: currentCount });
            }
            
            traverseTree(node[key], nodeId, level + 1, `${path.trim()}/${key.trim()}`);
          }
        });
      };

      traverseTree(data);
      setGraphData({ nodes, edges });
    }
  }, [data]);

  useEffect(() => {
    if (networkContainerRef.current && graphData.nodes.length > 0) {
      const network = new Network(networkContainerRef.current, graphData, {
        nodes: {
          shape: 'dot', // Set shape to dot
          scaling: {
            customScalingFunction: function (min, max, total, value) {
              return value / total;
            },
            min: 5,
            max: 150,
          },
        },
        edges: {
          color: '#848484',
          width: 2,
          scaling: {
            min: 1,
            max: 10,
          },
        },
        layout: {
          improvedLayout: true,
          hierarchical: false
        },
        physics: {
          enabled: true,
          solver: 'forceAtlas2Based',
          stabilization: { iterations: 100 },
        },
        interaction: {
          dragNodes: true,
          zoomView: true,
          dragView: true
        },
      });

      network.fit({ animation: true });
    }
  }, [graphData]);

  if (isLoading) return <p>Loading inventory tree...</p>;
  if (isError) return <p>Error loading inventory tree.</p>;

  return (
    <>
      <BackButton prevPageName="Account" />
      <div ref={networkContainerRef} id="network-container" style={{ width: '100%', height: '100vh' }}></div>
    </>
  );
};

export default UserInventoryTree;