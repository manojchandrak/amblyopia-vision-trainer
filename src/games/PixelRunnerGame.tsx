import { useEffect, useRef, useState } from 'react'
import GameFrame from '../components/GameFrame'
import { useAnimationFrame } from '../hooks/useAnimationFrame'
import { useHighScore } from '../hooks/useHighScore'
import { useSettings } from '../context/SettingsContext'
import { anaglyphGames } from '../data/games'
import { resolveColor } from './arcade'
import { Particles, Shake, Stars, fade, glowDot } from './fx'
import './ArcadeGame.css'

const meta = anaglyphGames.find((g) => g.id === 'pixel-runner')!

const W = 600
const H = 400
const PX = 140 // the runner stays at this screen x; the world scrolls past
const PW = 18
const PH = 28
const GRAVITY = 1500
const JUMP_V = -560

interface Platform { x: number; w: number; y: number }
interface Coin { x: number; y: number; taken: boolean }
interface Enemy { x: number; y: number; platform: Platform; dir: number; alive: boolean }

function freshGame() {
  const first: Platform = { x: -100, w: 520, y: 320 }
  return {
    cam: 0,
    runner: { y: first.y - PH, vy: 0, grounded: true, coyote: 0, held: false },
    platforms: [first],
    coins: [] as Coin[],
    enemies: [] as Enemy[],
    edge: first.x + first.w,
    time: 0,
    coinCount: 0,
    stomps: 0,
    dead: 0,
    stars: new Stars(W, H, 50),
    dust: new Particles(),
    shake: new Shake(),
  }
}
type Game = ReturnType<typeof freshGame>

/** Lays down more ground (with gaps, coins and the odd walker) until it reaches past the right edge of the screen. */
function extend(g: Game) {
  while (g.edge < g.cam + W + 400) {
    const last = g.platforms[g.platforms.length - 1]
    const speed = Math.min(220 + g.time * 4, 380)
    const gap = 60 + Math.random() * (40 + speed * 0.18)
    const w = 160 + Math.random() * 260
    const y = Math.max(230, Math.min(340, last.y + (Math.random() - 0.5) * 120))
    const p: Platform = { x: g.edge + gap, w, y }
    g.platforms.push(p)
    g.edge = p.x + p.w
    // Coins arc over the gap and sit along the ground.
    const n = 3 + Math.floor(Math.random() * 3)
    for (let i = 0; i < n; i++) g.coins.push({ x: p.x - gap / 2 + i * 34 - 34, y: Math.min(last.y, y) - 70 - Math.sin((i / (n - 1)) * Math.PI) * 30, taken: false })
    if (w > 240 && Math.random() < 0.7) g.enemies.push({ x: p.x + w * 0.6, y: p.y, platform: p, dir: -1, alive: true })
  }
}

