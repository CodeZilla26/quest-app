"use client";
import { useEffect, useRef } from 'react';

export default function SoundFX() {
  const ctxRef = useRef(null);

  function ensureCtx() {
    if (!ctxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      ctxRef.current = new AudioCtx();
    }
    return ctxRef.current;
  }

  function currentVolume() {
    if (typeof window === 'undefined') return 1.0;
    const v = window.__soundVolume;
    return typeof v === 'number' ? Math.max(0, Math.min(1, v)) : 1.0;
  }

  function beep({ freq = 660, dur = 0.12, type = 'sine', vol = 0.05, t0 }) {
    const ctx = ensureCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = vol * currentVolume();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const t = t0 ?? ctx.currentTime;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.start();
    osc.stop(t + dur);
  }

  useEffect(() => {
    function onSound(e) {
      const { type } = e.detail || {};
      if (type === 'note') {
        beep({ freq: 880, dur: 0.08, type: 'triangle', vol: 0.04 });
      } else if (type === 'quest') {
        beep({ freq: 520, dur: 0.12, type: 'sawtooth', vol: 0.06 });
        setTimeout(() => beep({ freq: 780, dur: 0.12, type: 'square', vol: 0.05 }), 90);
      } else if (type === 'claim_all') {
        const ctx = ensureCtx();
        const t = ctx.currentTime;
        beep({ freq: 700, dur: 0.08, type: 'triangle', vol: 0.06, t0: t });
        beep({ freq: 1000, dur: 0.10, type: 'sine', vol: 0.06, t0: t + 0.08 });
        beep({ freq: 1400, dur: 0.12, type: 'sine', vol: 0.05, t0: t + 0.18 });
      } else if (type === 'chest_small') {
        // Tono simple y corto
        const ctx = ensureCtx();
        const t = ctx.currentTime;
        beep({ freq: 600, dur: 0.10, type: 'triangle', vol: 0.05, t0: t });
        beep({ freq: 720, dur: 0.08, type: 'sine', vol: 0.04, t0: t + 0.09 });
      } else if (type === 'chest_rare') {
        // Pequeña arpegio ascendente
        const ctx = ensureCtx();
        const t = ctx.currentTime;
        beep({ freq: 520, dur: 0.10, type: 'triangle', vol: 0.06, t0: t });
        beep({ freq: 660, dur: 0.10, type: 'triangle', vol: 0.06, t0: t + 0.08 });
        beep({ freq: 820, dur: 0.12, type: 'sine', vol: 0.06, t0: t + 0.16 });
      } else if (type === 'chest_epic') {
        // Arpegio más largo con cierre brillante
        const ctx = ensureCtx();
        const t = ctx.currentTime;
        beep({ freq: 480, dur: 0.12, type: 'square', vol: 0.07, t0: t });
        beep({ freq: 640, dur: 0.12, type: 'square', vol: 0.07, t0: t + 0.10 });
        beep({ freq: 860, dur: 0.14, type: 'triangle', vol: 0.07, t0: t + 0.20 });
        beep({ freq: 1120, dur: 0.14, type: 'sine', vol: 0.06, t0: t + 0.32 });
      } else if (type === 'chest_legendary') {
        // Fanfarrias cortas y brillantes
        const ctx = ensureCtx();
        const t = ctx.currentTime;
        beep({ freq: 440, dur: 0.14, type: 'sawtooth', vol: 0.08, t0: t });
        beep({ freq: 660, dur: 0.14, type: 'sawtooth', vol: 0.08, t0: t + 0.12 });
        beep({ freq: 990, dur: 0.16, type: 'triangle', vol: 0.07, t0: t + 0.26 });
        beep({ freq: 1320, dur: 0.18, type: 'sine', vol: 0.06, t0: t + 0.42 });
      } else {
        beep({});
      }
    }
    window.addEventListener('sound', onSound);
    return () => window.removeEventListener('sound', onSound);
  }, []);

  return null;
}
