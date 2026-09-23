import { useEffect, useRef } from 'react'

/** Calls `callback(deltaSeconds)` on every animation frame while `active` is true. */
export function useAnimationFrame(callback: (dt: number) => void, active: boolean) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (!active) return
    let raf = 0
    let last = performance.now()
    function tick(now: number) {
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      callbackRef.current(dt)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active])
}
