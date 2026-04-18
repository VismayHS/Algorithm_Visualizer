import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import CodeSnippetCard from '../../components/CodeSnippetCard'
import PlaybackControls from '../../components/PlaybackControls'
import { usePlayback } from '../../hooks/usePlayback'
import { createNaiveStringMatchingTrace } from './naiveStringMatching'

const DEFAULT_TEXT = 'ABABDABACDABABCABAB'
const DEFAULT_PATTERN = 'ABABC'
const CELL_SIZE = 34
const MotionPatternRow = motion.div

const NAIVE_SNIPPET = `for i from 0 to n - m:
  j = 0
  while j < m and text[i + j] == pattern[j]:
    j = j + 1
  if j == m:
    record match at index i`

function normalizePhrase(value) {
  return value.trim().replace(/\s+/g, ' ')
}

function displayCharacter(character) {
  if (character === ' ') {
    return '␠'
  }

  return character
}

function StringMatchingPage() {
  const [textInput, setTextInput] = useState(DEFAULT_TEXT)
  const [patternInput, setPatternInput] = useState(DEFAULT_PATTERN)
  const [activeText, setActiveText] = useState(DEFAULT_TEXT)
  const [activePattern, setActivePattern] = useState(DEFAULT_PATTERN)
  const [trace, setTrace] = useState(() => createNaiveStringMatchingTrace(DEFAULT_TEXT, DEFAULT_PATTERN))
  const [speed, setSpeed] = useState(400)
  const [error, setError] = useState('')

  const { steps, matches, totalComparisons, totalShifts } = trace

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

  const normalizedInputPattern = useMemo(() => normalizePhrase(patternInput), [patternInput])
  const patternWordCount = useMemo(
    () => (normalizedInputPattern.length ? normalizedInputPattern.split(' ').length : 0),
    [normalizedInputPattern],
  )
  const patternCharacterCount = normalizedInputPattern.length

  const visualizationText = activeText
  const visualizationPattern = activePattern
  const windowStart = currentStep?.windowStart ?? 0
  const activePatternIndex = currentStep?.activePatternIndex
  const activeTextIndex = currentStep?.activeTextIndex
  const inCompareStep = currentStep?.type === 'compare'
  const isMatchComparison = inCompareStep && currentStep?.isMatch === true
  const isMismatchComparison = inCompareStep && currentStep?.isMatch === false

  const handleRun = () => {
    const normalizedText = textInput
    const normalizedPattern = normalizePhrase(patternInput)

    if (!normalizedText.trim()) {
      setError('Text cannot be empty.')
      return
    }

    if (!normalizedPattern) {
      setError('Pattern cannot be empty.')
      return
    }

    if (normalizedPattern.length > normalizedText.length) {
      setError('Pattern length cannot be greater than text length.')
      return
    }

    const nextTrace = createNaiveStringMatchingTrace(normalizedText, normalizedPattern)

    setError('')
    resetPlayback()
    setActiveText(normalizedText)
    setActivePattern(normalizedPattern)
    setTrace(nextTrace)
  }

  const handleReset = () => {
    const defaultTrace = createNaiveStringMatchingTrace(DEFAULT_TEXT, DEFAULT_PATTERN)

    setTextInput(DEFAULT_TEXT)
    setPatternInput(DEFAULT_PATTERN)
    setActiveText(DEFAULT_TEXT)
    setActivePattern(DEFAULT_PATTERN)
    setTrace(defaultTrace)
    setError('')
    resetPlayback()
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Naive String Matching Visualization</h2>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Input</h3>
        <div className="mt-3 grid gap-3">
          <label className="grid gap-1">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Text</span>
            <textarea
              rows={4}
              value={textInput}
              onChange={(event) => setTextInput(event.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Pattern (your choice)</span>
            <input
              value={patternInput}
              onChange={(event) => setPatternInput(event.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pattern words: {patternWordCount} | characters: {patternCharacterCount}
          </p>

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

            <div className="mt-4 overflow-x-auto rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
              <div className="inline-block min-w-max">
                <div className="mb-3 grid" style={{ gridTemplateColumns: `repeat(${visualizationText.length}, ${CELL_SIZE}px)` }}>
                  {Array.from(visualizationText).map((character, index) => {
                    const inWindow = index >= windowStart && index < windowStart + visualizationPattern.length
                    const isComparedChar = index === activeTextIndex

                    let cellClass = 'border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'

                    if (inWindow) {
                      cellClass = 'border-amber-400 bg-amber-100 text-amber-900 dark:border-amber-300 dark:bg-amber-500/20 dark:text-amber-200'
                    }

                    if (isComparedChar && isMatchComparison) {
                      cellClass = 'border-emerald-500 bg-emerald-200 text-emerald-900 dark:border-emerald-400 dark:bg-emerald-500/20 dark:text-emerald-200'
                    }

                    if (isComparedChar && isMismatchComparison) {
                      cellClass = 'border-rose-500 bg-rose-200 text-rose-900 dark:border-rose-400 dark:bg-rose-500/20 dark:text-rose-200'
                    }

                    return (
                      <div
                        key={`text-${index}`}
                        className={`flex h-8 w-8 items-center justify-center border text-xs font-semibold ${cellClass}`}
                      >
                        {displayCharacter(character)}
                      </div>
                    )
                  })}
                </div>

                <div className="relative h-10" style={{ width: visualizationText.length * CELL_SIZE }}>
                  <MotionPatternRow
                    animate={{ x: windowStart * CELL_SIZE }}
                    transition={{ duration: Math.min(speed / 1000, 0.35), ease: 'easeOut' }}
                    className="absolute left-0 top-0 flex"
                  >
                    {Array.from(visualizationPattern).map((character, index) => {
                      const isComparedPatternChar = index === activePatternIndex

                      let cellClass =
                        'border-amber-400 bg-amber-100 text-amber-900 dark:border-amber-300 dark:bg-amber-500/20 dark:text-amber-200'

                      if (isComparedPatternChar && isMatchComparison) {
                        cellClass = 'border-emerald-500 bg-emerald-200 text-emerald-900 dark:border-emerald-400 dark:bg-emerald-500/20 dark:text-emerald-200'
                      }

                      if (isComparedPatternChar && isMismatchComparison) {
                        cellClass = 'border-rose-500 bg-rose-200 text-rose-900 dark:border-rose-400 dark:bg-rose-500/20 dark:text-rose-200'
                      }

                      return (
                        <div
                          key={`pattern-${index}`}
                          className={`flex h-8 w-8 items-center justify-center border text-xs font-semibold ${cellClass}`}
                        >
                          {displayCharacter(character)}
                        </div>
                      )
                    })}
                  </MotionPatternRow>
                </div>
              </div>
            </div>

          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Output</h3>
            <div className="mt-3 grid gap-2 text-sm text-slate-700 dark:text-slate-300">
              <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                Final match indices: <span className="font-semibold">{matches.length ? matches.join(', ') : 'None'}</span>
              </p>
              <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                Total comparisons: <span className="font-semibold">{totalComparisons}</span>
              </p>
              <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                Total shifts: <span className="font-semibold">{totalShifts}</span>
              </p>
              <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                Time complexity: Best O(n), Worst O(n * m)
              </p>
            </div>
          </section>
        </div>

        <div className="self-start md:sticky md:top-4">
          <CodeSnippetCard
            title="Pseudocode"
            snippet={NAIVE_SNIPPET}
            activeLines={currentStep?.activeLines ?? []}
            executionNote={currentStep?.type ? `Current step: ${currentStep.type}` : ''}
          />
        </div>
      </div>
    </div>
  )
}

export default StringMatchingPage
