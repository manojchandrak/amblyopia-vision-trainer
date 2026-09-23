import './Guide.css'

const faqs = [
  {
    q: 'What is amblyopia?',
    a: 'Amblyopia, commonly called "lazy eye," happens when the brain favors one eye over the other during early visual development, so the weaker eye never learns to see as sharply. It’s usually caused by a misaligned eye (strabismus), a big difference in prescription between eyes, or something blocking clear vision in one eye early in childhood.',
  },
  {
    q: 'How is it normally treated?',
    a: 'Common treatments include corrective glasses, patching the stronger eye for part of the day to force the weaker eye to work, atropine eye drops to blur the stronger eye, and in some cases surgery to realign the eyes. Treatment is prescribed and monitored by an eye care professional and works best when started early in childhood, though some improvement is possible at older ages too.',
  },
  {
    q: 'What is dichoptic training, and why glasses?',
    a: 'Traditional patching blocks one eye completely. Dichoptic training instead shows each eye a different image at the same time — often using red/blue (anaglyph) glasses, similar to old 3D movies — so both eyes stay open and working while the weaker eye still gets extra stimulation. Several clinical research programs and games have explored this approach as a complement to patching.',
  },
  {
    q: 'Where do I get red-blue glasses?',
    a: 'Simple paper or plastic red-blue (or red-cyan) anaglyph glasses are inexpensive and widely sold online and at many optical shops as "3D glasses." Any pair with a red lens and a blue (or cyan) lens will work for the games here.',
  },
  {
    q: 'Is this a replacement for my treatment plan?',
    a: 'No. This app is an educational practice tool built around common vision-therapy concepts (pursuit, saccades, scanning, accommodation, and dichoptic stimulation). It is not a validated medical device and hasn’t been clinically tested. Always follow the treatment your eye care professional prescribes, and check with them before adding new exercises, especially for children.',
  },
]

export default function Guide() {
  return (
    <section className="section">
      <div className="container">
        <span className="pill">Guide</span>
        <h1>Understanding amblyopia &amp; vision therapy</h1>
        <p>
          A quick primer on what these exercises are training and why &mdash; plus where the
          concepts come from.
        </p>

        <div className="disclaimer" style={{ margin: '20px 0 32px' }}>
          <p>
            This page is educational only and not medical advice. Please talk to an
            ophthalmologist, optometrist, or orthoptist about diagnosis and treatment.
          </p>
        </div>

        <div className="faq-list">
          {faqs.map((f) => (
            <div key={f.q} className="card faq-item">
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </div>

        <h2 style={{ marginTop: 40 }}>What each exercise trains</h2>
        <div className="grid cols-2">
          <div className="card">
            <h3>🪲 Smooth pursuit</h3>
            <p>The ability to smoothly track a moving object with your eyes, without head movement.</p>
          </div>
          <div className="card">
            <h3>🔢 Saccades</h3>
            <p>Quick, accurate eye jumps between two points &mdash; used constantly in reading.</p>
          </div>
          <div className="card">
            <h3>🔍 Visual scanning</h3>
            <p>Systematically searching a scene for a target, important for reading and daily tasks.</p>
          </div>
          <div className="card">
            <h3>🔤 Accommodation</h3>
            <p>Shifting focus quickly and accurately between near and far distances.</p>
          </div>
          <div className="card">
            <h3>⭐ Weak-eye stimulation</h3>
            <p>Presenting a stimulus that only the amblyopic eye can see, to encourage it to engage.</p>
          </div>
          <div className="card">
            <h3>🧩 Binocular fusion</h3>
            <p>Combining slightly different images from each eye into one coherent picture.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
