// Procedural Web Audio API Engine for Sacrificial Scales
export interface TrackInstance {
  name: string;
  bus: GainNode;
  nodes: (AudioNode & { stop?: (when?: number) => void })[];
  timers: (ReturnType<typeof setTimeout> | ReturnType<typeof setInterval>)[];
  cleanup: () => void;
}

export interface ChiptuneAudioType {
  [key: string]: any;
  ctx: AudioContext | null;
  currentTrack: string | null;
  activeInstance: TrackInstance | null;
  init: () => void;
  transitionTo: (trackName: string, startFn: (inst: TrackInstance) => void, fadeTime?: number) => void;
  stop: (fadeTime?: number) => void;
  playSynthPiano: (freqs: number[], bus: GainNode, duration?: number, gainLevel?: number) => void;
  playSlapBass: (freq: number, bus: GainNode, isPop?: boolean, duration?: number, gainLevel?: number) => void;
  playStrings: (chordFreqs: number[], bus: GainNode, duration?: number, gainLevel?: number) => void;
  playBrass: (freq: number, bus: GainNode, duration?: number, gainLevel?: number) => void;
  playPluck: (freq: number, bus: GainNode, duration?: number, gainLevel?: number) => void;
  playImpact: (pitch: number, bus: GainNode, decay?: number, gainLevel?: number) => void;
  playSwell?: (freq: number, dest: GainNode, duration?: number, gainLevel?: number) => void;
  playCabin: (fadeTime?: number) => void;
  playAmbient?: (fadeTime?: number) => void;
  playBattle: (fadeTime?: number) => void;
  playBoss: (fadeTime?: number) => void;
  playOrgan: (freqs: number[], bus: GainNode, duration?: number, gainLevel?: number) => void;
  playBoneClick: (freq: number, bus: GainNode, gainLevel?: number) => void;
  playFinalBoss: (fadeTime?: number) => void;
  playFinalBossPhase3: (fadeTime?: number) => void;
  playHarp: (freq: number, bus: GainNode, duration?: number, gainLevel?: number) => void;
  playBell: (freq: number, bus: GainNode, duration?: number, gainLevel?: number) => void;
  playFleshGroan: (startFreq: number, endFreq: number, bus: GainNode, duration?: number, gainLevel?: number) => void;
  playTheWeaver: (fadeTime?: number) => void;
  playTheZealot: (fadeTime?: number) => void;
  playTheBegotten: (fadeTime?: number) => void;
  stopAll?: (fadeTime?: number) => void;
}

