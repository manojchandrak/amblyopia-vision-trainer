import { useCallback, useEffect, useRef, useState } from 'react'
import GameFrame from '../components/GameFrame'
import { useHighScore } from '../hooks/useHighScore'
import { noGlassesGames } from '../data/games'
import './ScanGame.css'

const meta = noGlassesGames.find((g) => g.id === 'scan')!
const COLS = 6
const ROWS = 5
const TOTAL_CELLS = COLS * ROWS
const TARGET_COUNT = 6
const ROUND_SECONDS = 30
const TARGET_LETTER = 'd'
const DISTRACTORS = ['b', 'p', 'q']

interface Cell {
  letter: string
  isTarget: boolean
  found: boolean
  rotate: number
}

function buildGrid(): Cell[] {
  const cells: Cell[] = Array.from({ length: TOTAL_CELLS }, () => ({
    letter: DISTRACTORS[Math.floor(Math.random() * DISTRACTORS.length)],
    isTarget: false,
    found: false,
    rotate: Math.random() * 16 - 8,
  }))
  const indices = new Set<number>()
  while (indices.size < TARGET_COUNT) {
    indices.add(Math.floor(Math.random() * TOTAL_CELLS))
  }
  indices.forEach((i) => {
    cells[i] = { letter: TARGET_LETTER, isTarget: true, found: false, rotate: Math.random() * 16 - 8 }
  })
  return cells
}

export default function ScanGame() {
  const { highScore, reportScore } = useHighScore('scan')
  const [phase, setPhase] = useState<'idle' | 'playing' | 'done'>('idle')
  const [grid, setGrid] = useState<Cell[]>(() => buildGrid())
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const found = grid.filter((c) => c.isTarget && c.found).length

  const start = useCallback(() => {
    setGrid(buildGrid())
    setTimeLeft(ROUND_SECONDS)
    setPhase('playing')
  }, [])

  useEffect(() => {
    if (phase !== 'playing') return
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setPhase('done')
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [phase])

  useEffect(() => {
    if (phase === 'done') reportScore(found)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  function clickCell(index: number) {
    if (phase !== 'playing') return
    setGrid((prev) => {
      const cell = prev[index]
      if (!cell.isTarget || cell.found) return prev
      const next = [...prev]
      next[index] = { ...cell, found: true }
      if (next.filter((c) => c.isTarget && c.found).length === TARGET_COUNT) {
        setPhase('done')
      }
      return next
    })
  }

  return (
    <GameFrame
      meta={meta}
      backTo="/exercises"
      backLabel="All exercises"
      score={found}
      highScore={highScore}
      scoreLabel="Found"
    >
      <div className="scan-stage">
        {phase === 'idle' && (
          <div className="stage-overlay">
            <p>
              Find and click all {TARGET_COUNT} letter &ldquo;d&rdquo;s hidden among the b&rsquo;s,
              p&rsquo;s, and q&rsquo;s.
            </p>
            <button type="button" className="btn" onClick={start}>
              Start ({ROUND_SECONDS}s)
            </button>
          </div>
        )}

        {phase === 'done' && (
          <div className="stage-overlay">
            <h3>{found === TARGET_COUNT ? 'All found!' : "Time's up!"}</h3>
            <p>
              You found {found} of {TARGET_COUNT}.
            </p>
            <button type="button" className="btn" onClick={start}>
              Play again
            </button>
          </div>
        )}

        {phase === 'playing' && (
          <div className="hud">
            ⏱ {timeLeft}s · Found {found}/{TARGET_COUNT}
          </div>
        )}

        <div className="scan-grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
          {grid.map((cell, i) => (
            <button
              key={i}
              type="button"
              className={`scan-cell${cell.found ? ' found' : ''}`}
              style={{ transform: `rotate(${cell.rotate}deg)` }}
              onClick={() => clickCell(i)}
              disabled={phase !== 'playing'}
            >
              {cell.letter}
            </button>
          ))}
        </div>
      </div>
    </GameFrame>
  )
}
