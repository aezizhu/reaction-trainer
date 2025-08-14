import { useEffect, useRef, useState } from 'react';
import { useHistory } from '@/contexts/HistoryContext';

export default function TapSpeed({ autoMode = false, attempts = 3, onFinish }: { autoMode?: boolean; attempts?: number; onFinish?: () => void } = {}) {
  const { addRecord } = useHistory();
  const [running, setRunning] = useState(false);
  const [taps, setTaps] = useState(0);
  const [intervals, setIntervals] = useState<number[]>([]);
  const [left, setLeft] = useState(5);
  const lastTap = useRef<number>(0);
  const [round, setRound] = useState(1);
  const [best, setBest] = useState<{ taps: number; avgIntervalMs: number } | null>(null);

  useEffect(() => {
    let id: number | undefined;
    if (running && left > 0) {
      id = window.setTimeout(() => setLeft(s => s - 1), 1000);
    } else if (running && left === 0) {
      setRunning(false);
      const avgInterval = intervals.length ? intervals.reduce((s, v) => s + v, 0) / intervals.length : 0;
      if (!autoMode) {
        addRecord({ id: crypto.randomUUID(), game: 'taps', dateIso: new Date().toISOString(), taps: { taps, seconds: 5, avgIntervalMs: avgInterval } });
      } else {
        // auto flow: track best and repeat up to attempts; save best only at the end
        if (!best || taps > best.taps) setBest({ taps, avgIntervalMs: avgInterval });
        if (round < attempts) {
          setRound(r => r + 1);
          // start next attempt
          setTaps(0); setIntervals([]); setLeft(5); lastTap.current = 0; setRunning(true);
        } else {
          // save best only and finish
          if (best) {
            addRecord({ id: crypto.randomUUID(), game: 'taps', dateIso: new Date().toISOString(), taps: { taps: best.taps, seconds: 5, avgIntervalMs: best.avgIntervalMs } });
          }
          onFinish?.();
        }
      }
    }
    return () => { if (id) clearTimeout(id); };
  }, [running, left]);

  const tap = () => {
    if (!running) return;
    const now = performance.now();
    if (lastTap.current) setIntervals(prev => [...prev, now - lastTap.current]);
    lastTap.current = now;
    setTaps(t => t + 1);
  };

  const start = () => { setRunning(true); setTaps(0); setIntervals([]); setLeft(5); lastTap.current = 0; };
  useEffect(() => { if (autoMode && round === 1) start(); }, [autoMode, round]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.code === 'Space') { e.preventDefault(); tap(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="container" style={{ display: 'grid', gap: 16 }}>
      <section className="card panel" style={{ display: 'grid', gap: 8 }}>
        <div className="title">Tap Speed 点击速度</div>
        <div className="muted" style={{ fontSize: 14 }}>5秒内尽可能多的点击（或空格）。训练手指协调与节奏稳定性。</div>
        <div className="row">
          <Tile title="点击次数" value={String(taps)} />
          <Tile title="剩余时间" value={`${left}s`} />
          {autoMode && <Tile title="轮次" value={`${round}/${attempts}`} />}
          {autoMode && best && <Tile title="最佳成绩" value={`${best.taps}`} />}
        </div>
        <div className="card panel" onClick={tap} style={{ height: 220, display: 'grid', placeItems: 'center', userSelect: 'none', cursor: 'pointer' }}>
          <div className="metric">点击这里或按空格</div>
        </div>
        {!autoMode && (
          <div style={{ display: 'flex', gap: 8 }}>
            {!running ? <button className="btn" onClick={start}>开始</button> : <button className="btn secondary" onClick={() => setRunning(false)}>暂停</button>}
          </div>
        )}
      </section>
    </div>
  );
}

function Tile({ title, value }: { title: string; value: string }) {
  return (
    <div className="card panel col">
      <div className="muted" style={{ fontSize: 12 }}>{title}</div>
      <div className="metric">{value}</div>
    </div>
  );
}


