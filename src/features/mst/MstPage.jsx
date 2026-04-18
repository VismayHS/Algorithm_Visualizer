import { useMemo, useState } from 'react'
import CodeSnippetCard from '../../components/CodeSnippetCard'
import PlaybackControls from '../../components/PlaybackControls'
import { usePlayback } from '../../hooks/usePlayback'
import { buildCircularLayout, createKruskalTrace, parseGraphInput } from './kruskalTrace'

const DEFAULT_NODES = 'A, B, C, D, E, F'
const DEFAULT_EDGES = `A, B, 4
A, F, 2
B, C, 6
B, F, 5
C, D, 3
C, E, 4
D, E, 2
E, F, 1
B, E, 7
A, C, 8`

const DEFAULT_ACTIVE_NODES = ['A', 'B', 'C', 'D', 'E', 'F']
const DEFAULT_ACTIVE_EDGES = [
  { u: 'A', v: 'B', weight: 4 },
  { u: 'A', v: 'F', weight: 2 },
  { u: 'B', v: 'C', weight: 6 },
  { u: 'B', v: 'F', weight: 5 },
  { u: 'C', v: 'D', weight: 3 },
  { u: 'C', v: 'E', weight: 4 },
  { u: 'D', v: 'E', weight: 2 },
  { u: 'E', v: 'F', weight: 1 },
  { u: 'B', v: 'E', weight: 7 },
  { u: 'A', v: 'C', weight: 8 },
]

const KRUSKAL_SNIPPET = `sort all edges by weight
initialize Disjoint Set
for each edge (u, v):
  if Find(u) != Find(v):
    add edge to MST
    Union(u, v)
  else:
    reject edge`

const EDGE_STYLE = {
  pending: {
    stroke: '#94a3b8',
    strokeWidth: 2,
    dash: '5 6',
    opacity: 0.8,
  },
  current: {
    stroke: '#facc15',
    strokeWidth: 4,
    dash: '0',
    opacity: 1,
  },
  accepted: {
    stroke: '#22c55e',
    strokeWidth: 4,
    dash: '0',
    opacity: 1,
  },
  rejected: {
    stroke: '#ef4444',
    strokeWidth: 3,
    dash: '8 6',
    opacity: 1,
  },
}

const CANVAS_WIDTH = 860
const CANVAS_HEIGHT = 460

