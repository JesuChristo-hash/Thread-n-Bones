const fs = require('fs');
const file = 'src/audio/ChiptuneAudio.ts';
const raw = fs.readFileSync(file, 'utf8');
const eol = raw.includes('\r\n') ? '\r\n' : '\n';
let src = raw.replace(/\r\n/g, '\n');

function swap(oldStr, newStr, label) {
  if (!src.includes(oldStr)) throw new Error('Anchor not found: ' + label);
  src = src.replace(oldStr, newStr);
}

// 1. Tight headroom constants so Music + SFX can never clip even at 100%/100%
swap(
  `const MUSIC_HEADROOM = 0.65;`,
  `const MUSIC_HEADROOM = 0.55;
const SFX_HEADROOM = 0.48;`,
  'headroom constants'
);

// 2. Track sfxMasterGain on ChiptuneAudio
swap(
  `  sfxBus: null as GainNode | null,`,
  `  sfxBus: null as GainNode | null,
  sfxMasterGain: null as GainNode | null,`,
  'sfxMasterGain field'
);

// 3. Rebuild sfxBus without DynamicsCompressorNode (no hidden Blink makeup gain)
swap(
  `        const sfxIn = this.ctx.createGain();
        sfxIn.gain.setValueAtTime(0.8, now);

        // Strip sub-85Hz rumble that eats master headroom and trips OS/driver limiters
        const sfxHp = this.ctx.createBiquadFilter();
        sfxHp.type = 'highpass';
        sfxHp.frequency.setValueAtTime(85, now);
        sfxHp.Q.setValueAtTime(0.7, now);

        // Gentle soft-clipper preserves tabletop punch without slamming 0 dBFS
        const shaper = this.ctx.createWaveShaper();
        const curve = new Float32Array(1024);
        for (let i = 0; i < 1024; i++) {
          const x = (i * 2) / 1024 - 1;
          curve[i] = Math.tanh(x * 1.2) / Math.tanh(1.2);
        }
        shaper.curve = curve;
        shaper.oversample = '2x';

        const limiter = this.ctx.createDynamicsCompressor();
        limiter.threshold.setValueAtTime(-8, now);
        limiter.knee.setValueAtTime(4, now);
        limiter.ratio.setValueAtTime(16, now);
        limiter.attack.setValueAtTime(0.001, now);
        limiter.release.setValueAtTime(0.06, now);

        const sfxOut = this.ctx.createGain();
        sfxOut.gain.value = 0.42;
        sfxOut.gain.setValueAtTime(0.42, now);

        sfxIn.connect(sfxHp);
        sfxHp.connect(shaper);
        shaper.connect(limiter);
        limiter.connect(sfxOut);
        sfxOut.connect(this.ctx.destination);
        this.sfxBus = sfxIn;`,
  `        const sfxIn = this.ctx.createGain();
        sfxIn.gain.setValueAtTime(0.68, now);

        // Clear sub-95Hz rumble that triggers OS/driver AGC without thinning wood knock
        const sfxHp = this.ctx.createBiquadFilter();
        sfxHp.type = 'highpass';
        sfxHp.frequency.setValueAtTime(95, now);
        sfxHp.Q.setValueAtTime(0.7, now);

        // Strictly bounded soft-clipper (<= 0.885 peak) — no compressor auto-makeup gain
        const shaper = this.ctx.createWaveShaper();
        const curve = new Float32Array(1024);
        for (let i = 0; i < 1024; i++) {
          const x = (i * 2) / 1024 - 1;
          curve[i] = Math.tanh(x * 1.4);
        }
        shaper.curve = curve;
        shaper.oversample = '2x';

        const sfxOut = this.ctx.createGain();
        const outGain = this.sfxVolume * SFX_HEADROOM;
        sfxOut.gain.value = outGain;
        sfxOut.gain.setValueAtTime(outGain, now);

        sfxIn.connect(sfxHp);
        sfxHp.connect(shaper);
        shaper.connect(sfxOut);
        sfxOut.connect(this.ctx.destination);
        this.sfxBus = sfxIn;
        this.sfxMasterGain = sfxOut;`,
  'sfxBus compressor removal & post-shaper master gain'
);

// 4. Drive sfxMasterGain directly from setSfxVolume
swap(
  `  setSfxVolume(val: number) {
    const clamped = Math.max(0, Math.min(1, val));
    this.sfxVolume = clamped;
    try { window.localStorage.setItem(SFX_VOL_KEY, String(clamped)); } catch {}
  },`,
  `  setSfxVolume(val: number) {
    const clamped = Math.max(0, Math.min(1, val));
    this.sfxVolume = clamped;
    try { window.localStorage.setItem(SFX_VOL_KEY, String(clamped)); } catch {}
    if (this.ctx && this.sfxMasterGain) {
      this.sfxMasterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.sfxMasterGain.gain.value = clamped * SFX_HEADROOM;
      this.sfxMasterGain.gain.setValueAtTime(clamped * SFX_HEADROOM, this.ctx.currentTime);
    }
  },`,
  'setSfxVolume live gain update'
);

// 5. Remove pre-shaper sfxMult multiplication inside playSound so sfxMasterGain scales linearly
swap(
  `gain.gain.linearRampToValueAtTime(vol * sfxMult, now + delay + 0.002);`,
  `gain.gain.linearRampToValueAtTime(vol, now + delay + 0.002);`,
  'crispNoise post-shaper gain'
);

swap(
  `gain.gain.linearRampToValueAtTime(vol * sfxMult, now + delay + 0.003);`,
  `gain.gain.linearRampToValueAtTime(vol, now + delay + 0.003);`,
  'dryTone post-shaper gain'
);

swap(
  `g.gain.linearRampToValueAtTime(vol * sfxMult, now + delay + 0.003);`,
  `g.gain.linearRampToValueAtTime(vol, now + delay + 0.003);`,
  'metalClank post-shaper gain'
);

fs.writeFileSync(file, src.replace(/\n/g, eol), 'utf8');
console.log('Stripped compressor makeup gain from sfxBus and moved SFX volume post-shaper.');
