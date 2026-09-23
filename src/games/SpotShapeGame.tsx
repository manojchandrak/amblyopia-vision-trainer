import { useCallback, useEffect, useRef, useState } from 'react'
import GameFrame from '../components/GameFrame'
import { useHighScore } from '../hooks/useHighScore'
import { useSettings } from '../context/SettingsContext'
import { anaglyphGames } from '../data/games'
import './SpotShapeGame.css'

const meta = anaglyphGames.find((g) => g.id === 'spot-shape')!
const TOTAL_ROUNDS = 10
const NOISE_DOTS = 90

interface Dot {
  x: number
  y: number
  color: 'red' | 'blue'
  size: number
}

function buildNoise(): Dot[] {
  return Array.from({ length: NOISE_DOTS }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    color: Math.random() < 0.5 ? 'red' : 'blue',
    size: 3 + Math.random() * 4,
  }))
}

export default function SpotShapeGame() {
  const { highScore, reportScore } = useHighScore('spot-shape')
  const { weakEyeColor } = useSettings()
  const [phase, setPhase] = useState<'idle' | 'playing' | 'done'>('idle')
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [noise, setNoise] = useState<Dot[]>(() => buildNoise())
  const [starPos, setStarPos] = useState({ x: 50, y: 50 })
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  const setupRound = useCallback(() => {
    setNoise(buildNoise())
    setStarPos({ x: 15 + Math.random() * 70, y: 15 + Math.random() * 70 })
    setFeedback(null)
  }, [])

  const start = useCallback(() => {
    setScore(0)
    setRound(1)
    setPhase('playing')
    setupRound()
  }, [setupRound])

  useEffect(() => {
    if (phase === 'done') reportScore(score)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  function handleStageClick(e: React.MouseEvent<HTMLDivElement>) {
    if (phase !== 'playing' || feedback) return
    const rect = stageRef.current!.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    const dist = Math.hypot(x - starPos.x, y - starPos.y)
    const isCorrect = dist < 10
    if (isCorrect) setScore((s) => s + 1)
    setFeedback(isCorrect ? 'correct' : 'wrong')
    setTimeout(() => {
      if (round >= TOTAL_ROUNDS) {
        setPhase('done')
      } else {
        setRound((r) => r + 1)
        setupRound()
      }
    }, 700)
  }

  return (
    <GameFrame
      meta={meta}
      backTo="/anaglyph"
      backLabel="All glasses games"
      score={score}
      highScore={highScore}
      scoreLabel="Found"
      needsGlasses
    >
      <div className="spot-stage" ref={stageRef} onClick={handleStageClick}>
        {phase === 'idle' && (
          <div className="stage-overlay">
            <p>Put your glasses on. Tap where the hidden star appears.</p>
            <button type="button" className="btn" onClick={start}>
              Start ({TOTAL_ROUNDS} rounds)
            </button>
          </div>
        )}

        {phase === 'done' && (
          <div className="stage-overlay">
            <h3>Round complete!</h3>
            <p>
              You found {score} of {TOTAL_ROUNDS}.
            </p>
            <button type="button" className="btn" onClick={start}>
              Play again
            </button>
          </div>
        )}

        {phase === 'playing' && (
          <>
            <div className="hud">
              Round {round}/{TOTAL_ROUNDS}
            </div>

            {noise.map((d, i) => (
              <span
                key={i}
                className={`noise-dot ${d.color}`}
                style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.size, height: d.size }}
              />
            ))}

            <svg
              className="target-star"
              style={{ left: `${starPos.x}%`, top: `${starPos.y}%`, color: weakEyeColor }}
              viewBox="0 0 24 24"
              width="34"
              height="34"
            >
              <path
                fill="currentColor"
                d="M12 1.5l2.9 6.6 7.1.7-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 8.8l7.1-.7z"
              />
            </svg>

            {feedback && (
              <div
                className={`click-feedback ${feedback}`}
                style={{ left: `${starPos.x}%`, top: `${starPos.y}%` }}
              >
                {feedback === 'correct' ? '✓' : '✗'}
              </div>
            )}
          </>
        )}
      </div>
    </GameFrame>
  )
}
