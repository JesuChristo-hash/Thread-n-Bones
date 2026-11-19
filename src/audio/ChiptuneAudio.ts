// Procedural Web Audio API Engine for Sacrificial Scales
// Architecture: Dark-Ambient Analog Tape / Haunted Music Box + Dry Tabletop Foley

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
  stopAll?: (fadeTime?: number) => void;
  playSynthPiano: (freqs: number[], bus: AudioNode, duration?: number, gainLevel?: number, when?: number) => void;
  playStrings: (chordFreqs: number[], bus: AudioNode, duration?: number, gainLevel?: number, when?: number) => void;
  playPluck: (freq: number, bus: AudioNode, duration?: number, gainLevel?: number, when?: number) => void;
  playMusicBox: (freq: number, bus: AudioNode, duration?: number, gainLevel?: number, when?: number) => void;
  playImpact: (pitch: number, bus: AudioNode, decay?: number, gainLevel?: number, when?: number) => void;
  playSwell: (freq: number, dest: AudioNode, duration?: number, gainLevel?: number, when?: number) => void;
  playOrgan: (freqs: number[], bus: AudioNode, duration?: number, gainLevel?: number, when?: number, cutoff?: number) => void;
  playBoneClick: (dest: AudioNode, gainLevel?: number, when?: number, centerFreq?: number) => void;
  playBell: (freq: number, bus: AudioNode, duration?: number, gainLevel?: number, when?: number) => void;
  playFleshGroan: (startFreq: number, endFreq: number, bus: AudioNode, duration?: number, gainLevel?: number, when?: number) => void;
  playFlute: (freq: number, bus: AudioNode, duration?: number, gainLevel?: number, when?: number) => void;
  playAmbient: (fadeTime?: number) => void;
  playCabin: (fadeTime?: number) => void;
  playBattle: (fadeTime?: number) => void;
  playBoss: (fadeTime?: number) => void;
  playTheWeaver: (fadeTime?: number) => void;
  playTheZealot: (fadeTime?: number) => void;
  playTheBegotten: (fadeTime?: number) => void;
  playFinalBoss: (fadeTime?: number) => void;
  playFinalBossPhase3: (fadeTime?: number) => void;
}

