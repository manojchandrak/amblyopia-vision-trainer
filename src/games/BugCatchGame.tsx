import { useCallback, useEffect, useRef, useState } from 'react'
import GameFrame from '../components/GameFrame'
import { useHighScore } from '../hooks/useHighScore'
import { useSettings } from '../context/SettingsContext'
import { anaglyphGames } from '../data/games'
import './BugCatchGame.css'

const meta = anaglyphGames.find((g) => g.id === 'bug-catch')!
const TOTAL_BUGS = 20
const BUG_LIFETIME_MS = 1700

interface Bug {
  id: number
  x: number
  y: number
  isWeakEye: boolean
}

export default function BugCatchGame() {
  const { highScore, reportScore } = useHighScore('bug-catch')
  const { weakEyeColor, strongEyeColor } = useSettings()
  const [phase, setPhase] = useState<'idle' | 'playing' | 'done'>('idle')
  const [spawned, setSpawned] = useState(0)
  const [caught, setCaught] = useState(0)
  const [bug, setBug] = useState<Bug | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idRef = useRef(0)

  const spawnNext = useCallback((count: number) => {
    if (count > TOTAL_BUGS) {
      setPhase('done')
      setBug(null)
      return
    }
    idRef.current += 1
    const next: Bug = {
      id: idRef.current,
      x: 10 + Math.random() * 80,
      y: 12 + Math.random() * 76,
      isWeakEye: Math.random() < 0.5,
    }
    setBug(next)
    setSpawned(count)
    timerRef.current = setTimeout(() => spawnNext(count + 1), BUG_LIFETIME_MS)
  }, [])

  const start = useCallback(() => {
    setCaught(0)
    if (timerRef.current) clearTimeout(timerRef.current)
    spawnNext(1)
    setPhase('playing')
  }, [spawnNext])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  useEffect(() => {
    if (phase === 'done') reportScore(caught)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  function catchBug() {
    if (!bug) return
    if (timerRef.current) clearTimeout(timerRef.current)
    setCaught((c) => c + 1)
    setBug(null)
    timerRef.current = setTimeout(() => spawnNext(spawned + 1), 150)
  }

  return (
    <GameFrame
      meta={meta}
      backTo="/anaglyph"
      backLabel="All glasses games"
      score={caught}
      highScore={highScore}
      scoreLabel="Caught"
      needsGlasses
    >
      <div className="bug-stage">
        {phase === 'idle' && (
          <div className="stage-overlay">
            <p>Put your glasses on. Click each bug before it scurries away.</p>
            <button type="button" className="btn" onClick={start}>
              Start ({TOTAL_BUGS} bugs)
            </button>
          </div>
        )}

        {phase === 'done' && (
          <div className="stage-overlay">
            <h3>All done!</h3>
            <p>
              You caught {caught} of {TOTAL_BUGS} bugs.
            </p>
            <button type="button" className="btn" onClick={start}>
              Play again
            </button>
          </div>
        )}

        {phase === 'playing' && (
          <>
            <div className="hud">
              Bug {spawned}/{TOTAL_BUGS} &middot; Caught {caught}
            </div>

            {bug && (
              <button
                key={bug.id}
                type="button"
                className={`bug${bug.isWeakEye ? ' weak-eye' : ' strong-eye'}`}
                style={{
                  left: `${bug.x}%`,
                  top: `${bug.y}%`,
                  color: bug.isWeakEye ? weakEyeColor : strongEyeColor,
                }}
                onClick={catchBug}
                aria-label="bug"
              >
                <svg viewBox="0 0 32 32" width="30" height="30">
                  <ellipse cx="16" cy="18" rx="10" ry="12" fill="currentColor" />
                  <circle cx="16" cy="7" r="5" fill="currentColor" />
                  <line x1="16" y1="6" x2="10" y2="1" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="16" y1="6" x2="22" y2="1" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="6" y1="18" x2="1" y2="14" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="6" y1="22" x2="1" y2="24" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="26" y1="18" x2="31" y2="14" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="26" y1="22" x2="31" y2="24" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
            )}
          </>
        )}
      </div>
    </GameFrame>
  )
}
