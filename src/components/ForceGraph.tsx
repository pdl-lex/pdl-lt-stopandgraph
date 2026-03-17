// Force-directed Graph Visualization using D3.js

import { useEffect, useRef, useState, useCallback } from 'react';
import { Paper, Box, Title, Text, Group, ActionIcon, Menu, Tooltip } from '@mantine/core';
import * as d3 from 'd3';
import { GraphData, GraphNode, GraphEdge, GraphDisplayConfig } from '../types/graph';
import { UILanguage } from '../config/i18n';
import { getGraphTranslation } from '../config/i18n-graph';

interface ForceGraphProps {
  data: GraphData;
  displayConfig: GraphDisplayConfig;
  uiLanguage: UILanguage;
  onNodeClick?: (node: GraphNode) => void;
}

export const ForceGraph = ({
  data,
  displayConfig,
  uiLanguage,
  onNodeClick,
}: ForceGraphProps) => {
  const t = getGraphTranslation(uiLanguage);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  // Track simulation for cleanup
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphEdge> | null>(null);
  
  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height: Math.max(height - 60, 400) });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  // Reset view function
  const resetView = useCallback(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.select('g.zoom-container')
      .transition()
      .duration(750)
      .attr('transform', 'translate(0,0) scale(1)');
  }, []);
  
  // Download SVG
  const downloadSVG = useCallback(() => {
    if (!svgRef.current) return;
    
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'knowledge-graph.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);
  
  // Download JSON
  const downloadJSON = useCallback(() => {
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'knowledge-graph.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [data]);
  
  // Main D3 rendering effect
  useEffect(() => {
    if (!svgRef.current || data.nodes.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    const { width, height } = dimensions;
    const { showLabels, nodeScaleRange, edgeScaleRange } = displayConfig;
    
    // Clear previous content
    svg.selectAll('*').remove();
    
    // Stop previous simulation
    if (simulationRef.current) {
      simulationRef.current.stop();
    }
    
    // Create scales
    const maxFrequency = Math.max(...data.nodes.map(n => n.frequency));
    const maxWeight = Math.max(...data.edges.map(e => e.weight));
    
    const nodeScale = d3.scaleSqrt()
      .domain([1, maxFrequency])
      .range(nodeScaleRange);
    
    const edgeScale = d3.scaleLinear()
      .domain([1, maxWeight])
      .range(edgeScaleRange);
    
    // Color scale for nodes based on frequency
    const colorScale = d3.scaleSequential(d3.interpolate('#b7c8c1', '#003835'))
      .domain([1, maxFrequency]);
    
    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });
    
    svg.call(zoom);
    
    // Create container for zoom
    const container = svg.append('g')
      .attr('class', 'zoom-container');
    
    // Create arrow marker for directed edges (if needed later)
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .append('path')
      .attr('d', 'M 0,-5 L 10,0 L 0,5')
      .attr('fill', '#999');
    
    // Deep copy data to avoid mutation
    const nodes: GraphNode[] = data.nodes.map(d => ({ ...d }));
    const edges: GraphEdge[] = data.edges.map(d => ({ ...d }));
    
    // Create force simulation
    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphEdge>(edges)
        .id(d => d.id)
        .distance(100)
        .strength(d => Math.min(d.weight / maxWeight, 1) * 0.5)
      )
      .force('charge', d3.forceManyBody()
        .strength(-150)
        .distanceMax(300)
      )
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide()
        .radius(d => nodeScale((d as GraphNode).frequency) + 10)
      );
    
    simulationRef.current = simulation;
    
    // Create edges
    const link = container.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(edges)
      .join('line')
      .attr('stroke', '#b7c8c1')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => edgeScale(d.weight));
    
    // Create edge labels (weight)
    const linkLabels = container.append('g')
      .attr('class', 'link-labels')
      .selectAll('text')
      .data(edges)
      .join('text')
      .attr('font-size', '9px')
      .attr('fill', '#666')
      .attr('text-anchor', 'middle')
      .attr('dy', '-3px')
      .text(d => d.weight > 1 ? d.weight : '');
    
    // Create node groups
    const node = container.append('g')
      .attr('class', 'nodes')
      .selectAll<SVGGElement, GraphNode>('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer');
    
    // Add drag behavior
    const dragBehavior = d3.drag<SVGGElement, GraphNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });
    
    node.call(dragBehavior);
    
    // Add circles to nodes
    node.append('circle')
      .attr('r', d => nodeScale(d.frequency))
      .attr('fill', d => colorScale(d.frequency))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('stroke', '#006844')
          .attr('stroke-width', 3);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('stroke', '#fff')
          .attr('stroke-width', 1.5);
      })
      .on('click', (event, d) => {
        if (onNodeClick) onNodeClick(d);
      });
    
    // Add labels to nodes
    if (showLabels) {
      node.append('text')
        .text(d => d.label)
        .attr('font-size', d => Math.max(10, Math.min(14, nodeScale(d.frequency))))
        .attr('font-family', '"Noto Sans", sans-serif')
        .attr('fill', '#1a1a1a')
        .attr('text-anchor', 'middle')
        .attr('dy', d => nodeScale(d.frequency) + 12)
        .attr('pointer-events', 'none');
    }
    
    // Add title (tooltip) to nodes
    node.append('title')
      .text(d => `${d.label}\n${t.nodeTooltip}: ${d.frequency}`);
    
    // Add title (tooltip) to edges
    link.append('title')
      .text(d => {
        const source = typeof d.source === 'object' ? d.source.label : d.source;
        const target = typeof d.target === 'object' ? d.target.label : d.target;
        return `${source} — ${target}\n${t.edgeTooltip}: ${d.weight}`;
      });
    
    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as GraphNode).x!)
        .attr('y1', d => (d.source as GraphNode).y!)
        .attr('x2', d => (d.target as GraphNode).x!)
        .attr('y2', d => (d.target as GraphNode).y!);
      
      linkLabels
        .attr('x', d => ((d.source as GraphNode).x! + (d.target as GraphNode).x!) / 2)
        .attr('y', d => ((d.source as GraphNode).y! + (d.target as GraphNode).y!) / 2);
      
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });
    
    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [data, dimensions, displayConfig, onNodeClick, t]);
  
  return (
    <Paper
      shadow="sm"
      radius="md"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #b7c8c1',
        overflow: 'hidden',
      }}
    >
      <Box
        p="sm"
        style={{
          borderBottom: '1px solid #b7c8c1',
          backgroundColor: '#f8faf9',
          borderRadius: 'var(--mantine-radius-md) var(--mantine-radius-md) 0 0',
        }}
      >
        <Group justify="space-between" align="center">
          <Title order={4} style={{ color: '#003835' }}>
            {t.graphTitle}
          </Title>
          
          <Group gap="xs">
            <Tooltip label={t.resetView}>
              <ActionIcon variant="subtle" color="gray" onClick={resetView}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </ActionIcon>
            </Tooltip>
            
            <Menu shadow="md" width={150}>
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="7,10 12,15 17,10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={downloadSVG}>{t.downloadSVG}</Menu.Item>
                <Menu.Item onClick={downloadJSON}>{t.downloadJSON}</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Box>
      
      <Box 
        ref={containerRef} 
        style={{ flex: 1, position: 'relative', overflow: 'hidden' }}
      >
        {data.nodes.length === 0 ? (
          <Box
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <Text c="dimmed">{t.graphEmpty}</Text>
          </Box>
        ) : (
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            style={{ display: 'block' }}
          />
        )}
      </Box>
    </Paper>
  );
};
