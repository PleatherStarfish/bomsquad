import 'vis-network/styles/vis-network.css';

import React, { useEffect, useRef, useState } from 'react';

import { Network } from 'vis-network/standalone';
import useGetUserInventoryTree from '../services/useGetUserInventoryTree';

const UserInventoryTree = () => {
  const { data, isLoading, isError } = useGetUserInventoryTree();
  const networkContainerRef = useRef(null);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });

  useEffect(() => {
    if (data) {
      const nodes = [];
      const edges = [];

      const traverseTree = (node, parentId = null, level = 0) => {
        Object.keys(node).forEach((key) => {
          if (key !== 'component' && key !== 'quantity') {
            const nodeId = `${parentId ? parentId + '-' : ''}${key}`;
            const componentsList = Object.keys(node[key])
              .filter(subKey => subKey === 'component' || subKey === 'quantity')
              .map(subKey => node[key][subKey]) // Only display the value, not "key: value"
              .join(', ');

            const maxLevel = 4; // Number of distinct levels
            const step = Math.floor((255 - 173) / maxLevel); // Calculate step size for RGB values

            // Ensure level is capped between 0 and maxLevel to prevent overflow
            const adjustedLevel = Math.min(level, maxLevel);

            // Calculate color intensity for each component
            const red = 173 + step * adjustedLevel;
            const green = 216 + step * adjustedLevel;
            const blue = 230 + step * adjustedLevel;

            const color = `rgba(${Math.min(255, red)}, ${Math.min(255, green)}, ${Math.min(255, blue)}, 1)`;

            // Calculate font size based on inverted level (larger at higher levels)
            const fontSize = 8 + (maxLevel - adjustedLevel) * 6; // Base size 14, decreasing by 4 units per level

            nodes.push({
              id: nodeId,
              label: key,
              title: componentsList ? componentsList : key,
              color: color,
              font: {
                size: fontSize
              }
            });

            if (parentId) {
              edges.push({ from: parentId, to: nodeId });
            }

            traverseTree(node[key], nodeId, level + 1);
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
          shape: 'circle',
          font: {
            size: 14,
            color: '#000'
          },
        },
        edges: {
          color: '#848484',
          width: 2,
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
          dragNodes: true, // Allow nodes to be moved
          zoomView: true,
          dragView: true
        },
      });

      network.fit({ animation: true });
    }
  }, [graphData]);

  if (isLoading) return <p>Loading inventory tree...</p>;
  if (isError) return <p>Error loading inventory tree.</p>;

  return <div ref={networkContainerRef} id="network-container" style={{ width: '100%', height: '100vh' }}></div>;
};

export default UserInventoryTree;