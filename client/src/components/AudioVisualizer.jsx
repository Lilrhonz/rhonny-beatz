import { useEffect, useRef } from 'react';

const BAR_COUNT = 24;

export default function AudioVisualizer({ audioRef, isPlaying }) {
  const barRefs = useRef([]);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    // Set up the audio graph once, the first time it's needed.
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64; // small = fewer, chunkier bars, less CPU

      const source = ctx.createMediaElementSource(audioEl);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
    }

    return () => {
      // Keep the audio graph alive across plays — only torn down on unmount
      // (handled separately below), not on every effect re-run.
    };
  }, [audioRef]);

  useEffect(() => {
    if (!isPlaying || !analyserRef.current) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    // Browsers suspend AudioContext until a user gesture — resume on play.
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    const analyser = analyserRef.current;
    const data = new Uint8Array(analyser.frequencyBinCount);

    function draw() {
      analyser.getByteFrequencyData(data);
      const step = Math.floor(data.length / BAR_COUNT);

      for (let i = 0; i < BAR_COUNT; i++) {
        const value = data[i * step] || 0;
        const pct = Math.max(8, (value / 255) * 100);
        const bar = barRefs.current[i];
        if (bar) bar.style.height = `${pct}%`;
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying]);

  return (
    <div className={`visualizer ${isPlaying ? 'is-active' : ''}`} aria-hidden="true">
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <span key={i} ref={(el) => (barRefs.current[i] = el)} />
      ))}
    </div>
  );
}