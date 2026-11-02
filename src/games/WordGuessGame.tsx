import { useEffect, useRef, useState, type CSSProperties } from 'react'
import GameFrame from '../components/GameFrame'
import { useHighScore } from '../hooks/useHighScore'
import { useSettings } from '../context/SettingsContext'
import { anaglyphGames } from '../data/games'
import './ArcadeGame.css'
import './PuzzleGames.css'

const meta = anaglyphGames.find((g) => g.id === 'word-guess')!

const WORDS = [
  'APPLE', 'BRAVE', 'CLOUD', 'DREAM', 'EAGLE', 'FLAME', 'GRAPE', 'HEART', 'IVORY', 'JOLLY', 'KNIFE', 'LEMON', 'MANGO', 'NIGHT',
  'OCEAN', 'PIANO', 'QUEEN', 'RIVER', 'STONE', 'TIGER', 'UNITY', 'VOICE', 'WATER', 'YOUTH', 'ZEBRA', 'BEACH', 'CANDY', 'DANCE',
  'EARTH', 'FIELD', 'GLASS', 'HOUSE', 'LIGHT', 'MUSIC', 'PLANT', 'SMILE', 'TRAIN', 'WORLD', 'SUGAR', 'PEARL',
]
const ROWS = 6
const LEN = 5
const KEYS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM']

type Mark = 'hit' | 'near' | 'miss'

function grade(guess: string, answer: string): Mark[] {
  const marks: Mark[] = Array(LEN).fill('miss')
  const left = answer.split('')
  for (let i = 0; i < LEN; i++) if (guess[i] === answer[i]) { marks[i] = 'hit'; left[i] = '' }
  for (let i = 0; i < LEN; i++) {
    if (marks[i] === 'hit') continue
    const k = left.indexOf(guess[i])
    if (k >= 0) { marks[i] = 'near'; left[k] = '' }
  }
  return marks
}

export default function WordGuessGame() {
  const { highScore, reportScore } = useHighScore('word-guess')
  const { weakEyeColor, strongEyeColor } = useSettings()
  const [answer, setAnswer] = useState(() => WORDS[Math.floor(Math.random() * WORDS.length)])
  const [guesses, setGuesses] = useState<string[]>([])
  const [entry, setEntry] = useState('')
  const [wins, setWins] = useState(0)
  const won = guesses.at(-1) === answer
  const over = won || guesses.length >= ROWS

  function submit() {
    if (over || entry.length !== LEN) return
    const next = [...guesses, entry]
    setGuesses(next)
    setEntry('')
    if (entry === answer) {
      const w = wins + 1
      setWins(w)
      reportScore(w)
    }
  }
  const press = useRef((k: string) => void k)
  press.current = (k: string) => {
    if (over) return
    if (k === 'ENTER') submit()
    else if (k === 'BACK') setEntry((e) => e.slice(0, -1))
    else if (/^[A-Z]$/.test(k)) setEntry((e) => (e.length < LEN ? e + k : e))
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key === 'Enter') press.current('ENTER')
      else if (e.key === 'Backspace') press.current('BACK')
      else if (/^[a-z]$/i.test(e.key)) press.current(e.key.toUpperCase())
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function again() {
    setAnswer(WORDS[Math.floor(Math.random() * WORDS.length)])
    setGuesses([])
    setEntry('')
  }

  const best: Record<string, Mark> = {}
  guesses.forEach((g) =>
    grade(g, answer).forEach((m, i) => {
      const rank = { miss: 0, near: 1, hit: 2 }
      if (!best[g[i]] || rank[m] > rank[best[g[i]]]) best[g[i]] = m
    }),
  )

  return (
    <GameFrame meta={meta} backTo="/anaglyph" backLabel="All glasses games" score={wins} highScore={highScore} scoreLabel="Solved" needsGlasses>
      <div className="puzzle-stage" style={{ '--weak': weakEyeColor, '--strong': strongEyeColor } as CSSProperties}>
        <div className="wg-grid">
          {Array.from({ length: ROWS }, (_, r) => {
            const word = guesses[r] ?? (r === guesses.length ? entry : '')
            const marks = guesses[r] ? grade(guesses[r], answer) : null
            return Array.from({ length: LEN }, (_, c) => (
              <div key={`${r}-${c}`} className={`wg-cell ${c % 2 ? 'strong' : 'weak'} ${marks ? marks[c] : ''}${word[c] && !marks ? ' typed' : ''}`}>
                {word[c] ?? ''}
              </div>
            ))
          })}
        </div>
        <p className="puzzle-msg">
          {won ? 'Solved!' : over ? `The word was ${answer}.` : 'Solid frame = right spot · dashed = wrong spot · faint = not in word.'}
        </p>
        <div className="wg-keys">
          {KEYS.map((row, i) => (
            <div key={row} className="wg-keyrow">
              {i === 2 && <button type="button" className="wg-key wide" onClick={() => press.current('ENTER')}>Enter</button>}
              {[...row].map((k) => (
                <button key={k} type="button" className={`wg-key ${best[k] ?? ''}`} onClick={() => press.current(k)}>
                  {k}
                </button>
              ))}
              {i === 2 && <button type="button" className="wg-key wide" onClick={() => press.current('BACK')}>⌫</button>}
            </div>
          ))}
        </div>
        {over && (
          <button type="button" className="pbtn primary" onClick={again}>
            Next word
          </button>
        )}
      </div>
    </GameFrame>
  )
}
