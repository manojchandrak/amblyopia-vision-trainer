import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import './GameFrame.css'

interface Props {
  meta: { name: string; icon: string; skill: string; howTo: string }
  backTo: string
  backLabel: string
  score: number
  highScore: number
  scoreLabel?: string
  children: ReactNode
  needsGlasses?: boolean
}

export default function GameFrame({
  meta,
  backTo,
  backLabel,
  score,
  highScore,
  scoreLabel = 'Score',
  children,
  needsGlasses,
}: Props) {
  return (
    <section className="section">
      <div className="container">
        <Link to={backTo} className="back-link">
          ← {backLabel}
        </Link>

        <div className="game-head">
          <div>
            <span className="pill">{meta.skill}</span>
            <h1>
              <span aria-hidden="true">{meta.icon}</span> {meta.name}
            </h1>
          </div>
          <div className="score-box">
            <div>
              <span className="score-label">{scoreLabel}</span>
              <span className="score-value">{score}</span>
            </div>
            <div>
              <span className="score-label">Best</span>
              <span className="score-value">{highScore}</span>
            </div>
          </div>
        </div>

        {needsGlasses && (
          <div className="disclaimer glasses-note">
            <p>🕶️ Put on your red-blue glasses for this one — red lens over your left eye, blue over your right.</p>
          </div>
        )}

        <p className="how-to">{meta.howTo}</p>

        <div className="card game-stage">{children}</div>
      </div>
    </section>
  )
}
