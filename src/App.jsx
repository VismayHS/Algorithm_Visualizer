import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import PixelSnow from './components/PixelSnow'
import PillNav from './components/PillNav'
import SplashCursor from './components/SplashCursor'
import TextType from './components/TextType'
import MergeSortPage from './features/mergeSort/MergeSortPage'
import MstPage from './features/mst/MstPage'
import StringMatchingPage from './features/stringMatching/StringMatchingPage'

const MotionPanel = motion.div
const THEME_STORAGE_KEY = 'algorithm-visualizer-theme'

function getInitialTheme() {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)

  if (storedTheme === 'dark' || storedTheme === 'light') {
    return storedTheme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const TABS = [
  {
    id: 'string-matching',
    label: 'String Matching',
    component: StringMatchingPage,
  },
  {
    id: 'merge-sort',
    label: 'Merge Sort',
    component: MergeSortPage,
  },
  {
    id: 'mst',
    label: 'Kruskal MST',
    component: MstPage,
  },
]

function App() {
  const [activeTab, setActiveTab] = useState(TABS[0].id)
  const [theme, setTheme] = useState(getInitialTheme)

  const ActiveComponent = useMemo(() => {
    return TABS.find((tab) => tab.id === activeTab)?.component ?? StringMatchingPage
  }, [activeTab])

  const navItems = useMemo(
    () =>
      TABS.map((tab) => ({
        label: tab.label,
        href: tab.id,
        onClick: () => setActiveTab(tab.id),
      })),
    [],
  )

  useEffect(() => {
    const root = document.documentElement

    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const isDark = theme === 'dark'

  return (
    <div className="relative min-h-screen bg-slate-50 px-4 py-6 text-slate-900 dark:bg-slate-900 dark:text-slate-100 sm:px-6">
      <div className="pointer-events-none fixed inset-0 z-0">
        <PixelSnow
          color={isDark ? '#ffffff' : '#334155'}
          flakeSize={0.01}
          minFlakeSize={1.25}
          pixelResolution={200}
          speed={1.25}
          density={isDark ? 0.3 : 0.2}
          direction={125}
          brightness={isDark ? 1 : 0.65}
          depthFade={8}
          farPlane={20}
        />
      </div>

      <SplashCursor
        DENSITY_DISSIPATION={3.5}
        VELOCITY_DISSIPATION={2}
        PRESSURE={0.1}
        CURL={3}
        SPLAT_RADIUS={0.2}
        SPLAT_FORCE={6000}
        COLOR_UPDATE_SPEED={10}
        SHADING
        RAINBOW_MODE={false}
        COLOR="#A855F7"
      />

      <div className="relative z-10 mr-auto w-full max-w-6xl">
        <header className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-start justify-between gap-3">
            <div>
              <TextType
                as="h1"
                text="Algorithm Visualizer"
                typingSpeed={75}
                pauseDuration={1200}
                loop={false}
                showCursor
                cursorCharacter="|"
                className="text-xl font-semibold text-slate-900 dark:text-slate-100"
                cursorClassName="text-slate-500 dark:text-slate-300"
              />

              <TextType
                as="p"
                text="Step-by-step, input-driven visualization for Q3, Q8, and Q13."
                typingSpeed={30}
                initialDelay={300}
                pauseDuration={1200}
                loop={false}
                showCursor={false}
                className="mt-1 text-sm text-slate-600 dark:text-slate-300"
              />
            </div>

            <button
              type="button"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? '☀' : '☾'}
            </button>
          </div>
        </header>

        <PillNav
          items={navItems}
          activeHref={activeTab}
          className="mb-4"
          ease="power2.easeOut"
          baseColor={isDark ? '#1e293b' : '#0f172a'}
          pillColor={isDark ? '#e2e8f0' : '#ffffff'}
          hoveredPillTextColor={isDark ? '#e2e8f0' : '#ffffff'}
          pillTextColor="#0f172a"
          initialLoadAnimation
          onLogoClick={() => setActiveTab(TABS[0].id)}
        />

        <main className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">
          <AnimatePresence mode="wait">
            <MotionPanel
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <ActiveComponent />
            </MotionPanel>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default App
