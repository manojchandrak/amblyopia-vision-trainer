import { useEffect } from 'react'

/** Keeps the phone screen on while a game is open, and re-takes the lock when the app returns to the foreground. */
export function useWakeLock() {
  useEffect(() => {
    let lock: WakeLockSentinel | null = null
    let gone = false
    async function take() {
      try {
        if (!gone && document.visibilityState === 'visible') lock = (await navigator.wakeLock?.request('screen')) ?? null
      } catch {
        // not supported, or refused (e.g. low battery)
      }
    }
    void take()
    document.addEventListener('visibilitychange', take)
    return () => {
      gone = true
      document.removeEventListener('visibilitychange', take)
      void lock?.release()
    }
  }, [])
}