export const ChiptuneAudio: any = {
  ctx: null as AudioContext | null,
  currentTrack: null as string | null,
  activeInstance: null as TrackInstance | null,
  musicVolume: 0.3,
  sfxVolume: 0.6,
  musicGain: null as GainNode | null,
  musicToneFilter: null as BiquadFilterNode | null,
  musicCompressor: null as DynamicsCompressorNode | null,
  reverbNode: null as ConvolverNode | null,
  reverbWetGain: null as GainNode | null,
  sfxBus: null as GainNode | null,
  noiseBuffer: null as AudioBuffer | null,
  whiteNoiseBuffer: null as AudioBuffer | null,
  liveInstances: new Set<TrackInstance>(), 

  init() {
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && !this.musicGain) {
        const now = this.ctx.currentTime;
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(this.musicVolume, now);

        // Warm analog tape roll-off so upper partials never get piercing or brittle
        const tone = this.ctx.createBiquadFilter();
        tone.type = 'lowpass';
        tone.frequency.setValueAtTime(4600, now);
        tone.Q.setValueAtTime(0.6, now);

        const comp = this.ctx.createDynamicsCompressor();
        comp.threshold.setValueAtTime(-18, now);
        comp.knee.setValueAtTime(14, now);
        comp.ratio.setValueAtTime(3.8, now);
        comp.attack.setValueAtTime(0.006, now);
        comp.release.setValueAtTime(0.22, now);

        // Shared dark-hall stereo convolution reverb for music space
        const reverb = this.ctx.createConvolver();
        reverb.buffer = this.buildDarkHallImpulse(2.6);
        const reverbWet = this.ctx.createGain();
        reverbWet.gain.setValueAtTime(0.36, now);

        this.musicGain.connect(tone);
        tone.connect(comp);
        tone.connect(reverb);
        reverb.connect(reverbWet);
        reverbWet.connect(comp);
        comp.connect(this.ctx.destination);

        this.musicToneFilter = tone;
        this.musicCompressor = comp;
        this.reverbNode = reverb;
        this.reverbWetGain = reverbWet;
      }
      if (this.ctx && !this.sfxBus) {
        const now = this.ctx.currentTime;
        const sfxIn = this.ctx.createGain();
        sfxIn.gain.setValueAtTime(1.35, now);

        // Warm analog soft-clipper adds midrange density & perceived punch without harshness
        const shaper = this.ctx.createWaveShaper();
        const curve = new Float32Array(1024);
        for (let i = 0; i < 1024; i++) {
          const x = (i * 2) / 1024 - 1;
          curve[i] = Math.tanh(x * 1.75) / Math.tanh(1.75);
        }
        shaper.curve = curve;
        shaper.oversample = '2x';

        const limiter = this.ctx.createDynamicsCompressor();
        limiter.threshold.setValueAtTime(-6, now);
        limiter.knee.setValueAtTime(6, now);
        limiter.ratio.setValueAtTime(8, now);
        limiter.attack.setValueAtTime(0.002, now);
        limiter.release.setValueAtTime(0.09, now);

        sfxIn.connect(shaper);
        shaper.connect(limiter);
        limiter.connect(this.ctx.destination);
        this.sfxBus = sfxIn;
      }
      if (this.ctx && !this.noiseBuffer) {
        const len = Math.floor(this.ctx.sampleRate * 1.2);
        const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        let last = 0;
        for (let i = 0; i < len; i++) {
          const white = Math.random() * 2 - 1;
          last = (last + 0.14 * white) / 1.14;
          data[i] = Math.max(-1, Math.min(1, last * 2.6));
        }
        this.noiseBuffer = buf;
      }
      if (this.ctx && !this.whiteNoiseBuffer) {
        const len = Math.floor(this.ctx.sampleRate * 0.6);
        const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        this.whiteNoiseBuffer = buf;
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch {}
  },

  buildDarkHallImpulse(seconds = 2.6): AudioBuffer {
    const ctx = this.ctx!;
    const sr = ctx.sampleRate;
    const length = Math.floor(sr * seconds);
    const impulse = ctx.createBuffer(2, length, sr);

    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      let lp = 0;
      for (let i = 0; i < length; i++) {
        const t = i / length;
        const decay = Math.pow(1 - t, 3.1);
        const raw = (Math.random() * 2 - 1) * decay;
        // 1-pole low-pass inside IR so reverb tail stays dark and velvety
        lp = lp + 0.16 * (raw - lp);
        data[i] = lp * 1.8;
      }
    }
    return impulse;
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
    this.sfxVolume = Math.max(0, Math.min(1, val));
  },

  playSfxPreview() {
    playSound('bone');
  },

  createPanNode(dest: AudioNode, pan = 0): AudioNode {
    if (!this.ctx || pan === 0 || typeof this.ctx.createStereoPanner !== 'function') return dest;
    const panner = this.ctx.createStereoPanner();
    panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), this.ctx.currentTime);
    panner.connect(dest);
    return panner;
  },

  createEchoBus(inst: TrackInstance, delayTime = 0.42, feedbackAmt = 0.34, filterCutoff = 1100): AudioNode {
    if (!this.ctx) return inst.bus;
    const input = this.ctx.createGain();
    const delayL = this.ctx.createDelay();
    const delayR = this.ctx.createDelay();
    const feedback = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    delayL.delayTime.value = delayTime;
    delayR.delayTime.value = delayTime * 1.33; // Subtle stereo tape offset
    feedback.gain.value = feedbackAmt;
    filter.type = 'lowpass';
    filter.frequency.value = filterCutoff;

    const panL = this.createPanNode(inst.bus, -0.45);
    const panR = this.createPanNode(inst.bus, 0.45);

    input.connect(inst.bus);
    input.connect(delayL);
    delayL.connect(filter);
    filter.connect(panL);
    filter.connect(delayR);
    delayR.connect(panR);
    delayR.connect(feedback);
    feedback.connect(delayL);

    inst.nodes.push(input, delayL, delayR, feedback, filter);
    return input;
  },

  scheduleLoop(
    inst: TrackInstance,
    stepSec: number,
    totalSteps: number,
    onStep: (step: number, when: number) => void
  ) {
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

  fadeOutInstance(old: TrackInstance, fadeOutSec: number) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // Halt all scheduled timers immediately so fading tracks cannot spawn new chimes/swells
    old.timers.forEach((t) => {
      clearInterval(t as unknown as number);
      clearTimeout(t as unknown as number);
    });
    old.timers = [];

    try {
      old.bus.gain.cancelScheduledValues(now);
      old.bus.gain.setValueAtTime(Math.max(0.0001, old.bus.gain.value), now);
      old.bus.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.05, fadeOutSec));
    } catch {}

    setTimeout(() => {
      try { old.cleanup(); } catch {}
      this.liveInstances.delete(old);
    }, Math.max(50, fadeOutSec * 1000) + 40);
  },

  transitionTo(trackName: string, startFn: (inst: TrackInstance) => void, fadeTime = 1.4) {
    this.init();
    if (!this.ctx) return;
    if (this.currentTrack === trackName) return;

    const now = this.ctx.currentTime;
    const fadeOutSec = Math.min(fadeTime, 0.65);

    // Guarantee every prior instance is halted and cleaned up
    Array.from(this.liveInstances as Set<TrackInstance>).forEach((old) => {
      this.fadeOutInstance(old, fadeOutSec);
    });

    const bus = this.ctx.createGain();
    bus.gain.setValueAtTime(0.0001, now);
    bus.gain.linearRampToValueAtTime(1.0, now + fadeTime);
    bus.connect(this.musicGain || this.ctx.destination);

    const instance: TrackInstance = {
      name: trackName,
      bus,
      nodes: [],
      timers: [],
      cleanup() {
        this.timers.forEach((t) => {
          clearInterval(t as unknown as number);
          clearTimeout(t as unknown as number);
        });
        this.timers = [];
        this.nodes.forEach((n) => {
          try { if (n.stop) n.stop(); } catch {}
          try { n.disconnect(); } catch {}
        });
        this.nodes = [];
        try { this.bus.disconnect(); } catch {}
      },
    };

    this.liveInstances.add(instance);
    this.activeInstance = instance;
    this.currentTrack = trackName;
    startFn(instance);
  },

  stopAll(fadeTime = 0.5) {
    this.stop(fadeTime);
  },

  stop(fadeTime = 0.65) {
    if (!this.ctx) return;
    Array.from(this.liveInstances as Set<TrackInstance>).forEach((old) => {
      this.fadeOutInstance(old, fadeTime);
    });
    this.activeInstance = null;
    this.currentTrack = null;
  },

  // =========================================================================
  // INSTRUMENT VOICES (Dark Analog Tape / Haunted Music Box / Chamber Strings)
  // =========================================================================

  // 1. Haunted Celesta / Dusty Music Box (Pure Bell Partials + Subtle Tape Drift)
  playMusicBox(freq: number, dest: AudioNode, duration = 2.6, gainLevel = 0.13, when?: number) {
    if (!this.ctx) return;
    const now = when ?? this.ctx.currentTime;
    const tapeDetune = (Math.random() - 0.5) * 10; // +/- 5 cents dusty tape drift

    const body = this.ctx.createOscillator();
    const chime = this.ctx.createOscillator();
    const tine = this.ctx.createOscillator();
    const bodyGain = this.ctx.createGain();
    const chimeGain = this.ctx.createGain();
    const tineGain = this.ctx.createGain();
    const lp = this.ctx.createBiquadFilter();

    body.type = 'sine';
    chime.type = 'sine';
    tine.type = 'triangle';

    body.frequency.setValueAtTime(freq, now);
    body.detune.setValueAtTime(tapeDetune, now);
    // Subtle downward tape sag over the decay tail
    body.detune.linearRampToValueAtTime(tapeDetune - 6, now + duration);

    chime.frequency.setValueAtTime(freq * 2.003, now);
    tine.frequency.setValueAtTime(freq * 3.01, now);

    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(Math.min(3400, freq * 4.2), now);
    lp.frequency.exponentialRampToValueAtTime(Math.max(520, freq * 1.4), now + duration * 0.8);

    bodyGain.gain.setValueAtTime(0.0008, now);
    bodyGain.gain.linearRampToValueAtTime(gainLevel, now + 0.008);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    chimeGain.gain.setValueAtTime(0.0008, now);
    chimeGain.gain.linearRampToValueAtTime(gainLevel * 0.28, now + 0.005);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.45);

    tineGain.gain.setValueAtTime(0.0008, now);
    tineGain.gain.linearRampToValueAtTime(gainLevel * 0.14, now + 0.003);
    tineGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

    body.connect(bodyGain);
    chime.connect(chimeGain);
    tine.connect(tineGain);
    bodyGain.connect(lp);
    chimeGain.connect(lp);
    tineGain.connect(lp);
    lp.connect(dest);

    body.start(now);
    chime.start(now);
    tine.start(now);
    body.stop(now + duration + 0.02);
    chime.stop(now + duration * 0.5 + 0.02);
    tine.stop(now + 0.11);
  },

  // 2. Dark Felt Upright Piano (Warm Muted Hammer, High-Passed Above Sub Mud)
  playSynthPiano(freqs: number[], dest: AudioNode, duration = 2.0, gainLevel = 0.2, when?: number) {
    if (!this.ctx) return;
    const now = when ?? this.ctx.currentTime;
    const perVoice = gainLevel / Math.max(1, Math.sqrt(freqs.length));

    freqs.forEach((freq) => {
      if (!this.ctx) return;
      const oscSine = this.ctx.createOscillator();
      const oscTri = this.ctx.createOscillator();
      const hp = this.ctx.createBiquadFilter();
      const lp = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      oscSine.type = 'sine';
      oscTri.type = 'triangle';
      const drift = (Math.random() - 0.5) * 7;
      oscSine.frequency.setValueAtTime(freq, now);
      oscTri.frequency.setValueAtTime(freq, now);
      oscSine.detune.setValueAtTime(drift, now);
      oscTri.detune.setValueAtTime(drift + 3, now);

      hp.type = 'highpass';
      hp.frequency.setValueAtTime(125, now);

      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(980, now);
      lp.frequency.exponentialRampToValueAtTime(260, now + duration);

      gain.gain.setValueAtTime(0.0008, now);
      gain.gain.linearRampToValueAtTime(perVoice, now + 0.018);
      gain.gain.exponentialRampToValueAtTime(perVoice * 0.35, now + 0.38);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      oscSine.connect(hp);
      oscTri.connect(hp);
      hp.connect(lp);
      lp.connect(gain);
      gain.connect(dest);

      oscSine.start(now);
      oscTri.start(now);
      oscSine.stop(now + duration + 0.02);
      oscTri.stop(now + duration + 0.02);
    });
  },

  // 3. Mournful Bowed String Swell (Warm Low-Passed Detuned Cello Ensemble)
  playSwell(freq: number, dest: AudioNode, duration = 5.2, gainLevel = 0.085, when?: number) {
    if (!this.ctx) return;
    const now = when ?? this.ctx.currentTime;

    [-6, 6].forEach((detuneCents) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq * Math.pow(2, detuneCents / 1200), now);

      filter.type = 'lowpass';
      filter.Q.setValueAtTime(1.1, now);
      filter.frequency.setValueAtTime(150, now);
      filter.frequency.exponentialRampToValueAtTime(460, now + duration * 0.45);
      filter.frequency.exponentialRampToValueAtTime(135, now + duration);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(gainLevel * 0.5, now + duration * 0.42);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + duration + 0.03);
    });
  },

  playStrings(chordFreqs: number[], dest: AudioNode, duration = 3.2, gainLevel = 0.12, when?: number) {
    const perNote = gainLevel / Math.max(1, Math.sqrt(chordFreqs.length));
    chordFreqs.forEach((f) => this.playSwell(f, dest, duration, perNote, when));
  },

  // 4. Cold Minimalist Tension Pulse (MGS-Style Sub Pressure)
  playColdPulse(freq: number, dest: AudioNode, duration = 0.55, gainLevel = 0.22, when?: number) {
    if (!this.ctx) return;
    const now = when ?? this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const sub = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    sub.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    sub.frequency.setValueAtTime(freq * 0.5, now);

    filter.type = 'lowpass';
    filter.Q.setValueAtTime(2.4, now);
    filter.frequency.setValueAtTime(420, now);
    filter.frequency.exponentialRampToValueAtTime(95, now + duration * 0.85);

    gain.gain.setValueAtTime(0.0008, now);
    gain.gain.linearRampToValueAtTime(gainLevel, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    sub.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(now);
    sub.start(now);
    osc.stop(now + duration + 0.02);
    sub.stop(now + duration + 0.02);
  },

  // 5. Plucked Gut String (Warm Chamber Pluck for The Weaver & Ambient)
  playPluck(freq: number, dest: AudioNode, duration = 1.4, gainLevel = 0.12, when?: number) {
    if (!this.ctx) return;
    const now = when ?? this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const lp = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq, now);
    osc2.detune.setValueAtTime(-5, now);

    const osc2Gain = this.ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.32, now);

    lp.type = 'lowpass';
    lp.Q.setValueAtTime(1.5, now);
    lp.frequency.setValueAtTime(Math.min(2600, freq * 4.5), now);
    lp.frequency.exponentialRampToValueAtTime(Math.max(220, freq * 1.1), now + duration * 0.7);

    gain.gain.setValueAtTime(0.0008, now);
    gain.gain.linearRampToValueAtTime(gainLevel, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc1.connect(lp);
    osc2.connect(osc2Gain);
    osc2Gain.connect(lp);
    lp.connect(gain);
    gain.connect(dest);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration + 0.02);
    osc2.stop(now + duration + 0.02);
  },

  // 6. Distant Resonant Frame Drum / Sub Impact
  playImpact(pitch: number, dest: AudioNode, decay = 0.45, gainLevel = 0.32, when?: number) {
    if (!this.ctx) return;
    const now = when ?? this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const lp = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(24, now + decay);

    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(240, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(gainLevel, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

    osc.connect(lp);
    lp.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + decay + 0.02);
  },

  // 7. Sanctuary Bronze Bell via Damped FM Synthesis
  playBell(freq: number, dest: AudioNode, duration = 2.8, gainLevel = 0.14, when?: number) {
    if (!this.ctx) return;
    const now = when ?? this.ctx.currentTime;

    const carrier = this.ctx.createOscillator();
    const subCarrier = this.ctx.createOscillator();
    const modulator = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const mainGain = this.ctx.createGain();
    const lp = this.ctx.createBiquadFilter();

    carrier.type = 'sine';
    subCarrier.type = 'triangle';
    modulator.type = 'sine';

    carrier.frequency.setValueAtTime(freq, now);
    subCarrier.frequency.setValueAtTime(freq * 0.5, now);
    modulator.frequency.setValueAtTime(freq * 2.756, now);

    modGain.gain.setValueAtTime(freq * 1.45, now);
    modGain.gain.exponentialRampToValueAtTime(0.01, now + duration * 0.48);

    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(2400, now);
    lp.frequency.exponentialRampToValueAtTime(650, now + duration);

    mainGain.gain.setValueAtTime(0.0008, now);
    mainGain.gain.linearRampToValueAtTime(gainLevel, now + 0.01);
    mainGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.35, now);

    modulator.connect(modGain);
    modGain.connect(carrier.frequency);
    carrier.connect(lp);
    subCarrier.connect(subGain);
    subGain.connect(lp);
    lp.connect(mainGain);
    mainGain.connect(dest);

    carrier.start(now);
    subCarrier.start(now);
    modulator.start(now);
    carrier.stop(now + duration + 0.02);
    subCarrier.stop(now + duration + 0.02);
    modulator.stop(now + duration + 0.02);
  },

  // 8. Subterranean Formant Groan (for The Begotten)
  playFleshGroan(startFreq: number, endFreq: number, dest: AudioNode, duration = 1.8, gainLevel = 0.2, when?: number) {
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
    filter.Q.value = 4.8;
    filter.frequency.setValueAtTime(180, now);
    filter.frequency.exponentialRampToValueAtTime(520, now + duration * 0.44);
    filter.frequency.exponentialRampToValueAtTime(120, now + duration);

    gain.gain.setValueAtTime(0.0008, now);
    gain.gain.linearRampToValueAtTime(gainLevel, now + duration * 0.25);
    gain.gain.setValueAtTime(gainLevel * 0.8, now + duration * 0.72);
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

  // 9. Dark Cathedral Pipe Organ (Warm Low-Passed Ranks, Zero Buzz)
  playOrgan(freqs: number[], dest: AudioNode, duration = 0.9, gainLevel = 0.17, when?: number, cutoff = 1050) {
    if (!this.ctx) return;
    const now = when ?? this.ctx.currentTime;
    const voiceGain = gainLevel / Math.max(1, Math.sqrt(freqs.length));

    freqs.forEach((freq) => {
      if (!this.ctx) return;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const hp = this.ctx.createBiquadFilter();
      const lp = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sawtooth';

      osc1.frequency.setValueAtTime(freq, now);
      osc2.frequency.setValueAtTime(freq * 2, now);
      osc2.detune.setValueAtTime(4, now);

      const osc2Mix = this.ctx.createGain();
      osc2Mix.gain.setValueAtTime(0.45, now);

      hp.type = 'highpass';
      hp.frequency.setValueAtTime(135, now);

      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(cutoff, now);
      lp.Q.value = 1.2;

      gain.gain.setValueAtTime(0.0008, now);
      gain.gain.linearRampToValueAtTime(voiceGain, now + 0.028);
      gain.gain.setValueAtTime(voiceGain * 0.86, now + duration * 0.72);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc1.connect(hp);
      osc2.connect(osc2Mix);
      osc2Mix.connect(hp);
      hp.connect(lp);
      lp.connect(gain);
      gain.connect(dest);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration + 0.02);
      osc2.stop(now + duration + 0.02);
    });
  },

  // 10. Dry Ossuary Bone-Click Percussion (Warm Pink-Noise High-Q Knock)
  playBoneClick(dest: AudioNode, gainLevel = 0.2, when?: number, centerFreq = 2150) {
    if (!this.ctx) return;
    const now = when ?? this.ctx.currentTime;
    if (!this.noiseBuffer) this.init();
    if (!this.noiseBuffer) return;

    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(centerFreq + (Math.random() - 0.5) * 320, now);
    bandpass.Q.value = 12;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(gainLevel, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.032);

    src.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(dest);

    src.start(now, Math.random() * 0.8, 0.038);
  },

  // 11. Warm Dark Analog Bass Drive (Bosses Only)
  playBassSaw(freq: number, dest: AudioNode, duration = 0.3, gainLevel = 0.25, when?: number) {
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
    filter.Q.value = 3.6;
    filter.frequency.setValueAtTime(620, now);
    filter.frequency.exponentialRampToValueAtTime(72, now + duration * 0.9);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(gainLevel, now + 0.008);
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

  // 12. Breathy Wooden Chamber Flute (for The Weaver — Warm Mid-Register, Zero Shrillness)
  playFlute(freq: number, dest: AudioNode, duration = 1.1, gainLevel = 0.17, when?: number) {
    if (!this.ctx) return;
    const now = when ?? this.ctx.currentTime;

    const fund = this.ctx.createOscillator();
    const overtone = this.ctx.createOscillator();
    const overtoneGain = this.ctx.createGain();
    const lp = this.ctx.createBiquadFilter();
    const mainGain = this.ctx.createGain();

    // Gentle human pitch scoop into the note
    fund.type = 'sine';
    fund.frequency.setValueAtTime(freq * 0.988, now);
    fund.frequency.exponentialRampToValueAtTime(freq, now + 0.065);

    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(freq * 2, now);
    overtoneGain.gain.setValueAtTime(0.14, now);

    // Delayed gentle breath vibrato on held notes
    const vib = this.ctx.createOscillator();
    const vibGain = this.ctx.createGain();
    vib.type = 'sine';
    vib.frequency.setValueAtTime(4.7, now);
    vibGain.gain.setValueAtTime(0.0001, now);
    vibGain.gain.linearRampToValueAtTime(freq * 0.0085, now + Math.min(0.35, duration * 0.5));
    vib.connect(vibGain);
    vibGain.connect(fund.frequency);
    vibGain.connect(overtone.frequency);

    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(Math.min(2200, freq * 3.2), now);
    lp.Q.setValueAtTime(0.9, now);

    mainGain.gain.setValueAtTime(0.0008, now);
    mainGain.gain.linearRampToValueAtTime(gainLevel, now + 0.075);
    mainGain.gain.setValueAtTime(gainLevel * 0.88, now + Math.max(0.09, duration * 0.72));
    mainGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    fund.connect(lp);
    overtone.connect(overtoneGain);
    overtoneGain.connect(lp);
    lp.connect(mainGain);
    mainGain.connect(dest);

    fund.start(now);
    overtone.start(now);
    vib.start(now);
    fund.stop(now + duration + 0.03);
    overtone.stop(now + duration + 0.03);
    vib.stop(now + duration + 0.03);

    // Soft warm wooden air-lip breath layer (pink noise, bandpass filtered)
    if (!this.noiseBuffer) this.init();
    if (this.noiseBuffer) {
      const breath = this.ctx.createBufferSource();
      breath.buffer = this.noiseBuffer;

      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(Math.min(2400, freq * 3.4), now);
      bp.Q.setValueAtTime(4.5, now);

      const bGain = this.ctx.createGain();
      bGain.gain.setValueAtTime(0.0005, now);
      bGain.gain.linearRampToValueAtTime(gainLevel * 0.34, now + 0.04);
      bGain.gain.exponentialRampToValueAtTime(gainLevel * 0.09, now + 0.16);
      bGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      breath.connect(bp);
      bp.connect(bGain);
      bGain.connect(dest);
      breath.start(now, Math.random() * 0.5, duration + 0.02);
    }
  },

  // Compatibility helpers
  playHarp(freq: number, dest: AudioNode, duration = 0.9, gainLevel = 0.11, when?: number) {
    this.playPluck(freq, dest, duration, gainLevel, when);
  },

  playBrass(freq: number, dest: AudioNode, duration = 0.8, gainLevel = 0.14, when?: number) {
    this.playSwell(freq, dest, duration, gainLevel, when);
  },

  playSlapBass(freq: number, dest: AudioNode, _isPop = false, duration = 0.35, gainLevel = 0.22, when?: number) {
    this.playColdPulse(freq, dest, duration, gainLevel, when);
  },

  // =========================================================================
  // 1. AMBIENT / MAP / EVENTS — Dusty Tape Drone & Haunted Celesta Chimes
  // =========================================================================
  playAmbient(fadeTime = 1.8) {
    this.playCabin(fadeTime);
  },

  playCabin(fadeTime = 1.8) {
    this.transitionTo('cabin', (inst: TrackInstance) => {
      if (!this.ctx) return;

      // Breathing low bowed chamber drone (D1 + detuned D2 + hollow A2)
      const droneFilter = this.ctx.createBiquadFilter();
      droneFilter.type = 'lowpass';
      droneFilter.frequency.value = 135;

      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.value = 0.11;
      lfoGain.gain.value = 42;
      lfo.connect(lfoGain);
      lfoGain.connect(droneFilter.frequency);
      lfo.start();
      inst.nodes.push(lfo, droneFilter, lfoGain);

      const subGain = this.ctx.createGain();
      subGain.gain.value = 0.13;
      droneFilter.connect(subGain);
      subGain.connect(inst.bus);
      inst.nodes.push(subGain);

      [
        { f: 36.71, type: 'sine' as OscillatorType },
        { f: 73.42, type: 'sawtooth' as OscillatorType },
        { f: 73.78, type: 'sawtooth' as OscillatorType },
        { f: 110.0, type: 'triangle' as OscillatorType },
      ].forEach((v) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        osc.type = v.type;
        osc.frequency.value = v.f;
        osc.connect(droneFilter);
        osc.start();
        inst.nodes.push(osc);
      });

      const chimeEcho = this.createEchoBus(inst, 0.56, 0.44, 1350);

      // Eerie, sparse D-minor / harmonic-minor music-box motifs (Lavender Town stillness)
      const motifs: number[][] = [
        [587.33, 440.0, 523.25],          // D5 -> A4 -> C5
        [659.25, 587.33, 554.37],         // E5 -> D5 -> C#5
        [440.0, 466.16, 349.23],          // A4 -> Bb4 -> F4
        [587.33, 698.46, 659.25, 440.0],  // D5 -> F5 -> E5 -> A4
        [349.23, 329.63, 293.66],         // F4 -> E4 -> D4
      ];

      const scheduleChime = () => {
        if (this.activeInstance !== inst || !this.ctx) return;
        const motif = motifs[Math.floor(Math.random() * motifs.length)];
        const panDest = this.createPanNode(chimeEcho, (Math.random() - 0.5) * 0.75);

        motif.forEach((freq, i) => {
          const delayMs = i * (560 + Math.random() * 240);
          const t = setTimeout(() => {
            if (this.activeInstance === inst) {
              this.playMusicBox(freq, panDest, 3.2, 0.085);
            }
          }, delayMs);
          inst.timers.push(t);
        });

        const next = 3600 + Math.random() * 3400;
        inst.timers.push(setTimeout(scheduleChime, next));
      };

      // Mournful bowed cello fifths & Dorian intervals swelling out of the dark
      const swellPairs: number[][] = [
        [146.83, 220.0],  // D3 + A3
        [130.81, 196.0],  // C3 + G3
        [174.61, 220.0],  // F3 + A3
        [146.83, 233.08], // D3 + Bb3
        [110.0, 164.81],  // A2 + E3
      ];

      const scheduleSwell = () => {
        if (this.activeInstance !== inst || !this.ctx) return;
        const pair = swellPairs[Math.floor(Math.random() * swellPairs.length)];
        const dur = 5.4 + Math.random() * 2.4;
        pair.forEach((freq) => this.playSwell(freq, inst.bus, dur, 0.07));
        inst.timers.push(setTimeout(scheduleSwell, 6200 + Math.random() * 4200));
      };

      inst.timers.push(setTimeout(scheduleChime, 900));
      scheduleSwell();
    }, fadeTime);
  },

  // =========================================================================
  // 2. STANDARD BATTLE — 68 BPM Cold Sub-Tension & Dark Felt Chamber Pulse
  // =========================================================================
  playBattle(fadeTime = 0.9) {
    this.transitionTo('battle', (inst: TrackInstance) => {
      if (!this.ctx) return;
      const chamberEcho = this.createEchoBus(inst, 0.33, 0.24, 960);
      const pizzPanL = this.createPanNode(chamberEcho, -0.32);
      const pizzPanR = this.createPanNode(chamberEcho, 0.32);
      const bonePan = this.createPanNode(inst.bus, 0.26);

      // Muted dark felt piano chords (taut minor/Phrygian tension, zero celesta)
      const feltChords: Record<number, number[]> = {
        0:  [146.83, 220.0, 293.66],  // Dm
        16: [155.56, 220.0, 293.66],  // Dm(b9) / Eb tension
        32: [130.81, 196.0, 261.63],  // Cm
        48: [138.59, 220.0, 261.63],  // A7(b9)/C#
      };

      // Low-mid plucked cello pizzicato counter-figure (dark, dry, hypnotic)
      const celloPizz: Record<number, number> = {
        4:  220.0,  // A3
        10: 174.61, // F3
        14: 164.81, // E3
        20: 233.08, // Bb3
        26: 174.61, // F3
        36: 196.0,  // G3
        42: 155.56, // Eb3
        46: 146.83, // D3
        52: 220.0,  // A3
        58: 164.81, // E3
        62: 138.59, // C#3
      };

      // Steady cold MGS-style sub pulse driving combat tension without midrange clutter
      const coldPulseBass: (number | null)[] = [
        73.42, null, 73.42, null, null, 73.42, null, 87.31,
        73.42, null, 73.42, null, 65.41, null, 73.42, null,
        77.78, null, 77.78, null, null, 77.78, null, 73.42,
        77.78, null, 77.78, null, 65.41, null, 69.3,  null,
        65.41, null, 65.41, null, null, 65.41, null, 77.78,
        65.41, null, 65.41, null, 58.27, null, 65.41, null,
        55.0,  null, 55.0,  null, null, 69.3,  null, 73.42,
        55.0,  null, 69.3,  null, 55.0,  null, null,  null,
      ];

      // 68 BPM 16th-note grid (~0.2206s per step)
      this.scheduleLoop(inst, 0.2206, 64, (step: number, when: number) => {
        if (feltChords[step]) {
          this.playSynthPiano(feltChords[step], chamberEcho, 2.2, 0.17, when);
        }
        if (celloPizz[step]) {
          const pan = step % 16 < 8 ? pizzPanL : pizzPanR;
          this.playPluck(celloPizz[step], pan, 0.72, 0.14, when);
        }
        const bassNote = coldPulseBass[step];
        if (bassNote) {
          this.playColdPulse(bassNote, inst.bus, 0.34, 0.24, when);
        }
        // Tactile heartbeat frame drum + dry ossuary rim ticks
        if (step % 8 === 0) {
          this.playImpact(56, inst.bus, 0.38, 0.32, when);
        } else if (step % 16 === 6 || step % 16 === 14) {
          this.playImpact(48, inst.bus, 0.22, 0.18, when);
        }
        if (step % 8 === 4) {
          this.playBoneClick(bonePan, 0.18, when, 2100);
        } else if (step % 4 === 2) {
          this.playBoneClick(bonePan, 0.08, when, 2650);
        }
      });
    }, fadeTime);
  },

  // =========================================================================
  // 3. ACT BOSSES: THE GOTHIC TRIPTYCH
  // =========================================================================

  // 3A. THE ZEALOT — 72 BPM D Phrygian Liturgical Inquisition
  playTheZealot(fadeTime = 1.5) {
    this.transitionTo('boss-Zealot', (inst: TrackInstance) => {
      if (!this.ctx) return;
      const cathedralEcho = this.createEchoBus(inst, 0.44, 0.36, 980);
      const bellPan = this.createPanNode(cathedralEcho, 0.3);
      const staffPan = this.createPanNode(inst.bus, -0.24);

      const liturgyChords: Record<number, number[]> = {
        0:  [146.83, 220.0, 293.66, 369.99],  // D (Phrygian Dominant)
        8:  [155.56, 233.08, 311.13, 392.0],  // Eb (bII dread)
        16: [130.81, 196.0, 261.63, 311.13],  // Cm
        24: [146.83, 220.0, 261.63, 369.99],  // D7(b9)
        32: [146.83, 220.0, 293.66, 369.99],  // D
        40: [196.0, 233.08, 293.66, 392.0],   // Gm
        48: [155.56, 233.08, 311.13, 369.99], // Eb(#9)
        56: [146.83, 220.0, 293.66, 369.99],  // D resolve
      };

      const steepleBells: Record<number, number> = {
        0:  587.33,
        12: 622.25,
        16: 523.25,
        28: 466.16,
        32: 739.99,
        44: 587.33,
        48: 622.25,
        56: 587.33,
      };

      const pedalMap: Record<number, number> = {
        0: 73.42, 6: 73.42,
        8: 77.78, 14: 77.78,
        16: 65.41, 22: 65.41,
        24: 73.42, 30: 77.78,
        32: 73.42, 38: 73.42,
        40: 98.0, 46: 77.78,
        48: 77.78, 54: 73.42,
        56: 73.42,
      };

      // 72 BPM 8th notes (~0.4167s)
      this.scheduleLoop(inst, 0.4167, 64, (step: number, when: number) => {
        if (liturgyChords[step]) {
          this.playOrgan(liturgyChords[step], cathedralEcho, 2.9, 0.21, when, 1020);
        }
        if (steepleBells[step]) {
          this.playBell(steepleBells[step], bellPan, 2.7, 0.13, when);
        }
        if (pedalMap[step]) {
          this.playBassSaw(pedalMap[step], inst.bus, 1.0, 0.23, when);
        }
        if (step % 8 === 0) {
          this.playImpact(52, inst.bus, 0.58, 0.36, when);
        } else if (step % 8 === 4) {
          this.playBoneClick(staffPan, 0.18, when, 2050);
        }
      });
    }, fadeTime);
  },

  // 3B. THE BEGOTTEN — 58 BPM Hollow Crypt Dirge (Clean, Stark, Uncluttered)
  playTheBegotten(fadeTime = 1.6) {
    this.transitionTo('boss-The Begotten', (inst: TrackInstance) => {
      if (!this.ctx) return;
      const cryptEcho = this.createEchoBus(inst, 0.44, 0.22, 780);
      const melodyPan = this.createPanNode(cryptEcho, -0.2);
      const groanPan = this.createPanNode(inst.bus, 0.26);
      const bonePan = this.createPanNode(inst.bus, 0.22);

      // Slow, clean sub-pulse bassline (zero overlapping sawtooth mud)
      const subWalk: Record<number, number> = {
        0:  73.42, // D2
        6:  77.78, // Eb2
        8:  73.42, // D2
        14: 65.41, // C2
        16: 58.27, // Bb1
        22: 55.0,  // A1
        24: 51.91, // Ab1 (tritone gravity)
        28: 55.0,  // A1
      };

      // Stark single-octave felt piano downbeats (clear register separation, no muddy clusters)
      const octaveMarkers: Record<number, number[]> = {
        0:  [146.83, 293.66], // D
        8:  [155.56, 311.13], // Eb
        16: [116.54, 233.08], // Bb
        24: [110.0,  220.0],  // A
      };

      // Lonely, clearly audible mid-register plucked cello melody with breathing room
      const cryptMelody: Record<number, [number, number]> = {
        2:  [293.66, 1.15], // D4
        4:  [349.23, 0.95], // F4
        6:  [311.13, 1.25], // Eb4
        10: [293.66, 1.3],  // D4
        18: [233.08, 1.15], // Bb3
        20: [293.66, 0.95], // D4
        22: [277.18, 1.35], // C#4
        26: [220.0,  1.45], // A3
      };

      // Subtle subterranean groans placed strictly in the empty rests
      const groans: Record<number, [number, number, number]> = {
        12: [98.0, 73.42, 1.6],
        28: [87.31, 65.41, 1.7],
      };

      // 58 BPM 8th-note grid (~0.5172s per step; 32 steps = ~16.55s slow cycle)
      this.scheduleLoop(inst, 0.5172, 32, (step: number, when: number) => {
        if (subWalk[step]) {
          this.playColdPulse(subWalk[step], inst.bus, 0.95, 0.25, when);
        }
        if (octaveMarkers[step]) {
          this.playSynthPiano(octaveMarkers[step], cryptEcho, 2.2, 0.14, when);
        }
        if (cryptMelody[step]) {
          const [freq, dur] = cryptMelody[step];
          this.playPluck(freq, melodyPan, dur, 0.16, when);
        }
        if (groans[step]) {
          const [sFreq, eFreq, dur] = groans[step];
          this.playFleshGroan(sFreq, eFreq, groanPan, dur, 0.11, when);
        }

        // Slow hollow crypt heartbeat & sparse dry bone knock
        if (step % 8 === 0) {
          this.playImpact(42, inst.bus, 0.62, 0.36, when);
        } else if (step % 16 === 14) {
          this.playImpact(48, inst.bus, 0.34, 0.2, when);
        }
        if (step % 8 === 4) {
          this.playBoneClick(bonePan, 0.19, when, 1850);
        }
      });
    }, fadeTime);
  },

  // 3C. THE WEAVER — Slow Swaying 6/8 Wooden Chamber Flute & Dark-Folk Loom
  playTheWeaver(fadeTime = 1.5) {
    this.transitionTo('boss-The Weaver', (inst: TrackInstance) => {
      if (!this.ctx) return;
      const loomEcho = this.createEchoBus(inst, 0.44, 0.34, 1300);
      const flutePan = this.createPanNode(loomEcho, -0.14);
      const arpPanL = this.createPanNode(loomEcho, -0.34);
      const arpPanR = this.createPanNode(loomEcho, 0.34);
      const shuttlePan = this.createPanNode(inst.bus, 0.24);

      // 8 bars of 6/8 (48 eighth-note steps): warm low-mid gut-string cradle (146–329 Hz)
      const loomArps: number[] = [
        // Bar 1 (Dm)
        146.83, 220.0, 293.66, 174.61, 220.0, 293.66,
        // Bar 2 (Dm/C)
        130.81, 220.0, 293.66, 174.61, 220.0, 261.63,
        // Bar 3 (Bb)
        116.54, 174.61, 233.08, 146.83, 174.61, 233.08,
        // Bar 4 (A7)
        110.0, 164.81, 220.0, 138.59, 164.81, 220.0,
        // Bar 5 (Gm)
        196.0, 233.08, 293.66, 196.0, 233.08, 329.63,
        // Bar 6 (Dm)
        146.83, 220.0, 293.66, 174.61, 220.0, 293.66,
        // Bar 7 (Em7b5 -> Bb)
        164.81, 196.0, 233.08, 146.83, 174.61, 233.08,
        // Bar 8 (A7 -> D turn)
        110.0, 164.81, 220.0, 138.59, 164.81, 196.0,
      ];

      // Warm middle-register wooden flute melody (D4–D5, hypnotic & unhurried)
      const fluteMelody: Record<number, [number, number]> = {
        0:  [293.66, 1.05], // D4
        3:  [349.23, 0.72], // F4
        5:  [329.63, 0.36], // E4
        6:  [440.0,  1.38], // A4
        10: [392.0,  0.72], // G4
        12: [349.23, 1.05], // F4
        15: [293.66, 0.72], // D4
        17: [329.63, 0.36], // E4
        18: [277.18, 1.42], // C#4 (hold + breath)
        24: [392.0,  1.05], // G4
        27: [466.16, 0.72], // Bb4
        29: [440.0,  0.36], // A4
        30: [587.33, 1.05], // D5 (peak)
        33: [523.25, 0.72], // C5
        35: [440.0,  0.36], // A4
        36: [466.16, 1.05], // Bb4
        39: [392.0,  0.72], // G4
        41: [349.23, 0.36], // F4
        42: [329.63, 1.05], // E4
        45: [277.18, 1.02], // C#4
      };

      const barBassRoots = [73.42, 65.41, 58.27, 55.0, 98.0, 73.42, 82.41, 55.0];

      // Slow swaying 6/8 eighth notes (0.36s per step; 48 steps = ~17.3s full lullaby cycle)
      this.scheduleLoop(inst, 0.36, 48, (step: number, when: number) => {
        const barIdx = Math.floor(step / 6);
        const inBar = step % 6;
        const root = barBassRoots[barIdx];

        // Gentle warm gut-string sway
        const arpNote = loomArps[step];
        if (arpNote) {
          const pan = step % 2 === 0 ? arpPanL : arpPanR;
          this.playPluck(arpNote, pan, 0.95, 0.11, when);
        }

        // Haunting wooden flute lead
        if (fluteMelody[step]) {
          const [freq, dur] = fluteMelody[step];
          this.playFlute(freq, flutePan, dur, 0.18, when);
        }

        // Deep bowed cello breath on even bars + warm sub pulse on every bar downbeat
        if (inBar === 0) {
          this.playColdPulse(root, inst.bus, 1.15, 0.22, when);
          this.playImpact(52, inst.bus, 0.42, 0.24, when);
          if (barIdx % 2 === 0) {
            this.playSwell(root * 2, inst.bus, 3.8, 0.08, when);
          }
        } else if (inBar === 3) {
          // Soft wooden loom shuttle tap on the 6/8 sway accent
          this.playBoneClick(shuttlePan, 0.12, when, 1850);
        }
      });
    }, fadeTime);
  },

  playBoss(fadeTime = 1.5) {
    return this.playTheZealot(fadeTime);
  },

  playBossTheme(type: 'Zealot' | 'The Begotten' | 'The Weaver', fadeTime = 1.5) {
    if (type === 'Zealot') return this.playTheZealot(fadeTime);
    if (type === 'The Begotten') return this.playTheBegotten(fadeTime);
    return this.playTheWeaver(fadeTime);
  },

  // =========================================================================
  // 4. THE BONE LORD: DRAWN-OUT OSSUARY PROCESSION (52 BPM, 37s Full Arc)
  // =========================================================================
  playFinalBoss(fadeTime = 2.0) {
    this.transitionTo('finalboss', (inst: TrackInstance) => {
      if (!this.ctx) return;
      const organEcho = this.createEchoBus(inst, 0.52, 0.26, 860);
      const bellPan = this.createPanNode(organEcho, -0.26);
      const pianoPan = this.createPanNode(organEcho, 0.24);
      const bonePan = this.createPanNode(inst.bus, 0.28);

      // 8-bar solemn cathedral progression (each chord holds for a full 4.6s measure)
      const funeralChords: Record<number, number[]> = {
        0:  [146.83, 220.0, 293.66, 349.23],  // Dm
        8:  [116.54, 174.61, 233.08, 293.66], // Bb
        16: [196.0,  233.08, 293.66, 392.0],  // Gm
        24: [138.59, 220.0, 277.18, 329.63],  // A7/C#
        32: [146.83, 220.0, 293.66, 349.23],  // Dm
        40: [155.56, 233.08, 311.13, 392.0],  // Eb (Neapolitan weight)
        48: [138.59, 174.61, 207.65, 277.18], // C#dim7
        56: [110.0,  164.81, 220.0, 277.18],  // A7
      };

      const pedalRoots: Record<number, number> = {
        0: 73.42, 8: 58.27, 16: 49.0, 24: 55.0,
        32: 73.42, 40: 77.78, 48: 69.3, 56: 55.0,
      };

      // Distant bronze bells tolling across the nave
      const steepleBells: Record<number, number> = {
        0:  587.33, // D5
        16: 466.16, // Bb4
        32: 587.33, // D5
        40: 622.25, // Eb5
        56: 554.37, // C#5
      };

      // Sparse B-section felt-piano lament (gives the 37s loop a slow emotional turn)
      const lamentNotes: Record<number, number[]> = {
        36: [293.66, 440.0],
        44: [311.13, 392.0],
        52: [277.18, 349.23],
        60: [220.0,  329.63],
      };

      // True 52 BPM 8th-note grid (~0.5769s per step; 64 steps = ~36.9s drawn-out procession)
      this.scheduleLoop(inst, 0.5769, 64, (step: number, when: number) => {
        if (funeralChords[step]) {
          this.playOrgan(funeralChords[step], organEcho, 4.1, 0.21, when, 920);
        }
        if (pedalRoots[step]) {
          this.playColdPulse(pedalRoots[step], inst.bus, 2.8, 0.27, when);
        }
        if (steepleBells[step]) {
          this.playBell(steepleBells[step], bellPan, 3.4, 0.12, when);
        }
        if (lamentNotes[step]) {
          this.playSynthPiano(lamentNotes[step], pianoPan, 2.6, 0.15, when);
        }
        if (step === 32 || step === 48) {
          this.playSwell(step === 32 ? 146.83 : 138.59, inst.bus, 4.4, 0.09, when);
        }

        // Measured, heavy funeral pace
        const inBar = step % 8;
        if (inBar === 0) {
          this.playImpact(40, inst.bus, 0.85, 0.44, when);
        } else if (inBar === 4) {
          this.playBoneClick(bonePan, 0.18, when, 2050);
        } else if (inBar === 6 && step >= 32) {
          this.playBoneClick(bonePan, 0.09, when, 2450);
        }
      });
    }, fadeTime);
  },

  // =========================================================================
  // 5. PHASE 3: THE BLOOD MOON (64 BPM Unified Slow-Burn Eclipse, 30s Arc)
  // =========================================================================
  playFinalBossPhase3(fadeTime = 0.8) {
    this.transitionTo('bloodmoon-phase3', (inst: TrackInstance) => {
      if (!this.ctx) return;
      const cathedralEcho = this.createEchoBus(inst, 0.46, 0.26, 1020);
      const leadPan = this.createPanNode(cathedralEcho, -0.18);
      const chimePan = this.createPanNode(cathedralEcho, 0.3);
      const bellPan = this.createPanNode(cathedralEcho, -0.32);
      const bonePan = this.createPanNode(inst.bus, 0.24);

      // 8-bar apocalyptic cathedral progression — one cohesive tempo, zero frantic layering
      const organWalls: Record<number, number[]> = {
        0:  [146.83, 220.0, 293.66, 349.23],  // Dm
        8:  [116.54, 174.61, 233.08, 293.66], // Bb
        16: [196.0,  233.08, 293.66, 392.0],  // Gm
        24: [110.0,  164.81, 233.08, 277.18], // A7(b9)
        32: [155.56, 196.0, 233.08, 311.13],  // Eb (Blood Moon lift)
        40: [130.81, 196.0, 233.08, 311.13],  // Cm7
        48: [138.59, 174.61, 207.65, 277.18], // C#dim7
        56: [110.0,  146.83, 220.0, 329.63],  // A7sus4
        60: [110.0,  138.59, 233.08, 277.18], // A7(b9) resolve
      };

      const barRoots = [73.42, 58.27, 49.0, 55.0, 77.78, 65.41, 69.3, 55.0];

      // Stately, mournful wooden-flute lead singing slowly above the organ
      const eclipseLead: Record<number, [number, number]> = {
        2:  [440.0,  1.25], // A4
        5:  [466.16, 0.85], // Bb4
        7:  [440.0,  0.48], // A4
        8:  [349.23, 1.55], // F4
        14: [329.63, 0.85], // E4
        16: [392.0,  1.45], // G4
        20: [466.16, 1.15], // Bb4
        24: [440.0,  1.4],  // A4
        28: [329.63, 1.1],  // E4
        32: [466.16, 1.45], // Bb4
        36: [622.25, 1.25], // Eb5 (climax peak)
        40: [587.33, 1.25], // D5
        44: [523.25, 1.15], // C5
        48: [554.37, 1.65], // C#5
        54: [440.0,  0.9],  // A4
        56: [587.33, 1.35], // D5
        60: [554.37, 1.35], // C#5
      };

      // Sparse haunted celesta answers echoing in the pauses
      const celestaEchoes: Record<number, number> = {
        12: 587.33, // D5
        22: 523.25, // C5
        30: 554.37, // C#5
        46: 622.25, // Eb5
        52: 698.46, // F5
      };

      // Heavy steeple bells on major harmonic shifts
      const eclipseBells: Record<number, number> = {
        0:  587.33,
        16: 392.0,
        32: 622.25,
        48: 554.37,
      };

      // Slow, deliberate 64 BPM 8th-note grid (~0.4688s per step; 64 steps = 30.0s full cycle)
      this.scheduleLoop(inst, 0.4688, 64, (step: number, when: number) => {
        const barIdx = Math.floor(step / 8);
        const inBar = step % 8;
        const root = barRoots[barIdx];

        if (organWalls[step]) {
          const wallDur = step === 56 || step === 60 ? 1.7 : 3.45;
          this.playOrgan(organWalls[step], cathedralEcho, wallDur, 0.22, when, 1040);
        }

        if (eclipseLead[step]) {
          const [freq, dur] = eclipseLead[step];
          this.playFlute(freq, leadPan, dur, 0.16, when);
        }

        if (celestaEchoes[step]) {
          this.playMusicBox(celestaEchoes[step], chimePan, 2.4, 0.095, when);
        }

        if (eclipseBells[step]) {
          this.playBell(eclipseBells[step], bellPan, 3.1, 0.12, when);
        }

        // Bowed low strings swelling in during the Blood Moon B-section
        if (step === 32 || step === 48) {
          this.playStrings([root * 2, root * 3], inst.bus, 4.2, 0.12, when);
        }

        // Steady, inexorable quarter-note sub-bass pulse (every 2 steps = 64 BPM)
        if (inBar % 2 === 0) {
          this.playColdPulse(root, inst.bus, 0.82, inBar === 0 ? 0.28 : 0.2, when);
        }

        // Heavy, unhurried ritual war-drums & dry ossuary bone cracks
        if (inBar === 0) {
          this.playImpact(40, inst.bus, 0.72, 0.46, when);
        } else if (inBar === 4) {
          this.playImpact(48, inst.bus, 0.46, 0.3, when);
          this.playBoneClick(bonePan, 0.24, when, 2150);
        } else if (inBar === 7 && (barIdx === 3 || barIdx === 7)) {
          // Single heavy pickup thud leading into the next 4-bar turn
          this.playImpact(44, inst.bus, 0.38, 0.34, when);
        } else if (inBar === 2 || inBar === 6) {
          this.playBoneClick(bonePan, 0.09, when, 2550);
        }
      });
    }, fadeTime);
  },
};

