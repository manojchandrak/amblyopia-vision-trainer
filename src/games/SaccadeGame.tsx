import { useCallback, useEffect, useRef, useState } from 'react'
import GameFrame from '../components/GameFrame'
import { useHighScore } from '../hooks/useHighScore'
import { noGlassesGames } from '../data/games'
import './SaccadeGame.css'

const meta = noGlassesGames.find((g) => g.id === 'saccade')!
const TOTAL_ROUNDS = 15

type RoundPhase = 'flash' | 'choices' | 'feedback'

function randomDigit(exclude?: number) {
  let n = Math.floor(Math.random() * 9) + 1
  while (n === exclude) n = Math.floor(Math.random() * 9) + 1
  return n
}

export default function SaccadeGame() {
  const { highScore, reportScore } = useHighScore('saccade')
  const [phase, setPhase] = useState<'idle' | 'playing' | 'done'>('idle')
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [roundPhase, setRoundPhase] = useState<RoundPhase>('flash')
  const [target, setTarget] = useState(1)
  const [leftNum, setLeftNum] = useState(1)
  const [rightNum, setRightNum] = useState(2)
  const [correctSide, setCorrectSide] = useState<'left' | 'right'>('left')
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setupRound = useCallback(() => {
    const t = randomDigit()
    const side: 'left' | 'right' = Math.random() < 0.5 ? 'left' : 'right'
    const other = randomDigit(t)
    setTarget(t)
    setCorrectSide(side)
    if (side === 'left') {
      setLeftNum(t)
      setRightNum(other)
    } else {
      setLeftNum(other)
      setRightNum(t)
    }
    setFeedback(null)
    setRoundPhase('flash')
  }, [])

  const start = useCallback(() => {
    setScore(0)
    setRound(1)
    setPhase('playing')
    setupRound()
  }, [setupRound])

  useEffect(() => {
    if (phase !== 'playing') return
    if (timerRef.current) clearTimeout(timerRef.current)

    if (roundPhase === 'flash') {
      timerRef.current = setTimeout(() => setRoundPhase('choices'), 700)
    } else if (roundPhase === 'choices') {
      timerRef.current = setTimeout(() => {
        setFeedback('wrong')
        setRoundPhase('feedback')
      }, 2200)
    } else if (roundPhase === 'feedback') {
      timerRef.current = setTimeout(() => {
        if (round >= TOTAL_ROUNDS) {
          setPhase('done')
        } else {
          setRound((r) => r + 1)
          setupRound()
        }
      }, 500)
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [phase, roundPhase, round, setupRound])

  useEffect(() => {
    if (phase === 'done') reportScore(score)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  function choose(side: 'left' | 'right') {
    if (roundPhase !== 'choices') return
    if (timerRef.current) clearTimeout(timerRef.current)
    const isCorrect = side === correctSide
    if (isCorrect) setScore((s) => s + 1)
    setFeedback(isCorrect ? 'correct' : 'wrong')
    setRoundPhase('feedback')
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
      <div className="saccade-stage">
        {phase === 'idle' && (
          <div className="stage-overlay">
            <p>Watch the center number, then jump your eyes to the matching target.</p>
            <button type="button" className="btn" onClick={start}>
              Start ({TOTAL_ROUNDS} rounds)
            </button>
          </div>
        )}

        {phase === 'done' && (
          <div className="stage-overlay">
            <h3>Round complete!</h3>
            <p>
              You matched {score} of {TOTAL_ROUNDS} correctly.
            </p>
            <button type="button" className="btn" onClick={start}>
              Play again
            </button>
          </div>
        )}

        {phase === 'playing' && (
          <>
            <div className="hud">
              Round {round}/{TOTAL_ROUNDS}
            </div>

            <div className="center-dot">{roundPhase === 'flash' ? target : '•'}</div>

            {roundPhase !== 'flash' && (
              <>
                <button
                  type="button"
                  className={`side-target left${feedback && correctSide === 'left' ? ` ${feedback}` : ''}`}
                  onClick={() => choose('left')}
                  disabled={roundPhase === 'feedback'}
                >
                  {leftNum}
                </button>
                <button
                  type="button"
                  className={`side-target right${feedback && correctSide === 'right' ? ` ${feedback}` : ''}`}
                  onClick={() => choose('right')}
                  disabled={roundPhase === 'feedback'}
                >
                  {rightNum}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </GameFrame>
  )
}
