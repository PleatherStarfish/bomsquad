import 'vis-network/styles/vis-network.css';

import React, { useEffect, useRef, useState } from 'react';

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

      // Define color scale from hot pink to cool blue
      const colorScale = chroma.scale(['#ff69b4', '#1e90ff']).mode('lab'); // Hot pink to cool blue
      const maxLevel = 4; // Number of distinct levels

      const traverseTree = (node, parentId = null, level = 0) => {
        Object.keys(node).forEach((key) => {
          if (key !== 'component' && key !== 'quantity') {
            const nodeId = `${parentId ? parentId + '-' : ''}${key}`;
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

  return <div ref={networkContainerRef} id="network-container" style={{ width: '100%', height: '100vh' }}></div>;
};

export default UserInventoryTree;
