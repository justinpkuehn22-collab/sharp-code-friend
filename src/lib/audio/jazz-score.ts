// The house band's songbook: original 1920s-style tunes written as data, so they
// can be tested. Every chorus improvises a little differently.

export type Voice = "bass" | "piano" | "horn" | "brush";
export type Style = "swing" | "blues" | "ragtime" | "ballad";

export interface NoteEvent {
  voice: Voice;
  // Position in beats from the start of the bar (swing already applied)
  beat: number;
  // Length in beats
  length: number;
  // MIDI note numbers (several for a chord); empty for the brush
  notes: number[];
  velocity: number;
  // Bend up into the note from below, in semitones (blue notes)
  slide?: number;
}

export interface Chord {
  name: string;
  root: number; // MIDI note of the root, bass register
  tones: number[]; // intervals from the root: third, fifth, seventh/sixth, ninth
}

export interface Tune {
  id: string;
  title: string;
  style: Style;
  bpm: number;
  // MIDI note of the key's tonic in the bass register (for blues licks)
  tonic: number;
  form: Chord[];
  // How many times through the form before the next record
  choruses: number;
}

const chord = (name: string, root: number, tones: number[]): Chord => ({ name, root, tones });
const maj6 = [4, 7, 9, 14];
const maj7 = [4, 7, 11, 14];
const dom7 = [4, 7, 10, 14];
const min7 = [3, 7, 10, 14];
const dim7 = [3, 6, 9, 12];
const min6 = [3, 7, 9, 14];

// 1. An easy foxtrot in F (32-bar AABA)
const swingA = [chord("F6", 41, maj6), chord("D7", 38, dom7), chord("Gm7", 43, min7), chord("C7", 36, dom7), chord("Am7", 45, min7), chord("D7", 38, dom7), chord("Gm7", 43, min7), chord("C7", 36, dom7)];
const swingB = [chord("Bb6", 46, maj6), chord("Bdim7", 47, dim7), chord("F6", 41, maj6), chord("D7", 38, dom7), chord("G7", 43, dom7), chord("G7", 43, dom7), chord("Gm7", 43, min7), chord("C7", 36, dom7)];

// 2. Slow 12-bar blues in Bb
const bb7 = chord("Bb7", 46, dom7);
const eb7 = chord("Eb7", 39, dom7);
const f7 = chord("F7", 41, dom7);
const slowBlues = [bb7, eb7, bb7, bb7, eb7, eb7, bb7, chord("G7", 43, dom7), chord("Cm7", 36, min7), f7, bb7, f7];

// 3. A faster shuffle blues in F
const fBlues7 = chord("F7", 41, dom7);
const bbBlues7 = chord("Bb7", 46, dom7);
const cBlues7 = chord("C7", 36, dom7);
const shuffleBlues = [fBlues7, bbBlues7, fBlues7, fBlues7, bbBlues7, bbBlues7, fBlues7, chord("D7", 38, dom7), chord("Gm7", 43, min7), cBlues7, fBlues7, cBlues7];

// 4. Ragtime in C (16 bars)
const c = chord("C", 36, [4, 7, 12, 16]);
const a7 = chord("A7", 45, dom7);
const d7 = chord("D7", 38, dom7);
const g7 = chord("G7", 43, dom7);
const rag = [c, c, a7, a7, d7, g7, c, g7, c, c, a7, a7, d7, g7, c, c];

// 5. A slow ballad in Eb (16 bars)
const ballad = [
  chord("Ebmaj7", 39, maj7), chord("Cm7", 36, min7), chord("Fm7", 41, min7), chord("Bb7", 46, dom7),
  chord("Gm7", 43, min7), chord("C7", 36, dom7), chord("Fm7", 41, min7), chord("Bb7", 46, dom7),
  chord("Abmaj7", 44, maj7), chord("Abm6", 44, min6), chord("Gm7", 43, min7), chord("C7", 36, dom7),
  chord("Fm7", 41, min7), chord("Bb7", 46, dom7), chord("Ebmaj7", 39, maj7), chord("Bb7", 46, dom7),
];

export const songbook: Tune[] = [
  { id: "midnight", title: "Midnight at the Poetry Room", style: "swing", bpm: 104, tonic: 41, form: [...swingA, ...swingA, ...swingB, ...swingA], choruses: 4 },
  { id: "smoke-gin", title: "Smoke & Gin Blues", style: "blues", bpm: 70, tonic: 46, form: slowBlues, choruses: 6 },
  { id: "ragtime-rain", title: "Ragtime Rain", style: "ragtime", bpm: 112, tonic: 36, form: rag, choruses: 7 },
  { id: "last-call", title: "Last Call Ballad", style: "ballad", bpm: 62, tonic: 39, form: ballad, choruses: 4 },
  { id: "bathtub", title: "Bathtub Gin Shuffle", style: "blues", bpm: 118, tonic: 41, form: shuffleBlues, choruses: 10 },
];

