/**
 * "A Little Universe" - Web Audio Generative Celestial Soundscape & Sound FX
 * Zero-external-dependency ambient space synthesizer and chime engine.
 */

class UniverseAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.currentTrackIndex = 0;
    this.ambientTimer = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

      // Music sub-channel
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      // SFX sub-channel
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.masterGain.connect(this.ctx.destination);
      this.initialized = true;
    } catch (e) {
      console.warn("Web Audio not supported or blocked:", e);
    }
  }

  // Toggle ambient celestial background music
  toggleMusic() {
    this.init();
    if (!this.ctx) return false;

    if (this.isPlaying) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }

  startMusic() {
    if (!this.ctx) return;
    this.isPlaying = true;
    this.musicGain.gain.setTargetAtTime(0.25, this.ctx.currentTime, 0.5);
    this.scheduleNextAmbientChord();
  }

  stopMusic() {
    this.isPlaying = false;
    if (this.ambientTimer) {
      clearTimeout(this.ambientTimer);
      this.ambientTimer = null;
    }
    if (this.ctx && this.musicGain) {
      this.musicGain.gain.setTargetAtTime(0.001, this.ctx.currentTime, 0.4);
    }
  }

  setTrack(index) {
    this.currentTrackIndex = index % 3;
    if (this.isPlaying) {
      // Re-trigger with new tone palette
      if (this.ambientTimer) clearTimeout(this.ambientTimer);
      this.scheduleNextAmbientChord();
    }
  }

  scheduleNextAmbientChord() {
    if (!this.isPlaying || !this.ctx) return;

    // Harmonic chord progressions (frequencies in Hz)
    // Dreamy Major 7th / 9th chords
    const chordPalettes = [
      // Track 1: A Little Universe (Lavender & Warmth - Dmaj9 / Gmaj7 / Amaj9 / F#m7)
      [
        [146.83, 220.00, 277.18, 329.63, 440.00], // D3, A3, C#4, E4, A4
        [196.00, 246.94, 293.66, 369.99, 440.00], // G3, B3, D4, F#4, A4
        [220.00, 277.18, 329.63, 415.30, 493.88], // A3, C#4, E4, G#4, B4
        [185.00, 220.00, 277.18, 369.99, 440.00]  // F#3, A3, C#4, F#4, A4
      ],
      // Track 2: Golden Hour Nostalgia (Ethereal Pentatonic)
      [
        [130.81, 196.00, 261.63, 329.63, 392.00], // C3, G3, C4, E4, G4
        [174.61, 220.00, 261.63, 329.63, 440.00], // F3, A3, C4, E4, A4
        [164.81, 196.00, 246.94, 293.66, 392.00], // E3, G3, B3, D4, G4
        [110.00, 164.81, 220.00, 261.63, 329.63]  // A2, E3, A3, C4, E4
      ],
      // Track 3: Midnight Constellations (Lofi Space Pads)
      [
        [174.61, 261.63, 329.63, 392.00, 523.25], // F3, C4, E4, G4, C5
        [146.83, 220.00, 293.66, 349.23, 440.00], // D3, A3, D4, F4, A4
        [130.81, 196.00, 246.94, 293.66, 392.00], // C3, G3, B3, D4, G4
        [196.00, 246.94, 329.63, 392.00, 493.88]  // G3, B3, E4, G4, B4
      ]
    ];

    const currentPalette = chordPalettes[this.currentTrackIndex] || chordPalettes[0];
    const chord = currentPalette[Math.floor(Math.random() * currentPalette.length)];

    this.playPadChord(chord, 6.0);

    // Random bell sparkles during chord
    const bells = [chord[2] * 2, chord[3] * 2, chord[4] * 2, chord[1] * 4];
    for (let i = 0; i < 3; i++) {
      const delay = 1.0 + Math.random() * 4.0;
      setTimeout(() => {
        if (this.isPlaying) {
          const bellFreq = bells[Math.floor(Math.random() * bells.length)];
          this.playBell(bellFreq, 0.08);
        }
      }, delay * 1000);
    }

    // Schedule next chord
    const interval = 5.5 + Math.random() * 2.0;
    this.ambientTimer = setTimeout(() => {
      this.scheduleNextAmbientChord();
    }, interval * 1000);
  }

  playPadChord(freqs, duration) {
    if (!this.ctx || !this.isPlaying) return;
    const now = this.ctx.currentTime;

    freqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Soft warm sine/triangle blend
      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      // Gentle lowpass filter for atmospheric warmth
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600 + Math.random() * 400, now);
      filter.frequency.exponentialRampToValueAtTime(300, now + duration);

      // Volume envelope: slow fade-in, long sustain, gentle fade-out
      const noteGain = (0.04 / freqs.length) * (1.2 - i * 0.15);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(noteGain, now + 2.0);
      gain.gain.setTargetAtTime(0.0001, now + duration - 2.0, 1.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + duration + 1.0);
    });
  }

  playBell(freq, volume = 0.1) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(now);
    osc.stop(now + 2.6);
  }

  // --- Sound Effects ---

  playTwinkle() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const notes = [1046.5, 1318.5, 1567.98]; // C6, E6, G6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.08, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.6);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.7);
    });
  }

  playDiscover() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Resonant chord chime (D5, F#5, A5, D6)
    const notes = [587.33, 739.99, 880.00, 1174.66];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.12, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.8);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 2.0);
    });
  }

  playWarp() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Filter sweep whoosh
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(480, now + 0.6);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.exponentialRampToValueAtTime(2500, now + 0.4);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.9);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 1.0);
  }

  playAchievement() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Uplifting fanfare arpeggio (C5, E5, G5, B5, C6)
    const notes = [523.25, 659.25, 783.99, 987.77, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(0.15, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.09 + 1.5);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 1.6);
    });
  }

  playClick() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.06);
  }
}

window.UniverseAudio = new UniverseAudioEngine();
