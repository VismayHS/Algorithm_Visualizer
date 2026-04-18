const NAIVE_LINES = {
  FOR_LOOP: 1,
  INIT_J: 2,
  WHILE_COMPARE: 3,
  INCREMENT_J: 4,
  IF_MATCH: 5,
  RECORD_MATCH: 6,
}

export function createNaiveStringMatchingTrace(rawText, rawPattern) {
  const text = rawText ?? ''
  const pattern = rawPattern ?? ''
  const n = text.length
  const m = pattern.length

  if (n === 0 || m === 0 || m > n) {
    return {
      steps: [
        {
          type: 'idle',
          windowStart: 0,
          activeTextIndex: null,
          activePatternIndex: null,
          comparisons: 0,
          shifts: 0,
          matches: [],
          isMatch: null,
          activeLines: [],
          message:
            m > n
              ? 'Pattern length is larger than text length, so no match is possible.'
              : 'Enter both a text and a non-empty pattern to start the simulation.',
        },
      ],
      matches: [],
      totalComparisons: 0,
      totalShifts: 0,
    }
  }

  const steps = []
  const matches = []
  let comparisons = 0
  let shifts = 0
  let finalWindowStart = 0

  const createStep = (overrides) => ({
    type: 'idle',
    i: 0,
    j: 0,
    windowStart: 0,
    activeTextIndex: null,
    activePatternIndex: null,
    comparisons,
    shifts,
    matches: [...matches],
    isMatch: null,
    activeLines: [],
    ...overrides,
  })

  for (let i = 0; i <= n - m; i += 1) {
    finalWindowStart = i

    steps.push(
      createStep({
        type: 'for-iteration',
        i,
        j: 0,
        windowStart: i,
        activeLines: [NAIVE_LINES.FOR_LOOP],
        message: `Start for-loop iteration at shift i = ${i}.`,
      }),
    )

    let j = 0

    steps.push(
      createStep({
        type: 'init-j',
        i,
        j,
        windowStart: i,
        activeLines: [NAIVE_LINES.INIT_J],
        message: `Initialize j = 0 for the current shift i = ${i}.`,
      }),
    )

    while (j < m) {
      const activeTextIndex = i + j
      const textChar = text[activeTextIndex]
      const patternChar = pattern[j]
      const isMatch = textChar === patternChar

      comparisons += 1

      steps.push(
        createStep({
          type: 'compare',
          i,
          j,
          windowStart: i,
          activeTextIndex,
          activePatternIndex: j,
          textChar,
          patternChar,
          isMatch,
          activeLines: [NAIVE_LINES.WHILE_COMPARE],
          message: isMatch
            ? `While condition holds: text[${activeTextIndex}] ('${textChar}') matches pattern[${j}] ('${patternChar}').`
            : `While comparison fails: text[${activeTextIndex}] ('${textChar}') != pattern[${j}] ('${patternChar}').`,
        }),
      )

      if (!isMatch) {
        break
      }

      j += 1

      steps.push(
        createStep({
          type: 'increment-j',
          i,
          j,
          windowStart: i,
          activeTextIndex: activeTextIndex,
          activePatternIndex: j - 1,
          isMatch: true,
          activeLines: [NAIVE_LINES.INCREMENT_J],
          message: `Characters matched, increment j to ${j}.`,
        }),
      )
    }

    const fullMatch = j === m

    steps.push(
      createStep({
        type: 'if-check',
        i,
        j,
        windowStart: i,
        isMatch: fullMatch,
        activeLines: [NAIVE_LINES.IF_MATCH],
        message: fullMatch
          ? `Condition j == m is true (${j} == ${m}).`
          : `Condition j == m is false (${j} != ${m}).`,
      }),
    )

    if (fullMatch) {
      matches.push(i)
      steps.push(
        createStep({
          type: 'match-found',
          i,
          j,
          windowStart: i,
          activeTextIndex: i,
          activePatternIndex: null,
          isMatch: true,
          activeLines: [NAIVE_LINES.RECORD_MATCH],
          message: `Record match at index ${i}.`,
        }),
      )

      break
    }

    if (i < n - m) {
      shifts += 1
      steps.push(
        createStep({
          type: 'shift',
          i: i + 1,
          j: 0,
          windowStart: i + 1,
          activeTextIndex: null,
          activePatternIndex: null,
          isMatch: null,
          activeLines: [NAIVE_LINES.FOR_LOOP],
          message: `Shift window from index ${i} to ${i + 1}.`,
        }),
      )
    }
  }

  steps.push(
    createStep({
      type: 'done',
      i: finalWindowStart,
      windowStart: finalWindowStart,
      activeTextIndex: null,
      activePatternIndex: null,
      isMatch: null,
      activeLines: [NAIVE_LINES.FOR_LOOP],
      message:
        matches.length > 0
          ? `Search complete. Found match at index ${matches[0]}. Stopped after first match.`
          : 'Search complete. No matches found.',
    }),
  )

  return {
    steps,
    matches,
    totalComparisons: comparisons,
    totalShifts: shifts,
  }
}

export function isWorstCaseInput(rawText, rawPattern) {
  const text = (rawText ?? '').replace(/\s+/g, '')
  const pattern = (rawPattern ?? '').replace(/\s+/g, '')

  if (!text || !pattern) {
    return false
  }

  if (pattern.length < 2 || text.length < pattern.length) {
    return false
  }

  const repeatedPart = pattern.slice(0, -1)
  const repeatedCharacter = repeatedPart[0]
  const allRepeated = repeatedPart.split('').every((character) => character === repeatedCharacter)

  if (!allRepeated) {
    return false
  }

  const textMostlyRepeated = text
    .slice(0, Math.max(0, text.length - 1))
    .split('')
    .every((character) => character === repeatedCharacter)

  const lastPatternCharacterDifferent = pattern[pattern.length - 1] !== repeatedCharacter

  return textMostlyRepeated && lastPatternCharacterDifferent
}
