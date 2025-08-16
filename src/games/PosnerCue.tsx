import { useEffect, useRef, useState } from 'react';
import { useHistory } from '@/contexts/HistoryContext';
import { loadPrefs } from '@/utils/prefs';
import { useI18n } from '@/contexts/I18nContext';

type Side = 'L' | 'R';

export default function PosnerCue({ autoMode = false, onFinish }: { autoMode?: boolean; onFinish?: () => void } = {}) {
  const { addRecord } = useHistory();
  const { t } = useI18n();
  const [running, setRunning] = useState(false);
  const [idx, setIdx] = useState(0);
  const [cue, setCue] = useState<Side | null>(null);
  const [target, setTarget] = useState<Side | null>(null);
  const [log, setLog] = useState<{ valid: boolean; rt?: number; correct: boolean }[]>([]);
  const startAt = useRef<number>(0);
  const prefs = loadPrefs();
  const trials = prefs.posner.trials;
  const validRatio = prefs.posner.validRatio;
  const panelRef = useRef<HTMLDivElement | null>(null);

  const beginTrial = () => {
    if (idx >= trials) return finish();
    const cueSide: Side = Math.random() < 0.5 ? 'L' : 'R';
    setCue(cueSide);
    setTarget(null);
    const isi = prefs.posner.isiMs;
    window.setTimeout(() => {
      const valid = Math.random() < validRatio;
      const tgtSide: Side = valid ? cueSide : (cueSide === 'L' ? 'R' : 'L');
      setTarget(tgtSide);
      startAt.current = performance.now();
    }, isi);
  };

  const answer = (side: Side) => {
    if (!running || !target) return;
    const rt = performance.now() - startAt.current;
    const correct = side === target;
    const valid = cue === target;
    setLog(prev => [...prev, { valid, rt, correct }]);
    setIdx(i => i + 1);
    setCue(null); setTarget(null);
    setTimeout(beginTrial, 400);
  };

  useEffect(() => { 
    if (running) { 
      panelRef.current?.focus(); 
      beginTrial(); 
    } 
    /* eslint-disable-next-line */
  }, [running]);
  
  // Keep focus on panel during run to avoid losing arrow key events
  useEffect(() => { 
    if (running) { 
      // Add a small delay to ensure the component is fully rendered
      setTimeout(() => panelRef.current?.focus(), 10);
    } 
  }, [idx, running, target, cue]);

  useEffect(() => {
    if (autoMode && !running && idx === 0) {
      setRunning(true);
      // Give focus immediately in auto mode
      setTimeout(() => panelRef.current?.focus(), 100);
    }
  }, [autoMode, running, idx]);

  const finish = () => {
    setRunning(false);
    const valid = log.filter(l => l.valid && l.correct);
    const invalid = log.filter(l => !l.valid && l.correct);
    const vAvg = avg(valid.map(l => l.rt!));
    const iAvg = avg(invalid.map(l => l.rt!));
    const acc = (log.filter(l => l.correct).length / Math.max(1, log.length)) * 100;
    addRecord({ id: crypto.randomUUID(), game: 'posner', dateIso: new Date().toISOString(), posner: { validAvgMs: vAvg, invalidAvgMs: iAvg, costMs: Math.max(0, iAvg - vAvg), accuracy: acc } });
    onFinish?.();
  };

  return (
    <div className="container" style={{ display: 'grid', gap: 16 }}>
      <section className="card panel" style={{ display: 'grid', gap: 8 }}>
        <div className="title">{t('game.posner')}</div>
        <div className="muted" style={{ fontSize: 14 }}>{t('posner.rules')}</div>
        {!running && !autoMode && (
          <div className="muted" style={{ fontSize: 12, textAlign: 'center', padding: '8px', background: 'rgba(124, 92, 255, 0.1)', borderRadius: '8px' }}>
            {t('posner.help')}
          </div>
        )}
        <div className="row">
          <Tile title={t('ui.progress')} value={`${Math.min(idx, trials)}/${trials}`} />
        </div>
        <div
          ref={panelRef}
          className="card panel"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') { 
              e.preventDefault(); 
              e.stopPropagation();
              answer('L'); 
            }
            if (e.key === 'ArrowRight') { 
              e.preventDefault(); 
              e.stopPropagation();
              answer('R'); 
            }
          }}
          style={{ height: 220, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', placeItems: 'center', outline: 'none', cursor: 'pointer' }}
          onClick={() => { if (!running) { setIdx(0); setLog([]); setRunning(true); } else { panelRef.current?.focus(); } }}
        >
          <div />
          <div style={{ fontSize: 42, opacity: cue ? 1 : 0.2 }}>{ cue === 'L' ? '←' : cue === 'R' ? '→' : '·' }</div>
          <div />
          <div style={{ gridColumn: '1 / span 1', fontSize: 36, opacity: target === 'L' ? 1 : 0.2 }}>•</div>
          <div />
          <div style={{ gridColumn: '3 / span 1', fontSize: 36, opacity: target === 'R' ? 1 : 0.2 }}>•</div>
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

function Tile({ title, value }: { title: string; value: string }) {
  return (
    <div className="card panel col">
      <div className="muted" style={{ fontSize: 12 }}>{title}</div>
      <div className="metric">{value}</div>
    </div>
  );
}

function avg(values: number[]) { return values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0; }


