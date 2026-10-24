import { useEffect, useRef, useState } from 'react'
import GameFrame from '../components/GameFrame'
import { useAnimationFrame } from '../hooks/useAnimationFrame'
import { useHighScore } from '../hooks/useHighScore'
import { useSettings } from '../context/SettingsContext'
import { anaglyphGames } from '../data/games'
import { canvasPoint, resolveColor, useKeys } from './arcade'
import './ArcadeGame.css'

const meta = anaglyphGames.find((g) => g.id === 'breakout')!

const W = 600
const H = 400
const PADDLE_W = 96
const PADDLE_H = 10
const PADDLE_Y = H - 24
const BALL_R = 7
const COLS = 10
const ROWS = 5
const BRICK_W = 54
const BRICK_H = 18
const BRICK_GAP = 4
const BRICK_LEFT = (W - (COLS * BRICK_W + (COLS - 1) * BRICK_GAP)) / 2
const BRICK_TOP = 40

function makeBricks() {
  return Array.from({ length: ROWS * COLS }, () => true)
}

function freshGame() {
  return {
    paddleX: W / 2,
    ball: { x: W / 2, y: PADDLE_Y - BALL_R - 1, vx: 0, vy: 0 },
    stuck: true,
    bricks: makeBricks(),
    level: 1,
    lives: 3,
    score: 0,
  }
}

export default function BreakoutGame() {
  const { highScore, reportScore } = useHighScore('breakout')
  const { weakEyeColor, strongEyeColor } = useSettings()
  const [phase, setPhase] = useState<'idle' | 'playing' | 'done'>('idle')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [level, setLevel] = useState(1)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const keys = useKeys(phase === 'playing')
  const game = useRef(freshGame())

  function start() {
    game.current = freshGame()
    setScore(0)
    setLives(3)
    setLevel(1)
    setPhase('playing')
  }

  function launch() {
    const g = game.current
    if (phase !== 'playing' || !g.stuck) return
    g.stuck = false
    const speed = 250 + (g.level - 1) * 30
    const angle = (-Math.PI / 2) + (Math.random() - 0.5) * 0.6
    g.ball.vx = Math.cos(angle) * speed
    g.ball.vy = Math.sin(angle) * speed
  }

  useEffect(() => {
    if (phase !== 'playing') return
    function onKey(e: KeyboardEvent) {
      if (e.code === 'Space') launch()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  useAnimationFrame(
    (dt) => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return
      const g = game.current

      if (keys.current.has('ArrowLeft')) g.paddleX -= 420 * dt
      if (keys.current.has('ArrowRight')) g.paddleX += 420 * dt
      g.paddleX = Math.max(PADDLE_W / 2, Math.min(W - PADDLE_W / 2, g.paddleX))

      const ball = g.ball
      if (g.stuck) {
        ball.x = g.paddleX
        ball.y = PADDLE_Y - BALL_R - 1
      } else {
        ball.x += ball.vx * dt
        ball.y += ball.vy * dt

        if (ball.x < BALL_R) { ball.x = BALL_R; ball.vx = Math.abs(ball.vx) }
        if (ball.x > W - BALL_R) { ball.x = W - BALL_R; ball.vx = -Math.abs(ball.vx) }
        if (ball.y < BALL_R) { ball.y = BALL_R; ball.vy = Math.abs(ball.vy) }

        // Paddle: the further from the centre it lands, the sharper the bounce.
        if (
          ball.vy > 0 &&
          ball.y + BALL_R >= PADDLE_Y &&
          ball.y - BALL_R <= PADDLE_Y + PADDLE_H &&
          Math.abs(ball.x - g.paddleX) <= PADDLE_W / 2 + BALL_R
        ) {
          const speed = Math.hypot(ball.vx, ball.vy)
          const offset = Math.max(-1, Math.min(1, (ball.x - g.paddleX) / (PADDLE_W / 2)))
          const angle = -Math.PI / 2 + offset * 1.0
          ball.vx = Math.cos(angle) * speed
          ball.vy = Math.sin(angle) * speed
          ball.y = PADDLE_Y - BALL_R
        }

        // Bricks: bounce off the first one touched this frame.
        for (let i = 0; i < g.bricks.length; i++) {
          if (!g.bricks[i]) continue
          const bx = BRICK_LEFT + (i % COLS) * (BRICK_W + BRICK_GAP)
          const by = BRICK_TOP + Math.floor(i / COLS) * (BRICK_H + BRICK_GAP)
          const nearX = Math.max(bx, Math.min(ball.x, bx + BRICK_W))
          const nearY = Math.max(by, Math.min(ball.y, by + BRICK_H))
          if (Math.hypot(ball.x - nearX, ball.y - nearY) <= BALL_R) {
            g.bricks[i] = false
            g.score += 10
            const overlapX = Math.min(ball.x + BALL_R - bx, bx + BRICK_W - (ball.x - BALL_R))
            const overlapY = Math.min(ball.y + BALL_R - by, by + BRICK_H - (ball.y - BALL_R))
            if (overlapX < overlapY) ball.vx = -ball.vx
            else ball.vy = -ball.vy
            break
          }
        }

        if (g.bricks.every((b) => !b)) {
          g.level += 1
          g.bricks = makeBricks()
          g.stuck = true
          setLevel(g.level)
        }

        if (ball.y - BALL_R > H) {
          g.lives -= 1
          g.stuck = true
          setLives(g.lives)
          if (g.lives <= 0) setPhase('done')
        }
      }

      const weak = resolveColor(weakEyeColor)
      const strong = resolveColor(strongEyeColor)
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'lighter'

      ctx.fillStyle = strong
      g.bricks.forEach((alive, i) => {
        if (!alive) return
        const bx = BRICK_LEFT + (i % COLS) * (BRICK_W + BRICK_GAP)
        const by = BRICK_TOP + Math.floor(i / COLS) * (BRICK_H + BRICK_GAP)
        ctx.beginPath()
        ctx.roundRect(bx, by, BRICK_W, BRICK_H, 4)
        ctx.fill()
      })
      ctx.beginPath()
      ctx.roundRect(g.paddleX - PADDLE_W / 2, PADDLE_Y, PADDLE_W, PADDLE_H, 5)
      ctx.fill()

      ctx.fillStyle = weak
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2)
      ctx.fill()

      setScore(g.score)
    },
    phase === 'playing',
  )

  useEffect(() => {
    if (phase === 'done') reportScore(score)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  function onPointer(e: React.PointerEvent<HTMLCanvasElement>) {
    if (phase !== 'playing' || !canvasRef.current) return
    game.current.paddleX = canvasPoint(e, canvasRef.current).x
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
      <div className="arcade-stage">
        <canvas
          ref={canvasRef}
          className="arcade-canvas"
          width={W}
          height={H}
          onPointerMove={onPointer}
          onPointerDown={(e) => {
            onPointer(e)
            launch()
          }}
        />
        {phase === 'idle' && (
          <div className="arcade-overlay">
            <p>The ball is only visible to your weaker eye; the paddle and bricks only to your stronger eye. Move the mouse or arrow keys, and click or press Space to launch.</p>
            <button type="button" className="btn" onClick={start}>
              Start
            </button>
          </div>
        )}
        {phase === 'done' && (
          <div className="arcade-overlay">
            <h3>Game over</h3>
            <p>You scored {score}.</p>
            <button type="button" className="btn" onClick={start}>
              Play again
            </button>
          </div>
        )}
        {phase === 'playing' && (
          <div className="arcade-hud">
            Level {level} · Lives {lives}
          </div>
        )}
      </div>
    </GameFrame>
  )
}
