import { useMemo, useState } from 'react'
import CodeSnippetCard from '../../components/CodeSnippetCard'
import PlaybackControls from '../../components/PlaybackControls'
import { usePlayback } from '../../hooks/usePlayback'
import { createMergeSortTrace, isSortedAscending, parseArrayInput } from './mergeSortTrace'

const DEFAULT_LEFT = '1, 4, 9'
const DEFAULT_RIGHT = '2, 3, 6'

const TREE_HORIZONTAL_SPACING = 120
const TREE_VERTICAL_SPACING = 110
const TREE_TOP_PADDING = 56
const TREE_SIDE_PADDING = 48
const TREE_NODE_RADIUS = 30

const MERGE_SORT_SNIPPET = `mergeSort(arr):
  if length(arr) <= 1: return arr
  split arr into left and right halves
  left = mergeSort(left)
  right = mergeSort(right)
  return merge(left, right)

merge(left, right):
  while both sides have elements:
    if left[i] <= right[j]: append left[i]
    else: append right[j]
  append remaining elements
  return merged`

function normalizeTreeNode(node) {
  if (!node) {
    return null
  }

  const normalizedLeft = normalizeTreeNode(node.left)
  const normalizedRight = normalizeTreeNode(node.right)

  const original =
    Array.isArray(node.original)
      ? [...node.original]
      : Array.isArray(node.value)
        ? [...node.value]
        : Array.isArray(node.values)
          ? [...node.values]
          : []

  const current = Array.isArray(node.current) ? [...node.current] : [...original]
  const isLeaf = !normalizedLeft && !normalizedRight
  const hasCurrentProgress = current.length > 0
  const showCurrent = hasCurrentProgress || isLeaf || node.status === 'merged'
  const displayValue = showCurrent ? current : original

  return {
    id: node.id,
    original,
    current,
    value: displayValue,
    status: node.status ?? 'active',
    left: normalizedLeft,
    right: normalizedRight,
  }
}

function getNodeTextLines(value) {
  if (!value.length) {
    return ['']
  }

  if (value.length <= 3) {
    return [value.join(', ')]
  }

  const midpoint = Math.ceil(value.length / 2)
  return [value.slice(0, midpoint).join(', '), value.slice(midpoint).join(', ')]
}

function buildTreeLayout(tree) {
  const normalizedRoot = normalizeTreeNode(tree)

  if (!normalizedRoot) {
    return null
  }

  let currentX = 0

  const assignPositions = (node, depth = 0, parentId = null) => {
    if (!node) {
      return null
    }

    const left = assignPositions(node.left, depth + 1, node.id)
    const x = Math.max(0, currentX * TREE_HORIZONTAL_SPACING)
    const y = depth * TREE_VERTICAL_SPACING

    currentX += 1

    const right = assignPositions(node.right, depth + 1, node.id)

    return {
      ...node,
      left,
      right,
      parentId,
      depth,
      x,
      y,
    }
  }

  return assignPositions(normalizedRoot, 0, null)
}

function MergeSortTreeVisualization({ tree, mergeFocus }) {
  const positionedTree = useMemo(() => buildTreeLayout(tree), [tree])

  const activeNodeIds = useMemo(
    () => new Set([mergeFocus?.parentPath, mergeFocus?.leftPath, mergeFocus?.rightPath].filter(Boolean)),
    [mergeFocus],
  )

  const { nodes, edges, svgWidth, svgHeight } = useMemo(() => {
    if (!positionedTree) {
      return {
        nodes: [],
        edges: [],
        svgWidth: 320,
        svgHeight: 180,
      }
    }

    const collectedNodes = []
    const collectedEdges = []

    const walkTree = (node) => {
      if (!node) {
        return
      }

      collectedNodes.push(node)

      if (node.left) {
        collectedEdges.push({
          id: `${node.id}-${node.left.id}`,
          x1: node.x,
          y1: node.y,
          x2: node.left.x,
          y2: node.left.y,
        })
      }

      if (node.right) {
        collectedEdges.push({
          id: `${node.id}-${node.right.id}`,
          x1: node.x,
          y1: node.y,
          x2: node.right.x,
          y2: node.right.y,
        })
      }

      walkTree(node.left)
      walkTree(node.right)
    }

    walkTree(positionedTree)

    const minX = Math.min(...collectedNodes.map((node) => node.x))
    const maxX = Math.max(...collectedNodes.map((node) => node.x))
    const maxY = Math.max(...collectedNodes.map((node) => node.y))
    const treeWidth = maxX - minX
    const svgWidth = Math.max(320, treeWidth + TREE_SIDE_PADDING * 2)
    const offsetX = (svgWidth - treeWidth) / 2

    const nodes = collectedNodes.map((node) => ({
      ...node,
      x: node.x - minX + offsetX,
      y: node.y + TREE_TOP_PADDING,
      textLines: getNodeTextLines(node.value),
    }))

    const edges = collectedEdges
      .map((edge) => ({
        id: edge.id,
        x1: edge.x1 - minX + offsetX,
        y1: edge.y1 + TREE_TOP_PADDING,
        x2: edge.x2 - minX + offsetX,
        y2: edge.y2 + TREE_TOP_PADDING,
      }))

    return {
      nodes,
      edges,
      svgWidth,
      svgHeight: maxY + TREE_TOP_PADDING * 2 + TREE_NODE_RADIUS,
    }
  }, [positionedTree])

  return (
    <div className="w-full overflow-x-auto rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
      {nodes.length === 0 ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">Tree unavailable for this step.</p>
      ) : (
        <svg width={svgWidth} height={svgHeight} className="mx-auto block" role="img" aria-label="Merge sort tree">
          {edges.map((edge) => (
            <line
              key={edge.id}
              x1={edge.x1}
              y1={edge.y1}
              x2={edge.x2}
              y2={edge.y2}
              className="stroke-slate-400 dark:stroke-slate-500"
              strokeWidth={2}
              strokeLinecap="round"
            />
          ))}

          {nodes.map((node) => {
            const isActive = activeNodeIds.has(node.id)
            const isMerged = node.status === 'base' || node.status === 'merged'
            const radius = isActive ? TREE_NODE_RADIUS + 4 : TREE_NODE_RADIUS

            let circleClass = 'fill-white stroke-slate-300 dark:fill-slate-800 dark:stroke-slate-600'
            let textClass = 'fill-slate-700 dark:fill-slate-200'

            if (isMerged) {
              circleClass =
                'fill-emerald-100 stroke-emerald-400 dark:fill-emerald-500/20 dark:stroke-emerald-400'
              textClass = 'fill-emerald-900 dark:fill-emerald-200'
            }

            if (isActive) {
              circleClass = 'fill-amber-100 stroke-amber-400 dark:fill-amber-500/20 dark:stroke-amber-300'
              textClass = 'fill-amber-900 dark:fill-amber-200'
            }

            return (
              <g key={node.id} transform={`translate(${node.x} ${node.y})`}>
                <circle
                  r={radius}
                  className={circleClass}
                  strokeWidth={isActive ? 4 : 2.5}
                  vectorEffect="non-scaling-stroke"
                />

                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={`text-[10px] font-semibold ${textClass}`}
                >
                  {node.textLines.map((line, index) => {
                    const isSingleLine = node.textLines.length === 1
                    const isFirstLine = index === 0
                    const isLastLine = index === node.textLines.length - 1

                    let displayLine = line

                    if (isSingleLine) {
                      displayLine = `[${line}]`
                    } else if (isFirstLine) {
                      displayLine = `[${line}`
                    } else if (isLastLine) {
                      displayLine = `${line}]`
                    }

                    return (
                      <tspan key={`${node.id}-${index}`} x="0" dy={isFirstLine ? -6 * (node.textLines.length - 1) : 12}>
                        {displayLine}
                      </tspan>
                    )
                  })}
                </text>
              </g>
            )
          })}
        </svg>
      )}
    </div>
  )
}

