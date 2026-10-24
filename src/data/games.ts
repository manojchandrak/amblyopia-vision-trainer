export interface GameMeta {
  id: string
  to: string
  name: string
  icon: string
  skill: string
  description: string
  howTo: string
}

export const noGlassesGames: GameMeta[] = [
  {
    id: 'pursuit',
    to: '/exercises/pursuit',
    name: 'Follow the Firefly',
    icon: '🪲',
    skill: 'Smooth pursuit',
    description:
      'A firefly drifts around the screen. Track it with your eyes and click the moment it flashes gold.',
    howTo:
      'Keep your head still and follow the firefly with just your eyes, not your whole head. Click as soon as it flashes gold.',
  },
  {
    id: 'saccade',
    to: '/exercises/saccade',
    name: 'Number Jump',
    icon: '🔢',
    skill: 'Saccades (quick eye jumps)',
    description:
      'A number flashes in the center, then two targets appear on either side. Jump your eyes straight to the matching one.',
    howTo:
      'Look at the center dot between rounds. When the number appears and the targets pop up, jump your eyes directly to the target showing the same number, then click it.',
  },
  {
    id: 'scan',
    to: '/exercises/scan',
    name: 'Symbol Search',
    icon: '🔍',
    skill: 'Visual scanning',
    description: 'Find and click every target symbol hidden among the look-alikes before time runs out.',
    howTo:
      'Scan the grid systematically — left to right, row by row — rather than jumping around randomly. Click every matching symbol you find.',
  },
  {
    id: 'focus',
    to: '/exercises/focus',
    name: 'Near & Far Focus',
    icon: '🔤',
    skill: 'Accommodation (focus shifting)',
    description:
      'A letter appears small and far away, then large and close up. Read each one out loud or type it before it switches.',
    howTo:
      'Hold your device at a comfortable distance. When the letter shrinks (far), focus out; when it grows (near), focus in. Try to identify each letter before it changes.',
  },
]

export const anaglyphGames: GameMeta[] = [
  {
    id: 'spot-shape',
    to: '/anaglyph/spot-shape',
    name: 'Spot the Star',
    icon: '⭐',
    skill: 'Weak-eye stimulation',
    description:
      'A star is hidden in a field of colored dots, drawn only in your amblyopic eye’s color channel. Put your glasses on and tap where you see it.',
    howTo:
      'Put on your red-blue glasses. The star is only visible to your weaker eye. Tap the screen where you see it appear.',
  },
  {
    id: 'maze',
    to: '/anaglyph/maze',
    name: 'Anaglyph Maze',
    icon: '🧩',
    skill: 'Binocular fusion',
    description:
      'The maze walls and your ball are drawn in opposite colors, so both eyes have to work together to see the whole picture and steer through.',
    howTo:
      'Put on your glasses. Use the arrow keys or on-screen buttons to steer the ball from the start to the goal without touching the walls.',
  },
  {
    id: 'bug-catch',
    to: '/anaglyph/bug-catch',
    name: 'Bug Catch',
    icon: '🐞',
    skill: 'Dichoptic contrast training',
    description:
      'Bugs pop up in either eye’s color. Catch them all — your weaker eye’s bugs are drawn bolder so it gets an equal chance to compete.',
    howTo:
      'Put on your glasses and click each bug as soon as it appears, before it scurries off.',
  },
  {
    id: 'flappy',
    to: '/anaglyph/flappy',
    name: 'Flappy Wing',
    icon: '🐦',
    skill: 'Binocular fusion & tracking',
    description:
      'Your bird is drawn in your weaker eye’s color and the pipes in your stronger eye’s color, so you need both eyes together to see the whole flight path.',
    howTo:
      'Put on your glasses. Click, tap, or press Space to flap upward and steer through the gaps in the pipes.',
  },
  {
    id: 'space-dodger',
    to: '/anaglyph/space-dodger',
    name: 'Space Dodger',
    icon: '🚀',
    skill: 'Binocular fusion & tracking',
    description:
      'Your ship is drawn only in your weaker eye’s color and the asteroids only in your stronger eye’s color, so you need both eyes to steer through the field.',
    howTo:
      'Put on your glasses. Move the mouse, drag a finger, or use the arrow keys to dodge the falling asteroids for as long as you can.',
  },
  {
    id: 'tetris',
    to: '/anaglyph/tetris',
    name: 'Dichoptic Blocks',
    icon: '🧱',
    skill: 'Binocular fusion',
    description:
      'A falling-blocks game where the falling piece is seen by your weaker eye and the stack by your stronger eye, so both must cooperate to place each piece.',
    howTo:
      'Put on your glasses. Use the arrow keys (or the buttons) to move and rotate the piece, and Space to drop it. Fill whole rows to clear them.',
  },
  {
    id: 'breakout',
    to: '/anaglyph/breakout',
    name: 'Brick Breaker',
    icon: '🏓',
    skill: 'Binocular fusion & hand-eye coordination',
    description:
      'The ball is drawn only for your weaker eye while the paddle and bricks are drawn only for your stronger eye, so you have to combine both views to keep the ball in play.',
    howTo:
      'Put on your glasses. Move the mouse or arrow keys to steer the paddle, and click or press Space to launch the ball. Clear all the bricks to reach the next level.',
  },
  {
    id: 'sudoku',
    to: '/anaglyph/sudoku',
    name: 'Dichoptic Sudoku',
    icon: '🔢',
    skill: 'Binocular reading & attention',
    description:
      'A classic Sudoku where each clue is drawn for only one eye, so you need both eyes together to read the whole puzzle.',
    howTo:
      'Put on your glasses. Pick a cell and type or tap a number from 1 to 9. Each row, column and 3×3 box must contain every digit once.',
  },
  {
    id: 'word-search',
    to: '/anaglyph/word-search',
    name: 'Word Search',
    icon: '🔤',
    skill: 'Binocular reading & visual scanning',
    description:
      'Find hidden words in a grid where every letter is drawn for only one eye, so both eyes have to work together to read the lines.',
    howTo:
      'Put on your glasses. Click the first letter of a word, then its last letter. Words can run in any direction, including backwards and diagonally.',
  },
  {
    id: 'word-scramble',
    to: '/anaglyph/word-scramble',
    name: 'Word Scramble',
    icon: '🧠',
    skill: 'Binocular reading',
    description:
      'Unscramble words against the clock. The scrambled letters alternate between your two eyes, and your answer is drawn for your weaker eye.',
    howTo:
      'Put on your glasses. Click the letters (or type them) in the right order to spell the word. Correct answers add time to the clock.',
  },
]