function MstPage() {
  const [nodesInput, setNodesInput] = useState(DEFAULT_NODES)
  const [edgesInput, setEdgesInput] = useState(DEFAULT_EDGES)
  const [activeNodes, setActiveNodes] = useState(DEFAULT_ACTIVE_NODES)
  const [trace, setTrace] = useState(() => createKruskalTrace(DEFAULT_ACTIVE_NODES, DEFAULT_ACTIVE_EDGES))
  const [speed, setSpeed] = useState(550)
  const [errors, setErrors] = useState([])

  const { steps, sortedEdges, mstEdges, mstWeight, isConnected } = trace

  const {
    stepIndex,
    isPlaying,
    playPause,
    next,
    previous,
    reset: resetPlayback,
    totalSteps,
  } = usePlayback(steps, speed)

  const currentStep = steps[stepIndex] ?? steps[0]
  const nodePositions = useMemo(
    () => buildCircularLayout(activeNodes, CANVAS_WIDTH, CANVAS_HEIGHT),
    [activeNodes],
  )

  const handleRun = () => {
    const parsedGraph = parseGraphInput(nodesInput, edgesInput)

    if (!parsedGraph.isValid) {
      setErrors(parsedGraph.errors.length ? parsedGraph.errors : ['Enter valid nodes and edges.'])
      return
    }

    const nextNodes = [...parsedGraph.nodes]
    const nextEdges = parsedGraph.edges.map((edge) => ({ ...edge }))
    const nextTrace = createKruskalTrace(nextNodes, nextEdges)

    setErrors([])
    resetPlayback()
    setActiveNodes(nextNodes)
    setTrace(nextTrace)
  }

  const handleReset = () => {
    const resetNodes = [...DEFAULT_ACTIVE_NODES]
    const resetEdges = DEFAULT_ACTIVE_EDGES.map((edge) => ({ ...edge }))
    const resetTraceState = createKruskalTrace(resetNodes, resetEdges)

    setNodesInput(DEFAULT_NODES)
    setEdgesInput(DEFAULT_EDGES)
    setActiveNodes(resetNodes)
    setTrace(resetTraceState)
    setErrors([])
    resetPlayback()
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Kruskal MST Visualization</h2>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Input</h3>
        <div className="mt-3 grid gap-3">
          <label className="grid gap-1">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Nodes (comma separated)</span>
            <input
              value={nodesInput}
              onChange={(event) => setNodesInput(event.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Edges (u, v, weight per line)</span>
            <textarea
              rows={7}
              value={edgesInput}
              onChange={(event) => setEdgesInput(event.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>

          {errors.length > 0 && (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/50 dark:bg-rose-500/10 dark:text-rose-300">
              {errors.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleRun}
              className="rounded-md border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:border-slate-200 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300"
            >
              Run
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      <PlaybackControls
        isPlaying={isPlaying}
        onPlayPause={playPause}
        onNext={next}
        onPrevious={previous}
        speed={speed}
        onSpeedChange={setSpeed}
        stepIndex={stepIndex}
        totalSteps={totalSteps}
        disabled={steps.length <= 1}
      />

      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Visualization</h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{currentStep?.message}</p>

            <div className="mt-4 overflow-x-auto rounded-md border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-900">
              <svg viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`} className="h-[460px] min-w-[860px] w-full">
                {sortedEdges.map((edge) => {
                  const state = currentStep?.edgeStates?.[edge.id] ?? 'pending'
                  const style = EDGE_STYLE[state] ?? EDGE_STYLE.pending
                  const start = nodePositions[edge.u]
                  const end = nodePositions[edge.v]

                  if (!start || !end) {
                    return null
                  }

                  const midX = (start.x + end.x) / 2
                  const midY = (start.y + end.y) / 2

                  return (
                    <g key={edge.id}>
                      <line
                        x1={start.x}
                        y1={start.y}
                        x2={end.x}
                        y2={end.y}
                        stroke={style.stroke}
                        strokeWidth={style.strokeWidth}
                        strokeDasharray={style.dash}
                        opacity={style.opacity}
                      />
                      <rect
                        x={midX - 14}
                        y={midY - 10}
                        width="28"
                        height="20"
                        rx="6"
                        fill="transparent"
                        stroke="currentColor"
                        className="text-slate-300 dark:text-slate-600"
                      />
                      <text
                        x={midX}
                        y={midY + 4}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="700"
                        fill="currentColor"
                        className="text-slate-700 dark:text-slate-200"
                      >
                        {edge.weight}
                      </text>
                    </g>
                  )
                })}

                {activeNodes.map((node) => {
                  const position = nodePositions[node]

                  if (!position) {
                    return null
                  }

                  return (
                    <g key={node}>
                      <circle
                        cx={position.x}
                        cy={position.y}
                        r="22"
                        fill="currentColor"
                        className="text-slate-100 dark:text-slate-800"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <circle
                        cx={position.x}
                        cy={position.y}
                        r="22"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-slate-500 dark:text-slate-300"
                      />
                      <text
                        x={position.x}
                        y={position.y + 4}
                        textAnchor="middle"
                        fontSize="13"
                        fontWeight="700"
                        fill="currentColor"
                        className="text-slate-800 dark:text-slate-100"
                      >
                        {node}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>

            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Current Edge States</p>
                <div className="mt-2 grid gap-1 text-xs text-slate-600 dark:text-slate-300">
                  {sortedEdges.map((edge) => {
                    const state = currentStep?.edgeStates?.[edge.id] ?? 'pending'
                    return (
                      <p key={`edge-state-${edge.id}`}>
                        {edge.u}-{edge.v} (w={edge.weight}) : {state}
                      </p>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Union-Find Parent</p>
                <div className="mt-2 grid gap-1 text-xs text-slate-600 dark:text-slate-300">
                  {activeNodes.map((node) => (
                    <p key={`uf-${node}`}>
                      {node}
                      {' -> '}
                      {currentStep?.parent?.[node] ?? '-'}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Output</h3>
            {!isConnected && (
              <p className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 dark:border-rose-400/50 dark:bg-rose-500/10 dark:text-rose-300">
                Graph is disconnected
              </p>
            )}

            <div className="mt-3 grid gap-2 text-sm text-slate-700 dark:text-slate-300">
              <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                MST edges selected: <span className="font-semibold">{mstEdges.length}</span>
              </p>
              <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                Total MST weight: <span className="font-semibold">{mstWeight}</span>
              </p>
              <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                Time complexity: O(E log E)
              </p>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                <p className="font-medium text-slate-800 dark:text-slate-200">Final MST edges:</p>
                {mstEdges.length ? (
                  <ul className="mt-1 list-disc pl-5 text-xs text-slate-700 dark:text-slate-300">
                    {mstEdges.map((edge) => (
                      <li key={`final-${edge.id}`}>
                        {edge.u}-{edge.v} (w={edge.weight})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">No edges selected.</p>
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="self-start md:sticky md:top-4">
          <CodeSnippetCard
            title="Pseudocode"
            snippet={KRUSKAL_SNIPPET}
            activeLines={currentStep?.activeLines ?? []}
            executionNote={currentStep?.type ? `Current step: ${currentStep.type}` : ''}
          />
        </div>
      </div>
    </div>
  )
}

export default MstPage
