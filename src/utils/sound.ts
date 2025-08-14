let ctx: AudioContext | null = null;

export function playClick(volume = 0.3) {
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(660, ctx.currentTime);
    g.gain.value = volume;
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.05);
  } catch {}
}

export function vibrate(ms = 30) {
  try { navigator.vibrate?.(ms); } catch {}
}


