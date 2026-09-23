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
]
