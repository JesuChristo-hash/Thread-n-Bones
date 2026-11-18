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

  init() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && !this.musicGain) {
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
        this.musicGain.connect(this.ctx.destination);
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch {}
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
    this.init();
    if (!this.ctx || this.sfxVolume <= 0) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587.33, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.09);
    gain.gain.setValueAtTime(0.25 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
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

  // 2. Sanctuary Bronze Bell via FM Synthesis (for The Zealot)
  playBell(freq: number, dest: any, duration = 2.6, gainLevel = 0.16) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const carrier = this.ctx.createOscillator();
    const modulator = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const mainGain = this.ctx.createGain();

    carrier.type = 'sine';
    modulator.type = 'sine';
    carrier.frequency.setValueAtTime(freq, now);
    modulator.frequency.setValueAtTime(freq * 2.756, now);

    modGain.gain.setValueAtTime(freq * 1.8, now);
    modGain.gain.exponentialRampToValueAtTime(0.01, now + duration * 0.65);

    mainGain.gain.setValueAtTime(0.001, now);
    mainGain.gain.linearRampToValueAtTime(gainLevel, now + 0.01);
    mainGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    modulator.connect(modGain);
    modGain.connect(carrier.frequency);
    carrier.connect(mainGain);
    mainGain.connect(dest);

    carrier.start(now);
    modulator.start(now);
    carrier.stop(now + duration);
    modulator.stop(now + duration);
  },

  // 3. Pitch-Gliding Biological Synth Groan (for The Begotten)
  playFleshGroan(startFreq: number, endFreq: number, dest: any, duration = 1.6, gainLevel = 0.22) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

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

    filter.type = 'lowpass';
    filter.Q.value = 6.5;
    filter.frequency.setValueAtTime(180, now);
    filter.frequency.exponentialRampToValueAtTime(680, now + duration * 0.45);
    filter.frequency.exponentialRampToValueAtTime(110, now + duration);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(gainLevel, now + duration * 0.25);
    gain.gain.setValueAtTime(gainLevel * 0.8, now + duration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    sub.connect(gain);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(now);
    sub.start(now);
    osc.stop(now + duration);
    sub.stop(now + duration);
  },

  // 4. Church Pipe Organ Voice (Gated Additive Harmonics)
  playOrgan(freqs: number[], dest: any, duration = 0.8, gainLevel = 0.16) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const voiceGain = gainLevel / Math.max(1, Math.sqrt(freqs.length));

    freqs.forEach(freq => {
      const osc1 = this.ctx!.createOscillator();
      const osc2 = this.ctx!.createOscillator();
      const filter = this.ctx!.createBiquadFilter();
      const gain = this.ctx!.createGain();

      osc1.type = 'triangle'; // Pure fundamental
      osc2.type = 'sawtooth'; // Reed edge

      osc1.frequency.setValueAtTime(freq, now);
      osc2.frequency.setValueAtTime(freq * 2, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1100, now);
      filter.Q.value = 1.8;

      // Tight gate: quick attack, clean sustain, rapid release before next step
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(voiceGain, now + 0.03);
      gain.gain.setValueAtTime(voiceGain * 0.85, now + duration * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);
    });
  },

  // 5. Dry Bone-Click Percussion (Resonant High-Q White Noise Chasm)
  playBoneClick(dest: any, gainLevel = 0.22) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.04);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(2400 + Math.random() * 800, now);
    bandpass.Q.value = 14;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(gainLevel, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);

    whiteNoise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(dest);

    whiteNoise.start(now);
    whiteNoise.stop(now + 0.04);
  },

  // 6. Resonant Acid Bass Saw (Filtered Attack Spike)
  playBassSaw(freq: number, dest: any, duration = 0.26, gainLevel = 0.28) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const sub = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    sub.type = 'sine';

    osc.frequency.setValueAtTime(freq, now);
    sub.frequency.setValueAtTime(freq * 0.5, now);

    filter.type = 'lowpass';
    filter.Q.value = 7.0;
    filter.frequency.setValueAtTime(950, now);
    filter.frequency.exponentialRampToValueAtTime(80, now + duration * 0.95);

    gain.gain.setValueAtTime(gainLevel, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    sub.connect(gain);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(now);
    sub.start(now);
    osc.stop(now + duration);
    sub.stop(now + duration);
  },

  // =========================================================================
  // 3. ACT BOSSES: THE TRIPTYCH (Chamber Combat: Groove -> Rise -> Bridge)
  // =========================================================================
  playBossTheme(type: 'Zealot' | 'The Begotten' | 'The Weaver', fadeTime = 1.4) {
    this.transitionTo(`boss-${type}`, (inst: any) => {
      if (!this.ctx) return;
      const pianoEcho = this.createEchoBus(inst, 0.38, 0.28, 850);

      // Acoustic Upright Piano Progression
      const chords: Record<number, number[]> = {
        // --- 1. Groove (Steps 0–31) ---
        0:  [73.42, 110.00, 146.83, 174.61], // Dm
        6:  [73.42, 164.81],                 // Dm9 push
        8:  [87.31, 130.81, 174.61, 220.00], // F
        14: [87.31, 174.61, 220.00],
        16: [58.27, 116.54, 146.83, 174.61], // Bb
        22: [58.27, 130.81, 164.81],
        24: [55.00, 110.00, 138.59, 196.00], // A7
        28: [55.00, 110.00, 146.83, 207.65], // A7(b5) turnaround

        // --- 2. The Rising Climb (Steps 32–47) ---
        32: [73.42, 110.00, 146.83, 174.61], // Dm
        36: [82.41, 123.47, 164.81, 196.00], // Edim
        40: [87.31, 130.81, 174.61, 220.00], // F
        44: [98.00, 146.83, 174.61, 220.00], // Gm
        46: [103.83, 146.83, 174.61, 207.65],// G#dim7 apex

        // --- 3. The Bridge & Turnaround (Steps 48–63) ---
        48: [58.27, 116.54, 174.61, 220.00], // Bbmaj7
        52: [49.00, 98.00, 146.83, 220.00],  // Gm9
        56: [55.00, 110.00, 164.81, 220.00], // A7sus4
        58: [55.00, 110.00, 138.59, 220.00]  // A7 resolve
      };

      // Weeping Melodic Lead (Plucked parlor strings)
      const topMelody: Record<number, number> = {
        // Groove phrases
        2:  293.66, 4:  349.23, 10: 440.00, 12: 392.00,
        18: 349.23, 20: 329.63, 26: 293.66, 30: 277.18,

        // The Climbing Escalation
        34: 293.66, 36: 329.63, 38: 349.23, 40: 392.00,
        42: 415.30, 44: 440.00, 46: 466.16,

        // The Falling Bridge
        48: 587.33, 50: 523.25, 52: 466.16, 54: 440.00,
        56: 392.00, 58: 349.23, 59: 277.18
      };

      // 64-step Warm Acoustic Bassline
      const bassline: (number | null)[] = [
        // Groove
        73.42, null, 73.42, null, 87.31, null, 73.42, 82.41,
        87.31, null, 87.31, 110.00, null, 87.31, 65.41, null,
        58.27, null, 58.27, null, 65.41, null, 58.27, 69.30,
        55.00, null, 55.00, 82.41, null, 73.42, 69.30, 61.74,

        // Ascent
        73.42, null, 82.41, null, 87.31, null, 98.00, null,
        103.83, null, 110.00, null, 116.54, null, 138.59, null,

        // Bridge & Drop
        58.27, null, 58.27, null, 49.00, null, 49.00, null,
        55.00, null, 55.00, null, null, null, null, null
      ];

      let step = 0;
      const interval = setInterval(() => {
        if (!this.ctx) return;

        // Upright Piano Chords
        if (chords[step]) {
          const chordDur = step >= 48 ? 2.6 : 2.0;
          this.playSynthPiano(chords[step], pianoEcho, chordDur, 0.24);
        }

        // Plucked Lead
        if (topMelody[step]) {
          this.playPluck(topMelody[step], pianoEcho, 1.4, 0.11);
        }

        // --- Cabin Percussion ---
        if (step < 60) {
          // Primary wood impact on beats 1 and 5
          if (step % 8 === 0) {
            this.playImpact(88, inst.bus, 0.42, 0.36);
          } else if (step % 8 === 3 && (step > 31 || step % 16 === 11)) {
            this.playImpact(72, inst.bus, 0.28, 0.22);
          }

          // Backbeat floor strike and brush hit on beat 3
          if (step % 8 === 4) {
            this.playImpact(68, inst.bus, 0.22, 0.2);
            this.playBrushHit(inst.bus, 0.16, 850, 0.1);
          } else if (step % 2 === 1) {
            // Shuffling room brush ticks
            this.playBrushHit(inst.bus, 0.05, 2400, step % 4 === 3 ? 0.035 : 0.018);
          }

          // Offbeat bone tick adding tension during the climb
          if (step >= 32 && step < 48 && step % 2 === 0) {
            this.playBoneClick(inst.bus, 0.16);
          }
        }
        // Steps 60–63: Total percussion silence for the drop

        // --- Triangle-Wave Acoustic Bass ---
        const note = bassline[step];
        if (note) {
          const osc = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          const gain = this.ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(note, this.ctx.currentTime);
          filter.type = 'lowpass';
          filter.frequency.value = 240;

          gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.32);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(inst.bus);

          osc.start();
          osc.stop(this.ctx.currentTime + 0.32);
        }

        step = (step + 1) % 64;
      }, 240); // 240ms step interval

      inst.timers.push(interval);
    }, fadeTime);
  },

  playTheWeaver(fadeTime = 1.4) {
    this.playBossTheme('The Weaver', fadeTime);
  },

  playTheZealot(fadeTime = 1.4) {
    this.playBossTheme('Zealot', fadeTime);
  },

  playTheBegotten(fadeTime = 1.8) {
    this.playBossTheme('The Begotten', fadeTime);
  },

  // =========================================================================
  // 4. THE BONE LORD: DOOM DIRGE (58 BPM Sparse Cathedral Funeral March)
  // =========================================================================
  playFinalBoss(fadeTime = 2.0) {
    this.transitionTo('finalboss', (inst: any) => {
      if (!this.ctx) return;
      const organEcho = this.createEchoBus(inst, 0.45, 0.35, 650);

      // Slow, breathing chord progression (4 beats per chord: Dm -> Bb -> Gm -> A)
      const funeralChords: Record<number, number[]> = {
        0:  [73.42, 110.00, 146.83, 174.61], // Dm
        8:  [58.27, 116.54, 146.83, 174.61], // Bb
        16: [49.00, 98.00, 146.83, 196.00],  // Gm
        24: [55.00, 110.00, 138.59, 220.00]  // A
      };

      // Sparse, weeping organ lead notes (spaced out, not noodling)
      const leadNotes: Record<number, number> = {
        4:  293.66, // D4
        12: 349.23, // F4
        20: 329.63, // E4
        28: 277.18  // C#4
      };

      let step = 0;
      const stepDuration = 0.258; // 58 BPM 8th notes
      const interval = setInterval(() => {
        if (!this.ctx) return;

        // Sub-bass bell impact on downbeats
        if (step % 8 === 0) {
          this.playImpact(45, inst.bus, 0.7, 0.5);
          this.playBassSaw(36.71, inst.bus, 1.8, 0.35); // Low D pedal
        }

        // Gated liturgical chords with breathing room between changes
        if (funeralChords[step]) {
          this.playOrgan(funeralChords[step], organEcho, 1.6, 0.28);
        }

        // Single solemn church bell / pluck
        if (leadNotes[step]) {
          this.playPluck(leadNotes[step], organEcho, 1.5, 0.2);
        }

        // Metronomic ticking bone click on the offbeats
        if (step % 2 === 0) {
          this.playBoneClick(inst.bus, 0.16);
        }

        step = (step + 1) % 32;
      }, stepDuration * 1000);

      inst.timers.push(interval);
    }, fadeTime);
  },

  // =========================================================================
  // 5. PHASE 3: THE BLOOD MOON (132 BPM Gothic Pipe Toccata & Industrial Pulse)
  // =========================================================================
  playFinalBossPhase3(fadeTime = 0.6) {
    this.transitionTo('bloodmoon-phase3', (inst: any) => {
      if (!this.ctx) return;
      const organEcho = this.createEchoBus(inst, 0.22, 0.3, 900);

      // Relentless Baroque Pipe Run (Dm -> Bb -> C#dim -> Dm)
      const organRun: number[] = [
        293.66, 349.23, 440.00, 587.33, 554.37, 440.00, 349.23, 293.66,
        233.08, 293.66, 349.23, 466.16, 440.00, 349.23, 293.66, 233.08,
        277.18, 329.63, 415.30, 554.37, 587.33, 440.00, 349.23, 277.18,
        293.66, 220.00, 174.61, 146.83, 138.59, 146.83, 174.61, 220.00
      ];

      // Crushing full-register organ chords hitting every 8 steps
      const organWalls: Record<number, number[]> = {
        0:  [73.42, 146.83, 220.00, 293.66], // Dm
        8:  [58.27, 116.54, 174.61, 233.08], // Bb
        16: [69.30, 138.59, 174.61, 277.18], // C#dim
        24: [55.00, 110.00, 164.81, 220.00]  // A7
      };

      // Driving 16th-note saw bass
      const bassDrive: number[] = [
        73.42, 73.42, 146.83, 73.42, 73.42, 73.42, 146.83, 73.42,
        58.27, 58.27, 116.54, 58.27, 58.27, 58.27, 116.54, 58.27,
        69.30, 69.30, 138.59, 69.30, 69.30, 69.30, 138.59, 69.30,
        55.00, 55.00, 110.00, 55.00, 55.00, 55.00, 110.00, 55.00
      ];

      let step = 0;
      const stepDuration = 0.114; // ~132 BPM 16th notes
      const interval = setInterval(() => {
        if (!this.ctx) return;

        // Heavy industrial sub kick (45Hz thud, zero bongo tone)
        if (step % 4 === 0) {
          this.playImpact(48, inst.bus, 0.35, 0.46);
        }

        // Heavy bone crack snare on 4 and 12
        if (step % 8 === 4) {
          this.playBoneClick(inst.bus, 0.38);
          this.playImpact(58, inst.bus, 0.22, 0.28);
        }

        // Relentless bassline
        this.playBassSaw(bassDrive[step % bassDrive.length], inst.bus, 0.1, 0.3);

        // Continuous high pipe manual runs
        const pipeNote = organRun[step % organRun.length];
        this.playOrgan([pipeNote], organEcho, 0.14, 0.22);

        // Massive cathedral chord drops on the measure boundaries
        if (organWalls[step % 32]) {
          this.playOrgan(organWalls[step % 32], inst.bus, 0.85, 0.28);
        }

        step = (step + 1) % 32;
      }, stepDuration * 1000);

      inst.timers.push(interval);
    }, fadeTime);
  }
};

