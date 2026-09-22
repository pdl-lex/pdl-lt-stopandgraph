// Die Zeichenfläche: D3-Kräftesimulation in ein SVG.
//
// Aus dem früheren ForceGraph.tsx übernommen, mit drei Änderungen:
//
//  * Die Farben kommen aus graphThemes.ts statt fest aus dem Evergreen-Satz,
//    damit der dunkle Modus nicht auf eine weiße Fläche trifft.
//  * Die Größe hängt an einem ResizeObserver statt am window-resize: Beim
//    Umschalten der Anordnung (links/rechts/oben) ändert sich die Fläche,
//    ohne dass das Fenster sich ändert.
//  * Reine Anzeigeschalter (Beschriftungen) wirken inkrementell. Vorher riss
//    jedes Häkchen die Simulation ab und würfelte das Bild neu.

import {
  useCallback, useEffect, useImperativeHandle, useMemo, useRef, type Ref,
} from 'react';
import * as d3 from 'd3';
import { getGraphTheme } from './graphThemes';
import type { GraphData, GraphDisplayConfig, GraphEdge, GraphNode } from '../types/graph';

export interface ForceGraphHandle {
  resetView: () => void;
  centerGraph: () => void;
  focusNode: (nodeId: string) => void;
  exportSVG: (filename: string) => void;
  exportPNG: (width: number, height: number, filename: string) => void;
}

interface Props {
  data: GraphData;
  config: GraphDisplayConfig;
  uiTheme: 'light' | 'dark';
  labels: { frequency: string; weight: string };
  ref?: Ref<ForceGraphHandle>;
}