function MergeSortPage() {
  const [leftInput, setLeftInput] = useState(DEFAULT_LEFT)
  const [rightInput, setRightInput] = useState(DEFAULT_RIGHT)
  const [trace, setTrace] = useState(() => createMergeSortTrace([], []))
  const [speed, setSpeed] = useState(500)
  const [error, setError] = useState('')

  const { steps, sorted, combined, totalComparisons } = trace

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

  const handleRun = () => {
    const leftParsed = parseArrayInput(leftInput)
    const rightParsed = parseArrayInput(rightInput)

    if (leftParsed.invalidTokens.length || rightParsed.invalidTokens.length) {
      setError('All values must be valid numbers separated by commas.')
      return
    }

    if (!leftParsed.values.length && !rightParsed.values.length) {
      setError('Enter at least one number.')
      return
    }

    if (!isSortedAscending(leftParsed.values) || !isSortedAscending(rightParsed.values)) {
      setError('Both arrays must already be sorted in ascending order.')
      return
    }

    const nextTrace = createMergeSortTrace([...leftParsed.values], [...rightParsed.values])

    setError('')
    resetPlayback()
    setTrace(nextTrace)
  }

  const handleReset = () => {
    const idleTrace = createMergeSortTrace([], [])

    setLeftInput(DEFAULT_LEFT)
    setRightInput(DEFAULT_RIGHT)
    setTrace(idleTrace)
    setError('')
    resetPlayback()
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Merge Sort Visualization</h2>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Input</h3>
        <div className="mt-3 grid gap-3">
          <label className="grid gap-1">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Array 1 (sorted)</span>
            <input
              value={leftInput}
              onChange={(event) => setLeftInput(event.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Array 2 (sorted)</span>
            <input
              value={rightInput}
              onChange={(event) => setRightInput(event.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>

          {error && (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/50 dark:bg-rose-500/10 dark:text-rose-300">
              {error}
            </p>
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

            <div className="mt-4">
              <MergeSortTreeVisualization tree={currentStep?.tree} mergeFocus={currentStep?.mergeFocus} />
            </div>

            {currentStep?.mergeState && (
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  Left: [{currentStep.mergeState.left.join(', ')}]
                </p>
                <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  Right: [{currentStep.mergeState.right.join(', ')}]
                </p>
                <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  Merged: [{currentStep.mergeState.merged.join(', ')}]
                </p>
              </div>
            )}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Output</h3>
            <div className="mt-3 grid gap-2 text-sm text-slate-700 dark:text-slate-300">
              <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                Combined input: <span className="font-semibold">[{combined.join(', ')}]</span>
              </p>
              <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                Final sorted array: <span className="font-semibold">[{sorted.join(', ')}]</span>
              </p>
              <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                Merge comparisons: <span className="font-semibold">{totalComparisons}</span>
              </p>
              <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                Time complexity: O(n log n)
              </p>
            </div>
          </section>
        </div>

        <div className="self-start md:sticky md:top-4">
          <CodeSnippetCard
            title="Pseudocode"
            snippet={MERGE_SORT_SNIPPET}
            activeLines={currentStep?.activeLines ?? []}
            executionNote={currentStep?.type ? `Current step: ${currentStep.type}` : ''}
          />
        </div>
      </div>
    </div>
  )
}

export default MergeSortPage
