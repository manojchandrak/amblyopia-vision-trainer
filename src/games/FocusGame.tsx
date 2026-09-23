import { useCallback, useEffect, useRef, useState } from 'react'
import GameFrame from '../components/GameFrame'
import { useHighScore } from '../hooks/useHighScore'
import { noGlassesGames } from '../data/games'
import './FocusGame.css'

const meta = noGlassesGames.find((g) => g.id === 'focus')!
const TOTAL_ROUNDS = 12
const ROUND_MS = 3200
const LETTERS = ['A', 'E', 'F', 'H', 'K', 'M', 'N', 'P', 'R', 'S', 'T', 'X', 'Y', 'Z']

function pickLetters() {
  const shuffled = [...LETTERS].sort(() => Math.random() - 0.5)
  const target = shuffled[0]
  const choices = shuffled.slice(0, 4).sort(() => Math.random() - 0.5)
  return { target, choices }
}

export default function FocusGame() {
  const { highScore, reportScore } = useHighScore('focus')
  const [phase, setPhase] = useState<'idle' | 'playing' | 'done'>('idle')
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [distance, setDistance] = useState<'far' | 'near'>('far')
  const [target, setTarget] = useState('A')
  const [choices, setChoices] = useState<string[]>(['A', 'B', 'C', 'D'])
  const [answered, setAnswered] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setupRound = useCallback((roundNum: number) => {
    const { target: t, choices: c } = pickLetters()
    setTarget(t)
    setChoices(c)
    setDistance(roundNum % 2 === 0 ? 'far' : 'near')
    setAnswered(null)
  }, [])

  const start = useCallback(() => {
    setScore(0)
    setRound(1)
    setPhase('playing')
    setupRound(1)
  }, [setupRound])

  useEffect(() => {
    if (phase !== 'playing' || answered) return
    timerRef.current = setTimeout(() => {
      setAnswered('__timeout__')
    }, ROUND_MS)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [phase, round, answered])

  useEffect(() => {
    if (!answered) return
    const t = setTimeout(() => {
      if (round >= TOTAL_ROUNDS) {
        setPhase('done')
      } else {
        const next = round + 1
        setRound(next)
        setupRound(next)
      }
    }, 500)
    return () => clearTimeout(t)
  }, [answered, round, setupRound])

  useEffect(() => {
    if (phase === 'done') reportScore(score)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  function choose(letter: string) {
    if (answered) return
    if (timerRef.current) clearTimeout(timerRef.current)
    if (letter === target) setScore((s) => s + 1)
    setAnswered(letter)
  }

  return (
    <GameFrame
      meta={meta}
      backTo="/exercises"
      backLabel="All exercises"
      score={score}
      highScore={highScore}
      scoreLabel="Correct"
    >
      <div className="focus-stage">
        {phase === 'idle' && (
          <div className="stage-overlay">
            <p>A letter appears small (far) or large (near). Click it among the four choices before it switches.</p>
            <button type="button" className="btn" onClick={start}>
              Start ({TOTAL_ROUNDS} rounds)
            </button>
          </div>
        )}

        {phase === 'done' && (
          <div className="stage-overlay">
            <h3>Round complete!</h3>
            <p>
              You identified {score} of {TOTAL_ROUNDS} correctly.
            </p>
            <button type="button" className="btn" onClick={start}>
              Play again
            </button>
          </div>
        )}

        {phase === 'playing' && (
          <>
            <div className="hud">
              Round {round}/{TOTAL_ROUNDS} &middot;{' '}
              <span className={`distance-label ${distance}`}>
                {distance === 'far' ? 'Far away — focus out' : 'Up close — focus in'}
              </span>
            </div>

            <div className={`letter-zone ${distance}`}>
              <span className="target-letter">{target}</span>
            </div>

            <div className="choice-row">
              {choices.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`choice-letter${
                    answered && c === target ? ' correct' : answered === c && c !== target ? ' wrong' : ''
                  }`}
                  onClick={() => choose(c)}
                  disabled={!!answered}
                >
                  {c}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </GameFrame>
  )
}