const endpoint = (value: string | GraphNode) => (typeof value === 'string' ? value : value.id);

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function ForceGraph({ data, config, uiTheme, labels, ref }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphEdge> | null>(null);
  const positions = useRef(new Map<string, { x: number; y: number }>());
  const sizeRef = useRef({ width: 800, height: 600 });

  const theme = useMemo(() => getGraphTheme(config.theme, uiTheme), [config.theme, uiTheme]);
  const { nodeScaleRange, edgeScaleRange, showLabels, showEdgeLabels } = config;

  // ── Größe ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      const { width, height } = element.getBoundingClientRect();
      const next = { width: Math.max(width, 100), height: Math.max(height, 160) };
      sizeRef.current = next;
      const svg = svgRef.current;
      if (svg) {
        svg.setAttribute('width', String(next.width));
        svg.setAttribute('height', String(next.height));
      }
      // Die Kräfte hängen an der Mitte — ohne Nachführen wandert der Graph
      // beim Verkleinern aus dem Bild.
      const center = simulationRef.current?.force<d3.ForceCenter<GraphNode>>('center');
      if (center) {
        center.x(next.width / 2).y(next.height / 2);
        simulationRef.current?.alpha(0.15).restart();
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // ── Bedienung von außen ─────────────────────────────────────────────────
  const resetView = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(600)
      .call(zoomRef.current.transform, d3.zoomIdentity);
  }, []);

  const centerGraph = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    const bounds = (svg.select('g.zoom-container').node() as SVGGElement | null)?.getBBox();
    if (!bounds || bounds.width === 0) return;
    const { width, height } = sizeRef.current;
    const scale = 0.85 / Math.max(bounds.width / width, bounds.height / height);
    const tx = width / 2 - scale * (bounds.x + bounds.width / 2);
    const ty = height / 2 - scale * (bounds.y + bounds.height / 2);
    svg.transition().duration(600)
      .call(zoomRef.current.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
  }, []);

  const focusNode = useCallback((nodeId: string) => {
    const position = positions.current.get(nodeId);
    if (!position || !svgRef.current || !zoomRef.current) return;
    const { width, height } = sizeRef.current;
    const scale = 2.5;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(700).call(
      zoomRef.current.transform,
      d3.zoomIdentity
        .translate(width / 2 - scale * position.x, height / 2 - scale * position.y)
        .scale(scale),
    );
    svg.selectAll<SVGCircleElement, GraphNode>('g.nodes circle')
      .filter((d) => d.id === nodeId)
      .raise()
      .transition().duration(150)
      .attr('stroke', theme.highlight).attr('stroke-width', 5)
      .transition().duration(1200)
      .attr('stroke', theme.nodeStroke).attr('stroke-width', 1.5);
  }, [theme]);

  const exportSVG = useCallback((filename: string) => {
    if (!svgRef.current) return;
    download(
      new Blob([new XMLSerializer().serializeToString(svgRef.current)],
        { type: 'image/svg+xml;charset=utf-8' }),
      filename,
    );
  }, []);

  const exportPNG = useCallback((targetWidth: number, targetHeight: number, filename: string) => {
    if (!svgRef.current) return;
    const { width, height } = sizeRef.current;
    // Kopie mit ausdrücklicher viewBox, damit sie in jeder Größe rendert.
    const clone = svgRef.current.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('width', String(targetWidth));
    clone.setAttribute('height', String(targetHeight));
    clone.setAttribute('viewBox', `0 0 ${width} ${height}`);
    const url = URL.createObjectURL(
      new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml;charset=utf-8' }));
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d')!;
      // Echter Hexwert, keine CSS-Variable — siehe graphThemes.ts.
      ctx.fillStyle = theme.background;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => blob && download(blob, filename), 'image/png');
    };
    image.src = url;
  }, [theme.background]);

  useImperativeHandle(ref, () => ({ resetView, centerGraph, focusNode, exportSVG, exportPNG }),
    [resetView, centerGraph, focusNode, exportSVG, exportPNG]);

  // ── Aufbau ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    simulationRef.current?.stop();
    svg.style('background-color', theme.background);
    if (data.nodes.length === 0) return;

    const { width, height } = sizeRef.current;

    // Ohne Spread: Bei einem langen Text sind das zehntausende Argumente,
    // und Math.max(...arr) bricht irgendwann am Stapel.
    const maxFrequency = data.nodes.reduce((max, node) => Math.max(max, node.frequency), 1);
    const maxWeight = data.edges.reduce((max, edge) => Math.max(max, edge.weight), 1);

    const nodeScale = d3.scaleSqrt().domain([1, maxFrequency]).range(nodeScaleRange);
    const edgeScale = d3.scaleLinear().domain([1, maxWeight]).range(edgeScaleRange);
    const colorScale = d3.scaleSequential(d3.interpolate(theme.nodeLow, theme.nodeHigh))
      .domain([1, maxFrequency]);

    const container = svg.append('g').attr('class', 'zoom-container');
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.05, 8])
      .on('zoom', (event) => container.attr('transform', event.transform));
    zoomRef.current = zoom;
    svg.call(zoom);

    // Kopie, damit die Simulation die Daten im Zustand nicht verändert.
    const nodes: GraphNode[] = data.nodes.map((node) => ({ ...node }));
    const edges: GraphEdge[] = data.edges.map((edge) => ({ ...edge }));

    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphEdge>(edges)
        .id((d) => d.id)
        .distance(100)
        .strength((d) => Math.min(d.weight / maxWeight, 1) * 0.5))
      .force('charge', d3.forceManyBody().strength(-150).distanceMax(300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide()
        .radius((d) => nodeScale((d as GraphNode).frequency) + 10));
    simulationRef.current = simulation;

    const link = container.append('g').attr('class', 'links')
      .selectAll<SVGLineElement, GraphEdge>('line').data(edges).join('line')
      .attr('stroke', theme.edge)
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d) => edgeScale(d.weight));

    link.append('title').text((d) => {
      const source = endpoint(d.source);
      const target = endpoint(d.target);
      return `${source} — ${target}\n${labels.weight}: ${d.weight}`;
    });

    const linkLabels = container.append('g').attr('class', 'link-labels')
      .selectAll<SVGTextElement, GraphEdge>('text').data(edges).join('text')
      .attr('font-size', '9px')
      .attr('font-family', '"Noto Sans Mono", monospace')
      .attr('fill', theme.edgeLabelColor)
      .attr('text-anchor', 'middle')
      .attr('dy', '-3px')
      .text((d) => (d.weight > 1 ? String(d.weight) : ''));

    const node = container.append('g').attr('class', 'nodes')
      .selectAll<SVGGElement, GraphNode>('g').data(nodes).join('g')
      .attr('class', 'node');

    node.call(d3.drag<SVGGElement, GraphNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x; d.fy = d.y;
      })
      .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null; d.fy = null;
      }));

    node.append('circle')
      .attr('r', (d) => nodeScale(d.frequency))
      .attr('fill', (d) => colorScale(d.frequency))
      .attr('stroke', theme.nodeStroke)
      .attr('stroke-width', 1.5)
      .on('mouseover', function (_event, d) {
        d3.select(this).transition().duration(120)
          .attr('stroke', theme.highlight).attr('stroke-width', 3);
        const touches = (e: GraphEdge) => endpoint(e.source) === d.id || endpoint(e.target) === d.id;
        link.attr('stroke-opacity', (e) => (touches(e) ? 1 : 0.12));
      })
      .on('mouseout', function () {
        d3.select(this).transition().duration(120)
          .attr('stroke', theme.nodeStroke).attr('stroke-width', 1.5);
        link.attr('stroke-opacity', 0.6);
      });

    node.append('title').text((d) => `${d.label}\n${labels.frequency}: ${d.frequency}`);

    // Beschriftungen werden immer angelegt und nur ein-/ausgeblendet — sonst
    // müsste ein Häkchen die ganze Simulation neu starten.
    node.append('text')
      .attr('class', 'node-label')
      .text((d) => d.label)
      .attr('font-size', (d) => Math.max(10, Math.min(14, nodeScale(d.frequency))))
      .attr('font-family', '"Noto Sans", sans-serif')
      .attr('fill', theme.labelColor)
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => nodeScale(d.frequency) + 12)
      .attr('pointer-events', 'none');

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as GraphNode).x!)
        .attr('y1', (d) => (d.source as GraphNode).y!)
        .attr('x2', (d) => (d.target as GraphNode).x!)
        .attr('y2', (d) => (d.target as GraphNode).y!);

      linkLabels
        .attr('x', (d) => ((d.source as GraphNode).x! + (d.target as GraphNode).x!) / 2)
        .attr('y', (d) => ((d.source as GraphNode).y! + (d.target as GraphNode).y!) / 2);

      node.attr('transform', (d) => `translate(${d.x},${d.y})`);
      for (const item of nodes) {
        if (item.x !== undefined && item.y !== undefined) {
          positions.current.set(item.id, { x: item.x, y: item.y });
        }
      }
    });

    return () => { simulation.stop(); };
  }, [data, theme, labels, nodeScaleRange, edgeScaleRange]);

  // ── Reine Anzeigeschalter, ohne Neuaufbau ───────────────────────────────
  useEffect(() => {
    if (!svgRef.current) return;
    d3.select(svgRef.current).selectAll('g.nodes text.node-label')
      .attr('display', showLabels ? null : 'none');
  }, [showLabels, data]);

  useEffect(() => {
    if (!svgRef.current) return;
    d3.select(svgRef.current).selectAll('g.link-labels text')
      .attr('display', showEdgeLabels ? null : 'none');
  }, [showEdgeLabels, data]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: 0 }}>
      <svg ref={svgRef} className="graph-canvas" />
    </div>
  );
}
