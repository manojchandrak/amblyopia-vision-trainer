import { useEffect, useState, type CSSProperties } from 'react'
import GameFrame from '../components/GameFrame'
import { useHighScore } from '../hooks/useHighScore'
import { useSettings } from '../context/SettingsContext'
import { anaglyphGames } from '../data/games'
import { shuffled } from './arcade'
import './ArcadeGame.css'

const meta = anaglyphGames.find((g) => g.id === 'word-search')!

const SIZE = 10
const WORD_COUNT = 6
const WORDS = [
  'EAGLE', 'TIGER', 'ZEBRA', 'OTTER', 'PANDA', 'KOALA', 'WHALE', 'SHARK', 'MOOSE', 'BADGER',
  'RABBIT', 'FALCON', 'DOLPHIN', 'GIRAFFE', 'LEOPARD', 'PENGUIN', 'BEAVER', 'CAMEL', 'HERON', 'LLAMA',
  'MAPLE', 'CEDAR', 'BIRCH', 'ASPEN', 'WILLOW', 'ORANGE', 'LEMON', 'MANGO', 'PEACH', 'GRAPE',
  'RIVER', 'OCEAN', 'FOREST', 'MEADOW', 'CANYON', 'GLACIER', 'ISLAND', 'DESERT', 'VALLEY', 'LAGOON',
]
const DIRECTIONS: [number, number][] = [[1, 0], [0, 1], [1, 1], [-1, 1], [-1, 0], [0, -1], [-1, -1], [1, -1]]

function makeGrid() {
  const words = shuffled(WORDS).slice(0, WORD_COUNT)
  const letters = Array<string>(SIZE * SIZE).fill('')
  const placed: string[] = []
  for (const word of words.sort((a, b) => b.length - a.length)) {
    for (let attempt = 0; attempt < 300; attempt++) {
      const [dx, dy] = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)]
      const x = Math.floor(Math.random() * SIZE)
      const y = Math.floor(Math.random() * SIZE)
      const endX = x + dx * (word.length - 1)
      const endY = y + dy * (word.length - 1)
      if (endX < 0 || endX >= SIZE || endY < 0 || endY >= SIZE) continue
      const fits = [...word].every((ch, k) => {
        const cell = letters[(y + dy * k) * SIZE + x + dx * k]
        return cell === '' || cell === ch
      })
      if (!fits) continue
      for (let k = 0; k < word.length; k++) letters[(y + dy * k) * SIZE + x + dx * k] = word[k]
      placed.push(word)
      break
    }
  }
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const grid = letters.map((l) => l || alphabet[Math.floor(Math.random() * alphabet.length)])
  // Every letter is drawn for one eye only, so both eyes are needed to read the grid.
  const eye = grid.map(() => (Math.random() < 0.55 ? 'weak' : 'strong'))
  return { grid, eye, words: placed.sort() }
}

export default function WordSearchGame() {
  const { highScore, reportScore } = useHighScore('word-search')
  const { weakEyeColor, strongEyeColor } = useSettings()
  const [puzzle, setPuzzle] = useState<ReturnType<typeof makeGrid> | null>(null)
  const [start, setStart] = useState<number | null>(null)
  const [found, setFound] = useState<string[]>([])
  const [foundCells, setFoundCells] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [message, setMessage] = useState('')

  const finished = puzzle !== null && found.length === puzzle.words.length

  function newPuzzle() {
    setPuzzle(makeGrid())
    setStart(null)
    setFound([])
    setFoundCells([])
    setMessage('')
  }

  function pick(index: number) {
    if (!puzzle || finished) return
    if (start === null) {
      setStart(index)
      return
    }
    if (start === index) {
      setStart(null)
      return
    }
    const r1 = Math.floor(start / SIZE)
    const c1 = start % SIZE
    const r2 = Math.floor(index / SIZE)
    const c2 = index % SIZE
    const dr = r2 - r1
    const dc = c2 - c1
    setStart(null)
    if (!(dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc))) {
      setMessage('Pick the first and last letter in a straight line.')
      return
    }
    const steps = Math.max(Math.abs(dr), Math.abs(dc))
    const cells = Array.from({ length: steps + 1 }, (_, k) => (r1 + Math.sign(dr) * k) * SIZE + c1 + Math.sign(dc) * k)
    const text = cells.map((i) => puzzle.grid[i]).join('')
    const word = puzzle.words.find((w) => !found.includes(w) && (w === text || w === [...text].reverse().join('')))
    if (!word) {
      setMessage('Not one of the words — try again.')
      return
    }
    setFound((f) => [...f, word])
    setFoundCells((f) => [...f, ...cells])
    setScore((s) => s + 10)
    setMessage(`Found ${word}!`)
  }

  useEffect(() => {
    if (finished) reportScore(score)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])

  const stageStyle = { '--weak': weakEyeColor, '--strong': strongEyeColor } as CSSProperties

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
          <button type="button" className="pbtn primary" onClick={newPuzzle}>
            {!puzzle ? 'Start' : finished ? 'Next puzzle' : 'New puzzle'}
          </button>
        </div>

        {puzzle ? (
          <>
            <div className="ws-grid" role="grid" aria-label="Word search grid">
              {puzzle.grid.map((letter, i) => (
                <button
                  key={i}
                  type="button"
                  className={`ws-cell ${puzzle.eye[i]}${start === i ? ' start' : ''}${foundCells.includes(i) ? ' found' : ''}`}
                  onClick={() => pick(i)}
                >
                  {letter}
                </button>
              ))}
            </div>
            <div className="word-list" aria-label="Words to find">
              {puzzle.words.map((w) => (
                <span key={w} className={found.includes(w) ? 'done' : ''}>
                  {[...w].map((ch, k) => (
                    <span key={k} className={k % 2 ? 'strong-text' : 'weak-text'}>
                      {ch}
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </>
        ) : (
          <p className="puzzle-msg">
            Each letter in the grid is drawn for only one eye, so both eyes have to work together to read it. Click the
            first letter of a word, then its last letter.
          </p>
        )}
        <p className="puzzle-msg" role="status">
          {finished ? 'All words found! Try the next puzzle.' : message}
        </p>
      </div>
    </GameFrame>
  )
}
