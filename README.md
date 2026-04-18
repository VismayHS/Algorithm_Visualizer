# DAA Algorithm Visualizer

Interactive React app for step-by-step visualization of:

1. Q3: Naive String Matching
2. Q8: Merge Sort
3. Q13: Kruskal Minimum Spanning Tree (MST)

The project focuses on algorithm correctness, input-driven traces, and clear per-step visual feedback.

## Current Highlights

- Dynamic, input-driven traces for all three algorithms.
- Shared playback controls (Play/Pause, Previous, Next, Speed).
- Pseudocode panel with active line highlighting per step.
- Theme toggle (dark/light) with persistence.
- Enhanced UI effects:
  - `PillNav` animated navbar
  - `TextType` animated title/subtitle typing
  - `SplashCursor` fluid cursor effect
  - `PixelSnow` background shader effect

## Tech Stack

- React 19
- Vite
- Tailwind CSS
- Framer Motion
- GSAP
- Three.js

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

1. Run lint:

```bash
npm run lint
```

## Defaults

### String Matching

- Text: `ABABDABACDABABCABAB`
- Pattern: `ABABC`

### Merge Sort

- Left array: `[1, 4, 9]`
- Right array: `[2, 3, 6]`

## Algorithm Notes

### Q3 Naive String Matching

- Sliding window comparison with detailed per-character trace.
- Match/mismatch highlighting in visualization.
- Stops after first full match in current logic.
- Output includes match indices, comparisons, and shifts.

Complexity:

- Best case: O(n)
- Worst case: O(n * m)

### Q8 Merge Sort

- Two sorted arrays are combined and recursively merge-sorted.
- SVG recursion tree with programmatic layout.
- Tree visibility grows step-by-step (not fully shown at first step).
- Merge phase is incremental: parent node updates as merged values are appended.

Complexity:

- O(n log n)

### Q13 Kruskal MST

- Edges sorted by weight.
- Union-Find with path compression and union by rank.
- Edge states: pending/current/accepted/rejected.
- MST selection capped at `V - 1` accepted edges.

Complexity:

- O(E log E)

## Project Structure

```text
.
|- src/
|  |- components/
|  |  |- CodeSnippetCard.jsx
|  |  |- PillNav.jsx
|  |  |- PillNav.css
|  |  |- PixelSnow.jsx
|  |  |- PixelSnow.css
|  |  |- PlaybackControls.jsx
|  |  |- SplashCursor.jsx
|  |  |- TextType.jsx
|  |  |- TextType.css
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

## Validation Status

- ESLint: passing
- Production build: passing
- Dev server: running successfully

Note:

- Build may show a chunk size warning due shader/animation libraries; this is currently non-blocking.
