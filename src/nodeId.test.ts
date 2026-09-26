import { describe, expect, it } from 'vitest'
import { createNodeId } from './nodeId'

describe('createNodeId', () => {
  it('prefixes with the node type', () => {
    expect(createNodeId('action').startsWith('action-')).toBe(true)
    expect(createNodeId('start').startsWith('start-')).toBe(true)
  })

  it('creates unique ids on each call', () => {
    const a = createNodeId('action')
    const b = createNodeId('action')
    expect(a).not.toBe(b)
  })

  it('returns a non-empty string', () => {
    expect(createNodeId('end').length).toBeGreaterThan(0)
  })
})
