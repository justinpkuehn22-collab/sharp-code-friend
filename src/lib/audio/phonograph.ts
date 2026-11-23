import { getAudioContext, midiToFrequency, noiseBuffer } from "@/lib/audio/audio-context";
import { buildBar, songbook, type NoteEvent, type Tune } from "@/lib/audio/jazz-score";

const lookAhead = 0.6;

// Crackle for the record: quiet hiss plus random pops, looped
const crackleBuffer = (ctx: BaseAudioContext): AudioBuffer => {
  const seconds = 6;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    let value = (Math.random() * 2 - 1) * 0.01;
    if (Math.random() < 0.0003) value += (Math.random() * 2 - 1) * 0.5;
    data[i] = value;
  }
  return buffer;
};

// Gramophone sound: thin lows and highs, a little warmth, and the crackle underneath
const gramophone = (ctx: BaseAudioContext, destination: AudioNode) => {
  const master = ctx.createGain();
  master.gain.value = 0;
  const highpass = ctx.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 160;
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 4200;
  const warmth = ctx.createWaveShaper();
  const curve = new Float32Array(1024);
  for (let i = 0; i < curve.length; i++) curve[i] = Math.tanh(1.5 * ((i / curve.length) * 2 - 1));
  warmth.curve = curve;
  highpass.connect(lowpass).connect(warmth).connect(master).connect(destination);

  const crackle = ctx.createBufferSource();
  crackle.buffer = crackleBuffer(ctx);
  crackle.loop = true;
  crackle.connect(master);
  crackle.start();
  return { input: highpass as AudioNode, master, crackle };
};

// The instruments: plays one scored note (or chord) at a given time
const playEvent = (ctx: BaseAudioContext, bus: AudioNode, event: NoteEvent, at: number, secondsPerBeat: number) => {
  const length = event.length * secondsPerBeat;

  if (event.voice === "brush") {
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer(ctx);
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 5000;
    band.Q.value = 0.6;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.linearRampToValueAtTime(0.045 * event.velocity, at + Math.min(0.08, length * 0.3));
    gain.gain.exponentialRampToValueAtTime(0.0001, at + Math.max(0.08, length));
    noise.connect(band).connect(gain).connect(bus);
    noise.start(at, Math.random() * 0.5, length + 0.1);
    return;
  }

  for (const note of event.notes) {
    const freq = midiToFrequency(note);
    // A little wobble, like a record that isn't perfectly flat
    const detune = (Math.random() - 0.5) * 10;
    const gain = ctx.createGain();

    if (event.voice === "bass") {
      // Upright bass: a round tone with a plucked attack
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = freq;
      osc.detune.value = detune;
      const tone = ctx.createBiquadFilter();
      tone.type = "lowpass";
      tone.frequency.setValueAtTime(900, at);
      tone.frequency.exponentialRampToValueAtTime(320, at + 0.25);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.linearRampToValueAtTime(0.38 * event.velocity, at + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + Math.max(0.2, length));
      osc.connect(tone).connect(gain).connect(bus);
      osc.start(at);
      osc.stop(at + length + 0.05);
      continue;
    }

    if (event.voice === "piano") {
      // Old upright piano: two slightly detuned strings, a bright strike that mellows
      const tone = ctx.createBiquadFilter();
      tone.type = "lowpass";
      tone.frequency.setValueAtTime(3200, at);
      tone.frequency.exponentialRampToValueAtTime(900, at + 0.4);
      for (const [type, cents, level] of [
        ["triangle", -4, 1],
        ["sine", 5, 0.7],
      ] as const) {
        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.value = freq;
        osc.detune.value = detune + cents;
        const mix = ctx.createGain();
        mix.gain.value = level;
        osc.connect(mix).connect(tone);
        osc.start(at);
        osc.stop(at + length + 0.6);
      }
      const peak = (event.notes.length > 1 ? 0.05 : 0.09) * event.velocity;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.linearRampToValueAtTime(peak, at + 0.006);
      gain.gain.exponentialRampToValueAtTime(peak * 0.35, at + 0.18);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + length + 0.5);
      tone.connect(gain).connect(bus);
      continue;
    }

    // Muted trumpet: a buzzy tone through a mute, with vibrato and bluesy bends
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = freq;
    osc.detune.setValueAtTime(detune - (event.slide ?? 0) * 100, at);
    if (event.slide) osc.detune.linearRampToValueAtTime(detune, at + 0.12);
    const mute = ctx.createBiquadFilter();
    mute.type = "bandpass";
    mute.frequency.value = 1100;
    mute.Q.value = 1.8;
    const vibrato = ctx.createOscillator();
    const depth = ctx.createGain();
    vibrato.frequency.value = 5.3;
    depth.gain.setValueAtTime(0, at);
    depth.gain.linearRampToValueAtTime(11, at + Math.min(0.4, length));
    vibrato.connect(depth).connect(osc.detune);
    vibrato.start(at);
    vibrato.stop(at + length + 0.2);
    const peak = 0.07 * event.velocity;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.linearRampToValueAtTime(peak, at + 0.04);
    gain.gain.setValueAtTime(peak, at + Math.max(0.05, length - 0.06));
    gain.gain.exponentialRampToValueAtTime(0.0001, at + length + 0.12);
    osc.connect(mute).connect(gain).connect(bus);
    osc.start(at);
    osc.stop(at + length + 0.2);
  }
};

