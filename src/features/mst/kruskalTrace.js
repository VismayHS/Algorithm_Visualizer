function createEdgeId(_, index) {
  return `edge-${index + 1}`
}

const KRUSKAL_LINES = {
  SORT_EDGES: 1,
  INIT_DISJOINT_SET: 2,
  FOR_EACH_EDGE: 3,
  CHECK_CYCLE: 4,
  ACCEPT_EDGE: 5,
  UNION_SETS: 6,
  REJECT_EDGE: 7,
}

class UnionFind {
  constructor(nodes) {
    this.parent = {}
    this.rank = {}

    nodes.forEach((node) => {
      this.parent[node] = node
      this.rank[node] = 0
    })
  }

  find(node, compressionLog) {
    if (this.parent[node] !== node) {
      const previousParent = this.parent[node]
      const root = this.find(previousParent, compressionLog)
      this.parent[node] = root

      if (previousParent !== root) {
        compressionLog.push(`${node}: ${previousParent} -> ${root}`)
      }
    }

    return this.parent[node]
  }

  union(rootA, rootB) {
    if (rootA === rootB) {
      return null
    }

    if (this.rank[rootA] < this.rank[rootB]) {
      this.parent[rootA] = rootB
      return {
        attached: rootA,
        parent: rootB,
        rankIncreased: false,
      }
    }

    if (this.rank[rootA] > this.rank[rootB]) {
      this.parent[rootB] = rootA
      return {
        attached: rootB,
        parent: rootA,
        rankIncreased: false,
      }
    }

    this.parent[rootB] = rootA
    this.rank[rootA] += 1

    return {
      attached: rootB,
      parent: rootA,
      rankIncreased: true,
    }
  }

  snapshot() {
    return {
      parent: { ...this.parent },
      rank: { ...this.rank },
    }
  }
}

export function parseGraphInput(nodesInput, edgesInput) {
  const nodes = Array.from(
    new Set(
      nodesInput
        .split(',')
        .map((node) => node.trim())
        .filter((node) => node.length > 0),
    ),
  )

  const edgeLines = edgesInput
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  const edges = []
  const errors = []

  edgeLines.forEach((line, lineIndex) => {
    const pieces = line.split(',').map((piece) => piece.trim())

    if (pieces.length !== 3) {
      errors.push(`Line ${lineIndex + 1}: expected format 'TownA, TownB, weight'.`)
      return
    }

    const [u, v, weightToken] = pieces
    const weight = Number(weightToken)

    if (!nodes.includes(u) || !nodes.includes(v)) {
      errors.push(`Line ${lineIndex + 1}: node '${u}' or '${v}' is not declared in the node list.`)
      return
    }

    if (u === v) {
      errors.push(`Line ${lineIndex + 1}: self loops are not valid for Kruskal's algorithm demo.`)
      return
    }

    if (Number.isNaN(weight)) {
      errors.push(`Line ${lineIndex + 1}: weight '${weightToken}' is not a number.`)
      return
    }

    edges.push({ u, v, weight })
  })

  return {
    nodes,
    edges,
    errors,
    isValid: nodes.length > 0 && edges.length > 0 && errors.length === 0,
  }
}

