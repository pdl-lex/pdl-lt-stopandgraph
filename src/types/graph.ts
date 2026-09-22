// Type definitions for the Knowledge Graph

import type { GraphThemeName } from '../graph/graphThemes';

export interface GraphNode {
  id: string;
  label: string;
  frequency: number;  // How often the word appears in text
  // For D3 force simulation
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphEdge {
  source: string | GraphNode;
  target: string | GraphNode;
  weight: number;  // Co-occurrence count
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// N-gram configuration
export interface EdgeWeightingUniform {
  type: 'uniform';
  value: number;  // e.g., 1
}

export interface EdgeWeightingDistance {
  type: 'distance';
  baseValue: number;      // Default weight for all pairs
  bonusRange: number;     // Distance threshold for bonus
  bonusValue: number;     // Additional weight for close pairs
}

export type EdgeWeighting = EdgeWeightingUniform | EdgeWeightingDistance;

export interface NGramConfig {
  windowSize: number;           // n-gram size
  weighting: EdgeWeighting;     // How to weight edges
  sentenceBoundaries: string[]; // Punctuation that resets the window
}

// Default configuration
export const defaultNGramConfig: NGramConfig = {
  windowSize: 5,
  weighting: {
    type: 'uniform',
    value: 1,
  },
  sentenceBoundaries: ['.', '?', '!'],
};

// Graph visualization settings
export interface GraphDisplayConfig {
  minEdgeWeight: number;      // Filter out weak connections
  minNodeFrequency: number;   // Filter out rare words
  showLabels: boolean;
  showEdgeLabels: boolean;    // Edge weight next to the line
  theme: GraphThemeName;      // Canvas palette; 'auto' follows the UI theme
  nodeScaleRange: [number, number];  // Min/max node size
  edgeScaleRange: [number, number];  // Min/max edge thickness
}

export const defaultGraphDisplayConfig: GraphDisplayConfig = {
  minEdgeWeight: 1,
  minNodeFrequency: 1,
  showLabels: true,
  showEdgeLabels: true,
  theme: 'auto',
  nodeScaleRange: [4, 24],
  edgeScaleRange: [0.5, 6],
};
