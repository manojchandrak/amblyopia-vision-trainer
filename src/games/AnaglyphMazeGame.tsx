import { useCallback, useEffect, useState } from 'react'
import GameFrame from '../components/GameFrame'
import { useHighScore } from '../hooks/useHighScore'
import { useSettings } from '../context/SettingsContext'
import { anaglyphGames } from '../data/games'
import './AnaglyphMazeGame.css'

const meta = anaglyphGames.find((g) => g.id === 'maze')!

const MAZES = [
  ['#######', '#S..#.#', '#.##..#', '#....##', '##.#..#', '#....G#', '#######'],
  ['#######', '#S....#', '#.###.#', '#.....#', '#.###.#', '#....G#', '#######'],
  ['#######', '#S....#', '#.#.#.#', '#.#.#.#', '#.#.#.#', '#....G#', '#######'],
]

function parseMaze(rows: string[]) {
  const grid = rows.map((row) => row.split(''))
  let start = { r: 1, c: 1 }
  let goal = { r: 1, c: 1 }
  grid.forEach((row, r) =>
    row.forEach((ch, c) => {
      if (ch === 'S') start = { r, c }
      if (ch === 'G') goal = { r, c }
    }),
  )
  return { grid, start, goal }
}

export default function AnaglyphMazeGame() {
  const { highScore, reportScore } = useHighScore('maze', { lowerIsBetter: true })
  const { weakEyeColor, strongEyeColor } = useSettings()
  const [phase, setPhase] = useState<'idle' | 'playing' | 'done'>('idle')
  const [maze, setMaze] = useState(() => parseMaze(MAZES[0]))
  const [pos, setPos] = useState(maze.start)
  const [moves, setMoves] = useState(0)

  const start = useCallback(() => {
    const idx = Math.floor(Math.random() * MAZES.length)
    const m = parseMaze(MAZES[idx])
    setMaze(m)
    setPos(m.start)
    setMoves(0)
    setPhase('playing')
  }, [])

  useEffect(() => {
    if (phase === 'done') reportScore(moves)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const move = useCallback(
    (dr: number, dc: number) => {
      if (phase !== 'playing') return
      const nr = pos.r + dr
      const nc = pos.c + dc
      const cell = maze.grid[nr]?.[nc]
      if (!cell || cell === '#') return
      setPos({ r: nr, c: nc })
      setMoves((m) => m + 1)
      if (nr === maze.goal.r && nc === maze.goal.c) {
        setTimeout(() => setPhase('done'), 150)
      }
    },
    [phase, maze, pos],
  )

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowUp') move(-1, 0)
      else if (e.key === 'ArrowDown') move(1, 0)
      else if (e.key === 'ArrowLeft') move(0, -1)
      else if (e.key === 'ArrowRight') move(0, 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [move])

  const cols = maze.grid[0]?.length ?? 7

  return (
    <GameFrame
      meta={meta}
      backTo="/anaglyph"
      backLabel="All glasses games"
      score={moves}
      highScore={Number.isFinite(highScore) ? highScore : 0}
      scoreLabel="Moves"
      needsGlasses
    >
      <div className="maze-wrap">
        {phase === 'idle' && (
          <div className="stage-overlay">
            <p>Put your glasses on. Steer the ball from start to the goal.</p>
            <button type="button" className="btn" onClick={start}>
              Start
            </button>
          </div>
        )}

        {phase === 'done' && (
          <div className="stage-overlay">
            <h3>Solved! 🎉</h3>
            <p>You reached the goal in {moves} moves.</p>
            <button type="button" className="btn" onClick={start}>
              Play again
            </button>
          </div>
        )}

        {phase === 'playing' && (
          <>
            <div
              className="maze-grid"
              style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, color: strongEyeColor }}
            >
              {maze.grid.map((row, r) =>
                row.map((ch, c) => (
                  <div key={`${r}-${c}`} className={`maze-cell${ch === '#' ? ' wall' : ''}`}>
                    {ch === 'G' && (
                      <span className="goal-marker" style={{ color: weakEyeColor }}>
                        ●
                      </span>
                    )}
                  </div>
                )),
              )}
              <div
                className="maze-ball"
                style={{
                  color: weakEyeColor,
                  gridRow: pos.r + 1,
                  gridColumn: pos.c + 1,
                }}
              >
                ●
              </div>
            </div>

            <div className="maze-controls">
              <div className="dpad">
                <button type="button" className="dpad-btn up" onClick={() => move(-1, 0)} aria-label="up">
                  ↑
                </button>
                <button type="button" className="dpad-btn left" onClick={() => move(0, -1)} aria-label="left">
                  ←
                </button>
                <button type="button" className="dpad-btn right" onClick={() => move(0, 1)} aria-label="right">
                  →
                </button>
                <button type="button" className="dpad-btn down" onClick={() => move(1, 0)} aria-label="down">
                  ↓
                </button>
              </div>
              <span className="moves-count">Moves: {moves}</span>
            </div>
          </>
        )}
      </div>
    </GameFrame>
  )
}
