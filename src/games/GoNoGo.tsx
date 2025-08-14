import { useEffect, useRef, useState } from 'react';
import { useHistory } from '@/contexts/HistoryContext';
import { loadPrefs } from '@/utils/prefs';
import { playClick } from '@/utils/sound';
import { useI18n } from '@/contexts/I18nContext';

type Stim = 'GO' | 'NOGO';

export default function GoNoGo({ autoMode = false, onFinish }: { autoMode?: boolean; onFinish?: () => void } = {}) {
  const { addRecord } = useHistory();
  const { t } = useI18n();
  const [running, setRunning] = useState(false);
  const [stim, setStim] = useState<Stim | null>(null);
  const [idx, setIdx] = useState(0);
  const [log, setLog] = useState<{ stim: Stim; rt?: number; correct: boolean }[]>([]);
  const goStart = useRef<number>(0);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const prefs = loadPrefs();
  const trials = prefs.gng.trials;
  const goRatio = prefs.gng.goRatio;
  const isi = prefs.gng.isiMs; // inter-stimulus interval

  useEffect(() => {
    if (!running) return;
    // ensure focus to receive keyboard events
    panelRef.current?.focus();
    if (idx >= trials) return finish();
    const isGo = Math.random() < goRatio;
    setStim(isGo ? 'GO' : 'NOGO');
    const start = performance.now();
    goStart.current = start;
    const timer = window.setTimeout(() => {
      // if no response
      setLog(prev => [...prev, { stim: isGo ? 'GO' : 'NOGO', correct: !isGo }]);
      setStim(null);
      setIdx(i => i + 1);
    }, isi);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, idx]);

  useEffect(() => {
    if (autoMode && !running && idx === 0) setRunning(true);
  }, [autoMode, running, idx]);

  const press = () => {
    if (!running || stim === null) return;
    const rt = performance.now() - goStart.current;
    const correct = stim === 'GO';
    setLog(prev => [...prev, { stim, rt, correct }]);
    setStim(null);
    setIdx(i => i + 1);
    if (correct) playClick(0.08);
  };

  const finish = () => {
    setRunning(false);
    const go = log.filter(l => l.stim === 'GO');
    const nogo = log.filter(l => l.stim === 'NOGO');
    const goAcc = go.length ? (go.filter(l => l.correct).length / go.length) * 100 : 0;
    const nogoAcc = nogo.length ? (nogo.filter(l => l.correct).length / nogo.length) * 100 : 0;
    const avgRt = go.filter(l => l.correct && l.rt !== undefined).reduce((s, l) => s + (l.rt || 0), 0) / Math.max(1, go.filter(l => l.correct && l.rt !== undefined).length);
    addRecord({ id: crypto.randomUUID(), game: 'gng', dateIso: new Date().toISOString(), gng: { goAcc, nogoAcc, avgRtMs: avgRt || 0 } });
    onFinish?.();
  };

  return (
    <div className="container" style={{ display: 'grid', gap: 16 }}>
      <section className="card panel" style={{ display: 'grid', gap: 8 }}>
        <div className="title">Go/No-Go</div>
        <div className="muted" style={{ fontSize: 14 }}>{t('gng.rules', { n: trials })}</div>
        <div className="row">
          <div className="card panel col"><div className="muted" style={{ fontSize: 12 }}>{t('ui.currentTrial')}</div><div className="metric">{Math.min(idx + 1, trials)}/{trials}</div></div>
        </div>
        <div
          ref={panelRef}
          className="card panel"
          tabIndex={0}
          onKeyDown={(e) => { if (e.code === 'Space') press(); }}
          style={{ height: 200, display: 'grid', placeItems: 'center', outline: 'none' }}
        >
          <div style={{ fontWeight: 900, fontSize: 48 }}>{stim ?? 'Press Space to start'}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {!running ? (
            <button className="btn" onClick={() => { setIdx(0); setLog([]); setRunning(true); }}>{t('ui.start')}</button>
          ) : (
            <button className="btn secondary" onClick={() => setRunning(false)}>{t('ui.pause')}</button>
          )}
        </div>
      </section>
    </div>
  );
}


