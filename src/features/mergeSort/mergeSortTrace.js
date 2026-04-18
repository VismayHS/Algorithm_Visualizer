const MERGE_SORT_LINES = {
  CALL: 1,
  BASE: 2,
  SPLIT: 3,
  RECURSE_LEFT: 4,
  RECURSE_RIGHT: 5,
  MERGE_CALL: 6,
  MERGE_WHILE: 7,
  MERGE_IF_LEFT: 8,
  MERGE_IF_RIGHT: 9,
  MERGE_DRAIN: 10,
  RETURN: 11,
}

function createNodeIdFactory() {
  const timestamp = Date.now()
  let counter = 0

  return () => `${timestamp}-${counter++}`
}

export function buildMergeTree(array, nextId, depth = 0) {
  if (!array.length) {
    return null
  }

  const node = {
    id: nextId(),
    depth,
    original: [...array],
    current: array.length === 1 ? [...array] : [],
    left: null,
    right: null,
  }

  if (array.length === 1) {
    return node
  }

  const midpoint = Math.floor(array.length / 2)
  const leftArray = array.slice(0, midpoint)
  const rightArray = array.slice(midpoint)

  node.left = buildMergeTree(leftArray, nextId, depth + 1)
  node.right = buildMergeTree(rightArray, nextId, depth + 1)

  return node
}

function createNodeMap(root) {
  const nodeMap = {}

  const walk = (node) => {
    if (!node) {
      return
    }

    nodeMap[node.id] = {
      id: node.id,
      depth: node.depth,
      original: [...node.original],
      current: [...node.current],
      status: 'new',
      visible: false,
      leftId: node.left?.id ?? null,
      rightId: node.right?.id ?? null,
    }

    walk(node.left)
    walk(node.right)
  }

  walk(root)

  return nodeMap
}

function cloneTree(nodeId, nodeMap) {
  const node = nodeMap[nodeId]

  if (!node || !node.visible) {
    return null
  }

  return {
    id: node.id,
    depth: node.depth,
    original: [...node.original],
    current: [...node.current],
    status: node.status,
    left: cloneTree(node.leftId, nodeMap),
    right: cloneTree(node.rightId, nodeMap),
  }
}

function formatArray(values) {
  return `[${values.join(', ')}]`
}