export default function PixelRunnerGame() {
  const { highScore, reportScore } = useHighScore('pixel-runner')
  const { weakEyeColor, strongEyeColor } = useSettings()
  const [phase, setPhase] = useState<'idle' | 'playing' | 'done'>('idle')
  const [score, setScore] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const game = useRef(freshGame())

  function start() {
    game.current = freshGame()
    setScore(0)
    setPhase('playing')
  }

  function press(down: boolean) {
    const r = game.current.runner
    r.held = down
    if (down && phase === 'playing' && (r.grounded || r.coyote > 0)) {
      r.vy = JUMP_V
      r.grounded = false
      r.coyote = 0
      game.current.dust.burst(PX, r.y + PH, 6, 70, 2, 0.35)
    }
  }
  const pressRef = useRef(press)
  pressRef.current = press

  useEffect(() => {
    if (phase !== 'playing') return
    const jumpKeys = ['Space', 'ArrowUp', 'KeyW']
    const down = (e: KeyboardEvent) => {
      if (!jumpKeys.includes(e.code)) return
      e.preventDefault()
      if (!e.repeat) pressRef.current(true)
    }
    const up = (e: KeyboardEvent) => jumpKeys.includes(e.code) && pressRef.current(false)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [phase])

  useAnimationFrame(
    (dt) => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return
      const g = game.current
      const r = g.runner
      g.time += dt
      g.dust.update(dt)
      g.shake.update(dt)
      const alive = g.dead === 0

      if (alive) {
        const speed = Math.min(220 + g.time * 4, 380)
        g.cam += speed * dt
        extend(g)
        const prevBottom = r.y + PH
        // Holding jump makes the rise float a little longer, for variable jump height.
        r.vy += GRAVITY * (r.held && r.vy < 0 ? 0.55 : 1) * dt
        r.y += r.vy * dt
        r.grounded = false
        r.coyote = Math.max(0, r.coyote - dt)
        const worldX = g.cam + PX
        for (const p of g.platforms) {
          if (worldX + PW / 2 > p.x && worldX - PW / 2 < p.x + p.w && r.vy >= 0 && prevBottom <= p.y + 6 && r.y + PH >= p.y) {
            r.y = p.y - PH
            r.vy = 0
            r.grounded = true
            r.coyote = 0.08
          }
        }
        if (r.y > H + 40) g.dead = 0.8

        for (const c of g.coins) {
          if (!c.taken && Math.abs(c.x - worldX) < 20 && Math.abs(c.y - (r.y + PH / 2)) < 26) {
            c.taken = true
            g.coinCount++
            g.dust.burst(c.x - g.cam, c.y, 8, 90, 2, 0.4)
          }
        }
        for (const e of g.enemies) {
          if (!e.alive) continue
          e.x += e.dir * 50 * dt
          if (e.x < e.platform.x + 20) e.dir = 1
          if (e.x > e.platform.x + e.platform.w - 20) e.dir = -1
          if (Math.abs(e.x - worldX) < 20 && r.y + PH > e.y - 24 && r.y < e.y) {
            if (r.vy > 0 && prevBottom <= e.y - 12) {
              e.alive = false
              r.vy = -420
              g.stomps++
              g.dust.burst(e.x - g.cam, e.y - 10, 18, 160, 3, 0.5)
              g.shake.kick(5)
            } else {
              g.dead = 0.8
              g.dust.burst(PX, r.y + PH / 2, 36, 220, 4, 0.9)
              g.shake.kick(14)
            }
          }
        }
        if (r.grounded && Math.random() < 0.5) g.dust.trail(PX - 6, r.y + PH, -60, -10, 2, 0.25)
        g.platforms = g.platforms.filter((p) => p.x + p.w > g.cam - 100)
        g.coins = g.coins.filter((c) => c.x > g.cam - 100)
        g.enemies = g.enemies.filter((e) => e.x > g.cam - 100)
      } else {
        g.dead -= dt
        if (g.dead <= 0) g.dead = -1
      }
      g.stars.update(dt, 8)

      const weak = resolveColor(weakEyeColor)
      const strong = resolveColor(strongEyeColor)
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, W, H)
      const sh = g.shake.offset()
      ctx.translate(sh.x, sh.y)
      ctx.globalCompositeOperation = 'lighter'

      // Backdrop (stronger eye): stars, then two layers of rolling hills moving at different speeds.
      g.stars.draw(ctx, strong)
      for (const [speed, base, amp, alpha] of [[0.2, 300, 50, 0.1], [0.45, 340, 36, 0.16]]) {
        ctx.fillStyle = strong
        ctx.globalAlpha = alpha
        ctx.beginPath()
        ctx.moveTo(0, H)
        for (let x = 0; x <= W; x += 20) ctx.lineTo(x, base - Math.abs(Math.sin((x + g.cam * speed) / 90)) * amp)
        ctx.lineTo(W, H)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      // Ground (stronger eye): glowing top edge over a brick-pattern body fading downwards.
      for (const p of g.platforms) {
        const x = p.x - g.cam
        fade(ctx, x, p.y, p.w, H - p.y, strong, 0.5, 0.04)
        ctx.strokeStyle = strong
        ctx.lineWidth = 3
        ctx.shadowColor = strong
        ctx.shadowBlur = 12
        ctx.beginPath()
        ctx.moveTo(x, p.y)
        ctx.lineTo(x + p.w, p.y)
        ctx.stroke()
        ctx.shadowBlur = 0
        ctx.globalAlpha = 0.25
        ctx.lineWidth = 1
        ctx.beginPath()
        for (let row = 0, yy = p.y + 18; yy < H; row++, yy += 18) {
          ctx.moveTo(x, yy)
          ctx.lineTo(x + p.w, yy)
          for (let bx = x + (row % 2 ? 0 : 18); bx < x + p.w; bx += 36) {
            ctx.moveTo(bx, yy)
            ctx.lineTo(bx, yy + 18)
          }
        }
        ctx.stroke()
        ctx.globalAlpha = 1
      }

      // Coins (stronger eye): spinning discs.
      ctx.fillStyle = strong
      for (const c of g.coins) {
        if (c.taken) continue
        const sx = c.x - g.cam
        if (sx < -20 || sx > W + 20) continue
        const squash = Math.abs(Math.cos(g.time * 4 + c.x * 0.05))
        glowDot(ctx, sx, c.y, 20, strong, 0.35)
        ctx.beginPath()
        ctx.ellipse(sx, c.y, 3 + 8 * squash, 9, 0, 0, Math.PI * 2)
        ctx.fill()
      }

      // Walkers (stronger eye): spiky blobs.
      for (const e of g.enemies) {
        if (!e.alive) continue
        const sx = e.x - g.cam
        if (sx < -30 || sx > W + 30) continue
        const bob = Math.sin(g.time * 10 + e.x) * 2
        ctx.fillStyle = strong
        ctx.shadowColor = strong
        ctx.shadowBlur = 10
        ctx.beginPath()
        for (let i = 0; i <= 10; i++) {
          const a = Math.PI + (i / 10) * Math.PI
          const rad = i % 2 ? 14 : 20
          ctx.lineTo(sx + Math.cos(a) * rad, e.y + bob + Math.sin(a) * rad)
        }
        ctx.closePath()
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // Runner (weaker eye): body, head, cap, swinging legs, glow.
      if (g.dead === 0) {
        const swing = r.grounded ? Math.sin(g.time * 18) * 6 : 5
        glowDot(ctx, PX, r.y + PH / 2, 40, weak, 0.3)
        ctx.fillStyle = weak
        ctx.strokeStyle = weak
        ctx.shadowColor = weak
        ctx.shadowBlur = 12
        ctx.beginPath()
        ctx.roundRect(PX - PW / 2, r.y + 8, PW, 14, 4)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(PX, r.y + 6, 8, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.moveTo(PX - 9, r.y + 3)
        ctx.lineTo(PX + 13, r.y + 3)
        ctx.lineTo(PX + 8, r.y - 3)
        ctx.lineTo(PX - 6, r.y - 3)
        ctx.closePath()
        ctx.fill()
        ctx.lineWidth = 4
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(PX - 4, r.y + 22)
        ctx.lineTo(PX - 4 - swing, r.y + PH)
        ctx.moveTo(PX + 4, r.y + 22)
        ctx.lineTo(PX + 4 + swing, r.y + PH)
        ctx.stroke()
        ctx.shadowBlur = 0
      }
      g.dust.draw(ctx, weak)
      ctx.setTransform(1, 0, 0, 1, 0, 0)

      const total = Math.floor(g.cam / 10) + g.coinCount * 10 + g.stomps * 25
      setScore(total)
      if (g.dead === -1) setPhase('done')
    },
    phase === 'playing',
  )

  useEffect(() => {
    if (phase === 'done') reportScore(score)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  return (
    <GameFrame meta={meta} backTo="/anaglyph" backLabel="All glasses games" score={score} highScore={highScore} needsGlasses>
      <div className="arcade-stage">
        <canvas
          ref={canvasRef}
          className="arcade-canvas"
          width={W}
          height={H}
          onPointerDown={() => press(true)}
          onPointerUp={() => press(false)}
          onPointerCancel={() => press(false)}
        />
        {phase === 'idle' && (
          <div className="arcade-overlay">
            <p>The runner is only visible to your weaker eye; the ground, coins and spiky walkers only to your stronger eye. Tap or press Space to jump (hold for a higher jump). Grab coins and land on walkers to stomp them.</p>
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
      </div>
    </GameFrame>
  )
}
