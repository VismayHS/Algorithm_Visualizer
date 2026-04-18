import { useCallback, useEffect, useMemo, useState } from 'react'

export function usePlayback(steps, speedMs = 500) {
  const totalSteps = steps.length
  const lastIndex = Math.max(0, totalSteps - 1)
  const [stepIndex, setStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const clampedStepIndex = Math.min(stepIndex, lastIndex)
  const reachedEnd = clampedStepIndex >= lastIndex
  const effectiveIsPlaying = isPlaying && !reachedEnd

  useEffect(() => {
    if (!effectiveIsPlaying) {
      return undefined
    }

    const timerId = window.setTimeout(() => {
      setStepIndex((previousIndex) => Math.min(previousIndex + 1, lastIndex))
    }, speedMs)

    return () => window.clearTimeout(timerId)
  }, [effectiveIsPlaying, lastIndex, speedMs])

  const playPause = useCallback(() => {
    if (effectiveIsPlaying) {
      setIsPlaying(false)
      return
    }

    if (reachedEnd) {
      setStepIndex(0)
    }

    setIsPlaying(true)
  }, [effectiveIsPlaying, reachedEnd])

  const reset = useCallback(() => {
    setStepIndex(0)
    setIsPlaying(false)
  }, [])

  const next = useCallback(() => {
    setIsPlaying(false)
    setStepIndex((previousIndex) => {
      const normalizedIndex = Math.min(previousIndex, lastIndex)
      return Math.min(normalizedIndex + 1, lastIndex)
    })
  }, [lastIndex])

  const previous = useCallback(() => {
    setIsPlaying(false)
    setStepIndex((previousIndex) => {
      const normalizedIndex = Math.min(previousIndex, lastIndex)
      return Math.max(normalizedIndex - 1, 0)
    })
  }, [lastIndex])

  const progress = useMemo(() => {
    if (totalSteps <= 1) {
      return 0
    }

    return Math.round((clampedStepIndex / lastIndex) * 100)
  }, [clampedStepIndex, lastIndex, totalSteps])

  return {
    stepIndex: clampedStepIndex,
    isPlaying: effectiveIsPlaying,
    setStepIndex,
    setIsPlaying,
    playPause,
    reset,
    next,
    previous,
    progress,
    totalSteps,
  }
}
