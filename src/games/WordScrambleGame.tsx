import { useEffect, useRef, useState, type CSSProperties } from 'react'
import GameFrame from '../components/GameFrame'
import { useHighScore } from '../hooks/useHighScore'
import { useSettings } from '../context/SettingsContext'
import { anaglyphGames } from '../data/games'
import { shuffled } from './arcade'
import './ArcadeGame.css'

const meta = anaglyphGames.find((g) => g.id === 'word-scramble')!

const ROUND_SECONDS = 90
const BONUS_SECONDS = 4

const WORDS: { word: string; hint: string }[] = [
  { word: 'TIGER', hint: 'Striped big cat' },
  { word: 'PENGUIN', hint: 'Flightless bird of the cold' },
  { word: 'DOLPHIN', hint: 'Clever sea mammal' },
  { word: 'GIRAFFE', hint: 'Tallest land animal' },
  { word: 'BANANA', hint: 'Yellow fruit' },
  { word: 'ORANGE', hint: 'Citrus fruit and a colour' },
  { word: 'CHERRY', hint: 'Small red fruit with a stone' },
  { word: 'GARDEN', hint: 'Where flowers and vegetables grow' },
  { word: 'WINDOW', hint: 'Look through it' },
  { word: 'PLANET', hint: 'Orbits a star' },
  { word: 'ROCKET', hint: 'Travels to space' },
  { word: 'BRIDGE', hint: 'Crosses a river' },
  { word: 'CASTLE', hint: 'Home of a king' },
  { word: 'FOREST', hint: 'Lots of trees' },
  { word: 'SUMMER', hint: 'Warmest season' },
  { word: 'WINTER', hint: 'Coldest season' },
  { word: 'GUITAR', hint: 'Six-string instrument' },
  { word: 'PIANO', hint: 'Black and white keys' },
  { word: 'PILLOW', hint: 'Rest your head on it' },
  { word: 'BUTTER', hint: 'Spread on toast' },
  { word: 'MARKET', hint: 'Place to buy fresh food' },
  { word: 'ISLAND', hint: 'Land surrounded by water' },
  { word: 'CAMERA', hint: 'Takes photographs' },
  { word: 'LANTERN', hint: 'Portable light' },
]

interface Tile {
  id: number
  ch: string
  eye: 'weak' | 'strong'
}

function scramble(word: string): Tile[] {
  let letters = shuffled([...word])
  while (letters.join('') === word) letters = shuffled([...word])
  // Tiles alternate between the two eyes so neither eye can read the word alone.
  return letters.map((ch, id) => ({ id, ch, eye: id % 2 ? 'strong' : 'weak' }))
}

export default function WordScrambleGame() {
  const { highScore, reportScore } = useHighScore('word-scramble')
  const { weakEyeColor, strongEyeColor } = useSettings()
  const [phase, setPhase] = useState<'idle' | 'playing' | 'done'>('idle')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [entry, setEntry] = useState<{ word: string; hint: string } | null>(null)
  const [tiles, setTiles] = useState<Tile[]>([])
  const [answer, setAnswer] = useState<number[]>([])
  const [message, setMessage] = useState('')
  const queue = useRef<typeof WORDS>([])

  function nextWord() {
    if (queue.current.length === 0) queue.current = shuffled(WORDS)
    const next = queue.current.pop()!
    setEntry(next)
    setTiles(scramble(next.word))
    setAnswer([])
  }

  function begin() {
    queue.current = shuffled(WORDS)
    setScore(0)
    setTimeLeft(ROUND_SECONDS)
    setMessage('')
    setPhase('playing')
    nextWord()
  }

  useEffect(() => {
    if (phase !== 'playing') return
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setPhase('done')
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [phase])

  useEffect(() => {
    if (phase === 'done') reportScore(score)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  function submit(ids: number[]) {
    if (!entry) return
    const guess = ids.map((id) => tiles.find((t) => t.id === id)!.ch).join('')
    if (guess === entry.word) {
      setScore((s) => s + 1)
      setTimeLeft((t) => t + BONUS_SECONDS)
      setMessage(`Correct — ${entry.word}! +${BONUS_SECONDS}s`)
      nextWord()
    } else {
      setMessage('Not quite — try again.')
      setAnswer([])
    }
  }

  function add(id: number) {
    if (phase !== 'playing' || answer.includes(id) || !entry) return
    const next = [...answer, id]
    setAnswer(next)
    if (next.length === entry.word.length) submit(next)
  }

  function remove(position: number) {
    setAnswer((a) => a.filter((_, i) => i !== position))
  }

  useEffect(() => {
    if (phase !== 'playing') return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Backspace') {
        setAnswer((a) => a.slice(0, -1))
        e.preventDefault()
        return
      }
      if (!/^[a-zA-Z]$/.test(e.key)) return
      const ch = e.key.toUpperCase()
      const tile = tiles.find((t) => t.ch === ch && !answer.includes(t.id))
      if (tile) add(tile.id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const stageStyle = { '--weak': weakEyeColor, '--strong': strongEyeColor } as CSSProperties

  return (
    <GameFrame
      meta={meta}
      backTo="/anaglyph"
      backLabel="All glasses games"
      score={score}
      highScore={highScore}
      scoreLabel="Solved"
      needsGlasses
    >
      <div className="puzzle-stage" style={stageStyle}>
        {phase === 'idle' && (
          <>
            <p className="puzzle-msg">
              Unscramble as many words as you can in {ROUND_SECONDS} seconds. The letters alternate between your two eyes,
              and your answer is drawn for your weaker eye. Click letters or type them.
            </p>
            <button type="button" className="pbtn primary" onClick={begin}>
              Start
            </button>
          </>
        )}

        {phase === 'playing' && entry && (
          <>
            <div className="scramble-timer">⏱ {timeLeft}s</div>
            <p className="scramble-hint">Hint: {entry.hint}</p>
            <div className="tiles" aria-label="Scrambled letters">
              {tiles.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`tile ${t.eye}${answer.includes(t.id) ? ' used' : ''}`}
                  onClick={() => add(t.id)}
                >
                  {t.ch}
                </button>
              ))}
            </div>
            <div className="tiles" aria-label="Your answer">
              {entry.word.split('').map((_, i) => {
                const id = answer[i]
                const tile = tiles.find((t) => t.id === id)
                return (
                  <button
                    key={i}
                    type="button"
                    className={`tile slot weak${tile ? ' filled' : ''}`}
                    onClick={() => tile && remove(i)}
                  >
                    {tile?.ch ?? ''}
                  </button>
                )
              })}
            </div>
            <div className="row">
              <button type="button" className="pbtn" onClick={() => setAnswer([])}>
                Clear
              </button>
              <button type="button" className="pbtn" onClick={nextWord}>
                Skip
              </button>
            </div>
          </>
        )}

        {phase === 'done' && (
          <>
            <h3>Time&rsquo;s up!</h3>
            <p className="puzzle-msg">
              You solved {score} word{score === 1 ? '' : 's'}.
            </p>
            <button type="button" className="pbtn primary" onClick={begin}>
              Play again
            </button>
          </>
        )}

        <p className="puzzle-msg" role="status">
          {message}
        </p>
      </div>
    </GameFrame>
  )
}
