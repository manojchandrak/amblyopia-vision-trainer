import { Link } from 'react-router-dom'
import { noGlassesGames } from '../data/games'
import { useHighScore } from '../hooks/useHighScore'
import './GameList.css'

function GameCard({ game }: { game: (typeof noGlassesGames)[number] }) {
  const { highScore } = useHighScore(game.id)
  return (
    <Link to={game.to} className="card game-card">
      <span className="game-card-icon" aria-hidden="true">
        {game.icon}
      </span>
      <span className="pill">{game.skill}</span>
      <h3>{game.name}</h3>
      <p>{game.description}</p>
      {highScore > 0 && <span className="best-badge">Best: {highScore}</span>}
    </Link>
  )
}

export default function Exercises() {
  return (
    <section className="section">
      <div className="container">
        <span className="pill">Exercises</span>
        <h1>No glasses needed</h1>
        <p>
          These four games train smooth pursuit, quick eye jumps (saccades), visual scanning, and
          focus shifting &mdash; core skills for both eyes, playable on any screen.
        </p>

        <div className="grid cols-2">
          {noGlassesGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </div>
    </section>
  )
}
