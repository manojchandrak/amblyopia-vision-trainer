import { useEffect, useRef } from 'react'

/** Turns `var(--anaglyph-red)` into the actual color, since a canvas can't read CSS variables. */
export function resolveColor(value: string): string {
  const match = /var\((--[^)\s]+)\)/.exec(value)
  if (!match) return value
  return getComputedStyle(document.documentElement).getPropertyValue(match[1]).trim() || value
}

const GAME_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'])

/** Tracks which keys (by `event.code`) are held down while `active` is true. */
export function useKeys(active: boolean) {
  const keys = useRef(new Set<string>())

  useEffect(() => {
    const held = keys.current
    if (!active) {
      held.clear()
      return
    }
    function down(e: KeyboardEvent) {
      if (GAME_KEYS.has(e.code)) e.preventDefault()
      held.add(e.code)
    }
    function up(e: KeyboardEvent) {
      held.delete(e.code)
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [active])

  return keys
}

/** Converts a pointer position to canvas pixel coordinates, whatever size the canvas is shown at. */
export function canvasPoint(e: { clientX: number; clientY: number }, canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect()
  return {
    x: ((e.clientX - rect.left) * canvas.width) / rect.width,
    y: ((e.clientY - rect.top) * canvas.height) / rect.height,
  }
}

export function shuffled<T>(items: T[]): T[] {
  const copy = items.slice()
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
