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
            if (node[key] && typeof node[key] === 'object') {
              // Use only the current key to extend the path, without duplicating topNode
              const newPath = path ? `${path}/${key.trim()}` : key.trim();
              
              // Construct the nodeId without including the topNode twice
              const nodeId = newPath.replace(/\/{2,}/g, '/').trim();
      
              const componentsList = Object.keys(node[key])
                .filter(subKey => subKey === 'component' || subKey === 'quantity')
                .map(subKey => node[key][subKey])
                .join(', ');
      
              // Ensure level is capped between 0 and maxLevel to prevent overflow
              const adjustedLevel = Math.min(level, maxLevel);
      
              // Use chroma-js to interpolate colors based on the level
              const color = colorScale(adjustedLevel / maxLevel).hex();
      
              // Calculate font size and node size based on linkage count
              const fontSize = 8 + (maxLevel - adjustedLevel) * 6; // Base size 14, decreasing by 4 units per level
              const currentNodeCount = (nodeLinkCountMap.get(nodeId) || 0) + 1;
              nodeLinkCountMap.set(nodeId, currentNodeCount);
              const nodeSize = 10 + currentNodeCount * 20;
      
              if (nodeMap.has(nodeId)) {
                // Update existing node size if it already exists
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
                const currentCount = (edgeCountMap.get(edgeId) || 0) + 1;
                edgeCountMap.set(edgeId, currentCount);
                
                if (currentCount === 1) { // This should be 1 to push the edge on the first occurrence
                  edges.push({ from: parentId, to: nodeId, value: currentCount });
                } else {
                  const existingEdgeIndex = edges.findIndex(edge => edge.from === parentId && edge.to === nodeId);
                  if (existingEdgeIndex !== -1) {
                    edges[existingEdgeIndex].value = currentCount;
                  }
                }
              }
              
              console.log(edges)
              traverseTree(node[key], nodeId, level + 1, newPath);
            }
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