export const ChiptuneAudio: any = {
  ctx: null,
  currentTrack: null,
  activeInstance: null,
  musicVolume: 0.3,
  sfxVolume: 0.6,
  musicGain: null as GainNode | null,
  musicCompressor: null as DynamicsCompressorNode | null,
  noiseBuffer: null as AudioBuffer | null,

  init() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && !this.musicGain) {
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);

        const comp = this.ctx.createDynamicsCompressor();
        comp.threshold.setValueAtTime(-18, this.ctx.currentTime);
        comp.knee.setValueAtTime(12, this.ctx.currentTime);
        comp.ratio.setValueAtTime(4, this.ctx.currentTime);
        comp.attack.setValueAtTime(0.004, this.ctx.currentTime);
        comp.release.setValueAtTime(0.18, this.ctx.currentTime);

        this.musicGain.connect(comp);
        comp.connect(this.ctx.destination);
        this.musicCompressor = comp;
      }
      if (this.ctx && !this.noiseBuffer) {
        const len = Math.floor(this.ctx.sampleRate * 1.0);
        const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
        this.noiseBuffer = buf;
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch {}
  },

  createPanNode(dest: AudioNode, pan = 0): AudioNode {
    if (!this.ctx || pan === 0 || typeof this.ctx.createStereoPanner !== 'function') return dest;
    const panner = this.ctx.createStereoPanner();
    panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), this.ctx.currentTime);
    panner.connect(dest);
    return panner;
  },

  scheduleLoop(inst: TrackInstance, stepSec: number, totalSteps: number, onStep: (step: number, when: number) => void) {
    if (!this.ctx) return;
    let step = 0;
    let nextNoteTime = this.ctx.currentTime + 0.04;
    const lookahead = 0.14;

    const tick = () => {
      if (!this.ctx) return;
      while (nextNoteTime < this.ctx.currentTime + lookahead) {
        onStep(step, nextNoteTime);
        nextNoteTime += stepSec;
        step = (step + 1) % totalSteps;
      }
    };

    tick();
    const timer = setInterval(tick, 25);
    inst.timers.push(timer);
  },

  setMusicVolume(val: number) {
    const clamped = Math.max(0, Math.min(1, val));
    this.musicVolume = clamped;
    this.init();
    if (this.ctx && this.musicGain) {
      this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.musicGain.gain.setValueAtTime(clamped, this.ctx.currentTime);
    }
  },

  setSfxVolume(val: number) {
    const clamped = Math.max(0, Math.min(1, val));
    this.sfxVolume = clamped;
  },

  playSfxPreview() {
    playSound('bone');
  },

  transitionTo(trackName: string, startFn: (inst: TrackInstance) => void, fadeTime = 1.5) {
    this.init();
    if (!this.ctx) return;
    if (this.currentTrack === trackName) return;

    const now = this.ctx.currentTime;

    if (this.activeInstance) {
      const old = this.activeInstance;
      old.bus.gain.cancelScheduledValues(now);
      old.bus.gain.setValueAtTime(old.bus.gain.value, now);
      old.bus.gain.linearRampToValueAtTime(0.0001, now + fadeTime);

      setTimeout(() => {
        old.cleanup();
      }, fadeTime * 1000);
    }

    const bus = this.ctx.createGain();
    bus.gain.setValueAtTime(0.0001, now);
    bus.gain.linearRampToValueAtTime(1.0, now + fadeTime);
    bus.connect(this.musicGain || this.ctx.destination);

    const instance: TrackInstance = {
      name: trackName,
      bus: bus,
      nodes: [],
      timers: [],
      cleanup() {
        this.timers.forEach(t => {
          clearInterval(t as unknown as number);
          clearTimeout(t as unknown as number);
        });
        this.nodes.forEach(n => {
          try {
            if (n.stop) n.stop();
            n.disconnect();
          } catch {}
        });
        try {
          this.bus.disconnect();
        } catch {}
      }
    };

    this.activeInstance = instance;
    this.currentTrack = trackName;
    startFn(instance);
  },

  stopAll(fadeTime = 0.5) {
    if (!this.ctx || !this.activeInstance) return;
    const now = this.ctx.currentTime;
    const old = this.activeInstance;
    try {
      old.bus.gain.cancelScheduledValues(now);
      old.bus.gain.setValueAtTime(old.bus.gain.value, now);
      old.bus.gain.linearRampToValueAtTime(0.0001, now + fadeTime);
      setTimeout(() => {
        try { old.cleanup(); } catch (e) {}
      }, fadeTime * 1000);
    } catch (e) {}
    this.activeInstance = null;
    this.currentTrack = null;
  },

  stop(fadeTime = 1.0) {
    if (!this.activeInstance || !this.ctx) return;
    const now = this.ctx.currentTime;
    const old = this.activeInstance;

    old.bus.gain.cancelScheduledValues(now);
    old.bus.gain.setValueAtTime(old.bus.gain.value, now);
    old.bus.gain.linearRampToValueAtTime(0.0001, now + fadeTime);

    setTimeout(() => {
      old.cleanup();
    }, fadeTime * 1000);

    this.activeInstance = null;
    this.currentTrack = null;
  },

  // --- Specialized Instruments ---

  // Heavy, dark synth piano chord/strike
  playSynthPiano(freqs: number[], bus: GainNode, duration = 1.6, gainLevel = 0.22) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    freqs.forEach(freq => {
      if (!this.ctx) return;
      const oscSine = this.ctx.createOscillator();
      const oscTri = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      oscSine.type = 'sine';
      oscTri.type = 'triangle';

      // Slight hammer transient drop
      oscSine.frequency.setValueAtTime(freq * 1.02, now);
      oscSine.frequency.exponentialRampToValueAtTime(freq, now + 0.04);
      oscTri.frequency.setValueAtTime(freq, now);

      // Warm acoustic lowpass roll-off
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(850, now);
      filter.frequency.exponentialRampToValueAtTime(220, now + duration);

      // Piano decay curve
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(gainLevel / freqs.length, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(gainLevel * 0.35, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      oscSine.connect(filter);
      oscTri.connect(filter);
      filter.connect(gain);
      gain.connect(bus);

      oscSine.start(now);
      oscTri.start(now);
      oscSine.stop(now + duration);
      oscTri.stop(now + duration);
    });
  },

  // Slap Bass: punchy sub-drive with a bright thumb/pop attack
  playSlapBass(freq: number, bus: GainNode, isPop = false, duration = 0.35, gainLevel = 0.26) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = isPop ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    // Resonant slap filter sweep
    filter.type = 'lowpass';
    filter.Q.value = isPop ? 5.0 : 3.0;
    const startFilter = isPop ? 2800 : 1200;
    filter.frequency.setValueAtTime(startFilter, now);
    filter.frequency.exponentialRampToValueAtTime(140, now + 0.12);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(gainLevel, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(bus);

    osc.start(now);
    osc.stop(now + duration);

    // Perceptual transient click/thump
    const click = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    click.type = 'square';
    click.frequency.setValueAtTime(isPop ? 800 : 300, now);
    clickGain.gain.setValueAtTime(0.08, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    click.connect(clickGain);
    clickGain.connect(bus);
    click.start(now);
    click.stop(now + 0.02);
  },

  // Heavy 4-voice detuned string ensemble swell
  playStrings(chordFreqs: number[], bus: GainNode, duration = 2.8, gainLevel = 0.14) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    chordFreqs.forEach(freq => {
      [-7, 7].forEach(cents => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq * Math.pow(2, cents / 1200), now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(700, now);

        // Lush orchestral swell & release
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(gainLevel / (chordFreqs.length * 2), now + 0.35);
        gain.gain.setValueAtTime(gainLevel * 0.7 / (chordFreqs.length * 2), now + duration * 0.7);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(bus);

        osc.start(now);
        osc.stop(now + duration);
      });
    });
  },

  // Toned-down brass accent
  playBrass(freq: number, bus: GainNode, duration = 0.6, gainLevel = 0.15) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq * 1.005, now);

    filter.type = 'lowpass';
    filter.Q.value = 2.5;
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.exponentialRampToValueAtTime(900, now + 0.07);
    filter.frequency.exponentialRampToValueAtTime(150, now + duration);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(gainLevel, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(bus);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  },

  playPluck(freq: number, bus: GainNode, duration = 1.8, gainLevel = 0.07) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(gainLevel, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(bus);
    osc.start(now);
    osc.stop(now + duration);
  },

  playImpact(pitch: number, bus: GainNode, decay = 0.4, gainLevel = 0.3) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + decay);
    gain.gain.setValueAtTime(gainLevel, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + decay);

    osc.connect(gain);
    gain.connect(bus);
    osc.start(now);
    osc.stop(now + decay);
  },

  // Slow, mournful bowed string/pad swell for ambient mid-range
  playSwell(freq: number, dest: GainNode, duration = 5.5, gainLevel = 0.06) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    [-4, 4].forEach(detuneCents => {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq * Math.pow(2, detuneCents / 1200), now);

      // Warm, muffled filter that opens slightly at the peak of the swell
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(160, now);
      filter.frequency.exponentialRampToValueAtTime(480, now + duration * 0.45);
      filter.frequency.exponentialRampToValueAtTime(140, now + duration);

      // Slow fade-in, long tail
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(gainLevel * 0.5, now + duration * 0.45);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + duration);
    });
  },