// Total playing time of a tune in seconds
export const tuneSeconds = (tune: Tune): number => (tune.form.length * tune.choruses * 4 * 60) / tune.bpm;

export const swing = (beat: number, ratio = 2 / 3): number => {
  // Off-beat eighths land late in the beat
  const whole = Math.floor(beat);
  return beat - whole === 0.5 ? whole + ratio : beat;
};

// Small deterministic random generator, so a given chorus always sounds the same
export const makeRandom = (seed: number) => {
  let x = (Math.abs(Math.floor(seed)) % 2147483646) + 1;
  return () => {
    x = (x * 16807) % 2147483647;
    return (x - 1) / 2147483646;
  };
};

const pick = <T,>(rand: () => number, items: T[]): T => items[Math.floor(rand() * items.length)];

export const chordAt = (tune: Tune, bar: number): Chord => {
  const n = tune.form.length;
  return tune.form[((bar % n) + n) % n];
};

const voicing = (c: Chord, lift = 24): number[] => c.tones.map((t) => c.root + lift + t);

const brushes = (events: NoteEvent[], rand: () => number, density: number, ratio: number) => {
  for (let beat = 0; beat < 4; beat++) {
    events.push({ voice: "brush", beat, length: 0.5, notes: [], velocity: beat % 2 === 1 ? 0.7 : 0.45 });
    if (rand() < density) events.push({ voice: "brush", beat: swing(beat + 0.5, ratio), length: 0.2, notes: [], velocity: 0.25 });
  }
};

// Melody from chord tones in the horn's register, resting between phrases
const chordToneHorn = (events: NoteEvent[], rand: () => number, c: Chord, playing: boolean, ratio: number, lengths: number[]) => {
  if (!playing) return;
  const pool = [...c.tones, 12].map((t) => c.root + 36 + t);
  let beat = rand() < 0.5 ? 0 : 0.5;
  while (beat < 3.5) {
    const length = pick(rand, lengths);
    if (rand() < 0.8) events.push({ voice: "horn", beat: swing(beat, ratio), length: length * 0.9, notes: [pick(rand, pool)], velocity: 0.5 + rand() * 0.25 });
    beat += length;
  }
};

// Blues licks: the blues scale over the key, with bent blue notes
const bluesHorn = (events: NoteEvent[], rand: () => number, tune: Tune, bar: number, ratio: number) => {
  // Call and response: play two bars, leave room in the next two
  const inPhrase = bar % 4 < 2 || rand() < 0.2;
  if (!inPhrase) return;
  const scale = [0, 3, 5, 6, 7, 10, 12, 15];
  const base = tune.tonic + 36;
  let beat = bar % 4 === 0 ? 0.5 : 0;
  let idx = Math.floor(rand() * 5) + 1;
  while (beat < 3.75) {
    const length = pick(rand, [0.5, 0.5, 1, 1.5]);
    idx = Math.max(0, Math.min(scale.length - 1, idx + pick(rand, [-2, -1, -1, 1, 1, 2])));
    const interval = scale[idx];
    const blue = interval === 3 || interval === 6 || interval === 10;
    if (rand() < 0.85) {
      events.push({
        voice: "horn",
        beat: swing(beat, ratio),
        length: length * 0.92,
        notes: [base + interval],
        velocity: 0.55 + rand() * 0.25,
        slide: blue && rand() < 0.7 ? 1 : undefined,
      });
    }
    beat += length;
  }
};

const buildSwing = (tune: Tune, bar: number, rand: () => number): NoteEvent[] => {
  const events: NoteEvent[] = [];
  const current = chordAt(tune, bar);
  const next = chordAt(tune, bar + 1);
  const third = current.root + current.tones[0];
  const fifth = current.root + current.tones[1];
  const approach = next.root + (rand() < 0.5 ? -1 : 1);
  [current.root, rand() < 0.5 ? third : fifth, rand() < 0.5 ? fifth : current.root + 12, approach].forEach((note, beat) =>
    events.push({ voice: "bass", beat, length: 0.95, notes: [note], velocity: beat === 0 ? 0.9 : 0.75 }),
  );
  const chordNotes = voicing(current);
  events.push({ voice: "piano", beat: 0, length: 1.4, notes: chordNotes, velocity: 0.55 });
  events.push({ voice: "piano", beat: swing(1.5), length: 0.6, notes: chordNotes, velocity: 0.45 });
  if (rand() < 0.35) events.push({ voice: "piano", beat: swing(3.5), length: 0.4, notes: chordNotes, velocity: 0.35 });
  brushes(events, rand, 0.6, 2 / 3);
  chordToneHorn(events, rand, current, bar % 4 < 2 || rand() < 0.3, 2 / 3, [0.5, 0.5, 1, 1.5]);
  return events;
};