export function createMergeSortTrace(firstArray, secondArray) {
  const combined = [...firstArray, ...secondArray]

  if (combined.length === 0) {
    return {
      combined,
      sorted: [],
      totalComparisons: 0,
      steps: [
        {
          type: 'idle',
          message: 'Enter values and click Run.',
          activeLines: [],
          tree: null,
          mergeState: null,
          mergeFocus: null,
          comparisons: 0,
        },
      ],
    }
  }

  const steps = []
  let comparisons = 0

  const nextId = createNodeIdFactory()
  const root = buildMergeTree(combined, nextId)
  const rootId = root?.id ?? null
  const nodeMap = createNodeMap(root)

  const pushStep = (step) => {
    steps.push({
      type: 'idle',
      message: '',
      activeLines: [],
      mergeState: null,
      mergeFocus: null,
      comparisons,
      tree: rootId ? cloneTree(rootId, nodeMap) : null,
      ...step,
    })
  }

  const setNodeStatus = (nodeId, status) => {
    if (!nodeMap[nodeId]) {
      return
    }

    nodeMap[nodeId].status = status
  }

  const setNodeVisible = (nodeId, visible) => {
    if (!nodeMap[nodeId]) {
      return
    }

    nodeMap[nodeId].visible = visible
  }

  const setNodeCurrent = (nodeId, current) => {
    if (!nodeMap[nodeId]) {
      return
    }

    nodeMap[nodeId].current = [...current]
  }

  const mergeSortRecursive = (nodeId) => {
    const node = nodeMap[nodeId]

    if (!node) {
      return []
    }

    const leftId = node.leftId
    const rightId = node.rightId
    const label = formatArray(node.original)

    setNodeVisible(nodeId, true)
    setNodeStatus(nodeId, 'active')

    pushStep({
      type: 'call',
      message: `Call mergeSort on ${label}.`,
      activeLines: [MERGE_SORT_LINES.CALL],
    })

    if (!leftId && !rightId) {
      setNodeStatus(nodeId, 'base')
      setNodeCurrent(nodeId, node.original)

      pushStep({
        type: 'base',
        message: `Base case at ${label}.`,
        activeLines: [MERGE_SORT_LINES.BASE],
      })

      return [...node.original]
    }

    const leftLabel = leftId ? formatArray(nodeMap[leftId].original) : '[]'
    const rightLabel = rightId ? formatArray(nodeMap[rightId].original) : '[]'

    setNodeStatus(nodeId, 'split')
    if (leftId) {
      setNodeVisible(leftId, true)
    }
    if (rightId) {
      setNodeVisible(rightId, true)
    }

    pushStep({
      type: 'split',
      message: `Split ${label} into ${leftLabel} and ${rightLabel}.`,
      activeLines: [MERGE_SORT_LINES.SPLIT],
    })

    let sortedLeft = []
    if (leftId) {
      pushStep({
        type: 'recurse-left',
        message: `Recurse on left half ${leftLabel}.`,
        activeLines: [MERGE_SORT_LINES.RECURSE_LEFT],
      })

      sortedLeft = mergeSortRecursive(leftId)
    }

    let sortedRight = []
    if (rightId) {
      pushStep({
        type: 'recurse-right',
        message: `Recurse on right half ${rightLabel}.`,
        activeLines: [MERGE_SORT_LINES.RECURSE_RIGHT],
      })

      sortedRight = mergeSortRecursive(rightId)
    }

    setNodeStatus(nodeId, 'merging')
    setNodeCurrent(nodeId, [])

    let leftIndex = 0
    let rightIndex = 0
    const merged = []

    while (leftIndex < sortedLeft.length && rightIndex < sortedRight.length) {
      comparisons += 1
      const leftValue = sortedLeft[leftIndex]
      const rightValue = sortedRight[rightIndex]
      const chooseLeft = leftValue <= rightValue

      pushStep({
        type: 'merge-compare',
        message: `Compare ${leftValue} and ${rightValue}.`,
        activeLines: chooseLeft
          ? [MERGE_SORT_LINES.MERGE_CALL, MERGE_SORT_LINES.MERGE_WHILE, MERGE_SORT_LINES.MERGE_IF_LEFT]
          : [MERGE_SORT_LINES.MERGE_CALL, MERGE_SORT_LINES.MERGE_WHILE, MERGE_SORT_LINES.MERGE_IF_RIGHT],
        mergeFocus: {
          parentPath: nodeId,
          leftPath: leftId,
          rightPath: rightId,
        },
        mergeState: {
          left: [...sortedLeft],
          right: [...sortedRight],
          merged: [...merged],
          leftIndex,
          rightIndex,
          chosen: chooseLeft ? leftValue : rightValue,
        },
      })

      if (chooseLeft) {
        merged.push(leftValue)
        leftIndex += 1
      } else {
        merged.push(rightValue)
        rightIndex += 1
      }

      setNodeCurrent(nodeId, merged)

      pushStep({
        type: 'merge-progress',
        message: `Merged so far at ${label}: ${formatArray(merged)}`,
        activeLines: [MERGE_SORT_LINES.MERGE_CALL],
        mergeFocus: {
          parentPath: nodeId,
          leftPath: leftId,
          rightPath: rightId,
        },
        mergeState: {
          left: [...sortedLeft],
          right: [...sortedRight],
          merged: [...merged],
          leftIndex,
          rightIndex,
          chosen: merged[merged.length - 1],
        },
      })
    }

    while (leftIndex < sortedLeft.length) {
      merged.push(sortedLeft[leftIndex])
      leftIndex += 1
      setNodeCurrent(nodeId, merged)

      pushStep({
        type: 'merge-progress',
        message: `Append remaining left value to ${label}.`,
        activeLines: [MERGE_SORT_LINES.MERGE_DRAIN],
        mergeFocus: {
          parentPath: nodeId,
          leftPath: leftId,
          rightPath: rightId,
        },
        mergeState: {
          left: [...sortedLeft],
          right: [...sortedRight],
          merged: [...merged],
          leftIndex,
          rightIndex,
          chosen: merged[merged.length - 1],
        },
      })
    }

    while (rightIndex < sortedRight.length) {
      merged.push(sortedRight[rightIndex])
      rightIndex += 1
      setNodeCurrent(nodeId, merged)

      pushStep({
        type: 'merge-progress',
        message: `Append remaining right value to ${label}.`,
        activeLines: [MERGE_SORT_LINES.MERGE_DRAIN],
        mergeFocus: {
          parentPath: nodeId,
          leftPath: leftId,
          rightPath: rightId,
        },
        mergeState: {
          left: [...sortedLeft],
          right: [...sortedRight],
          merged: [...merged],
          leftIndex,
          rightIndex,
          chosen: merged[merged.length - 1],
        },
      })
    }

    setNodeStatus(nodeId, 'merged')
    setNodeCurrent(nodeId, merged)

    pushStep({
      type: 'merge-complete',
      message: `Merge complete at ${label}: ${formatArray(merged)}`,
      activeLines: [MERGE_SORT_LINES.RETURN],
      mergeFocus: {
        parentPath: nodeId,
        leftPath: leftId,
        rightPath: rightId,
      },
      mergeState: {
        left: [...sortedLeft],
        right: [...sortedRight],
        merged: [...merged],
        leftIndex,
        rightIndex,
        chosen: null,
      },
    })

    return merged
  }

  const sorted = rootId ? mergeSortRecursive(rootId) : []

  pushStep({
    type: 'done',
    message: `Final sorted array: [${sorted.join(', ')}]`,
    activeLines: [MERGE_SORT_LINES.RETURN],
  })

  return {
    combined,
    sorted,
    totalComparisons: comparisons,
    steps,
  }
}

export function parseArrayInput(input) {
  const tokens = input
    .split(',')
    .map((token) => token.trim())
    .filter((token) => token.length > 0)

  const values = []
  const invalidTokens = []

  tokens.forEach((token) => {
    const value = Number(token)

    if (Number.isNaN(value)) {
      invalidTokens.push(token)
      return
    }

    values.push(value)
  })

  return {
    values,
    invalidTokens,
  }
}

export function isSortedAscending(array) {
  for (let index = 1; index < array.length; index += 1) {
    if (array[index - 1] > array[index]) {
      return false
    }
  }

  return true
}
