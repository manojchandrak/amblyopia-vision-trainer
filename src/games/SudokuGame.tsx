import { useEffect, useRef, useState, type CSSProperties } from 'react'
import GameFrame from '../components/GameFrame'
import { useHighScore } from '../hooks/useHighScore'
import { useSettings } from '../context/SettingsContext'
import { anaglyphGames } from '../data/games'
import { shuffled } from './arcade'
import './ArcadeGame.css'

const meta = anaglyphGames.find((g) => g.id === 'sudoku')!

type Difficulty = 'easy' | 'medium' | 'hard'
const CLUES: Record<Difficulty, number> = { easy: 42, medium: 34, hard: 28 }
const BASE_POINTS: Record<Difficulty, number> = { easy: 300, medium: 600, hard: 900 }

function candidates(g: number[], i: number): number[] {
  const r = Math.floor(i / 9)
  const c = i % 9
  const used = new Set<number>()
  for (let k = 0; k < 9; k++) {
    used.add(g[r * 9 + k])
    used.add(g[k * 9 + c])
  }
  const br = r - (r % 3)
  const bc = c - (c % 3)
  for (let dr = 0; dr < 3; dr++) for (let dc = 0; dc < 3; dc++) used.add(g[(br + dr) * 9 + bc + dc])
  return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => !used.has(d))
}

/** The empty cell with the fewest options, or null once the grid is full (or -1 index when stuck). */
function pickCell(g: number[]): { index: number; options: number[] } | null {
  let best: { index: number; options: number[] } | null = null
  for (let i = 0; i < 81; i++) {
    if (g[i] !== 0) continue
    const options = candidates(g, i)
    if (!best || options.length < best.options.length) {
      best = { index: i, options }
      if (options.length <= 1) break
    }
  }
  return best
}

function fill(g: number[]): boolean {
  const cell = pickCell(g)
  if (!cell) return true
  for (const v of shuffled(cell.options)) {
    g[cell.index] = v
    if (fill(g)) return true
  }
  g[cell.index] = 0
  return false
}

function countSolutions(g: number[], limit: number): number {
  const cell = pickCell(g)
  if (!cell) return 1
  let found = 0
  for (const v of cell.options) {
    g[cell.index] = v
    found += countSolutions(g, limit - found)
    if (found >= limit) break
  }
  g[cell.index] = 0
  return found
}

function makePuzzle(difficulty: Difficulty) {
  const solution = Array<number>(81).fill(0)
  fill(solution)
  const puzzle = solution.slice()
  let left = 81
  for (const i of shuffled(Array.from({ length: 81 }, (_, k) => k))) {
    if (left <= CLUES[difficulty]) break
    const saved = puzzle[i]
    puzzle[i] = 0
    if (countSolutions(puzzle.slice(), 2) === 1) left -= 1
    else puzzle[i] = saved
  }
  // Each given clue is drawn for one eye only, so both eyes are needed to read the whole puzzle.
  const eye = puzzle.map(() => (Math.random() < 0.55 ? 'weak' : 'strong'))
  return { given: puzzle, solution, eye }
}

