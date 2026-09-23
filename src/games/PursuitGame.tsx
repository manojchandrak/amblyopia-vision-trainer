import { useCallback, useEffect, useRef, useState } from 'react'
import GameFrame from '../components/GameFrame'
import { useAnimationFrame } from '../hooks/useAnimationFrame'
import { useHighScore } from '../hooks/useHighScore'
import { noGlassesGames } from '../data/games'
import './PursuitGame.css'

const meta = noGlassesGames.find((g) => g.id === 'pursuit')!
const ROUND_SECONDS = 45
const SPEED = 28 // percent of stage per second

function randomPoint() {
  return { x: 10 + Math.random() * 80, y: 12 + Math.random() * 76 }
}

export default function PursuitGame() {
  const { highScore, reportScore } = useHighScore('pursuit')
  const [phase, setPhase] = useState<'idle' | 'playing' | 'done'>('idle')
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [score, setScore] = useState(0)
  const [misses, setMisses] = useState(0)
  const [pos, setPos] = useState(() => randomPoint())
  const [flashing, setFlashing] = useState(false)

  const waypointRef = useRef(randomPoint())
  const flashTimerRef = useRef(0)
  const nextFlashRef = useRef(2 + Math.random() * 2)
  const flashActiveRef = useRef(false)

  useAnimationFrame(
    (dt) => {
      // countdown
      setTimeLeft((t) => {
        const next = t - dt
        if (next <= 0) {
          setPhase('done')
          return 0
        }
        return next
      })

      // steer toward waypoint
      setPos((p) => {
        const wp = waypointRef.current
        const dx = wp.x - p.x
        const dy = wp.y - p.y
        const dist = Math.hypot(dx, dy)
        if (dist < 2) {
          waypointRef.current = randomPoint()
          return p
        }
        const step = SPEED * dt
        return { x: p.x + (dx / dist) * step, y: p.y + (dy / dist) * step }
      })

      // flash cycle
      flashTimerRef.current += dt
      if (!flashActiveRef.current && flashTimerRef.current >= nextFlashRef.current) {
        flashActiveRef.current = true
        flashTimerRef.current = 0
        setFlashing(true)
      } else if (flashActiveRef.current && flashTimerRef.current >= 0.9) {
        flashActiveRef.current = false
        flashTimerRef.current = 0
        nextFlashRef.current = 2 + Math.random() * 2.5
        setFlashing(false)
        setMisses((m) => m + 1) // flash expired without a click
      }
    },
    phase === 'playing',
  )

  const start = useCallback(() => {
    setScore(0)
    setMisses(0)
    setTimeLeft(ROUND_SECONDS)
    setPos(randomPoint())
    waypointRef.current = randomPoint()
    flashTimerRef.current = 0
    nextFlashRef.current = 2 + Math.random() * 2
    flashActiveRef.current = false
    setFlashing(false)
    setPhase('playing')
  }, [])

  function handleFireflyClick() {
    if (phase !== 'playing') return
    if (flashing) {
      setScore((s) => s + 1)
      setFlashing(false)
      flashActiveRef.current = false
      flashTimerRef.current = 0
      nextFlashRef.current = 2 + Math.random() * 2.5
    }
  }

  useEffect(() => {
    if (phase === 'done') reportScore(score)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  return (
    <GameFrame meta={meta} backTo="/exercises" backLabel="All exercises" score={score} highScore={highScore}>
      <div className="pursuit-stage">
        {phase === 'idle' && (
          <div className="stage-overlay">
            <p>Track the firefly with your eyes. Click it the instant it flashes gold.</p>
            <button type="button" className="btn" onClick={start}>
              Start (45s)
            </button>
          </div>
        )}

        {phase === 'done' && (
          <div className="stage-overlay">
            <h3>Round complete!</h3>
            <p>
              You caught {score} flash{score === 1 ? '' : 'es'}
              {misses > 0 ? ` and missed ${misses}` : ''}.
            </p>
            <button type="button" className="btn" onClick={start}>
              Play again
            </button>
          </div>
        )}

        {phase === 'playing' && (
          <>
            <div className="hud">⏱ {Math.ceil(timeLeft)}s</div>
            <button
              type="button"
              className={`firefly${flashing ? ' flash' : ''}`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              onClick={handleFireflyClick}
              aria-label="firefly"
            >
              🪲
            </button>
          </>
        )}
      </div>
    </GameFrame>
  )
}
