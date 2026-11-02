# Amblyopia Vision Trainer

Game-based amblyopia (lazy eye) vision therapy exercises, playable with or without a pair of
red-blue anaglyph glasses.

Live at: https://manojchandrak.github.io/amblyopia-vision-trainer/

## Pages

- **Exercises (no glasses needed)** — four games built with plain React state/DOM, no canvas:
  - **Follow the Firefly** — smooth pursuit
  - **Number Jump** — saccades (quick eye jumps)
  - **Symbol Search** — visual scanning
  - **Near & Far Focus** — accommodation (focus shifting)
- **Glasses Games** — dichoptic games using red/blue channel-separated (anaglyph) rendering, so
  each eye sees something different through red-blue glasses:
  - **Spot the Star** — a shape hidden only in the amblyopic eye's color channel
  - **Anaglyph Maze** — walls and ball drawn in opposite colors; requires binocular fusion
  - **Bug Catch** — dichoptic contrast training, weak-eye stimuli drawn bolder
  - **Flappy Wing** — a Flappy-Bird-style game where the bird and pipes are in opposite colors
  - **Space Dodger** — steer a ship (weak eye) through asteroids (strong eye)
  - **Dichoptic Blocks** — falling-blocks game: the falling piece is weak-eye, the stack is strong-eye
  - **Brick Breaker** — ball in the weak eye's color, paddle and bricks in the strong eye's
  - **Dichoptic Sudoku** — each clue is drawn for one eye only; your answers use the weak eye's color
  - **Word Search** — every grid letter is drawn for one eye only
  - **Word Scramble** — timed unscrambling with letters alternating between the eyes
  - **Dichoptic 2048** — each tile's frame is one eye's colour and its number the other's
  - **Word Guess** — five-letter guessing; letters alternate eyes, hints shown by border style
  - **Memory Match** — every shape appears once in each eye's colour
  - **Pixel Runner** — side-scrolling platformer: runner for the weak eye, world for the strong eye
- **Guide** — what amblyopia is, how dichoptic training works, and where to get red-blue glasses
- **Settings** — pick your weaker eye and whether you have glasses; saved to this device via
  localStorage

## Anaglyph rendering approach

Games in "Glasses Games" render two sets of visuals in pure red (`--anaglyph-red`) and pure blue
(`--anaglyph-blue`) on a black background with `mix-blend-mode: screen`, following the standard
red-left/blue-right glasses convention. Which role (bird/ball/target vs. walls/pipes/noise) uses
which color is driven by the user's selected weak eye in Settings. Colored game elements use SVG
shapes or plain CSS colors rather than emoji, since emoji glyphs ignore the CSS `color` property
and would break the channel separation.

## Stack

React 19 + TypeScript + Vite, react-router-dom (hash history, for static GitHub Pages hosting).
Games are built with React state/hooks driving positioned DOM/SVG elements (via
`requestAnimationFrame` for continuous motion) rather than raw `<canvas>` drawing.

## Install on a phone (PWA)

Open the live site in Chrome (Android) or Safari (iPhone) and choose **Add to Home Screen**. It then runs full screen, works offline after the first visit, and keeps the screen awake during games.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Deploys automatically to GitHub Pages via GitHub Actions on push to `main`.
