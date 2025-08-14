import { useEffect, useRef, useState } from 'react';
import { useHistory } from '@/contexts/HistoryContext';
import { loadPrefs } from '@/utils/prefs';
import { playClick } from '@/utils/sound';
import { useI18n } from '@/contexts/I18nContext';

// Simplified SST: Go trials (left/right arrow) and occasional Stop signal (beep) after SSD
export default function StopSignal({ autoMode = false, onFinish }: { autoMode?: boolean; onFinish?: () => void } = {}) {
  const { addRecord } = useHistory();
  const { t } = useI18n();
  const [running, setRunning] = useState(false);
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState<'L'|'R'|null>(null);
  const [isStop, setIsStop] = useState(false);
  const [ssd, setSsd] = useState(250); // stop-signal delay ms (adaptive)
  const startAt = useRef(0);
  const [log, setLog] = useState<{ go: boolean; correct: boolean; rt?: number; stop?: boolean }[]>([]);
  const trials = 40;
  const stopRatio = 0.25;
  const step = 50; // staircase 1-up/1-down
  const prefs = loadPrefs();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const beepTimer = useRef<number | null>(null);
  const endTimer = useRef<number | null>(null);
  const RESPONSE_WINDOW_MS = 1000;

  const clearTimers = () => {
    if (beepTimer.current) { window.clearTimeout(beepTimer.current); beepTimer.current = null; }
    if (endTimer.current) { window.clearTimeout(endTimer.current); endTimer.current = null; }
  };

  const begin = () => {
    if (idx >= trials) return finish();
    const d: 'L'|'R' = Math.random() < 0.5 ? 'L' : 'R';
    setDir(d);
    const willStop = Math.random() < stopRatio;
    setIsStop(false);
    startAt.current = performance.now();
    clearTimers();
    if (willStop) {
      beepTimer.current = window.setTimeout(() => { setIsStop(true); if (prefs.soundEnabled) playClick(0.25); }, ssd) as any;
    }
    // End-of-trial timer: if无响应，则记录（Go错/Stop成功），并推进试次
    endTimer.current = window.setTimeout(() => {
      if (!running) return;
      if (willStop) {
        // Successful stop (no response)
        setLog(prev => [...prev, { go: false, correct: true, stop: true }]);
        setSsd(prev => prev + step); // 成功 → SSD 增大
      } else {
        // Missed Go
        setLog(prev => [...prev, { go: true, correct: false }]);
      }
      setIdx(i => i + 1);
      setDir(null); setIsStop(false);
      clearTimers();
    }, RESPONSE_WINDOW_MS) as any;
  };

  useEffect(() => { if (running) { panelRef.current?.focus(); begin(); } /* eslint-disable-next-line */}, [running, idx]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!running || !dir) return;
      if (e.code !== 'ArrowLeft' && e.code !== 'ArrowRight') return;
      e.preventDefault();
      const side = e.code === 'ArrowLeft' ? 'L' : 'R';
      const rt = performance.now() - startAt.current;
      clearTimers();
      if (isStop) {
        // Failed stop
        setLog(prev => [...prev, { go: false, correct: false, stop: true, rt }]);
        setSsd(prev => Math.max(0, prev - step));
      } else {
        const correct = side === dir;
        setLog(prev => [...prev, { go: true, correct, rt }]);
      }
      setIdx(i => i + 1);
      setDir(null); setIsStop(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [running, dir, isStop]);

  const finish = () => {
    setRunning(false);
    clearTimers();
    const go = log.filter(l => l.go);
    const goAcc = go.length ? (go.filter(l => l.correct).length / go.length) * 100 : 0;
    const stopTrials = log.filter(l => l.stop);
    const stopSuccess = stopTrials.length ? (stopTrials.filter(l => l.correct).length / stopTrials.length) * 100 : 0;
    // Estimate SSRT ≈ mean(correct Go RT) - 当前SSD
    const meanGoRt = avg(go.filter(l => l.correct && typeof l.rt === 'number').map(l => l.rt as number));
    const ssrt = Math.max(0, meanGoRt - ssd);
    addRecord({ id: crypto.randomUUID(), game: 'sst', dateIso: new Date().toISOString(), sst: { avgSsdMs: ssd, ssrtMs: ssrt, stopSuccessPct: stopSuccess, goAcc } });
    onFinish?.();
  };

  return (
    <div className="container" style={{ display: 'grid', gap: 16 }}>
      <section className="card panel" style={{ display: 'grid', gap: 8 }}>
        <div className="title">Stop-Signal</div>
        <div className="muted" style={{ fontSize: 14 }}>{t('sst.rules')}</div>
        <div className="row">
          <Tile title={t('ui.progress')} value={`${Math.min(idx, trials)}/${trials}`} />
          <Tile title={t('ui.ssd')} value={`${ssd}ms`} />
        </div>
        <div ref={panelRef} className="card panel" tabIndex={0} style={{ height: 220, display: 'grid', placeItems: 'center', outline: 'none' }}>
          <div style={{ fontWeight: 900, fontSize: 64 }}>
            {dir === 'L' ? '←' : dir === 'R' ? '→' : '·'} {isStop ? '🚫' : ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {!running ? <button className="btn" onClick={() => { setIdx(0); setLog([]); setRunning(true); }}>{t('ui.start')}</button> : <button className="btn secondary" onClick={() => setRunning(false)}>{t('ui.pause')}</button>}
        </div>
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

function avg(v: number[]) { return v.length ? v.reduce((s, x) => s + x, 0) / v.length : 0; }


