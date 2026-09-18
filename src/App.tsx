import { useCallback, useEffect, useRef } from 'react'
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { FlowNodeView } from './FlowNodeView'
import { useFlowStore, type FlowNodeData } from './store'
import './App.css'

const nodeTypes = { flow: FlowNodeView }

function Toolbar() {
  const addNode = useFlowStore((s) => s.addNode)
  const undo = useFlowStore((s) => s.undo)
  const redo = useFlowStore((s) => s.redo)
  const exportJson = useFlowStore((s) => s.exportJson)
  const importJson = useFlowStore((s) => s.importJson)
  const fileRef = useRef<HTMLInputElement>(null)

  const onExport = () => {
    const blob = new Blob([exportJson()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'flowboard-export.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const onImport = async (file: File) => {
    try {
      const text = await file.text()
      importJson(text)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Import failed')
    }
  }

  const kinds: FlowNodeData['nodeType'][] = ['start', 'action', 'condition', 'end']

  return (
    <header className="toolbar">
      <div className="brand">
        <strong>flowboard</strong>
        <span>Drag-and-drop workflow builder</span>
      </div>
      <div className="actions">
        {kinds.map((k) => (
          <button key={k} type="button" onClick={() => addNode(k)}>
            + {k}
          </button>
        ))}
        <button type="button" onClick={undo}>
          Undo
        </button>
        <button type="button" onClick={redo}>
          Redo
        </button>
        <button type="button" onClick={onExport}>
          Export JSON
        </button>
        <button type="button" onClick={() => fileRef.current?.click()}>
          Import JSON
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void onImport(file)
            e.target.value = ''
          }}
        />
      </div>
    </header>
  )
}

function Canvas() {
  const nodes = useFlowStore((s) => s.nodes)
  const edges = useFlowStore((s) => s.edges)
  const onNodesChange = useFlowStore((s) => s.onNodesChange)
  const onEdgesChange = useFlowStore((s) => s.onEdgesChange)
  const onConnect = useFlowStore((s) => s.onConnect)
  const deleteSelected = useFlowStore((s) => s.deleteSelected)
  const undo = useFlowStore((s) => s.undo)
  const redo = useFlowStore((s) => s.redo)
  const hydrateFromStorage = useFlowStore((s) => s.hydrateFromStorage)

  useEffect(() => {
    hydrateFromStorage()
  }, [hydrateFromStorage])

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey
      if (meta && e.key.toLowerCase() === 'z' && e.shiftKey) {
        e.preventDefault()
        redo()
        return
      }
      if (meta && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        undo()
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const tag = (e.target as HTMLElement)?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA') return
        e.preventDefault()
        deleteSelected()
      }
    },
    [deleteSelected, redo, undo],
  )

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onKeyDown])

  return (
    <div className="canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        deleteKeyCode={null}
      >
        <Background gap={18} size={1} />
        <MiniMap pannable zoomable />
        <Controls />
      </ReactFlow>
    </div>
  )
}

export default function App() {
  return (
    <ReactFlowProvider>
      <div className="app">
        <Toolbar />
        <Canvas />
        <footer className="hint">
          Shortcuts: ⌘/Ctrl+Z undo · ⌘/Ctrl+Shift+Z redo · Delete remove selection · autosaves to
          localStorage
        </footer>
      </div>
    </ReactFlowProvider>
  )
}