type Listener = () => void;

class Phonograph {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bus: AudioNode | null = null;
  private crackle: AudioBufferSourceNode | null = null;
  private timer: number | null = null;
  private nextBarTime = 0;
  private bar = 0;
  private seed = 1;
  private volume = 0.6;
  private listeners = new Set<Listener>();
  track = 0;
  playing = false;

  get tune(): Tune {
    return songbook[this.track];
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  start(): boolean {
    const ctx = getAudioContext();
    if (!ctx) return false;
    if (this.playing) return true;
    this.ctx = ctx;
    const chain = gramophone(ctx, ctx.destination);
    chain.master.gain.linearRampToValueAtTime(this.volume * 0.55, ctx.currentTime + 1.5);
    this.master = chain.master;
    this.bus = chain.input;
    this.crackle = chain.crackle;
    this.bar = 0;
    this.seed = Math.floor(Math.random() * 1000) + 1;
    this.nextBarTime = ctx.currentTime + 0.8;
    this.playing = true;
    this.timer = window.setInterval(() => this.schedule(), 100);
    this.schedule();
    this.notify();
    return true;
  }

  stop(): void {
    if (!this.playing || !this.ctx || !this.master) return;
    const ctx = this.ctx;
    const master = this.master;
    const crackle = this.crackle;
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    this.playing = false;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
    window.setTimeout(() => {
      crackle?.stop();
      master.disconnect();
    }, 900);
    this.notify();
  }

  // Change records; if the band is playing, the new one starts after a short pause
  skip(direction: 1 | -1): void {
    this.track = (this.track + direction + songbook.length) % songbook.length;
    this.bar = 0;
    this.seed = Math.floor(Math.random() * 1000) + 1;
    if (this.playing && this.ctx) {
      // Silence what's already queued by briefly dipping the volume
      const g = this.master?.gain;
      const now = this.ctx.currentTime;
      g?.cancelScheduledValues(now);
      g?.setValueAtTime(g.value, now);
      g?.linearRampToValueAtTime(0, now + 0.15);
      g?.linearRampToValueAtTime(this.volume * 0.55, now + lookAhead + 0.9);
      this.nextBarTime = now + lookAhead + 0.8;
    }
    this.notify();
  }

  setVolume(volume: number): void {
    this.volume = Math.min(1, Math.max(0, volume));
    if (this.ctx && this.master && this.playing) {
      this.master.gain.setTargetAtTime(this.volume * 0.55, this.ctx.currentTime, 0.1);
    }
  }

  private schedule(): void {
    if (!this.ctx || !this.bus) return;
    while (this.nextBarTime < this.ctx.currentTime + lookAhead) {
      const tune = this.tune;
      const secondsPerBeat = 60 / tune.bpm;
      const totalBars = tune.form.length * tune.choruses;
      if (this.bar >= totalBars) {
        // End of the record: a breath of crackle, then the next one
        this.track = (this.track + 1) % songbook.length;
        this.bar = 0;
        this.seed += 17;
        this.nextBarTime += 2.5;
        this.notify();
        continue;
      }
      // A new improvisation each time through the form
      const chorus = Math.floor(this.bar / tune.form.length);
      for (const event of buildBar(tune, this.bar, this.seed + chorus)) {
        playEvent(this.ctx, this.bus, event, this.nextBarTime + event.beat * secondsPerBeat, secondsPerBeat);
      }
      this.nextBarTime += secondsPerBeat * 4;
      this.bar++;
    }
  }
}

// One record player for the whole app, so music keeps going between views
export const phonograph = new Phonograph();

// Renders a stretch of a tune without playing it, for previews and checks
export const renderTune = async (tune: Tune, seconds: number, seed = 7): Promise<AudioBuffer> => {
  const ctx = new OfflineAudioContext(2, Math.ceil(44100 * seconds), 44100);
  const chain = gramophone(ctx, ctx.destination);
  chain.master.gain.value = 0.55;
  const secondsPerBeat = 60 / tune.bpm;
  for (let bar = 0, t = 0.3; t < seconds; bar++, t += secondsPerBeat * 4) {
    const chorus = Math.floor(bar / tune.form.length);
    for (const event of buildBar(tune, bar, seed + chorus)) playEvent(ctx, chain.input, event, t + event.beat * secondsPerBeat, secondsPerBeat);
  }
  return ctx.startRendering();
};
