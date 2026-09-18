import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { FlowNode } from './store'

const colors: Record<string, string> = {
  start: '#16a34a',
  action: '#2563eb',
  condition: '#d97706',
  end: '#dc2626',
}

export function FlowNodeView({ data, selected }: NodeProps<FlowNode>) {
  const accent = colors[data.nodeType] ?? '#64748b'

  return (
    <div
      style={{
        minWidth: 140,
        borderRadius: 10,
        border: `2px solid ${selected ? accent : '#cbd5e1'}`,
        background: '#fff',
        boxShadow: selected ? `0 0 0 3px ${accent}33` : '0 2px 8px rgba(15,23,42,0.08)',
        overflow: 'hidden',
      }}
    >
      {data.nodeType !== 'start' && (
        <Handle type="target" position={Position.Left} style={{ background: accent }} />
      )}
      <div
        style={{
          background: accent,
          color: '#fff',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 0.4,
          textTransform: 'uppercase',
          padding: '4px 10px',
        }}
      >
        {data.nodeType}
      </div>
      <div style={{ padding: '10px 12px', fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
        {data.label}
      </div>
      {data.nodeType !== 'end' && (
        <Handle type="source" position={Position.Right} style={{ background: accent }} />
      )}
    </div>
  )
}