export function createKruskalTrace(nodes, rawEdges) {
  const requiredEdgeCount = Math.max(0, nodes.length - 1)

  if (!nodes.length || !rawEdges.length) {
    return {
      sortedEdges: [],
      steps: [
        {
          type: 'idle',
          message: 'Enter nodes and edges to start Kruskal\'s MST simulation.',
          edgeStates: {},
          parent: {},
          rank: {},
          acceptedEdgeIds: [],
          rejectedEdgeIds: [],
          mstWeight: 0,
          isConnected: false,
          requiredEdgeCount,
          activeLines: [],
        },
      ],
      mstEdges: [],
      mstWeight: 0,
      isConnected: false,
      requiredEdgeCount,
    }
  }

  const sortedEdges = rawEdges
    .map((edge, index) => ({ ...edge, id: createEdgeId(edge, index) }))
    .sort((leftEdge, rightEdge) => {
      if (leftEdge.weight !== rightEdge.weight) {
        return leftEdge.weight - rightEdge.weight
      }

      return leftEdge.id.localeCompare(rightEdge.id)
    })

  const unionFind = new UnionFind(nodes)
  const edgeStates = Object.fromEntries(sortedEdges.map((edge) => [edge.id, 'pending']))
  const acceptedEdgeIds = []
  const rejectedEdgeIds = []
  const steps = []
  let runningMstWeight = 0

  steps.push({
    type: 'start',
    message: 'Sort edges by non-decreasing weight and initialize Disjoint Set.',
    edgeStates: { ...edgeStates },
    parent: unionFind.snapshot().parent,
    rank: unionFind.snapshot().rank,
    acceptedEdgeIds: [...acceptedEdgeIds],
    rejectedEdgeIds: [...rejectedEdgeIds],
    mstWeight: runningMstWeight,
    requiredEdgeCount,
    activeLines: [KRUSKAL_LINES.SORT_EDGES, KRUSKAL_LINES.INIT_DISJOINT_SET],
  })

  for (const edge of sortedEdges) {
    if (acceptedEdgeIds.length >= requiredEdgeCount) {
      break
    }

    const compressionLog = []
    const rootU = unionFind.find(edge.u, compressionLog)
    const rootV = unionFind.find(edge.v, compressionLog)

    edgeStates[edge.id] = 'current'

    steps.push({
      type: 'check-edge',
      edge,
      rootU,
      rootV,
      compressionLog,
      message: `Check edge ${edge.u}-${edge.v} (weight ${edge.weight}). Roots: ${rootU}, ${rootV}.`,
      edgeStates: { ...edgeStates },
      parent: unionFind.snapshot().parent,
      rank: unionFind.snapshot().rank,
      acceptedEdgeIds: [...acceptedEdgeIds],
      rejectedEdgeIds: [...rejectedEdgeIds],
      mstWeight: runningMstWeight,
      requiredEdgeCount,
      activeLines: [KRUSKAL_LINES.FOR_EACH_EDGE, KRUSKAL_LINES.CHECK_CYCLE],
    })

    if (rootU !== rootV && acceptedEdgeIds.length < requiredEdgeCount) {
      const unionSummary = unionFind.union(rootU, rootV)
      acceptedEdgeIds.push(edge.id)
      edgeStates[edge.id] = 'accepted'
      runningMstWeight += edge.weight

      steps.push({
        type: 'accept-edge',
        edge,
        unionSummary,
        message: `Accepted edge ${edge.u}-${edge.v}. Union by rank attached ${unionSummary.attached} under ${unionSummary.parent}.`,
        edgeStates: { ...edgeStates },
        parent: unionFind.snapshot().parent,
        rank: unionFind.snapshot().rank,
        acceptedEdgeIds: [...acceptedEdgeIds],
        rejectedEdgeIds: [...rejectedEdgeIds],
        mstWeight: runningMstWeight,
        requiredEdgeCount,
        activeLines: [KRUSKAL_LINES.ACCEPT_EDGE, KRUSKAL_LINES.UNION_SETS],
      })
    } else {
      rejectedEdgeIds.push(edge.id)
      edgeStates[edge.id] = 'rejected'

      steps.push({
        type: 'reject-edge',
        edge,
        message: `Rejected edge ${edge.u}-${edge.v} because it forms a cycle.`,
        edgeStates: { ...edgeStates },
        parent: unionFind.snapshot().parent,
        rank: unionFind.snapshot().rank,
        acceptedEdgeIds: [...acceptedEdgeIds],
        rejectedEdgeIds: [...rejectedEdgeIds],
        mstWeight: runningMstWeight,
        requiredEdgeCount,
        activeLines: [KRUSKAL_LINES.REJECT_EDGE],
      })
    }
  }

  const mstEdges = sortedEdges.filter((edge) => acceptedEdgeIds.includes(edge.id))
  const mstWeight = mstEdges.reduce((sum, edge) => sum + edge.weight, 0)
  const isConnected = mstEdges.length === requiredEdgeCount
  const completionMessage = isConnected
    ? `Kruskal complete. MST has ${mstEdges.length} edges with total weight ${mstWeight}.`
    : `Graph is disconnected. Minimum Spanning Tree is not possible. Minimum Spanning Forest has ${mstEdges.length} edges with total weight ${mstWeight}.`

  steps.push({
    type: 'done',
    message: completionMessage,
    edgeStates: { ...edgeStates },
    parent: unionFind.snapshot().parent,
    rank: unionFind.snapshot().rank,
    acceptedEdgeIds: [...acceptedEdgeIds],
    rejectedEdgeIds: [...rejectedEdgeIds],
    mstWeight,
    isConnected,
    requiredEdgeCount,
    activeLines: [KRUSKAL_LINES.FOR_EACH_EDGE],
  })

  return {
    sortedEdges,
    steps,
    mstEdges,
    mstWeight,
    isConnected,
    requiredEdgeCount,
  }
}

export function buildCircularLayout(nodes, width, height) {
  if (!nodes.length) {
    return {}
  }

  if (nodes.length === 1) {
    return {
      [nodes[0]]: {
        x: width / 2,
        y: height / 2,
      },
    }
  }

  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width, height) * 0.35

  return Object.fromEntries(
    nodes.map((node, index) => {
      const angle = (2 * Math.PI * index) / nodes.length - Math.PI / 2
      return [
        node,
        {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        },
      ]
    }),
  )
}
