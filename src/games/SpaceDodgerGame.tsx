import { useEffect, useRef, useState } from 'react'
import GameFrame from '../components/GameFrame'
import { useAnimationFrame } from '../hooks/useAnimationFrame'
import { useHighScore } from '../hooks/useHighScore'
import { useSettings } from '../context/SettingsContext'
import { anaglyphGames } from '../data/games'
import { canvasPoint, resolveColor, useKeys } from './arcade'
import './ArcadeGame.css'

const meta = anaglyphGames.find((g) => g.id === 'space-dodger')!

const W = 600
const H = 400
const SHIP_R = 10
const SHIP_SPEED = 300

interface Rock {
  x: number
  y: number
  r: number
  vx: number
  vy: number
  shape: number[]
}

function freshGame() {
  return {
    ship: { x: W / 2, y: H - 50 },
    target: null as { x: number; y: number } | null,
    rocks: [] as Rock[],
    spawn: 0.5,
    time: 0,
    score: 0,
  }
}

export default function SpaceDodgerGame() {
  const { highScore, reportScore } = useHighScore('space-dodger')
  const { weakEyeColor, strongEyeColor } = useSettings()
  const [phase, setPhase] = useState<'idle' | 'playing' | 'done'>('idle')
  const [score, setScore] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const keys = useKeys(phase === 'playing')
  const game = useRef(freshGame())

  function start() {
    game.current = freshGame()
    setScore(0)
    setPhase('playing')
  }

  useAnimationFrame(
    (dt) => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return
      const g = game.current
      g.time += dt

      // Steering: keys, or glide toward the last pointer position.
      const held = keys.current
      let moved = false
      if (held.has('ArrowLeft')) { g.ship.x -= SHIP_SPEED * dt; moved = true }
      if (held.has('ArrowRight')) { g.ship.x += SHIP_SPEED * dt; moved = true }
      if (held.has('ArrowUp')) { g.ship.y -= SHIP_SPEED * dt; moved = true }
      if (held.has('ArrowDown')) { g.ship.y += SHIP_SPEED * dt; moved = true }
      if (moved) g.target = null
      if (g.target) {
        const k = Math.min(1, dt * 12)
        g.ship.x += (g.target.x - g.ship.x) * k
        g.ship.y += (g.target.y - g.ship.y) * k
      }
      g.ship.x = Math.max(SHIP_R, Math.min(W - SHIP_R, g.ship.x))
      g.ship.y = Math.max(SHIP_R, Math.min(H - SHIP_R, g.ship.y))

      // Rocks fall faster and more often as time goes on.
      g.spawn -= dt
      if (g.spawn <= 0) {
        g.spawn = Math.max(0.22, 0.7 - g.time * 0.008)
        const r = 14 + Math.random() * 16
        g.rocks.push({
          x: r + Math.random() * (W - 2 * r),
          y: -r,
          r,
          vx: (Math.random() - 0.5) * 60,
          vy: Math.min(110 + g.time * 3, 300) + Math.random() * 60,
          shape: Array.from({ length: 9 }, () => 0.75 + Math.random() * 0.4),
        })
      }

      let hit = false
      g.rocks = g.rocks.filter((rock) => {
        rock.x += rock.vx * dt
        rock.y += rock.vy * dt
        if (Math.hypot(rock.x - g.ship.x, rock.y - g.ship.y) < rock.r * 0.85 + SHIP_R - 2) hit = true
        if (rock.y - rock.r > H) {
          g.score += 1
          return false
        }
        return true
      })

      const weak = resolveColor(weakEyeColor)
      const strong = resolveColor(strongEyeColor)
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'lighter'

      ctx.fillStyle = strong
      for (const rock of g.rocks) {
        ctx.beginPath()
        rock.shape.forEach((s, i) => {
          const a = (i / rock.shape.length) * Math.PI * 2
          const px = rock.x + Math.cos(a) * rock.r * s
          const py = rock.y + Math.sin(a) * rock.r * s
          if (i === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        })
        ctx.closePath()
        ctx.fill()
      }

      ctx.fillStyle = weak
      ctx.beginPath()
      ctx.moveTo(g.ship.x, g.ship.y - SHIP_R * 1.5)
      ctx.lineTo(g.ship.x + SHIP_R, g.ship.y + SHIP_R)
      ctx.lineTo(g.ship.x, g.ship.y + SHIP_R * 0.5)
      ctx.lineTo(g.ship.x - SHIP_R, g.ship.y + SHIP_R)
      ctx.closePath()
      ctx.fill()

      setScore(g.score)
      if (hit) setPhase('done')
    },
    phase === 'playing',
  )

  useEffect(() => {
    if (phase === 'done') reportScore(score)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  function steer(e: React.PointerEvent<HTMLCanvasElement>) {
    if (phase !== 'playing' || !canvasRef.current) return
    game.current.target = canvasPoint(e, canvasRef.current)
  }

  return (
    <GameFrame
      meta={meta}
      backTo="/anaglyph"
      backLabel="All glasses games"
      score={score}
      highScore={highScore}
      scoreLabel="Dodged"
      needsGlasses
    >
      <div className="arcade-stage">
        <canvas
          ref={canvasRef}
          className="arcade-canvas"
          width={W}
          height={H}
          onPointerDown={steer}
          onPointerMove={steer}
        />
        {phase === 'idle' && (
          <div className="arcade-overlay">
            <p>Your ship is only visible to your weaker eye and the asteroids only to your stronger eye. Move the mouse, drag a finger, or use the arrow keys.</p>
            <button type="button" className="btn" onClick={start}>
              Start
            </button>
          </div>
        )}
        {phase === 'done' && (
          <div className="arcade-overlay">
            <h3>Crash!</h3>
            <p>You dodged {score} asteroid{score === 1 ? '' : 's'}.</p>
            <button type="button" className="btn" onClick={start}>
              Play again
            </button>
          </div>
        )}
        {phase === 'playing' && <div className="arcade-hud">Dodged: {score}</div>}
      </div>
    </GameFrame>
  )
}
