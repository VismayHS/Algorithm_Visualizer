function PlaybackControls({
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  speed,
  onSpeedChange,
  stepIndex,
  totalSteps,
  disabled = false,
}) {
  const maxStepIndex = Math.max(totalSteps - 1, 0)
  const controlsDisabled = disabled || totalSteps <= 1
  const canGoPrevious = !controlsDisabled && stepIndex > 0
  const canGoNext = !controlsDisabled && stepIndex < maxStepIndex
  const canPlayPause = !controlsDisabled
  const stepLabel = `${Math.min(stepIndex + 1, Math.max(totalSteps, 1))} / ${Math.max(totalSteps, 1)}`

  const buttonBaseClass =
    'rounded-md border px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-500'
  const secondaryButtonClass = `${buttonBaseClass} border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700`

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Controls</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Step {stepLabel}</p>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">Use Play for automatic stepping.</p>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onPlayPause}
          disabled={!canPlayPause}
          className={`${buttonBaseClass} border-slate-900 bg-slate-900 text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-200 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300`}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className={secondaryButtonClass}
        >
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          className={secondaryButtonClass}
        >
          Next
        </button>
      </div>

      <div className="mt-3">
        <label htmlFor="speed" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
          Speed ({speed} ms)
        </label>
        <input
          id="speed"
          type="range"
          min="80"
          max="1400"
          step="20"
          value={speed}
          disabled={controlsDisabled}
          onChange={(event) => onSpeedChange(Number(event.target.value))}
          className="mt-2 h-2 w-full cursor-pointer rounded-full accent-slate-700 disabled:cursor-not-allowed dark:accent-slate-300"
        />
      </div>
    </section>
  )
}

export default PlaybackControls
