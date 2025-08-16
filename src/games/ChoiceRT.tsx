import { useEffect, useRef, useState } from 'react';
import { useHistory } from '@/contexts/HistoryContext';
import { useI18n } from '@/contexts/I18nContext';

const KEYS = ['KeyD','KeyF','KeyJ','KeyK'];

export default function ChoiceRT({ autoMode = false, trials = 40, onFinish }: { autoMode?: boolean; trials?: number; onFinish?: () => void } = {}) {
  const { addRecord } = useHistory();
  const { t } = useI18n();
  const [running, setRunning] = useState(false);
  const [idx, setIdx] = useState(0);
  const [cue, setCue] = useState<number | null>(null);
  const [log, setLog] = useState<{ rt: number; correct: boolean }[]>([]);
  const startAt = useRef(0);

  const begin = () => {
    if (idx >= trials) return finish();
    const c = Math.floor(Math.random() * 4);
    setCue(c);
    startAt.current = performance.now();
  };

  useEffect(() => { if (running) begin(); /* eslint-disable-next-line */ }, [running, idx]);

  useEffect(() => {
    if (autoMode && !running && idx === 0) {
      setRunning(true);
    }
  }, [autoMode, running, idx]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!running || cue === null) return;
      const n = KEYS.indexOf(e.code);
      if (n === -1) return;
      e.preventDefault();
      const rt = performance.now() - startAt.current;
      const correct = n === cue;
      setLog(prev => [...prev, { rt, correct }]);
      setCue(null); setIdx(i => i + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [running, cue]);

  const finish = () => {
    setRunning(false);
    const correct = log.filter(l => l.correct);
    const avgRt = correct.length ? correct.reduce((s, l) => s + l.rt, 0) / correct.length : 0;
    const acc = (correct.length / Math.max(1, log.length)) * 100;
    addRecord({ id: crypto.randomUUID(), game: 'crt', dateIso: new Date().toISOString(), crt: { choices: 4, avgRtMs: avgRt, accuracy: acc } });
    onFinish?.();
  };

  return (
    <div className="container" style={{ display: 'grid', gap: 16 }}>
      <section className="card panel" style={{ display: 'grid', gap: 8 }}>
        <div className="title">{t('game.crt')}</div>
        <div className="muted" style={{ fontSize: 14 }}>{t('crt.rules')}</div>
        <div className="card panel" style={{ height: 220, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, placeItems: 'center' }}>
          {[0,1,2,3].map(i => (
            <div key={i} className="card" style={{ width: 100, height: 100, display: 'grid', placeItems: 'center', background: cue === i ? '#7c5cff' : undefined }}>
              {['D','F','J','K'][i]}
            </div>
          ))}
        </div>
        {!autoMode && (
          <div style={{ display: 'flex', gap: 8 }}>
            {!running ? <button className="btn" onClick={() => { setIdx(0); setLog([]); setRunning(true); }}>{t('ui.start')}</button> : <button className="btn secondary" onClick={() => setRunning(false)}>{t('ui.pause')}</button>}
          </div>
        )}
      </section>
    </div>
  );
}


