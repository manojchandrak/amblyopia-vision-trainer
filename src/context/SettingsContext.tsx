import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type WeakEye = 'left' | 'right'

interface SettingsContextValue {
  weakEye: WeakEye
  setWeakEye: (eye: WeakEye) => void
  hasGlasses: boolean
  setHasGlasses: (has: boolean) => void
  /** CSS color for the channel the amblyopic eye sees through standard red-left/blue-right glasses. */
  weakEyeColor: string
  strongEyeColor: string
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeStored<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore — private browsing / blocked storage
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [weakEye, setWeakEyeState] = useState<WeakEye>(() => readStored('avt.weakEye', 'left'))
  const [hasGlasses, setHasGlassesState] = useState<boolean>(() => readStored('avt.hasGlasses', true))

  useEffect(() => writeStored('avt.weakEye', weakEye), [weakEye])
  useEffect(() => writeStored('avt.hasGlasses', hasGlasses), [hasGlasses])

  function setWeakEye(eye: WeakEye) {
    setWeakEyeState(eye)
  }
  function setHasGlasses(has: boolean) {
    setHasGlassesState(has)
  }

  // Standard convention for red-blue glasses: red lens over the left eye, blue lens over the right eye.
  const weakEyeColor = weakEye === 'left' ? 'var(--anaglyph-red)' : 'var(--anaglyph-blue)'
  const strongEyeColor = weakEye === 'left' ? 'var(--anaglyph-blue)' : 'var(--anaglyph-red)'

  return (
    <SettingsContext.Provider
      value={{ weakEye, setWeakEye, hasGlasses, setHasGlasses, weakEyeColor, strongEyeColor }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