// --- Spatial & Utility Helpers ---
  createEchoBus(inst: any, delayTime = 0.36, feedbackAmt = 0.38, filterCutoff = 950) {
    if (!this.ctx) return inst.bus;
    const input = this.ctx.createGain();
    const delay = this.ctx.createDelay();
    const feedback = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    delay.delayTime.value = delayTime;
    feedback.gain.value = feedbackAmt;
    filter.type = 'lowpass';
    filter.frequency.value = filterCutoff;

    input.connect(inst.bus);
    input.connect(delay);
    delay.connect(filter);
    filter.connect(inst.bus);
    filter.connect(feedback);
    feedback.connect(delay);

    inst.nodes.push(input, delay, feedback, filter);
    return input;
  },

  // Brushed snare / organic percussion hit
  playBrushHit(dest: any, decay = 0.12, toneFreq = 900, gainLevel = 0.08) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * decay);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 1.8;
    filter.frequency.setValueAtTime(toneFreq, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(gainLevel, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start(now);
  },

playAmbient(fadeTime = 1.8) {
    this.playCabin(fadeTime);
  },

  // 1. Ambient (Reworked): Breathing drone, tape delay network, and bowed swells
  playCabin(fadeTime = 1.8) {
    this.transitionTo('cabin', (inst: any) => {
      if (!this.ctx) return;

      // --- A. Breathing Sub-Drone ---
      const droneFilter = this.ctx.createBiquadFilter();
      droneFilter.type = 'lowpass';
      droneFilter.frequency.value = 145;

      // Slow LFO to make the drone filter slowly open and close (~8s cycle)
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.value = 0.12;
      lfoGain.gain.value = 45; // Sweeps filter between 100Hz and 190Hz
      lfo.connect(lfoGain);
      lfoGain.connect(droneFilter.frequency);
      lfo.start();
      inst.nodes.push(lfo);

      const subGain = this.ctx.createGain();
      subGain.gain.value = 0.12;
      droneFilter.connect(subGain);
      subGain.connect(inst.bus);

      // D1, D2 detuned pair, plus a faint A2 fifth
      [
        { f: 36.71, type: 'sawtooth' as OscillatorType },
        { f: 73.42, type: 'sawtooth' as OscillatorType },
        { f: 73.85, type: 'sawtooth' as OscillatorType },
        { f: 110.00, type: 'triangle' as OscillatorType }
      ].forEach(v => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        osc.type = v.type;
        osc.frequency.value = v.f;
        osc.connect(droneFilter);
        osc.start();
        inst.nodes.push(osc);
      });

      // --- B. Dark Tape Delay Bus for Plucks ---
      const pluckBus = this.ctx.createGain();
      const delay = this.ctx.createDelay();
      const feedback = this.ctx.createGain();
      const delayFilter = this.ctx.createBiquadFilter();

      delay.delayTime.value = 0.48; // ~Half-second echo
      feedback.gain.value = 0.42;   // Decaying repeats
      delayFilter.type = 'lowpass';
      delayFilter.frequency.value = 900; // Darken each repeat

      // Dry path + Wet loop
      pluckBus.connect(inst.bus);
      pluckBus.connect(delay);
      delay.connect(delayFilter);
      delayFilter.connect(inst.bus);
      delayFilter.connect(feedback);
      feedback.connect(delay);

      // --- C. Generative Plucks & Arpeggio Rolls ---
      const palette = [
        98.00,  // G2
        110.00, // A2
        130.81, // C3
        146.83, // D3
        164.81, // E3
        174.61, // F3
        196.00, // G3
        220.00, // A3
        246.94, // B3 (Dorian natural 6th)
        261.63, // C4
        293.66, // D4
        329.63, // E4
        349.23, // F4
        440.00  // A4
      ];

      const schedulePluck = () => {
        if (this.activeInstance !== inst) return;
        const roll = Math.random();
        const idx = Math.floor(Math.random() * (palette.length - 3));
        const baseNote = palette[idx];

        if (roll > 0.72) {
          // 3-note slow rolled chord
          this.playPluck(baseNote, pluckBus, 3.0, 0.055);
          const t1 = setTimeout(() => {
            if (this.activeInstance === inst) this.playPluck(palette[idx + 1], pluckBus, 2.6, 0.045);
          }, 210);
          const t2 = setTimeout(() => {
            if (this.activeInstance === inst) this.playPluck(palette[idx + 3], pluckBus, 2.4, 0.035);
          }, 440);
          inst.timers.push(t1, t2);
        } else if (roll > 0.4) {
          // Harmonic dyad (fifth or fourth)
          this.playPluck(baseNote, pluckBus, 2.8, 0.055);
          const t = setTimeout(() => {
            if (this.activeInstance === inst) {
              this.playPluck(baseNote * 1.5, pluckBus, 2.2, 0.038);
            }
          }, 190);
          inst.timers.push(t);
        } else if (roll > 0.15) {
          // Lonely single note
          this.playPluck(baseNote, pluckBus, 2.4, 0.065);
        }

        const next = 1100 + Math.random() * 1900;
        const mainTimer = setTimeout(schedulePluck, next);
        inst.timers.push(mainTimer);
      };

      // --- D. Haunting Bowed Mid-Range Swells ---
      const swellNotes = [
        [146.83, 220.00], // D3 + A3 (Open fifth)
        [130.81, 196.00], // C3 + G3
        [174.61, 220.00], // F3 + A3 (Minor third warmth)
        [110.00, 164.81], // A2 + E3
        [146.83, 246.94]  // D3 + B3 (Dorian ache)
      ];

      const scheduleSwell = () => {
        if (this.activeInstance !== inst) return;
        const pair = swellNotes[Math.floor(Math.random() * swellNotes.length)];
        const dur = 4.5 + Math.random() * 2.5;

        pair.forEach(freq => {
          this.playSwell(freq, inst.bus, dur, 0.055);
        });

        const nextSwell = 5000 + Math.random() * 4000;
        const swellTimer = setTimeout(scheduleSwell, nextSwell);
        inst.timers.push(swellTimer);
      };

      schedulePluck();
      scheduleSwell();
    }, fadeTime);
  },

  // ==========================================
  // 2. BATTLE (64-Step Noir Synth Piano Groove)
  // ==========================================
  playBattle(fadeTime = 1.4) {
    this.transitionTo('battle', (inst: any) => {
      if (!this.ctx) return;
      const pianoEcho = this.createEchoBus(inst, 0.38, 0.28, 850);

      const chords: Record<number, number[]> = {
        0:  [73.42, 110.00, 146.83, 174.61], // Dm
        6:  [73.42, 164.81],                 // Dm9 push
        8:  [87.31, 130.81, 174.61, 220.00], // F
        16: [58.27, 116.54, 146.83, 174.61], // Bb
        22: [58.27, 130.81, 164.81],         // Bbmaj9 offbeat
        24: [55.00, 110.00, 138.59, 196.00], // A7
        32: [98.00, 146.83, 174.61, 220.00], // Gm9
        40: [73.42, 110.00, 146.83, 220.00], // Dm/F
        48: [82.41, 116.54, 146.83, 196.00], // Em7b5
        56: [55.00, 110.00, 146.83, 196.00], // A7sus4
        60: [55.00, 110.00, 138.59, 174.61]  // A7 resolve
      };

      const topMelody: Record<number, number> = {
        34: 293.66, 36: 329.63, 38: 349.23,
        42: 440.00, 44: 392.00, 46: 349.23,
        50: 329.63, 52: 293.66, 54: 277.18,
        58: 293.66, 62: 277.18
      };

      const bassline: (number | null)[] = [
        73.42, null, 73.42, null, 87.31, null, 73.42, 82.41,
        87.31, null, 87.31, 110.00, null, 87.31, 65.41, null,
        58.27, null, 58.27, null, 65.41, null, 58.27, 69.30,
        55.00, null, 55.00, 82.41, null, 73.42, 69.30, 61.74,
        49.00, null, 49.00, null, 58.27, null, 65.41, 73.42,
        73.42, null, 73.42, 65.41, null, 58.27, 55.00, null,
        41.20, null, 41.20, null, 58.27, null, 55.00, 49.00,
        55.00, null, 55.00, null, 55.00, 61.74, 65.41, 69.30
      ];

      let step = 0;
      const interval = setInterval(() => {
        if (!this.ctx) return;

        if (chords[step]) {
          this.playSynthPiano(chords[step], pianoEcho, 2.2, 0.22);
        }

        if (topMelody[step]) {
          this.playPluck(topMelody[step], pianoEcho, 1.4, 0.08);
        }

        if (step % 8 === 0) {
          this.playImpact(88, inst.bus, 0.4, 0.34);
        } else if (step % 8 === 3 && step > 31) {
          this.playImpact(72, inst.bus, 0.25, 0.2);
        }

        if (step % 8 === 4) {
          this.playImpact(68, inst.bus, 0.2, 0.18);
          this.playBrushHit(inst.bus, 0.14, 850, 0.08);
        } else if (step % 2 === 1) {
          this.playBrushHit(inst.bus, 0.05, 2400, step % 4 === 3 ? 0.03 : 0.015);
        }

        const note = bassline[step];
        if (note) {
          const osc = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          const gain = this.ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(note, this.ctx.currentTime);
          filter.type = 'lowpass';
          filter.frequency.value = 240;

          gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.26);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(inst.bus);

          osc.start();
          osc.stop(this.ctx.currentTime + 0.26);
        }

        step = (step + 1) % 64;
      }, 290);

      inst.timers.push(interval);
    }, fadeTime);
  },

  // --- Boss-Specific Instrument Generators ---

  // 1. Metallic Arachnid Harp / Harpsichord (for The Weaver)
  playHarp(freq: number, dest: any, duration = 0.85, gainLevel = 0.1) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq * 2, now);

    filter.type = 'lowpass';
    filter.Q.value = 3.5;
    filter.frequency.setValueAtTime(3200, now);
    filter.frequency.exponentialRampToValueAtTime(380, now + duration * 0.7);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(gainLevel, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  },

  // 2. Sanctuary Bronze Bell via Inharmonic FM Synthesis (for The Zealot & Bone Lord)
  playBell(freq: number, dest: any, duration = 2.6, gainLevel = 0.16, when?: number) {
    if (!this.ctx) return;
    const now = when ?? this.ctx.currentTime;

    const carrier = this.ctx.createOscillator();
    const subCarrier = this.ctx.createOscillator();
    const modulator = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const mainGain = this.ctx.createGain();

    carrier.type = 'sine';
    subCarrier.type = 'triangle';
    modulator.type = 'sine';

    carrier.frequency.setValueAtTime(freq, now);
    subCarrier.frequency.setValueAtTime(freq * 0.5, now);
    modulator.frequency.setValueAtTime(freq * 2.756, now);

    modGain.gain.setValueAtTime(freq * 2.1, now);
    modGain.gain.exponentialRampToValueAtTime(0.01, now + duration * 0.55);

    mainGain.gain.setValueAtTime(0.0008, now);
    mainGain.gain.linearRampToValueAtTime(gainLevel, now + 0.008);
    mainGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.35, now);

    modulator.connect(modGain);
    modGain.connect(carrier.frequency);
    carrier.connect(mainGain);
    subCarrier.connect(subGain);
    subGain.connect(mainGain);
    mainGain.connect(dest);

    carrier.start(now);
    subCarrier.start(now);
    modulator.start(now);
    carrier.stop(now + duration + 0.02);
    subCarrier.stop(now + duration + 0.02);
    modulator.stop(now + duration + 0.02);
  },

  // 3. Visceral Subterranean Formant Groan (for The Begotten)
  playFleshGroan(startFreq: number, endFreq: number, dest: any, duration = 1.6, gainLevel = 0.22, when?: number) {
    if (!this.ctx) return;
    const now = when ?? this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const sub = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    sub.type = 'sine';

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration * 0.85);
    sub.frequency.setValueAtTime(startFreq * 0.5, now);
    sub.frequency.exponentialRampToValueAtTime(endFreq * 0.5, now + duration * 0.85);

    filter.type = 'bandpass';
    filter.Q.value = 5.5;
    filter.frequency.setValueAtTime(190, now);
    filter.frequency.exponentialRampToValueAtTime(640, now + duration * 0.42);
    filter.frequency.exponentialRampToValueAtTime(125, now + duration);

    gain.gain.setValueAtTime(0.0008, now);
    gain.gain.linearRampToValueAtTime(gainLevel, now + duration * 0.22);
    gain.gain.setValueAtTime(gainLevel * 0.82, now + duration * 0.72);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    sub.connect(gain);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(now);
    sub.start(now);
    osc.stop(now + duration + 0.02);
    sub.stop(now + duration + 0.02);
  },

  // 4. Cathedral Pipe Organ (Gated Reed + Principal Ranks, High-Passed Above Sub Mud)
  playOrgan(freqs: number[], dest: any, duration = 0.8, gainLevel = 0.16, when?: number, cutoff = 1250) {
    if (!this.ctx) return;
    const now = when ?? this.ctx.currentTime;
    const voiceGain = gainLevel / Math.max(1, Math.sqrt(freqs.length));

    freqs.forEach(freq => {
      const osc1 = this.ctx!.createOscillator();
      const osc2 = this.ctx!.createOscillator();
      const hp = this.ctx!.createBiquadFilter();
      const lp = this.ctx!.createBiquadFilter();
      const gain = this.ctx!.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sawtooth';

      osc1.frequency.setValueAtTime(freq, now);
      osc2.frequency.setValueAtTime(freq * 2, now);
      osc2.detune.setValueAtTime(4, now);

      hp.type = 'highpass';
      hp.frequency.setValueAtTime(135, now);

      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(cutoff, now);
      lp.Q.value = 1.6;

      gain.gain.setValueAtTime(0.0008, now);
      gain.gain.linearRampToValueAtTime(voiceGain, now + 0.025);
      gain.gain.setValueAtTime(voiceGain * 0.86, now + duration * 0.72);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc1.connect(hp);
      osc2.connect(hp);
      hp.connect(lp);
      lp.connect(gain);
      gain.connect(dest);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration + 0.02);
      osc2.stop(now + duration + 0.02);
    });
  },

  // 5. Dry Ossuary Bone-Click Percussion (Pooled Noise Buffer + High-Q Bandpass)
  playBoneClick(dest: any, gainLevel = 0.22, when?: number, centerFreq = 2500) {
    if (!this.ctx) return;
    const now = when ?? this.ctx.currentTime;
    if (!this.noiseBuffer) this.init();
    if (!this.noiseBuffer) return;

    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(centerFreq + (Math.random() - 0.5) * 420, now);
    bandpass.Q.value = 13;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(gainLevel, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.036);

    src.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(dest);

    const offset = Math.random() * 0.8;
    src.start(now, offset, 0.04);
  },

  // 6. Gothic Harpsichord / Spindled Gut Pluck (for The Weaver)
  playHarpsichord(freq: number, dest: any, duration = 0.65, gainLevel = 0.16, when?: number) {
    if (!this.ctx) return;
    const now = when ?? this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'square';
    osc1.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq * 2, now);
    osc2.detune.setValueAtTime(-6, now);

    filter.type = 'bandpass';
    filter.Q.value = 2.4;
    filter.frequency.setValueAtTime(Math.min(4200, freq * 5.5), now);
    filter.frequency.exponentialRampToValueAtTime(Math.max(260, freq * 1.4), now + duration * 0.75);

    const osc2Gain = this.ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.28, now);

    gain.gain.setValueAtTime(0.0008, now);
    gain.gain.linearRampToValueAtTime(gainLevel, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc1.connect(filter);
    osc2.connect(osc2Gain);
    osc2Gain.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration + 0.02);
    osc2.stop(now + duration + 0.02);
  },

  // 7. Resonant Sub-Bass Saw (Filtered Attack Spike)
  playBassSaw(freq: number, dest: any, duration = 0.26, gainLevel = 0.28, when?: number) {
    if (!this.ctx) return;
    const now = when ?? this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const sub = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    sub.type = 'sine';

    osc.frequency.setValueAtTime(freq, now);
    sub.frequency.setValueAtTime(freq * 0.5, now);

    filter.type = 'lowpass';
    filter.Q.value = 6.2;
    filter.frequency.setValueAtTime(860, now);
    filter.frequency.exponentialRampToValueAtTime(75, now + duration * 0.92);

    gain.gain.setValueAtTime(gainLevel, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    sub.connect(gain);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(now);
    sub.start(now);
    osc.stop(now + duration + 0.02);
    sub.stop(now + duration + 0.02);
  },

  // =========================================================================
  // 3. ACT BOSSES: THE GOTHIC TRIPTYCH
  // =========================================================================

  // 3A. THE ZEALOT — 76 BPM D Phrygian Liturgical Inquisition
  playTheZealot(fadeTime = 1.4) {
    this.transitionTo('boss-Zealot', (inst: TrackInstance) => {
      if (!this.ctx) return;
      const cathedralEcho = this.createEchoBus(inst, 0.42, 0.34, 920);
      const bellPan = this.createPanNode(cathedralEcho, 0.28);
      const staffPan = this.createPanNode(inst.bus, -0.24);

      // Lifted voicings (>146 Hz) so the D1/Eb1 pedal owns the sub register
      const liturgyChords: Record<number, number[]> = {
        0:  [146.83, 220.00, 293.66, 369.99], // D major / Phrygian Dominant
        8:  [155.56, 233.08, 311.13, 392.00], // Eb major (bII)
        16: [130.81, 196.00, 261.63, 311.13], // Cm (bvii)
        24: [146.83, 220.00, 261.63, 369.99], // D7(b9)
        32: [146.83, 220.00, 293.66, 369.99], // D
        40: [196.00, 233.08, 293.66, 392.00], // Gm (iv)
        48: [155.56, 233.08, 311.13, 369.99], // Eb(#9)
        56: [146.83, 220.00, 293.66, 369.99], // D resolve
      };

      const steepleBells: Record<number, number> = {
        0: 587.33,  // D5
        12: 622.25, // Eb5
        16: 523.25, // C5
        28: 466.16, // Bb4
        32: 739.99, // F#5
        44: 587.33, // D5
        48: 622.25, // Eb5
        56: 587.33, // D5
      };

      const pedalMap: Record<number, number> = {
        0: 73.42, 6: 73.42,
        8: 77.78, 14: 77.78,
        16: 65.41, 22: 65.41,
        24: 73.42, 30: 77.78,
        32: 73.42, 38: 73.42,
        40: 98.00, 46: 77.78,
        48: 77.78, 54: 73.42,
        56: 73.42,
      };

      // 76 BPM 8th notes (~0.3947s per step)
      this.scheduleLoop(inst, 0.3947, 64, (step: number, when: number) => {
        if (liturgyChords[step]) {
          this.playOrgan(liturgyChords[step], cathedralEcho, 2.7, 0.22, when, 1350);
        }
        if (steepleBells[step]) {
          this.playBell(steepleBells[step], bellPan, 2.4, 0.13, when);
        }
        if (pedalMap[step]) {
          this.playBassSaw(pedalMap[step], inst.bus, 0.95, 0.24, when);
        }
        // Heavy processional censor/staff thud on 1 & 3
        if (step % 8 === 0) {
          this.playImpact(54, inst.bus, 0.55, 0.36);
        } else if (step % 8 === 4) {
          this.playBoneClick(staffPan, 0.2, when, 2150);
        }
      });
    }, fadeTime);
  },

  // 3B. THE BEGOTTEN — 68 BPM Subterranean Ossuary & Formant Dirge
  playTheBegotten(fadeTime = 1.8) {
    this.transitionTo('boss-The Begotten', (inst: TrackInstance) => {
      if (!this.ctx) return;
      const cryptEcho = this.createEchoBus(inst, 0.48, 0.38, 620);
      const groanPan = this.createPanNode(cryptEcho, -0.22);
      const clickPan = this.createPanNode(inst.bus, 0.3);

      // Dissonant tritone & minor-second organ clusters
      const cryptClusters: Record<number, number[]> = {
        0:  [146.83, 207.65, 220.00], // D - G# - A
        16: [138.59, 196.00, 207.65], // C# - G - G#
        32: [146.83, 174.61, 207.65], // D - F - G# (dim)
        48: [116.54, 155.56, 207.65], // Bb - Eb - G#
      };

      const groans: Record<number, [number, number, number]> = {
        4:  [110.00, 73.42, 2.2],
        20: [98.00, 130.81, 2.0],
        36: [116.54, 69.30, 2.4],
        52: [87.31, 61.74, 2.2],
      };

      // 68 BPM 16th-note grid (~0.2206s) for limping, irregular marrow ticks
      this.scheduleLoop(inst, 0.2206, 64, (step: number, when: number) => {
        if (cryptClusters[step]) {
          this.playOrgan(cryptClusters[step], cryptEcho, 3.1, 0.2, when, 880);
        }
        if (groans[step]) {
          const [sFreq, eFreq, dur] = groans[step];
          this.playFleshGroan(sFreq, eFreq, groanPan, dur, 0.2, when);
        }
        if (step % 16 === 0) {
          this.playImpact(42, inst.bus, 0.75, 0.42);
          this.playBassSaw(36.71, inst.bus, 2.6, 0.28, when);
        }
        // Limping 3+3+2 ossuary bone ticks
        if (step % 8 === 0 || step % 8 === 3 || step % 8 === 6) {
          this.playBoneClick(clickPan, step % 8 === 0 ? 0.22 : 0.13, when, 1850);
        }
      });
    }, fadeTime);
  },

  // 3C. THE WEAVER — 108 BPM Spindled Gothic Harpsichord & Clockwork Ostinato
  playTheWeaver(fadeTime = 1.4) {
    this.transitionTo('boss-The Weaver', (inst: TrackInstance) => {
      if (!this.ctx) return;
      const parlorEcho = this.createEchoBus(inst, 0.28, 0.26, 1400);
      const arpPanL = this.createPanNode(parlorEcho, -0.32);
      const arpPanR = this.createPanNode(parlorEcho, 0.32);
      const needlePan = this.createPanNode(inst.bus, 0.18);

      // 32-step baroque harpsichord ostinato in D Harmonic Minor (Dm -> Gm6 -> A7(b9) -> Dm)
      const spindleArp: number[] = [
        293.66, 349.23, 440.00, 587.33, 523.25, 440.00, 349.23, 329.63,
        293.66, 392.00, 466.16, 587.33, 523.25, 466.16, 392.00, 349.23,
        277.18, 329.63, 440.00, 554.37, 587.33, 554.37, 440.00, 329.63,
        293.66, 440.00, 349.23, 587.33, 440.00, 329.63, 277.18, 220.00,
      ];

      const bassNotes: Record<number, number> = {
        0: 73.42, 4: 110.00,
        8: 98.00, 12: 116.54,
        16: 55.00, 20: 110.00,
        24: 73.42, 28: 69.30,
      };

      const upperBell: Record<number, number> = {
        0: 880.00,
        12: 932.33,
        16: 830.61,
        24: 1174.66,
      };

      // 108 BPM 16th notes (~0.1389s)
      this.scheduleLoop(inst, 0.1389, 32, (step: number, when: number) => {
        const note = spindleArp[step];
        const targetPan = step % 2 === 0 ? arpPanL : arpPanR;
        this.playHarpsichord(note, targetPan, 0.52, 0.15, when);

        if (bassNotes[step]) {
          this.playBassSaw(bassNotes[step], inst.bus, 0.42, 0.24, when);
        }
        if (upperBell[step]) {
          this.playBell(upperBell[step], parlorEcho, 1.4, 0.08, when);
        }
        // Crisp clockwork needle ticks & muted frame thud
        if (step % 8 === 0) {
          this.playImpact(64, inst.bus, 0.26, 0.26);
        } else if (step % 8 === 4) {
          this.playBoneClick(needlePan, 0.24, when, 3100);
        } else if (step % 2 === 1) {
          this.playBoneClick(needlePan, 0.07, when, 3600);
        }
      });
    }, fadeTime);
  },

  playBossTheme(type: 'Zealot' | 'The Begotten' | 'The Weaver', fadeTime = 1.4) {
    if (type === 'Zealot') return this.playTheZealot(fadeTime);
    if (type === 'The Begotten') return this.playTheBegotten(fadeTime);
    return this.playTheWeaver(fadeTime);
  },

  // =========================================================================
  // 4. THE BONE LORD: OSSUARY FUNERAL MARCH (56 BPM)
  // =========================================================================
  playFinalBoss(fadeTime = 2.0) {
    this.transitionTo('finalboss', (inst: TrackInstance) => {
      if (!this.ctx) return;
      const organEcho = this.createEchoBus(inst, 0.46, 0.36, 720);
      const bellPan = this.createPanNode(organEcho, -0.25);
      const bonePan = this.createPanNode(inst.bus, 0.26);

      // Lifted >=146 Hz so D1 (36.71 Hz) sub pedal breathes cleanly
      const funeralChords: Record<number, number[]> = {
        0:  [146.83, 220.00, 293.66, 349.23], // Dm
        8:  [116.54, 174.61, 233.08, 293.66], // Bb
        16: [196.00, 233.08, 293.66, 392.00], // Gm
        24: [138.59, 220.00, 277.18, 329.63], // A7/C#
      };

      const leadBells: Record<number, number> = {
        4:  587.33, // D5
        12: 698.46, // F5
        20: 659.25, // E5
        28: 554.37, // C#5
      };

      // 56 BPM 8th notes (~0.2679s)
      this.scheduleLoop(inst, 0.2679, 32, (step: number, when: number) => {
        if (step % 8 === 0) {
          this.playImpact(44, inst.bus, 0.72, 0.46);
          this.playBassSaw(36.71, inst.bus, 1.9, 0.32, when);
        }
        if (funeralChords[step]) {
          this.playOrgan(funeralChords[step], organEcho, 1.85, 0.24, when, 1150);
        }
        if (leadBells[step]) {
          this.playBell(leadBells[step], bellPan, 2.2, 0.14, when);
        }
        if (step % 2 === 0) {
          this.playBoneClick(bonePan, step % 4 === 0 ? 0.18 : 0.11, when, 2350);
        }
      });
    }, fadeTime);
  },

  // =========================================================================
  // 5. PHASE 3: THE BLOOD MOON (132 BPM Gothic Pipe Toccata)
  // =========================================================================
  playFinalBossPhase3(fadeTime = 0.6) {
    this.transitionTo('bloodmoon-phase3', (inst: TrackInstance) => {
      if (!this.ctx) return;
      const organEcho = this.createEchoBus(inst, 0.22, 0.28, 980);
      const manualL = this.createPanNode(organEcho, -0.3);
      const manualR = this.createPanNode(organEcho, 0.3);

      const organRun: number[] = [
        293.66, 349.23, 440.00, 587.33, 554.37, 440.00, 349.23, 293.66,
        233.08, 293.66, 349.23, 466.16, 440.00, 349.23, 293.66, 233.08,
        277.18, 329.63, 415.30, 554.37, 587.33, 440.00, 349.23, 277.18,
        293.66, 220.00, 174.61, 146.83, 138.59, 146.83, 174.61, 220.00,
      ];

      // Full-register chord drops lifted out of sub range
      const organWalls: Record<number, number[]> = {
        0:  [146.83, 220.00, 293.66, 349.23], // Dm
        8:  [116.54, 174.61, 233.08, 293.66], // Bb
        16: [138.59, 174.61, 207.65, 277.18], // C#dim
        24: [110.00, 164.81, 220.00, 277.18], // A7
      };

      const bassDrive: number[] = [
        73.42, 73.42, 146.83, 73.42, 73.42, 73.42, 146.83, 73.42,
        58.27, 58.27, 116.54, 58.27, 58.27, 58.27, 116.54, 58.27,
        69.30, 69.30, 138.59, 69.30, 69.30, 69.30, 138.59, 69.30,
        55.00, 55.00, 110.00, 55.00, 55.00, 55.00, 110.00, 55.00,
      ];

      // 132 BPM 16th notes (~0.1136s)
      this.scheduleLoop(inst, 0.1136, 32, (step: number, when: number) => {
        if (step % 4 === 0) {
          this.playImpact(46, inst.bus, 0.34, 0.44);
        }
        if (step % 8 === 4) {
          this.playBoneClick(inst.bus, 0.34, when, 2600);
          this.playImpact(58, inst.bus, 0.2, 0.26);
        }
        this.playBassSaw(bassDrive[step], inst.bus, 0.095, 0.26, when);

        const pipeNote = organRun[step];
        const manualBus = step % 2 === 0 ? manualL : manualR;
        this.playOrgan([pipeNote], manualBus, 0.13, 0.19, when, 1650);

        if (organWalls[step]) {
          this.playOrgan(organWalls[step], inst.bus, 0.82, 0.24, when, 1300);
        }
      });
    }, fadeTime);
  }
};

