import { getAudioContext, midiToFrequency, noiseBuffer } from "@/lib/audio/audio-context";
import { buildBar, type NoteEvent } from "@/lib/audio/jazz-score";

const tempo = 104; // beats per minute, an easy foxtrot swing
const secondsPerBeat = 60 / tempo;
const barSeconds = secondsPerBeat * 4;
const lookAhead = 0.6;

// Crackle for the record: quiet hiss plus random pops, looped
const crackleBuffer = (ctx: AudioContext): AudioBuffer => {
  const seconds = 6;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    let value = (Math.random() * 2 - 1) * 0.012;
    if (Math.random() < 0.00035) value += (Math.random() * 2 - 1) * 0.6;
    data[i] = value;
  }
  return buffer;
};

class Phonograph {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bus: AudioNode | null = null;
  private crackle: AudioBufferSourceNode | null = null;
  private timer: number | null = null;
  private nextBarTime = 0;
  private bar = 0;
  private chorusSeed = 1;
  private volume = 0.6;
  playing = false;

  start(): boolean {
    const ctx = getAudioContext();
    if (!ctx) return false;
    if (this.playing) return true;
    this.ctx = ctx;

    // Gramophone sound: thin out lows and highs, then a touch of saturation
    const master = ctx.createGain();
    master.gain.value = 0;
    master.gain.linearRampToValueAtTime(this.volume * 0.5, ctx.currentTime + 1.5);
    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 180;
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 3600;
    const warmth = ctx.createWaveShaper();
    const curve = new Float32Array(1024);
    for (let i = 0; i < curve.length; i++) {
      const x = (i / curve.length) * 2 - 1;
      curve[i] = Math.tanh(1.6 * x);
    }
    warmth.curve = curve;
    highpass.connect(lowpass).connect(warmth).connect(master).connect(ctx.destination);
    this.master = master;
    this.bus = highpass;

    const crackle = ctx.createBufferSource();
    crackle.buffer = crackleBuffer(ctx);
    crackle.loop = true;
    const crackleGain = ctx.createGain();
    crackleGain.gain.value = 0.9;
    crackle.connect(crackleGain).connect(master);
    crackle.start();
    this.crackle = crackle;

    this.bar = 0;
    this.chorusSeed = Math.floor(Math.random() * 1000) + 1;
    this.nextBarTime = ctx.currentTime + 0.8;
    this.playing = true;
    this.timer = window.setInterval(() => this.schedule(), 100);
    this.schedule();
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
  }

  setVolume(volume: number): void {
    this.volume = Math.min(1, Math.max(0, volume));
    if (this.ctx && this.master && this.playing) {
      this.master.gain.setTargetAtTime(this.volume * 0.5, this.ctx.currentTime, 0.1);
    }
  }

  private schedule(): void {
    if (!this.ctx || !this.bus) return;
    while (this.nextBarTime < this.ctx.currentTime + lookAhead) {
      // A new improvisation each time through the 32-bar tune
      const seed = this.chorusSeed + Math.floor(this.bar / 32);
      for (const event of buildBar(this.bar, seed)) this.play(event, this.nextBarTime + event.beat * secondsPerBeat);
      this.nextBarTime += barSeconds;
      this.bar++;
    }
  }

  private play(event: NoteEvent, at: number): void {
    const ctx = this.ctx;
    const bus = this.bus;
    if (!ctx || !bus) return;
    const length = event.length * secondsPerBeat;
    // A little wobble, like a record that's not perfectly flat
    const detune = (Math.random() - 0.5) * 12;

    if (event.voice === "brush") {
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer(ctx);
      const band = ctx.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.value = 5200;
      band.Q.value = 0.6;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.linearRampToValueAtTime(0.05 * event.velocity, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + Math.max(0.08, length));
      noise.connect(band).connect(gain).connect(bus);
      noise.start(at, Math.random() * 0.5, length + 0.1);
      return;
    }

    for (const note of event.notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = midiToFrequency(note);
      osc.detune.value = detune;
      let peak = 0.1;
      let release = length;

      if (event.voice === "bass") {
        osc.type = "triangle";
        peak = 0.32;
        release = length * 0.9;
      } else if (event.voice === "piano") {
        osc.type = "triangle";
        peak = 0.06;
        release = length + 0.3;
      } else {
        // Muted horn: a buzzy tone, softened, with a gentle vibrato
        osc.type = "sawtooth";
        peak = 0.045;
        const mute = ctx.createBiquadFilter();
        mute.type = "lowpass";
        mute.frequency.value = 1300;
        mute.Q.value = 3;
        const vibrato = ctx.createOscillator();
        const depth = ctx.createGain();
        vibrato.frequency.value = 5.2;
        depth.gain.value = 9;
        vibrato.connect(depth).connect(osc.detune);
        vibrato.start(at);
        vibrato.stop(at + length + 0.2);
        gain.gain.setValueAtTime(0.0001, at);
        gain.gain.linearRampToValueAtTime(peak * event.velocity, at + 0.05);
        gain.gain.setValueAtTime(peak * event.velocity, at + Math.max(0.06, length - 0.06));
        gain.gain.exponentialRampToValueAtTime(0.0001, at + length + 0.12);
        osc.connect(mute).connect(gain).connect(bus);
        osc.start(at);
        osc.stop(at + length + 0.2);
        continue;
      }

      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.linearRampToValueAtTime(peak * event.velocity, at + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + release);
      osc.connect(gain).connect(bus);
      osc.start(at);
      osc.stop(at + release + 0.05);
    }
  }
}

// One record player for the whole app, so music keeps going between views
export const phonograph = new Phonograph();
