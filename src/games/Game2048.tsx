import { useEffect, useRef, useState, type CSSProperties } from 'react'
import GameFrame from '../components/GameFrame'
import { useHighScore } from '../hooks/useHighScore'
import { useSettings } from '../context/SettingsContext'
import { anaglyphGames } from '../data/games'
import './ArcadeGame.css'
import './PuzzleGames.css'

const meta = anaglyphGames.find((g) => g.id === '2048')!
const N = 4

type Board = number[]

function addTile(board: Board): Board {
  const empty = board.flatMap((v, i) => (v ? [] : [i]))
  if (!empty.length) return board
  const next = board.slice()
  next[empty[Math.floor(Math.random() * empty.length)]] = Math.random() < 0.9 ? 2 : 4
  return next
}

function fresh(): Board {
  return addTile(addTile(Array<number>(N * N).fill(0)))
}

/** Slides one line towards its start, merging equal neighbours once. */
function slideLine(line: number[]): { line: number[]; gained: number } {
  const tiles = line.filter(Boolean)
  const out: number[] = []
  let gained = 0
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i] === tiles[i + 1]) {
      out.push(tiles[i] * 2)
      gained += tiles[i] * 2
      i++
    } else out.push(tiles[i])
  }
  while (out.length < N) out.push(0)
  return { line: out, gained }
}

type Dir = 'left' | 'right' | 'up' | 'down'

function move(board: Board, dir: Dir): { board: Board; gained: number; moved: boolean } {
  const next = board.slice()
  let gained = 0
  for (let k = 0; k < N; k++) {
    const idx = Array.from({ length: N }, (_, j) =>
      dir === 'left' ? k * N + j : dir === 'right' ? k * N + (N - 1 - j) : dir === 'up' ? j * N + k : (N - 1 - j) * N + k,
    )
    const res = slideLine(idx.map((i) => board[i]))
    idx.forEach((i, j) => (next[i] = res.line[j]))
    gained += res.gained
  }
  return { board: next, gained, moved: next.some((v, i) => v !== board[i]) }
}

function stuck(board: Board) {
  return (['left', 'right', 'up', 'down'] as Dir[]).every((d) => !move(board, d).moved)
}

export default function Game2048() {
  const { highScore, reportScore } = useHighScore('2048')
  const { weakEyeColor, strongEyeColor } = useSettings()
  const [board, setBoard] = useState<Board>(fresh)
  const [score, setScore] = useState(0)
  const [over, setOver] = useState(false)
  const touch = useRef<{ x: number; y: number } | null>(null)

  function play(dir: Dir) {
    if (over) return
    const res = move(board, dir)
    if (!res.moved) return
    const next = addTile(res.board)
    const total = score + res.gained
    setBoard(next)
    setScore(total)
    if (stuck(next)) {
      setOver(true)
      reportScore(total)
    }
  }
  const playRef = useRef(play)
  playRef.current = play

  useEffect(() => {
    const keyDirs: Record<string, Dir> = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' }
    function onKey(e: KeyboardEvent) {
      const d = keyDirs[e.code]
      if (!d) return
      e.preventDefault()
      playRef.current(d)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function restart() {
    reportScore(score)
    setBoard(fresh())
    setScore(0)
    setOver(false)
  }

  function swipeEnd(e: React.PointerEvent) {
    const s = touch.current
    touch.current = null
    if (!s) return
    const dx = e.clientX - s.x
    const dy = e.clientY - s.y
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return
    play(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up')
  }

  return (
    <GameFrame meta={meta} backTo="/anaglyph" backLabel="All glasses games" score={score} highScore={highScore} needsGlasses>
      <div className="puzzle-stage" style={{ '--weak': weakEyeColor, '--strong': strongEyeColor } as CSSProperties}>
        <div
          className="g2048-board"
          onPointerDown={(e) => (touch.current = { x: e.clientX, y: e.clientY })}
          onPointerUp={swipeEnd}
        >
          {board.map((v, i) => {
            // Every tile has a frame for one eye and a number for the other, swapping with each doubling.
            const level = v ? Math.log2(v) : 0
            const swap = level % 2 === 0
            return (
              <div
                key={i}
                className={`g2048-tile${v ? ' filled' : ''}${swap ? ' swap' : ''}`}
                style={{ '--glow': Math.min(level, 11) / 11 } as CSSProperties}
              >
                {v || ''}
              </div>
            )
          })}
        </div>
        <p className="puzzle-msg">{over ? 'No moves left!' : 'Swipe or use the arrow keys.'}</p>
        <div className="row">
          <button type="button" className="pbtn primary" onClick={restart}>
            {over ? 'Play again' : 'New game'}
          </button>
        </div>
      </div>
    </GameFrame>
  )
}
