export function createNodeId(nodeType: string): string {
  return `${nodeType}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
