# DAA Algorithm Visualizer

A clean, minimal React application for step-by-step visualization of three algorithms:

1. Naive String Matching (Q3)
1. Merge Sort (Q8)
1. Kruskal Minimum Spanning Tree (Q13)

This version is focused on correctness and clarity.

## Tech Stack

- React
- Tailwind CSS
- Framer Motion (used only for meaningful step transitions)
- Vite

## Run Locally

1. Install dependencies:

```bash
npm install
```

1. Start development server:

```bash
npm run dev
```

If PowerShell blocks npm scripts:

```bash
npm.cmd run dev
```

1. Build production bundle:

```bash
npm run build
```

## Minimal UI Structure

Each algorithm page contains only:

1. Title
1. Input section (manual fields + Run + Reset)
1. Controls (Play/Pause, Previous Step, Next Step, Speed slider)
1. Visualization area
1. Output section (final result + important values)
1. Pseudocode panel

Removed features:

- Teacher mode
- Demo scripts
- Sample input/output presentation panels
- Dashboard-style sidebar and extra cards

## Project Structure

```text
.
|- src/
|  |- components/
|  |  |- CodeSnippetCard.jsx
|  |  |- PlaybackControls.jsx
|  |- features/
|  |  |- stringMatching/
|  |  |  |- StringMatchingPage.jsx
|  |  |  |- naiveStringMatching.js
|  |  |- mergeSort/
|  |  |  |- MergeSortPage.jsx
|  |  |  |- mergeSortTrace.js
|  |  |- mst/
|  |     |- MstPage.jsx
|  |     |- kruskalTrace.js
|  |- hooks/
|  |  |- usePlayback.js
|  |- App.jsx
|  |- index.css
|  |- main.jsx
```

## Algorithm Accuracy Notes

### Q3 Naive String Matching

- Checks every shift i from 0 to n - m
- Compares characters one-by-one with j
- Visualization shows:
  - current window
  - current character comparison
  - match in green
  - mismatch in red
  - pattern shifting to the right
- Output includes total comparisons, total shifts, and match indices

Complexity:

- Best case: O(n)
- Worst case: O(n * m)

### Q8 Merge Sort

- Two sorted input arrays are combined and processed with merge sort
- Tree is dynamic per step (not pre-rendered)
- Visualization shows:
  - split operations
  - recursive calls
  - active merge pair
  - merged values updating live
- Output includes final sorted array and total merge comparisons

Complexity:

- O(n log n)

Recurrence:

- T(n) = 2T(n/2) + O(n)

### Q13 Kruskal MST

- Edges are sorted by weight
- Union-Find with path compression and union by rank
- Each edge has a unique id in trace
- Visualization shows each step:
  - current edge (yellow)
  - accepted edge (green)
  - rejected edge (red)
  - union-find parent updates
- MST acceptance is explicitly capped at V - 1 edges
- Output includes MST edges, total MST weight, and disconnected graph notice

Complexity:

- O(E log E)

## Validation Status

- ESLint: passing
- Production build: passing
- Dev server: runs successfully