const chiptuneAudio = ChiptuneAudio;

// =========================================================================
// DRY, PUNCHY CLOSE-MIC TABLETOP FOLEY ENGINE (Dedicated Saturated SFX Bus)
// =========================================================================
export const playSound = (
  type: 'draw' | 'sacrifice' | 'play' | 'hit' | 'bell' | 'bone' | 'defeat' | 'victory' | 'armor' | 'blood_fill' | 'blood_drain'
) => {
  try {
    const sfxMult = typeof ChiptuneAudio.sfxVolume === 'number' ? ChiptuneAudio.sfxVolume : 0.6;
    if (sfxMult <= 0) return;

    if (!ChiptuneAudio.ctx) ChiptuneAudio.init();
    const ctx: AudioContext | null = ChiptuneAudio.ctx;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const dest: AudioNode = ChiptuneAudio.sfxBus || ctx.destination;
    const now = ctx.currentTime;
    const jitter = 0.95 + Math.random() * 0.1;

    const crispNoise = (
      dur: number,
      filterType: BiquadFilterType,
      freqStart: number,
      freqEnd: number,
      q: number,
      vol: number,
      delay = 0
    ) => {
      if (!ChiptuneAudio.whiteNoiseBuffer) ChiptuneAudio.init();
      const buf = ChiptuneAudio.whiteNoiseBuffer;
      if (!buf) return;

      const srcNode = ctx.createBufferSource();
      srcNode.buffer = buf;

      const filter = ctx.createBiquadFilter();
      filter.type = filterType;
      filter.Q.setValueAtTime(q, now + delay);
      filter.frequency.setValueAtTime(freqStart, now + delay);
      filter.frequency.exponentialRampToValueAtTime(Math.max(80, freqEnd), now + delay + dur);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now + delay);
      gain.gain.linearRampToValueAtTime(vol * sfxMult, now + delay + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);

      srcNode.connect(filter);
      filter.connect(gain);
      gain.connect(dest);
      srcNode.start(now + delay, Math.random() * 0.35, dur + 0.01);
    };

    const dryTone = (
      wave: OscillatorType,
      freqStart: number,
      freqEnd: number,
      dur: number,
      vol: number,
      delay = 0,
      lpCutoff?: number
    ) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = wave;
      osc.frequency.setValueAtTime(freqStart, now + delay);
      osc.frequency.exponentialRampToValueAtTime(Math.max(24, freqEnd), now + delay + dur);

      gain.gain.setValueAtTime(0.001, now + delay);
      gain.gain.linearRampToValueAtTime(vol * sfxMult, now + delay + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);

      if (lpCutoff) {
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(lpCutoff, now + delay);
        osc.connect(lp);
        lp.connect(gain);
      } else {
        osc.connect(gain);
      }
      gain.connect(dest);
      osc.start(now + delay);
      osc.stop(now + delay + dur + 0.012);
    };

    if (type === 'draw') {
      // Snappy dry cardstock slide + subtle thumb flick (zero tail)
      crispNoise(0.068, 'bandpass', 1550 * jitter, 2750 * jitter, 1.9, 0.55);
      dryTone('triangle', 280 * jitter, 420 * jitter, 0.042, 0.2, 0.008, 1200);
    } else if (type === 'play') {
      // Heavy wood-table card slam: punchy low-mid knock + sub thud + crisp card slap
      dryTone('sine', 145 * jitter, 44 * jitter, 0.145, 0.72);
      dryTone('triangle', 270 * jitter, 78 * jitter, 0.085, 0.48, 0, 680);
      crispNoise(0.042, 'bandpass', 1450 * jitter, 620 * jitter, 1.8, 0.58);
    } else if (type === 'sacrifice') {
      // Heavy ritual blood thud + low-mid body crunch + damped steel slice
      dryTone('sine', 112 * jitter, 34 * jitter, 0.26, 0.78);
      dryTone('triangle', 210 * jitter, 58 * jitter, 0.19, 0.52, 0, 560);
      crispNoise(0.095, 'bandpass', 2400 * jitter, 820 * jitter, 1.7, 0.56);
    } else if (type === 'hit') {
      // Heavy, meaty card-on-card physical impact (sub chest-thump + low-mid flesh mass + bone crunch)
      dryTone('sine', 128 * jitter, 30 * jitter, 0.21, 0.95);
      dryTone('sawtooth', 220 * jitter, 52 * jitter, 0.125, 0.58, 0, 540);
      dryTone('triangle', 280 * jitter, 64 * jitter, 0.11, 0.64, 0.004, 720);
      crispNoise(0.024, 'bandpass', 1650 * jitter, 520 * jitter, 1.25, 0.86, 0);
      crispNoise(0.095, 'bandpass', 760 * jitter, 210 * jitter, 1.55, 0.78, 0.012);
    } else if (type === 'blood_fill') {
      // Pressurized viscous blood surging upward into the glass gauge
      dryTone('sine', 86 * jitter, 54 * jitter, 0.085, 0.42);
      crispNoise(0.105, 'bandpass', 420 * jitter, 1480 * jitter, 2.7, 0.62, 0);
      dryTone('sine', 240 * jitter, 520 * jitter, 0.075, 0.46, 0.008, 920);
      dryTone('triangle', 520 * jitter, 960 * jitter, 0.048, 0.24, 0.024, 1500);
      dryTone('sine', 1320 * jitter, 1345 * jitter, 0.055, 0.14, 0.012);
    } else if (type === 'blood_drain') {
      // Hollow negative-pressure siphon draining blood out of the glass gauge
      dryTone('sine', 94 * jitter, 32 * jitter, 0.23, 0.68);
      crispNoise(0.24, 'bandpass', 1380 * jitter, 270 * jitter, 2.5, 0.64, 0);
      dryTone('sine', 460 * jitter, 135 * jitter, 0.21, 0.5, 0.008, 860);
      dryTone('triangle', 680 * jitter, 230 * jitter, 0.135, 0.28, 0.045, 1150);
    } else if (type === 'armor') {
      // Heavy iron plate deflection & shatter (low-mid metal clunk + staggered plate crunch, zero high beep)
      const metalClank = (freq: number, modRatio: number, dur: number, vol: number, delay = 0) => {
        const car = ctx.createOscillator();
        const mod = ctx.createOscillator();
        const modGain = ctx.createGain();
        const lp = ctx.createBiquadFilter();
        const g = ctx.createGain();

        car.type = 'triangle';
        mod.type = 'sine';
        car.frequency.setValueAtTime(freq, now + delay);
        mod.frequency.setValueAtTime(freq * modRatio, now + delay);

        modGain.gain.setValueAtTime(freq * 2.4, now + delay);
        modGain.gain.exponentialRampToValueAtTime(1, now + delay + dur * 0.55);

        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(1950, now + delay);
        lp.frequency.exponentialRampToValueAtTime(420, now + delay + dur);

        g.gain.setValueAtTime(0.001, now + delay);
        g.gain.linearRampToValueAtTime(vol * sfxMult, now + delay + 0.003);
        g.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);

        mod.connect(modGain);
        modGain.connect(car.frequency);
        car.connect(lp);
        lp.connect(g);
        g.connect(dest);

        car.start(now + delay);
        mod.start(now + delay);
        car.stop(now + delay + dur + 0.02);
        mod.stop(now + delay + dur + 0.02);
      };

      // Mass impact thud
      dryTone('sine', 175 * jitter, 44 * jitter, 0.14, 0.78);
      dryTone('triangle', 250 * jitter, 72 * jitter, 0.085, 0.45, 0, 580);
      // Damped iron clank & secondary plate drop
      metalClank(295 * jitter, 2.37, 0.14, 0.52, 0);
      metalClank(442 * jitter, 3.14, 0.11, 0.34, 0.028);
      // Coarse iron scrape / crackle
      crispNoise(0.045, 'bandpass', 1450 * jitter, 620 * jitter, 2.1, 0.62, 0);
      crispNoise(0.065, 'bandpass', 980 * jitter, 390 * jitter, 2.4, 0.46, 0.032);
    } else if (type === 'bone') {
      // Crisp, dry skeletal clack: twin tight knocks with calcium wood resonance
      crispNoise(0.022, 'bandpass', 2250 * jitter, 1750 * jitter, 5.5, 0.65);
      dryTone('triangle', 1620 * jitter, 1180 * jitter, 0.024, 0.34);
      crispNoise(0.022, 'bandpass', 3100 * jitter, 2450 * jitter, 6.0, 0.48, 0.02);
      dryTone('triangle', 2280 * jitter, 1650 * jitter, 0.022, 0.24, 0.02);
    } else if (type === 'bell') {
      // Heavy carved stone glyph depressing and locking into a granite socket
      // 1. Dry granite-on-granite friction scrape as the glyph slides down
      crispNoise(0.088, 'bandpass', 1050 * jitter, 420 * jitter, 2.2, 0.52, 0);
      crispNoise(0.072, 'bandpass', 2150 * jitter, 980 * jitter, 3.0, 0.28, 0.008);
      // 2. Heavy stone-slab lock & socket seat thud
      dryTone('sine', 98 * jitter, 34 * jitter, 0.22, 0.85, 0.062);
      dryTone('triangle', 165 * jitter, 52 * jitter, 0.14, 0.56, 0.062, 420);
      crispNoise(0.048, 'bandpass', 720 * jitter, 280 * jitter, 2.8, 0.68, 0.062);
      // 3. Muted hollow stone chamber resonance tail
      dryTone('sine', 196 * jitter, 188 * jitter, 0.34, 0.22, 0.068, 360);
      dryTone('triangle', 293.66 * jitter, 278 * jitter, 0.24, 0.12, 0.07, 480);
    } else if (type === 'victory') {
      // Dark, modal minor survival cadence (Dm9)
      dryTone('sine', 293.66, 292.8, 0.38, 0.42, 0.0);
      dryTone('sine', 349.23, 348.2, 0.38, 0.4, 0.14);
      dryTone('sine', 440.0, 438.8, 0.58, 0.42, 0.28);
      dryTone('triangle', 329.63, 328.5, 0.82, 0.34, 0.42, 1300);
      dryTone('sine', 146.83, 146.2, 0.88, 0.44, 0.42);
    } else if (type === 'defeat') {
      // Heavy analog tape-stop power-down droop
      dryTone('triangle', 146.83, 46.0, 0.92, 0.58, 0, 480);
      dryTone('sine', 73.42, 32.0, 0.98, 0.65);
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
