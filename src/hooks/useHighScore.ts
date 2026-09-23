import { useEffect, useState } from 'react'

interface Options {
  /** When true, a lower reported value counts as a new "best" (e.g. fewest moves). */
  lowerIsBetter?: boolean
}

export function useHighScore(gameId: string, options: Options = {}) {
  const { lowerIsBetter = false } = options
  const key = `avt.highscore.${gameId}`
  const [highScore, setHighScoreState] = useState<number | null>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? Number(raw) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (highScore === null) return
    try {
      localStorage.setItem(key, String(highScore))
    } catch {
      // ignore
    }
  }, [key, highScore])

  function reportScore(score: number) {
    if (highScore === null || (lowerIsBetter ? score < highScore : score > highScore)) {
      setHighScoreState(score)
    }
  }

  return { highScore: highScore ?? (lowerIsBetter ? Infinity : 0), reportScore }
}