export default function SudokuGame() {
  const { highScore, reportScore } = useHighScore('sudoku')
  const { weakEyeColor, strongEyeColor } = useSettings()
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [puzzle, setPuzzle] = useState<ReturnType<typeof makePuzzle> | null>(null)
  const [entries, setEntries] = useState<number[]>(() => Array(81).fill(0))
  const [selected, setSelected] = useState<number | null>(null)
  const [wrong, setWrong] = useState<number[]>([])
  const [message, setMessage] = useState('')
  const [score, setScore] = useState(0)
  const [solved, setSolved] = useState(false)
  const startedAt = useRef(0)

  function newGame() {
    const p = makePuzzle(difficulty)
    setPuzzle(p)
    setEntries(Array(81).fill(0))
    setSelected(null)
    setWrong([])
    setSolved(false)
    setMessage('')
    startedAt.current = Date.now()
  }

  function setCell(index: number, value: number) {
    if (!puzzle || solved || puzzle.given[index] !== 0) return
    const next = entries.slice()
    next[index] = value
    setEntries(next)
    setWrong((w) => w.filter((i) => i !== index))
    const complete = next.every((v, i) => (puzzle.given[i] || v) === puzzle.solution[i])
    if (complete) {
      const seconds = Math.floor((Date.now() - startedAt.current) / 1000)
      const points = Math.max(Math.round(BASE_POINTS[difficulty] / 3), BASE_POINTS[difficulty] - seconds)
      setScore((s) => s + points)
      setSolved(true)
      setMessage(`Solved in ${seconds}s! +${points} points`)
    }
  }

  function check() {
    if (!puzzle) return
    const bad = entries.flatMap((v, i) => (v !== 0 && v !== puzzle.solution[i] ? [i] : []))
    setWrong(bad)
    setMessage(bad.length ? `${bad.length} cell${bad.length === 1 ? ' is' : 's are'} wrong.` : 'No mistakes so far.')
  }

  useEffect(() => {
    if (solved) reportScore(score)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solved])

  useEffect(() => {
    if (!puzzle) return
    function onKey(e: KeyboardEvent) {
      if (selected === null) return
      if (/^[1-9]$/.test(e.key)) setCell(selected, Number(e.key))
      else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') setCell(selected, 0)
      else if (e.key === 'ArrowLeft') setSelected(selected % 9 ? selected - 1 : selected)
      else if (e.key === 'ArrowRight') setSelected(selected % 9 < 8 ? selected + 1 : selected)
      else if (e.key === 'ArrowUp') setSelected(selected >= 9 ? selected - 9 : selected)
      else if (e.key === 'ArrowDown') setSelected(selected < 72 ? selected + 9 : selected)
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const stageStyle = { '--weak': weakEyeColor, '--strong': strongEyeColor } as CSSProperties

  function related(i: number) {
    if (selected === null) return false
    const sr = Math.floor(selected / 9)
    const sc = selected % 9
    const r = Math.floor(i / 9)
    const c = i % 9
    return r === sr || c === sc || (Math.floor(r / 3) === Math.floor(sr / 3) && Math.floor(c / 3) === Math.floor(sc / 3))
  }

  return (
    <GameFrame
      meta={meta}
      backTo="/anaglyph"
      backLabel="All glasses games"
      score={score}
      highScore={highScore}
      scoreLabel="Points"
      needsGlasses
    >
      <div className="puzzle-stage" style={stageStyle}>
        <div className="row">
          <select
            aria-label="Difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <button type="button" className="pbtn primary" onClick={newGame}>
            {puzzle ? 'New puzzle' : 'Start'}
          </button>
          {puzzle && !solved && (
            <button type="button" className="pbtn" onClick={check}>
              Check
            </button>
          )}
        </div>

        {puzzle ? (
          <>
            <div className="sudoku-grid" role="grid" aria-label="Sudoku board">
              {Array.from({ length: 81 }, (_, i) => {
                const given = puzzle.given[i]
                const value = given || entries[i]
                const classes = ['sudoku-cell']
                if (i % 9 === 2 || i % 9 === 5) classes.push('band-r')
                if (Math.floor(i / 9) === 2 || Math.floor(i / 9) === 5) classes.push('band-b')
                if (given) classes.push(puzzle.eye[i] === 'weak' ? 'given-weak' : 'given-strong')
                if (related(i)) classes.push('related')
                if (selected === i) classes.push('selected')
                if (wrong.includes(i)) classes.push('wrong')
                return (
                  <button
                    key={i}
                    type="button"
                    className={classes.join(' ')}
                    onClick={() => setSelected(i)}
                    aria-label={`Row ${Math.floor(i / 9) + 1}, column ${(i % 9) + 1}${value ? `, ${value}` : ', empty'}`}
                  >
                    {value || ''}
                  </button>
                )
              })}
            </div>
            <div className="numpad">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <button key={n} type="button" onClick={() => selected !== null && setCell(selected, n)}>
                  {n}
                </button>
              ))}
              <button type="button" aria-label="Erase" onClick={() => selected !== null && setCell(selected, 0)}>
                ⌫
              </button>
            </div>
          </>
        ) : (
          <p className="puzzle-msg">
            Some clues are drawn for your weaker eye and some for your stronger eye, so you need both eyes to read the
            puzzle. Your own answers are drawn for your weaker eye.
          </p>
        )}
        <p className="puzzle-msg" role="status">
          {message}
        </p>
      </div>
    </GameFrame>
  )
}
