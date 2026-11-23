// An original 1920s-style swing tune, written as data so it can be tested.
// 32-bar AABA form in F, played forever with a little improvisation each time.

export type Voice = "bass" | "piano" | "horn" | "brush";

export interface NoteEvent {
  voice: Voice;
  // Position in beats from the start of the bar (swing already applied)
  beat: number;
  // Length in beats
  length: number;
  // MIDI note numbers (several for a chord); empty for the brush
  notes: number[];
  velocity: number;
}

interface Chord {
  name: string;
  root: number; // MIDI note of the root, bass register
  tones: number[]; // intervals from the root: third, fifth, seventh/sixth, ninth
}

const chord = (name: string, root: number, tones: number[]): Chord => ({ name, root, tones });

// Roots sit around F2 (41)
const F6 = chord("F6", 41, [4, 7, 9, 14]);
const D7 = chord("D7", 38, [4, 7, 10, 14]);
const Gm7 = chord("Gm7", 43, [3, 7, 10, 14]);
const C7 = chord("C7", 36, [4, 7, 10, 14]);
const Am7 = chord("Am7", 45, [3, 7, 10, 14]);
const Bb6 = chord("Bb6", 46, [4, 7, 9, 14]);
const Bdim7 = chord("Bdim7", 47, [3, 6, 9, 12]);
const G7 = chord("G7", 43, [4, 7, 10, 14]);

const sectionA: Chord[] = [F6, D7, Gm7, C7, Am7, D7, Gm7, C7];
const sectionB: Chord[] = [Bb6, Bdim7, F6, D7, G7, G7, Gm7, C7];
export const form: Chord[] = [...sectionA, ...sectionA, ...sectionB, ...sectionA];

export const swing = (beat: number): number => {
  // Off-beat eighths land two thirds of the way through the beat
  const whole = Math.floor(beat);
  return beat - whole === 0.5 ? whole + 2 / 3 : beat;
};

// Small deterministic random generator, so a given chorus always sounds the same
export const makeRandom = (seed: number) => {
  let x = (seed % 2147483646) + 1;
  return () => {
    x = (x * 16807) % 2147483647;
    return (x - 1) / 2147483646;
  };
};

const pick = <T,>(rand: () => number, items: T[]): T => items[Math.floor(rand() * items.length)];

export const chordAt = (bar: number): Chord => form[((bar % form.length) + form.length) % form.length];

// One bar of music for every instrument
export const buildBar = (bar: number, seed = 1): NoteEvent[] => {
  const rand = makeRandom(seed * 1009 + bar * 7919);
  const current = chordAt(bar);
  const next = chordAt(bar + 1);
  const events: NoteEvent[] = [];

  // Walking bass: root, chord tone, chord tone, then a half-step into the next chord
  const third = current.root + current.tones[0];
  const fifth = current.root + current.tones[1];
  const approach = next.root + (rand() < 0.5 ? -1 : 1);
  const line = [current.root, rand() < 0.5 ? third : fifth, rand() < 0.5 ? fifth : current.root + 12, approach];
  line.forEach((note, beat) => events.push({ voice: "bass", beat, length: 0.95, notes: [note], velocity: beat === 0 ? 0.9 : 0.75 }));

  // Piano: Charleston rhythm (beat one, then the "and" of two), voiced in the middle register
  const voicing = current.tones.map((t) => current.root + 24 + t);
  events.push({ voice: "piano", beat: 0, length: 1.4, notes: voicing, velocity: 0.55 });
  events.push({ voice: "piano", beat: swing(1.5), length: 0.6, notes: voicing, velocity: 0.45 });
  if (rand() < 0.35) events.push({ voice: "piano", beat: swing(3.5), length: 0.4, notes: voicing, velocity: 0.35 });

  // Brushes: a swish on every beat, a lighter flick on the swung off-beats
  for (let beat = 0; beat < 4; beat++) {
    events.push({ voice: "brush", beat, length: 0.5, notes: [], velocity: beat % 2 === 1 ? 0.7 : 0.45 });
    if (rand() < 0.6) events.push({ voice: "brush", beat: swing(beat + 0.5), length: 0.2, notes: [], velocity: 0.25 });
  }

  // Muted horn: short phrases from chord tones, resting about half the time
  const phrasing = bar % 4 < 2 || rand() < 0.3;
  if (phrasing) {
    const pool = [...current.tones, 12].map((t) => current.root + 36 + t);
    let beat = rand() < 0.5 ? 0 : 0.5;
    while (beat < 3.5) {
      const length = pick(rand, [0.5, 0.5, 1, 1.5]);
      if (rand() < 0.8) {
        events.push({ voice: "horn", beat: swing(beat), length: length * 0.9, notes: [pick(rand, pool)], velocity: 0.5 + rand() * 0.25 });
      }
      beat += length;
    }
  }

  return events;
};
