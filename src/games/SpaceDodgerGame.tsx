import { useEffect, useRef, useState } from 'react'
import GameFrame from '../components/GameFrame'
import { useAnimationFrame } from '../hooks/useAnimationFrame'
import { useHighScore } from '../hooks/useHighScore'
import { useSettings } from '../context/SettingsContext'
import { anaglyphGames } from '../data/games'
import { canvasPoint, resolveColor, useKeys } from './arcade'
import { Particles, Shake, Stars, fade, glowDot } from './fx'
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
  spin: number
  angle: number
}

function freshGame() {
  return {
    ship: { x: W / 2, y: H - 50 },
    target: null as { x: number; y: number } | null,
    rocks: [] as Rock[],
    spawn: 0.5,
    time: 0,
    score: 0,
    dead: 0,
    stars: new Stars(W, H),
    sparks: new Particles(),
    shake: new Shake(),
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
      g.stars.update(dt, 60 + Math.min(g.time * 2, 120))
      g.sparks.update(dt)
      g.shake.update(dt)
      const alive = g.dead === 0

      // Steering: keys, or glide toward the last pointer position.
      const held = keys.current
      let moved = false
      if (alive && held.has('ArrowLeft')) { g.ship.x -= SHIP_SPEED * dt; moved = true }
      if (alive && held.has('ArrowRight')) { g.ship.x += SHIP_SPEED * dt; moved = true }
      if (alive && held.has('ArrowUp')) { g.ship.y -= SHIP_SPEED * dt; moved = true }
      if (alive && held.has('ArrowDown')) { g.ship.y += SHIP_SPEED * dt; moved = true }
      if (moved) g.target = null
      if (alive && g.target) {
        const k = Math.min(1, dt * 12)
        g.ship.x += (g.target.x - g.ship.x) * k
        g.ship.y += (g.target.y - g.ship.y) * k
      }
      g.ship.x = Math.max(SHIP_R, Math.min(W - SHIP_R, g.ship.x))
      g.ship.y = Math.max(SHIP_R, Math.min(H - SHIP_R, g.ship.y))

      // Rocks fall faster and more often as time goes on.
      g.spawn -= dt
      if (alive && g.spawn <= 0) {
        g.spawn = Math.max(0.22, 0.7 - g.time * 0.008)
        const r = 14 + Math.random() * 16
        g.rocks.push({
          x: r + Math.random() * (W - 2 * r),
          y: -r,
          r,
          vx: (Math.random() - 0.5) * 60,
          vy: Math.min(110 + g.time * 3, 300) + Math.random() * 60,
          shape: Array.from({ length: 9 }, () => 0.75 + Math.random() * 0.4),
          spin: (Math.random() - 0.5) * 2,
          angle: Math.random() * Math.PI * 2,
        })
      }

      let hit = false
      g.rocks = g.rocks.filter((rock) => {
        rock.x += rock.vx * dt
        rock.y += rock.vy * dt
        rock.angle += rock.spin * dt
        if (alive && Math.hypot(rock.x - g.ship.x, rock.y - g.ship.y) < rock.r * 0.85 + SHIP_R - 2) hit = true
        if (rock.y - rock.r > H) {
          g.score += 1
          return false
        }
        return true
      })

      // Engine flame while flying.
      if (alive) g.sparks.trail(g.ship.x + (Math.random() - 0.5) * 4, g.ship.y + SHIP_R, (Math.random() - 0.5) * 20, 90 + Math.random() * 60, 2.5)
      if (alive && hit) {
        g.dead = 0.9
        g.sparks.burst(g.ship.x, g.ship.y, 40, 220, 4, 0.9)
        g.shake.kick(14)
      }
      if (!alive) {
        g.dead -= dt
        if (g.dead <= 0) g.dead = -1
      }

      const weak = resolveColor(weakEyeColor)
      const strong = resolveColor(strongEyeColor)
      ctx.globalCompositeOperation = 'source-over'
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, W, H)
      const shake = g.shake.offset()
      ctx.translate(shake.x, shake.y)
      ctx.globalCompositeOperation = 'lighter'

      // Backdrop for the stronger eye: drifting stars and a faint horizon glow.
      fade(ctx, 0, H * 0.55, W, H * 0.45, strong, 0, 0.16)
      g.stars.draw(ctx, strong)

      // Asteroids (stronger eye): glowing rim, dim body, craters, slowly tumbling.
      for (const rock of g.rocks) {
        ctx.save()
        ctx.translate(rock.x, rock.y)
        ctx.rotate(rock.angle)
        ctx.beginPath()
        rock.shape.forEach((sh, k) => {
          const a = (k / rock.shape.length) * Math.PI * 2
          const px = Math.cos(a) * rock.r * sh
          const py = Math.sin(a) * rock.r * sh
          if (k === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        })
        ctx.closePath()
        ctx.globalAlpha = 0.55
        ctx.fillStyle = strong
        ctx.fill()
        ctx.globalAlpha = 1
        ctx.lineWidth = 2
        ctx.strokeStyle = strong
        ctx.shadowColor = strong
        ctx.shadowBlur = 10
        ctx.stroke()
        ctx.shadowBlur = 0
        ctx.globalAlpha = 0.35
        ctx.lineWidth = 1.5
        for (const [cx, cy, cr] of [[-0.3, -0.2, 0.25], [0.3, 0.25, 0.18], [0.05, -0.5, 0.12]]) {
          ctx.beginPath()
          ctx.arc(cx * rock.r, cy * rock.r, cr * rock.r, 0, Math.PI * 2)
          ctx.stroke()
        }
        ctx.globalAlpha = 1
        ctx.restore()
      }

      // Ship (weaker eye): glowing hull with a cockpit and an engine flame.
      if (g.dead === 0) {
        glowDot(ctx, g.ship.x, g.ship.y + 4, 34, weak, 0.35)
        ctx.fillStyle = weak
        ctx.shadowColor = weak
        ctx.shadowBlur = 14
        ctx.beginPath()
        ctx.moveTo(g.ship.x, g.ship.y - SHIP_R * 1.8)
        ctx.lineTo(g.ship.x + SHIP_R * 1.3, g.ship.y + SHIP_R)
        ctx.lineTo(g.ship.x + SHIP_R * 0.5, g.ship.y + SHIP_R * 0.6)
        ctx.lineTo(g.ship.x, g.ship.y + SHIP_R * 1.1)
        ctx.lineTo(g.ship.x - SHIP_R * 0.5, g.ship.y + SHIP_R * 0.6)
        ctx.lineTo(g.ship.x - SHIP_R * 1.3, g.ship.y + SHIP_R)
        ctx.closePath()
        ctx.fill()
        ctx.shadowBlur = 0
      }
      if (g.dead !== 0) glowDot(ctx, g.ship.x, g.ship.y, 60 * Math.max(0, g.dead), weak, 0.6)
      g.sparks.draw(ctx, weak)
      ctx.setTransform(1, 0, 0, 1, 0, 0)

      setScore(g.score)
      if (g.dead === -1) setPhase('done')
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
