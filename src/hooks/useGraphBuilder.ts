// N-Gram Parser - builds a co-occurrence graph from tokens

import { Token } from '../types';
import { 
  GraphData, 
  GraphNode, 
  GraphEdge, 
  NGramConfig,
  EdgeWeighting,
} from '../types/graph';

/**
 * Calculate edge weight based on distance and weighting config
 */
const calculateWeight = (
  distance: number, 
  weighting: EdgeWeighting
): number => {
  if (weighting.type === 'uniform') {
    return weighting.value;
  }
  
  // Distance-based weighting
  const baseWeight = weighting.baseValue;
  if (distance <= weighting.bonusRange) {
    return baseWeight + weighting.bonusValue;
  }
  return baseWeight;
};

/**
 * Create a unique edge key for a pair of words (order-independent)
 */
const getEdgeKey = (word1: string, word2: string): string => {
  return [word1, word2].sort().join('|||');
};

/**
 * Extract content words from tokens (excluding stopwords and whitespace)
 * Returns array of { word, position } with sentence boundaries marked
 */
const extractContentWords = (
  tokens: Token[],
  sentenceBoundaries: string[]
): { word: string; isBoundary: boolean }[] => {
  const result: { word: string; isBoundary: boolean }[] = [];
  
  for (const token of tokens) {
    // Skip whitespace
    if (token.type === 'whitespace') continue;
    
    // Skip stopwords
    if (token.isStopword) continue;
    
    // Check if this is a sentence boundary
    if (token.type === 'punctuation' && sentenceBoundaries.includes(token.text)) {
      result.push({ word: token.text, isBoundary: true });
      continue;
    }
    
    // Regular content word
    if (token.type === 'word') {
      result.push({ word: token.normalizedText, isBoundary: false });
    }
  }
  
  return result;
};

/**
 * Build a co-occurrence graph from tokens using n-gram windows
 */
export const buildCooccurrenceGraph = (
  tokens: Token[],
  config: NGramConfig
): GraphData => {
  const { windowSize, weighting, sentenceBoundaries } = config;
  
  // Extract content words with boundary markers
  const words = extractContentWords(tokens, sentenceBoundaries);
  
  // Track node frequencies and edge weights
  const nodeFrequencies = new Map<string, number>();
  const edgeWeights = new Map<string, number>();
  
  // Current window of content words (excluding boundaries)
  let currentWindow: string[] = [];
  
  for (const { word, isBoundary } of words) {
    if (isBoundary) {
      // Reset window at sentence boundary
      currentWindow = [];
      continue;
    }
    
    // Count word frequency
    nodeFrequencies.set(word, (nodeFrequencies.get(word) || 0) + 1);
    
    // Add word to window
    currentWindow.push(word);
    
    // Keep window at max size
    if (currentWindow.length > windowSize) {
      currentWindow.shift();
    }
    
    // Calculate co-occurrences within current window
    // The newest word is at the end, calculate distance from it
    const newestWord = currentWindow[currentWindow.length - 1];
    
    for (let i = 0; i < currentWindow.length - 1; i++) {
      const otherWord = currentWindow[i];
      
      // Skip self-loops
      if (otherWord === newestWord) continue;
      
      // Calculate distance (1 = adjacent, higher = further apart)
      const distance = currentWindow.length - 1 - i;
      
      // Calculate weight based on config
      const weight = calculateWeight(distance, weighting);
      
      // Create edge key and add weight
      const edgeKey = getEdgeKey(newestWord, otherWord);
      edgeWeights.set(edgeKey, (edgeWeights.get(edgeKey) || 0) + weight);
    }
  }
  
  // Build nodes array
  const nodes: GraphNode[] = [];
  nodeFrequencies.forEach((frequency, word) => {
    nodes.push({
      id: word,
      label: word,
      frequency,
    });
  });
  
  // Build edges array
  const edges: GraphEdge[] = [];
  edgeWeights.forEach((weight, edgeKey) => {
    const [source, target] = edgeKey.split('|||');
    edges.push({
      source,
      target,
      weight,
    });
  });
  
  return { nodes, edges };
};

/**
 * Filter graph based on display configuration
 */
export const filterGraph = (
  graph: GraphData,
  minEdgeWeight: number,
  minNodeFrequency: number
): GraphData => {
  // First, filter nodes by frequency
  const validNodes = new Set(
    graph.nodes
      .filter(node => node.frequency >= minNodeFrequency)
      .map(node => node.id)
  );
  
  // Filter edges by weight and valid nodes
  const filteredEdges = graph.edges.filter(edge => {
    const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
    const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
    
    return (
      edge.weight >= minEdgeWeight &&
      validNodes.has(sourceId) &&
      validNodes.has(targetId)
    );
  });
  
  // Get nodes that are actually used in edges
  const usedNodes = new Set<string>();
  filteredEdges.forEach(edge => {
    const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
    const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
    usedNodes.add(sourceId);
    usedNodes.add(targetId);
  });
  
  // Filter nodes to only those used in edges
  const filteredNodes = graph.nodes.filter(node => usedNodes.has(node.id));
  
  return {
    nodes: filteredNodes,
    edges: filteredEdges,
  };
};

/**
 * Get statistics about the graph
 */
export const getGraphStats = (graph: GraphData): {
  nodeCount: number;
  edgeCount: number;
  maxNodeFrequency: number;
  maxEdgeWeight: number;
  avgEdgeWeight: number;
} => {
  // reduce statt Math.max(...arr): Ein langer Text liefert zehntausende
  // Knoten, und so viele Argumente überlaufen den Aufrufstapel.
  const maxNodeFrequency = graph.nodes.reduce((max, n) => Math.max(max, n.frequency), 0);
  const maxEdgeWeight = graph.edges.reduce((max, e) => Math.max(max, e.weight), 0);
  const avgEdgeWeight = graph.edges.length > 0
    ? graph.edges.reduce((sum, e) => sum + e.weight, 0) / graph.edges.length
    : 0;
  
  return {
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    maxNodeFrequency,
    maxEdgeWeight,
    avgEdgeWeight: Math.round(avgEdgeWeight * 100) / 100,
  };
};

/**
 * Detect punctuation marks present in the tokens
 */
export const detectPunctuation = (tokens: Token[]): string[] => {
  const punctuationSet = new Set<string>();
  
  for (const token of tokens) {
    if (token.type === 'punctuation') {
      punctuationSet.add(token.text);
    }
  }
  
  // Sort for consistent display
  return Array.from(punctuationSet).sort();
};
