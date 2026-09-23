import { useCallback, useEffect, useRef, useState } from 'react'
import GameFrame from '../components/GameFrame'
import { useAnimationFrame } from '../hooks/useAnimationFrame'
import { useHighScore } from '../hooks/useHighScore'
import { useSettings } from '../context/SettingsContext'
import { anaglyphGames } from '../data/games'
import './FlappyGame.css'

const meta = anaglyphGames.find((g) => g.id === 'flappy')!

const BIRD_X = 22
const BIRD_RADIUS = 4
const GRAVITY = 110
const FLAP_VELOCITY = -38
const PIPE_SPEED = 26
const PIPE_WIDTH = 10
const GAP_HEIGHT = 32
const SPAWN_INTERVAL = 2.2

interface Pipe {
  id: number
  x: number
  gapCenter: number
  passed: boolean
}

export default function FlappyGame() {
  const { highScore, reportScore } = useHighScore('flappy')
  const { weakEyeColor, strongEyeColor } = useSettings()
  const [phase, setPhase] = useState<'idle' | 'playing' | 'done'>('idle')
  const [score, setScore] = useState(0)
  const [birdY, setBirdY] = useState(50)
  const [pipes, setPipes] = useState<Pipe[]>([])

  const birdRef = useRef({ y: 50, vel: 0 })
  const pipesRef = useRef<Pipe[]>([])
  const spawnTimerRef = useRef(0)
  const scoreRef = useRef(0)
  const idRef = useRef(0)

  const start = useCallback(() => {
    birdRef.current = { y: 50, vel: 0 }
    pipesRef.current = []
    spawnTimerRef.current = 0
    scoreRef.current = 0
    idRef.current = 0
    setBirdY(50)
    setPipes([])
    setScore(0)
    setPhase('playing')
  }, [])

  useAnimationFrame(
    (dt) => {
      const bird = birdRef.current
      bird.vel += GRAVITY * dt
      bird.y += bird.vel * dt

      spawnTimerRef.current += dt
      let pipesList = pipesRef.current.map((p) => ({ ...p, x: p.x - PIPE_SPEED * dt })).filter((p) => p.x > -15)
      if (spawnTimerRef.current >= SPAWN_INTERVAL) {
        spawnTimerRef.current = 0
        const gapCenter = 22 + Math.random() * 56
        pipesList = [...pipesList, { id: idRef.current++, x: 110, gapCenter, passed: false }]
      }

      let collided = bird.y - BIRD_RADIUS < 0 || bird.y + BIRD_RADIUS > 100

      pipesList = pipesList.map((p) => {
        const withinX = Math.abs(p.x - BIRD_X) < PIPE_WIDTH / 2 + BIRD_RADIUS
        if (withinX) {
          const topEdge = p.gapCenter - GAP_HEIGHT / 2
          const bottomEdge = p.gapCenter + GAP_HEIGHT / 2
          if (bird.y - BIRD_RADIUS < topEdge || bird.y + BIRD_RADIUS > bottomEdge) {
            collided = true
          }
        }
        if (!p.passed && p.x + PIPE_WIDTH / 2 < BIRD_X) {
          scoreRef.current += 1
          return { ...p, passed: true }
        }
        return p
      })

      pipesRef.current = pipesList

      setBirdY(bird.y)
      setPipes(pipesList)
      setScore(scoreRef.current)
      if (collided) setPhase('done')
    },
    phase === 'playing',
  )

  useEffect(() => {
    if (phase === 'done') reportScore(score)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const flap = useCallback(() => {
    if (phase !== 'playing') return
    birdRef.current.vel = FLAP_VELOCITY
  }, [phase])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === 'Space' || e.key === 'ArrowUp') {
        e.preventDefault()
        flap()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [flap])

  function handleStageClick() {
    if (phase === 'playing') flap()
  }

  return (
    <GameFrame
      meta={meta}
      backTo="/anaglyph"
      backLabel="All glasses games"
      score={score}
      highScore={highScore}
      scoreLabel="Score"
      needsGlasses
    >
      <div className="flappy-stage" onClick={handleStageClick}>
        {phase === 'idle' && (
          <div className="stage-overlay">
            <p>Put your glasses on. Click or press Space to flap and steer through the gaps.</p>
            <button type="button" className="btn" onClick={start}>
              Start
            </button>
          </div>
        )}

        {phase === 'done' && (
          <div className="stage-overlay">
            <h3>Game over</h3>
            <p>You made it through {score} gap{score === 1 ? '' : 's'}.</p>
            <button type="button" className="btn" onClick={start}>
              Play again
            </button>
          </div>
        )}

        {phase === 'playing' && (
          <>
            <div className="hud">Score: {score}</div>

            {pipes.map((p) => (
              <div key={p.id} className="pipe-pair" style={{ left: `${p.x}%`, color: strongEyeColor }}>
                <div
                  className="pipe pipe-top"
                  style={{ height: `${p.gapCenter - GAP_HEIGHT / 2}%`, width: `${PIPE_WIDTH}%` }}
                />
                <div
                  className="pipe pipe-bottom"
                  style={{
                    top: `${p.gapCenter + GAP_HEIGHT / 2}%`,
                    height: `${100 - (p.gapCenter + GAP_HEIGHT / 2)}%`,
                    width: `${PIPE_WIDTH}%`,
                  }}
                />
              </div>
            ))}

            <svg
              className="flappy-bird"
              style={{ left: `${BIRD_X}%`, top: `${birdY}%`, color: weakEyeColor }}
              viewBox="0 0 24 24"
              width="32"
              height="32"
            >
              <circle cx="12" cy="12" r="9" fill="currentColor" />
              <path d="M12 10 L21 12 L12 15 Z" fill="currentColor" opacity="0.7" />
            </svg>
          </>
        )}
      </div>
    </GameFrame>
  )
}
