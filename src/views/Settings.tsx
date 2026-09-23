import { useSettings } from '../context/SettingsContext'
import './Settings.css'

export default function Settings() {
  const { weakEye, setWeakEye, hasGlasses, setHasGlasses } = useSettings()

  return (
    <section className="section">
      <div className="container">
        <span className="pill">Settings</span>
        <h1>Personalize your training</h1>
        <p>
          These settings tune the glasses games so the right eye gets the right stimulus. They're
          saved on this device only.
        </p>

        <div className="card settings-card">
          <h3>Which is your weaker (amblyopic) eye?</h3>
          <p className="settings-desc">
            If you&rsquo;re not sure, check with your eye care professional &mdash; it&rsquo;s
            usually the eye with the lower prescription correction or the one that tends to drift.
          </p>
          <div className="choice-select">
            <button
              type="button"
              className={`choice-btn${weakEye === 'left' ? ' active' : ''}`}
              onClick={() => setWeakEye('left')}
            >
              Left eye
            </button>
            <button
              type="button"
              className={`choice-btn${weakEye === 'right' ? ' active' : ''}`}
              onClick={() => setWeakEye('right')}
            >
              Right eye
            </button>
          </div>
        </div>

        <div className="card settings-card">
          <h3>Do you have red-blue glasses?</h3>
          <p className="settings-desc">
            Cheap paper anaglyph glasses (red lens on the left, blue on the right) work fine. If
            you don&rsquo;t have a pair yet, stick to the no-glasses exercises for now.
          </p>
          <div className="choice-select">
            <button
              type="button"
              className={`choice-btn${hasGlasses ? ' active' : ''}`}
              onClick={() => setHasGlasses(true)}
            >
              Yes, I have glasses
            </button>
            <button
              type="button"
              className={`choice-btn${!hasGlasses ? ' active' : ''}`}
              onClick={() => setHasGlasses(false)}
            >
              Not yet
            </button>
          </div>
        </div>

        <div className="card settings-card">
          <h3>Test your glasses</h3>
          <p className="settings-desc">
            Without glasses you should see two overlapping stars, red and blue. Put your glasses
            on &mdash; each eye should now see only one, and your brain fuses them into a single
            star.
          </p>
          <div className="glasses-test">
            <span className="test-dot test-red">★</span>
            <span className="test-dot test-blue">★</span>
          </div>
        </div>
      </div>
    </section>
  )
}
