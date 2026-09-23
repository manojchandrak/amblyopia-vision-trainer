import { useEffect, useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { SettingsProvider } from './context/SettingsContext'
import Home from './views/Home'
import Exercises from './views/Exercises'
import AnaglyphGames from './views/AnaglyphGames'
import Guide from './views/Guide'
import Settings from './views/Settings'
import PursuitGame from './games/PursuitGame'
import SaccadeGame from './games/SaccadeGame'
import ScanGame from './games/ScanGame'
import FocusGame from './games/FocusGame'
import SpotShapeGame from './games/SpotShapeGame'
import AnaglyphMazeGame from './games/AnaglyphMazeGame'
import BugCatchGame from './games/BugCatchGame'
import FlappyGame from './games/FlappyGame'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/exercises', label: 'Exercises' },
  { to: '/anaglyph', label: 'Glasses Games' },
  { to: '/guide', label: 'Guide' },
  { to: '/settings', label: 'Settings' },
]

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  return (
    <SettingsProvider>
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand" onClick={() => setMenuOpen(false)}>
            <span className="brand-mark" aria-hidden="true">
              👁️
            </span>
            Amblyopia Vision Trainer
          </Link>
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
          <nav className={`site-nav${menuOpen ? ' open' : ''}`}>
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="site-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/exercises" element={<Exercises />} />
          <Route path="/exercises/pursuit" element={<PursuitGame />} />
          <Route path="/exercises/saccade" element={<SaccadeGame />} />
          <Route path="/exercises/scan" element={<ScanGame />} />
          <Route path="/exercises/focus" element={<FocusGame />} />
          <Route path="/anaglyph" element={<AnaglyphGames />} />
          <Route path="/anaglyph/spot-shape" element={<SpotShapeGame />} />
          <Route path="/anaglyph/maze" element={<AnaglyphMazeGame />} />
          <Route path="/anaglyph/bug-catch" element={<BugCatchGame />} />
          <Route path="/anaglyph/flappy" element={<FlappyGame />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <p>
            Amblyopia Vision Trainer is an educational practice tool, not a medical device or
            diagnostic service. It does not replace a treatment plan prescribed by an
            ophthalmologist, optometrist, or orthoptist. Always follow your eye care
            professional&rsquo;s guidance, especially for children.
          </p>
          <p className="footer-meta">
            Built by{' '}
            <a href="https://manojchandrak.github.io/portfolio" target="_blank" rel="noopener">
              Manoj Kompalli
            </a>
          </p>
        </div>
      </footer>
    </SettingsProvider>
  )
}

export default App
