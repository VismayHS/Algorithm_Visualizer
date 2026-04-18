import { useMemo } from 'react'

function CodeSnippetCard({ title, snippet, activeLines = [], executionNote = '' }) {
  const lines = useMemo(() => {
    if (!snippet) {
      return []
    }

    return snippet.replace(/\r\n/g, '\n').split('\n')
  }, [snippet])

  const activeLineSet = useMemo(() => new Set(activeLines), [activeLines])

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>

      <div className="mt-3 overflow-x-auto rounded-md border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-900">
        <div className="min-w-[18rem] space-y-1">
          {lines.map((line, index) => {
            const lineNumber = index + 1
            const isActive = activeLineSet.has(lineNumber)

            return (
              <div
                key={`${title}-line-${lineNumber}`}
                className={`grid grid-cols-[2rem_2rem_1fr] items-start gap-2 rounded px-2 py-1 ${
                  isActive ? 'bg-amber-100 dark:bg-amber-500/20' : ''
                }`}
              >
                <span
                  className={`text-center font-mono text-xs ${
                    isActive ? 'text-amber-700 dark:text-amber-300' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {isActive ? '->' : ''}
                </span>
                <span
                  className={`font-mono text-xs ${
                    isActive ? 'text-amber-700 dark:text-amber-300' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {lineNumber}
                </span>
                <code
                  className={`whitespace-pre text-xs leading-relaxed ${
                    isActive ? 'text-slate-900 dark:text-amber-100' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {line || ' '}
                </code>
              </div>
            )
          })}

          {!lines.length && (
            <p className="rounded border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              No snippet available.
            </p>
          )}
        </div>
      </div>

      {executionNote && <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">{executionNote}</p>}
    </section>
  )
}

export default CodeSnippetCard
