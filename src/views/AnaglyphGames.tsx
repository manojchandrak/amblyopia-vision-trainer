import { Link } from 'react-router-dom'
import { anaglyphGames } from '../data/games'
import { useHighScore } from '../hooks/useHighScore'
import { useSettings } from '../context/SettingsContext'
import './GameList.css'

function GameCard({ game }: { game: (typeof anaglyphGames)[number] }) {
  const { highScore } = useHighScore(game.id)
  return (
    <Link to={game.to} className="card game-card">
      <span className="game-card-icon" aria-hidden="true">
        {game.icon}
      </span>
      <span className="pill glasses">{game.skill}</span>
      <h3>{game.name}</h3>
      <p>{game.description}</p>
      {highScore > 0 && <span className="best-badge">Best: {highScore}</span>}
    </Link>
  )
}

export default function AnaglyphGames() {
  const { weakEye } = useSettings()

  return (
    <section className="section">
      <div className="container">
        <span className="pill glasses">Glasses Games</span>
        <h1>Put on your red-blue glasses</h1>
        <p>
          These games use color-separated (anaglyph) images so each eye sees something slightly
          different through red-blue glasses &mdash; the same principle behind modern dichoptic
          amblyopia therapy. Cheap paper red-blue glasses work fine.
        </p>

        <div className="disclaimer" style={{ marginBottom: 24 }}>
          <p>
            Your settings say your <strong>{weakEye}</strong> eye is the weaker one. With standard
            glasses (red lens on the left, blue on the right), these games are tuned for that.
            Change it any time in{' '}
            <Link to="/settings" style={{ fontWeight: 700 }}>
              Settings
            </Link>
            .
          </p>
        </div>

        <div className="grid cols-2">
          {anaglyphGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </div>
    </section>
  )
}
