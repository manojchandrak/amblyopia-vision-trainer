// Visual effects for the canvas glasses games. Everything is drawn in a single eye's pure colour (only its brightness
// and transparency vary), so the red/blue separation the therapy relies on is never broken.

const TAU = Math.PI * 2

/** "#rrggbb" -> "rgba(r,g,b,a)". Other colour strings are returned unchanged. */
export function withAlpha(color: string, a: number): string {
  const m = /^#([0-9a-f]{6})$/i.exec(color)
  if (!m) return color
  const n = parseInt(m[1], 16)
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`
}

/** A soft round glow, brightest in the middle. */
export function glowDot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, a = 1) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r)
  g.addColorStop(0, withAlpha(color, a))
  g.addColorStop(1, withAlpha(color, 0))
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, r, 0, TAU)
  ctx.fill()
}

/** Sets a glow around whatever is drawn next; call `noGlow` afterwards. */
export function glow(ctx: CanvasRenderingContext2D, color: string, blur: number) {
  ctx.shadowColor = color
  ctx.shadowBlur = blur
}

export function noGlow(ctx: CanvasRenderingContext2D) {
  ctx.shadowBlur = 0
  ctx.shadowColor = 'transparent'
}

/** A vertical gradient panel fading from `top` to `bottom` opacity. */
export function fade(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, top: number, bottom: number) {
  const g = ctx.createLinearGradient(0, y, 0, y + h)
  g.addColorStop(0, withAlpha(color, top))
  g.addColorStop(1, withAlpha(color, bottom))
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)
}

/** Slow parallax stars: far ones are dim and slow, near ones bright and fast. */
export class Stars {
  private stars: { x: number; y: number; z: number; tw: number }[]

  private w: number
  private h: number

  constructor(w: number, h: number, count = 70) {
    this.w = w
    this.h = h
    this.stars = Array.from({ length: count }, () => ({ x: Math.random() * w, y: Math.random() * h, z: Math.random(), tw: Math.random() * TAU }))
  }

  update(dt: number, speed = 40) {
    for (const s of this.stars) {
      s.y += speed * (0.2 + s.z) * dt
      s.tw += dt * (1 + s.z * 2)
      if (s.y > this.h) {
        s.y = 0
        s.x = Math.random() * this.w
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, color: string) {
    ctx.fillStyle = color
    for (const s of this.stars) {
      ctx.globalAlpha = (0.15 + s.z * 0.5) * (0.7 + 0.3 * Math.sin(s.tw))
      const size = 0.6 + s.z * 1.6
      ctx.fillRect(s.x, s.y, size, size)
    }
    ctx.globalAlpha = 1
  }
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  size: number
}

/** Sparks and trails. */
export class Particles {
  private items: Particle[] = []

  /** An outward burst, e.g. an explosion or a broken brick. */
  burst(x: number, y: number, count: number, speed: number, size = 3, life = 0.6) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * TAU
      const v = speed * (0.3 + Math.random() * 0.7)
      this.add({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life, max: life * (0.6 + Math.random() * 0.4), size })
    }
  }

  /** A single spark drifting the given way, e.g. an engine flame or a ball trail. */
  trail(x: number, y: number, vx: number, vy: number, size = 3, life = 0.35) {
    this.add({ x, y, vx, vy, life, max: life, size })
  }

  private add(p: Omit<Particle, 'max'> & { max: number }) {
    if (this.items.length > 320) this.items.shift()
    this.items.push({ ...p, life: p.max })
  }

  update(dt: number) {
    for (const p of this.items) {
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vx *= 1 - dt * 1.5
      p.vy *= 1 - dt * 1.5
      p.life -= dt
    }
    this.items = this.items.filter((p) => p.life > 0)
  }

  draw(ctx: CanvasRenderingContext2D, color: string) {
    for (const p of this.items) {
      const t = p.life / p.max
      glowDot(ctx, p.x, p.y, p.size * (1 + t * 2), color, 0.9 * t)
    }
  }

  get count() {
    return this.items.length
  }
}

/** A screen shake that dies away; `offset()` gives this frame's nudge. */
export class Shake {
  private power = 0

  kick(power: number) {
    this.power = Math.max(this.power, power)
  }

  update(dt: number) {
    this.power = Math.max(0, this.power - dt * 40)
  }

  offset() {
    return { x: (Math.random() - 0.5) * this.power, y: (Math.random() - 0.5) * this.power }
  }
}
