import { useEffect, useState, type CSSProperties } from 'react'
import GameFrame from '../components/GameFrame'
import { useHighScore } from '../hooks/useHighScore'
import { useSettings } from '../context/SettingsContext'
import { anaglyphGames } from '../data/games'
import { shuffled } from './arcade'
import './ArcadeGame.css'
import './PuzzleGames.css'

const meta = anaglyphGames.find((g) => g.id === 'memory')!

// SVG paths on a 24x24 grid (shapes, not emoji, so the colour stays in one channel).
const SHAPES = [
  'M12 2l3 7 7 .8-5.3 4.7 1.6 7.2L12 18l-6.3 3.7 1.6-7.2L2 9.8 9 9z',
  'M12 21s-8-5.3-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.7-8 11-8 11z',
  'M12 2l9 10-9 10L3 12z',
  'M12 3a9 9 0 100 18 9 9 0 000-18z',
  'M3 20L12 4l9 16z',
  'M4 4h16v16H4z',
  'M9 3h6v6h6v6h-6v6H9v-6H3V9h6z',
  'M12 2l2.4 6.6L21 9l-5.2 4.3L17.5 20 12 16.2 6.5 20l1.7-6.7L3 9l6.6-.4z',
]

interface Card {
  id: number
  shape: number
  eye: 'weak' | 'strong'
}

function deal(pairs: number): Card[] {
  // Each shape appears once for each eye, so a match needs both eyes' views.
  const cards = Array.from({ length: pairs }, (_, s) => [
    { shape: s, eye: 'weak' as const },
    { shape: s, eye: 'strong' as const },
  ]).flat()
  return shuffled(cards).map((c, id) => ({ ...c, id }))
}

export default function MemoryMatchGame() {
  const { highScore, reportScore } = useHighScore('memory', { lowerIsBetter: true })
  const { weakEyeColor, strongEyeColor } = useSettings()
  const [pairs, setPairs] = useState(6)
  const [cards, setCards] = useState(() => deal(6))
  const [open, setOpen] = useState<number[]>([])
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [moves, setMoves] = useState(0)
  const done = matched.size === cards.length

  useEffect(() => {
    if (done) reportScore(moves)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  useEffect(() => {
    if (open.length !== 2) return
    const [a, b] = open.map((i) => cards[i])
    const t = setTimeout(
      () => {
        if (a.shape === b.shape) setMatched((m) => new Set([...m, a.id, b.id]))
        setOpen([])
      },
      a.shape === b.shape ? 450 : 900,
    )
    return () => clearTimeout(t)
  }, [open, cards])

  function flip(i: number) {
    if (open.length >= 2 || open.includes(i) || matched.has(cards[i].id)) return
    if (open.length === 1) setMoves((m) => m + 1)
    setOpen([...open, i])
  }

  function newGame(p = pairs) {
    setPairs(p)
    setCards(deal(p))
    setOpen([])
    setMatched(new Set())
    setMoves(0)
  }

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
      <div className="puzzle-stage" style={{ '--weak': weakEyeColor, '--strong': strongEyeColor } as CSSProperties}>
        <div className="memory-grid" style={{ '--cols': 4 } as CSSProperties}>
          {cards.map((c, i) => {
            const shown = open.includes(i) || matched.has(c.id)
            return (
              <button
                key={c.id}
                type="button"
                className={`memory-card ${c.eye}${shown ? ' shown' : ''}${matched.has(c.id) ? ' matched' : ''}`}
                onClick={() => flip(i)}
                aria-label={shown ? `Shape ${c.shape + 1}` : 'Hidden card'}
              >
                {shown && (
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d={SHAPES[c.shape]} />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
        <p className="puzzle-msg">{done ? `Cleared in ${moves} moves!` : 'Find each shape in both colours.'}</p>
        <div className="row">
          <select value={pairs} onChange={(e) => newGame(Number(e.target.value))} aria-label="Number of pairs">
            <option value={4}>8 cards</option>
            <option value={6}>12 cards</option>
            <option value={8}>16 cards</option>
          </select>
          <button type="button" className="pbtn primary" onClick={() => newGame()}>
            New game
          </button>
        </div>
      </div>
    </GameFrame>
  )
}