const chiptuneAudio = ChiptuneAudio;

// Built-in Web Audio API sound generator for game events
export const playSound = (type: 'draw' | 'sacrifice' | 'play' | 'hit' | 'bell' | 'bone' | 'defeat' | 'victory' | 'armor') => {
  try {
    const sfxMult = typeof ChiptuneAudio.sfxVolume === 'number' ? ChiptuneAudio.sfxVolume : 0.6;
    if (sfxMult <= 0) return;

    let ctx = ChiptuneAudio.ctx;
    if (!ctx) {
      ChiptuneAudio.init();
      ctx = ChiptuneAudio.ctx;
    }
    if (!ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AudioCtx();
    }
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'draw') {
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.1);
      gain.gain.setValueAtTime(0.12 * sfxMult, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'sacrifice') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.22);
      gain.gain.setValueAtTime(0.25 * sfxMult, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'play') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);
      gain.gain.setValueAtTime(0.18 * sfxMult, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'hit') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(95, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.15);
      gain.gain.setValueAtTime(0.28 * sfxMult, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'bone') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(560, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);
      gain.gain.setValueAtTime(0.15 * sfxMult, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'bell') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.5);
      gain.gain.setValueAtTime(0.2 * sfxMult, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'victory') {
      osc.frequency.setValueAtTime(330, now);
      osc.frequency.setValueAtTime(440, now + 0.15);
      osc.frequency.setValueAtTime(660, now + 0.3);
      gain.gain.setValueAtTime(0.2 * sfxMult, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'defeat') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.7);
      gain.gain.setValueAtTime(0.25 * sfxMult, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc.start(now);
      osc.stop(now + 0.7);
    } else if (type === 'armor') {
        // High-frequency metallic iron clang / deflection ring
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1150, now);
        osc.frequency.exponentialRampToValueAtTime(380, now + 0.18);
        gain.gain.setValueAtTime(0.35 * sfxMult, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
    }
  } catch {
    // Audio context may require user gesture
  }
};

// Universal audio reference bridge
export const getAudioEngine = () => {
  try {
    if (typeof ChiptuneAudio !== 'undefined') return ChiptuneAudio;
    if (typeof chiptuneAudio !== 'undefined') return chiptuneAudio;
    if (typeof (window as any).ChiptuneAudio !== 'undefined') return (window as any).ChiptuneAudio;
    if (typeof (window as any).chiptuneAudio !== 'undefined') return (window as any).chiptuneAudio;
  } catch (_) {}
  return null;
};