const buildBlues = (tune: Tune, bar: number, rand: () => number): NoteEvent[] => {
  const events: NoteEvent[] = [];
  const current = chordAt(tune, bar);
  const ratio = 0.7;
  // Boogie bass: root, third, fifth, sixth, flat seven, sixth, fifth, third on swung eighths
  const steps = [0, 4, 7, 9, 10, 9, 7, 4];
  steps.forEach((step, i) =>
    events.push({ voice: "bass", beat: swing(i / 2, ratio), length: 0.45, notes: [current.root + step], velocity: i % 2 === 0 ? 0.85 : 0.6 }),
  );
  // Piano shuffle stabs on two and four, with a pickup now and then
  const chordNotes = voicing(current);
  events.push({ voice: "piano", beat: 1, length: 0.5, notes: chordNotes, velocity: 0.5 });
  events.push({ voice: "piano", beat: 3, length: 0.5, notes: chordNotes, velocity: 0.5 });
  if (rand() < 0.4) events.push({ voice: "piano", beat: swing(2.5, ratio), length: 0.3, notes: chordNotes, velocity: 0.35 });
  brushes(events, rand, 0.85, ratio);
  bluesHorn(events, rand, tune, bar, ratio);
  return events;
};

const buildRagtime = (tune: Tune, bar: number, rand: () => number): NoteEvent[] => {
  const events: NoteEvent[] = [];
  const current = chordAt(tune, bar);
  // Stride left hand: low bass on one and three, chord on two and four
  const low = current.root - (current.root > 40 ? 12 : 0);
  const chordNotes = voicing(current, 24);
  events.push({ voice: "bass", beat: 0, length: 0.9, notes: [low], velocity: 0.9 });
  events.push({ voice: "piano", beat: 1, length: 0.6, notes: chordNotes, velocity: 0.5 });
  events.push({ voice: "bass", beat: 2, length: 0.9, notes: [low + current.tones[1]], velocity: 0.8 });
  events.push({ voice: "piano", beat: 3, length: 0.6, notes: chordNotes, velocity: 0.5 });
  // Syncopated right hand: straight eighths with the classic ragtime tie across the beat
  const pool = [...current.tones, 12, 16].map((t) => current.root + 36 + t);
  const rhythm = pick(rand, [
    [0, 0.5, 1.5, 2, 2.5, 3.5],
    [0, 1, 1.5, 2.5, 3],
    [0.5, 1, 2, 2.5, 3, 3.5],
  ]);
  for (const beat of rhythm) events.push({ voice: "piano", beat, length: 0.4, notes: [pick(rand, pool)], velocity: 0.45 + rand() * 0.15 });
  brushes(events, rand, 0.3, 0.5);
  return events;
};

const buildBallad = (tune: Tune, bar: number, rand: () => number): NoteEvent[] => {
  const events: NoteEvent[] = [];
  const current = chordAt(tune, bar);
  events.push({ voice: "bass", beat: 0, length: 1.9, notes: [current.root], velocity: 0.8 });
  events.push({ voice: "bass", beat: 2, length: 1.9, notes: [current.root + current.tones[1]], velocity: 0.65 });
  // Rolling piano arpeggios
  const arp = voicing(current, 24);
  const order = [0, 1, 2, 3, 2, 1, 0, 1];
  order.forEach((idx, i) => events.push({ voice: "piano", beat: swing(i / 2, 0.6), length: 0.9, notes: [arp[idx]], velocity: 0.4 }));
  // Soft swirl on the snare
  events.push({ voice: "brush", beat: 0, length: 1.8, notes: [], velocity: 0.35 });
  events.push({ voice: "brush", beat: 2, length: 1.8, notes: [], velocity: 0.35 });
  // A few long, singing horn notes
  if (bar % 2 === 0 || rand() < 0.4) {
    const pool = [...current.tones].map((t) => current.root + 36 + t);
    const first = pick(rand, [0, 0.5, 1]);
    events.push({ voice: "horn", beat: first, length: 1.8, notes: [pick(rand, pool)], velocity: 0.5 });
    if (rand() < 0.6) events.push({ voice: "horn", beat: 2.5, length: 1.3, notes: [pick(rand, pool)], velocity: 0.45 });
  }
  return events;
};

// One bar of music for every instrument
export const buildBar = (tune: Tune, bar: number, seed = 1): NoteEvent[] => {
  const rand = makeRandom(seed * 1009 + bar * 7919 + tune.bpm);
  if (tune.style === "blues") return buildBlues(tune, bar, rand);
  if (tune.style === "ragtime") return buildRagtime(tune, bar, rand);
  if (tune.style === "ballad") return buildBallad(tune, bar, rand);
  return buildSwing(tune, bar, rand);
};
