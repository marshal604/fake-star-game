import type { EventGraph, EventNode } from './types';

export interface RuntimeStep {
  node: EventNode;
  isTerminal: boolean;
}

export function getNode(graph: EventGraph, nodeId: string): EventNode {
  const node = graph[nodeId];
  if (!node) {
    throw new Error(`Event node not found: ${nodeId}`);
  }

  return node;
}

export function advance(graph: EventGraph, node: EventNode, choice?: number): string | null {
  if (node.type === 'choice') {
    return choice === undefined ? null : (node.options[choice]?.next ?? null);
  }

  if ('next' in node) {
    return getNode(graph, node.next) ? node.next : null;
  }

  return null;
}

// @example pseudo:
// const node = getNode(signSuman, 'start')
// const next = advance(signSuman, node) // 'knock'