const chiptuneAudio = ChiptuneAudio;

// Chiptune-Native Web Audio SFX Engine (Matched to Score Architecture)
export const playSound = (type: 'draw' | 'sacrifice' | 'play' | 'hit' | 'bell' | 'bone' | 'defeat' | 'victory' | 'armor') => {
  try {
    const sfxMult = typeof ChiptuneAudio.sfxVolume === 'number' ? ChiptuneAudio.sfxVolume : 0.6;
    if (sfxMult <= 0) return;

    if (!ChiptuneAudio.ctx) ChiptuneAudio.init();
    const ctx: AudioContext | null = ChiptuneAudio.ctx;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    const jitter = 0.96 + Math.random() * 0.08;

    const chipTone = (
      wave: OscillatorType,
      freqStart: number,
      freqEnd: number,
      dur: number,
      vol: number,
      delay = 0,
      stepped = false
    ) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = wave;

      if (stepped) {
        osc.frequency.setValueAtTime(freqStart, now + delay);
        osc.frequency.setValueAtTime((freqStart + freqEnd) * 0.5, now + delay + dur * 0.35);
        osc.frequency.setValueAtTime(freqEnd, now + delay + dur * 0.7);
      } else {
        osc.frequency.setValueAtTime(freqStart, now + delay);
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), now + delay + dur);
      }

      gain.gain.setValueAtTime(0.0008, now + delay);
      gain.gain.linearRampToValueAtTime(vol * sfxMult, now + delay + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + dur + 0.01);
    };

    const chipNoise = (
      dur: number,
      centerFreq: number,
      q: number,
      vol: number,
      delay = 0
    ) => {
      if (!ChiptuneAudio.noiseBuffer) ChiptuneAudio.init();
      const buf = ChiptuneAudio.noiseBuffer;
      if (!buf) return;
      const srcNode = ctx.createBufferSource();
      srcNode.buffer = buf;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(centerFreq, now + delay);
      filter.Q.setValueAtTime(q, now + delay);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(vol * sfxMult, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);

      srcNode.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      srcNode.start(now + delay, Math.random() * 0.6, dur + 0.01);
    };

    if (type === 'draw') {
      chipTone('triangle', 330 * jitter, 520 * jitter, 0.085, 0.16);
      chipNoise(0.022, 3200 * jitter, 4.0, 0.07);
    } else if (type === 'play') {
      chipTone('square', 210 * jitter, 88 * jitter, 0.11, 0.14);
      chipTone('triangle', 140 * jitter, 52 * jitter, 0.13, 0.22);
      chipNoise(0.025, 1600 * jitter, 3.0, 0.09);
    } else if (type === 'sacrifice') {
      chipTone('sawtooth', 165 * jitter, 54 * jitter, 0.22, 0.22);
      chipNoise(0.06, 2200 * jitter, 2.5, 0.11);
    } else if (type === 'hit') {
      chipTone('square', 115 * jitter, 36 * jitter, 0.15, 0.24);
      chipNoise(0.055, 950 * jitter, 2.0, 0.15);
    } else if (type === 'armor') {
      chipTone('square', 1046.5 * jitter, 784.0 * jitter, 0.14, 0.14, 0, true);
      chipTone('triangle', 1568.0 * jitter, 1174.7 * jitter, 0.18, 0.18);
    } else if (type === 'bone') {
      chipTone('triangle', 587.33 * jitter, 659.25 * jitter, 0.045, 0.18, 0);
      chipTone('triangle', 880.0 * jitter, 987.77 * jitter, 0.06, 0.16, 0.038);
    } else if (type === 'bell') {
      chipTone('sine', 880, 872, 0.52, 0.2);
      chipTone('triangle', 1760, 1748, 0.3, 0.08);
    } else if (type === 'victory') {
      chipTone('square', 293.66, 293.66, 0.13, 0.14, 0.0);
      chipTone('square', 349.23, 349.23, 0.13, 0.14, 0.11);
      chipTone('square', 440.00, 440.00, 0.14, 0.15, 0.22);
      chipTone('triangle', 587.33, 587.33, 0.45, 0.22, 0.33);
    } else if (type === 'defeat') {
      chipTone('sawtooth', 146.83, 110.00, 0.24, 0.18, 0.0);
      chipTone('sawtooth', 110.00, 55.00, 0.55, 0.2, 0.22);
    }
  } catch {
    // Audio context may require user gesture
  }
};

// Universal audio reference bridge
export const getAudioEngine = () => {
  try {
    if (typeof chiptuneAudio !== 'undefined') return chiptuneAudio;
    if (typeof (window as any).chiptuneAudio !== 'undefined') return (window as any).chiptuneAudio;
  } catch {}
  return null;
};
