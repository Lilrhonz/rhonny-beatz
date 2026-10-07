function seededBars(seed, count) {
  let x = seed;
  const bars = [];
  for (let i = 0; i < count; i++) {
    x = (x * 9301 + 49297) % 233280;
    bars.push(20 + (x / 233280) * 80);
  }
  return bars;
}

export default function MiniWaveform({ seed, progress = 0 }) {
  const bars = seededBars(seed, 28);
  return (
    <div className="mini-waveform">
      {bars.map((h, i) => (
        <span
          key={i}
          style={{ height: `${h}%` }}
          className={i / bars.length < progress ? 'played' : ''}
        />
      ))}
    </div>
  );
}