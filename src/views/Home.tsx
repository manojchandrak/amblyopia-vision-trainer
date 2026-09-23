import { Link } from 'react-router-dom'
import './Home.css'

const features = [
  {
    to: '/exercises',
    icon: '🎮',
    title: 'Exercises (No Glasses Needed)',
    desc: 'Pursuit, saccade, scanning, and focus games that work on any screen, no equipment required.',
  },
  {
    to: '/anaglyph',
    icon: '🕶️',
    title: 'Glasses Games',
    desc: 'Put on a pair of cheap red-blue glasses to unlock dichoptic games that engage your weaker eye directly.',
  },
  {
    to: '/guide',
    icon: '📖',
    title: 'Vision Therapy Guide',
    desc: 'What amblyopia is, how dichoptic training works, and how to get red-blue glasses.',
  },
]

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <span className="pill glasses">Play your way to stronger vision</span>
          <h1>Amblyopia Vision Trainer</h1>
          <p className="hero-sub">
            Fun, game-based exercises for lazy eye (amblyopia) &mdash; some playable on any
            screen, others using a simple pair of red-blue glasses to give your weaker eye its
            own workout.
          </p>
          <div className="hero-actions">
            <Link to="/exercises" className="btn">
              Start an exercise
            </Link>
            <Link to="/anaglyph" className="btn secondary">
              Glasses games
            </Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container">
          <div className="disclaimer">
            <p>
              <strong>This is an educational practice tool, not a medical device.</strong> It
              doesn&rsquo;t diagnose or treat any condition and isn&rsquo;t a substitute for care
              from an ophthalmologist, optometrist, or orthoptist &mdash; especially for children,
              who should always be supervised and follow their prescribed treatment plan.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Explore</h2>
          <div className="grid cols-3">
            {features.map((f) => (
              <Link key={f.to} to={f.to} className="feature-card card">
                <span className="feature-icon" aria-hidden="true">
                  {f.icon}
                </span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
