import { useEffect, useRef, useState } from 'react'
import GameFrame from '../components/GameFrame'
import { useAnimationFrame } from '../hooks/useAnimationFrame'
import { useHighScore } from '../hooks/useHighScore'
import { useSettings } from '../context/SettingsContext'
import { anaglyphGames } from '../data/games'
import { resolveColor } from './arcade'
import './ArcadeGame.css'

const meta = anaglyphGames.find((g) => g.id === 'tetris')!

const COLS = 10
const ROWS = 20
const CELL = 22
const W = COLS * CELL
const H = ROWS * CELL

type Shape = number[][]

const SHAPES: Shape[] = [
  [[1, 1, 1, 1]],
  [[1, 1], [1, 1]],
  [[0, 1, 0], [1, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
  [[1, 1, 0], [0, 1, 1]],
  [[1, 0, 0], [1, 1, 1]],
  [[0, 0, 1], [1, 1, 1]],
]

const LINE_POINTS = [0, 100, 300, 500, 800]

interface Piece {
  shape: Shape
  x: number
  y: number
}

function rotate(shape: Shape): Shape {
  return shape[0].map((_, c) => shape.map((row) => row[c]).reverse())
}

function emptyBoard() {
  return Array.from({ length: ROWS }, () => Array<number>(COLS).fill(0))
}

function collides(board: number[][], shape: Shape, x: number, y: number) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue
      const nx = x + c
      const ny = y + r
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true
      if (ny >= 0 && board[ny][nx]) return true
    }
  }
  return false
}

function newPiece(): Piece {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)]
  return { shape, x: Math.floor((COLS - shape[0].length) / 2), y: 0 }
}

function freshGame() {
  return { board: emptyBoard(), piece: newPiece(), timer: 0, lines: 0, score: 0, over: false }
}

export default function TetrisGame() {
  const { highScore, reportScore } = useHighScore('tetris')
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

  function lock() {
    const g = game.current
    const { shape, x, y } = g.piece
    shape.forEach((row, r) =>
      row.forEach((cell, c) => {
        if (cell && y + r >= 0) g.board[y + r][x + c] = 1
      }),
    )
    const kept = g.board.filter((row) => row.some((cell) => !cell))
    const cleared = ROWS - kept.length
    if (cleared > 0) {
      const level = Math.floor(g.lines / 8)
      g.score += LINE_POINTS[cleared] * (level + 1)
      g.lines += cleared
      g.board = [...Array.from({ length: cleared }, () => Array<number>(COLS).fill(0)), ...kept]
    }
    g.piece = newPiece()
    if (collides(g.board, g.piece.shape, g.piece.x, g.piece.y)) g.over = true
  }

  const actions = {
    left() {
      const p = game.current.piece
      if (!collides(game.current.board, p.shape, p.x - 1, p.y)) p.x -= 1
    },
    right() {
      const p = game.current.piece
      if (!collides(game.current.board, p.shape, p.x + 1, p.y)) p.x += 1
    },
    rotate() {
      const g = game.current
      const turned = rotate(g.piece.shape)
      for (const kick of [0, -1, 1, -2, 2]) {
        if (!collides(g.board, turned, g.piece.x + kick, g.piece.y)) {
          g.piece = { shape: turned, x: g.piece.x + kick, y: g.piece.y }
          return
        }
      }
    },
    down() {
      const g = game.current
      if (!collides(g.board, g.piece.shape, g.piece.x, g.piece.y + 1)) {
        g.piece.y += 1
        g.timer = 0
      } else {
        lock()
      }
    },
    drop() {
      const g = game.current
      while (!collides(g.board, g.piece.shape, g.piece.x, g.piece.y + 1)) g.piece.y += 1
      lock()
    },
  }
  const actionsRef = useRef(actions)
  actionsRef.current = actions

  useEffect(() => {
    if (phase !== 'playing') return
    function onKey(e: KeyboardEvent) {
      const a = actionsRef.current
      if (e.code === 'ArrowLeft') a.left()
      else if (e.code === 'ArrowRight') a.right()
      else if (e.code === 'ArrowUp') a.rotate()
      else if (e.code === 'ArrowDown') a.down()
      else if (e.code === 'Space') a.drop()
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase])

  useAnimationFrame(
    (dt) => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return
      const g = game.current

      g.timer += dt
      const interval = Math.max(0.1, 0.8 - Math.floor(g.lines / 8) * 0.07)
      if (g.timer >= interval) {
        g.timer = 0
        actionsRef.current.down()
      }

      const weak = resolveColor(weakEyeColor)
      const strong = resolveColor(strongEyeColor)
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'lighter'

      // Faint grid and the settled stack belong to the stronger eye.
      ctx.strokeStyle = strong
      ctx.globalAlpha = 0.15
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let c = 1; c < COLS; c++) { ctx.moveTo(c * CELL + 0.5, 0); ctx.lineTo(c * CELL + 0.5, H) }
      for (let r = 1; r < ROWS; r++) { ctx.moveTo(0, r * CELL + 0.5); ctx.lineTo(W, r * CELL + 0.5) }
      ctx.stroke()
      ctx.globalAlpha = 1

      ctx.fillStyle = strong
      g.board.forEach((row, r) =>
        row.forEach((cell, c) => {
          if (cell) ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2)
        }),
      )

      // The falling piece belongs to the weaker eye.
      ctx.fillStyle = weak
      g.piece.shape.forEach((row, r) =>
        row.forEach((cell, c) => {
          if (cell) ctx.fillRect((g.piece.x + c) * CELL + 1, (g.piece.y + r) * CELL + 1, CELL - 2, CELL - 2)
        }),
      )

      setScore(g.score)
      if (g.over) setPhase('done')
    },
    phase === 'playing',
  )

  useEffect(() => {
    if (phase === 'done') reportScore(score)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

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
      <div className="arcade-stage narrow">
        <canvas ref={canvasRef} className="arcade-canvas" width={W} height={H} />
        {phase === 'idle' && (
          <div className="arcade-overlay">
            <p>The falling piece is only visible to your weaker eye and the stack only to your stronger eye. Arrow keys move and rotate, Space drops.</p>
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
        <div className="arcade-controls">
          <button type="button" aria-label="Move left" onClick={() => phase === 'playing' && actions.left()}>←</button>
          <button type="button" aria-label="Rotate" onClick={() => phase === 'playing' && actions.rotate()}>↻</button>
          <button type="button" aria-label="Move right" onClick={() => phase === 'playing' && actions.right()}>→</button>
          <button type="button" aria-label="Soft drop" onClick={() => phase === 'playing' && actions.down()}>↓</button>
          <button type="button" aria-label="Hard drop" onClick={() => phase === 'playing' && actions.drop()}>⤓</button>
        </div>
      </div>
    </GameFrame>
  )
}
