import { useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from '@/contexts/HistoryContext';
import { loadPrefs } from '@/utils/prefs';
import { useI18n } from '@/contexts/I18nContext';

type ColorKey = '红' | '绿' | '蓝' | '黄';
const COLORS: Record<ColorKey, string> = { '红': '#ff5c7a', '绿': '#3ad29f', '蓝': '#5aa9ff', '黄': '#ffcc66' };
const KEYS: Record<string, ColorKey> = { d: '红', f: '绿', j: '蓝', k: '黄' };

interface Trial { word: ColorKey; color: ColorKey; congruent: boolean }

export default function Stroop({ autoMode = false, onFinish }: { autoMode?: boolean; onFinish?: () => void } = {}) {
  const { addRecord } = useHistory();
  const { t } = useI18n();
  const [running, setRunning] = useState(false);
  const [idx, setIdx] = useState(0);
  const [trial, setTrial] = useState<Trial | null>(null);
  const [log, setLog] = useState<{ rt: number; correct: boolean; congruent: boolean }[]>([]);
  const startAt = useRef<number>(0);
  const prefs = loadPrefs();
  const total = prefs.stroop.total;
  const incongruentRatio = prefs.stroop.incongruentRatio;
  const panelRef = useRef<HTMLDivElement | null>(null);

  const nextTrial = () => {
    if (idx >= total) return finish();
    const word = pick<ColorKey>(['红', '绿', '蓝', '黄']);
    const isCong = Math.random() > incongruentRatio;
    const pool = (['红', '绿', '蓝', '黄'] as ColorKey[]).filter(c => c !== word);
    const color = isCong ? word : pick<ColorKey>(pool);
    setTrial({ word, color, congruent: isCong });
    startAt.current = performance.now();
  };

  const answer = (c: ColorKey) => {
    if (!running || !trial) return;
    const rt = performance.now() - startAt.current;
    const correct = c === trial.color;
    setLog(prev => [...prev, { rt, correct, congruent: trial.congruent }]);
    setIdx(i => i + 1);
    setTrial(null);
    setTimeout(nextTrial, 400);
  };

  useEffect(() => {
    if (!running) return;
    panelRef.current?.focus();
    nextTrial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  useEffect(() => {
    if (autoMode && !running && idx === 0) setRunning(true);
  }, [autoMode, running, idx]);

  // Also bind at panel level to stop focus跳转
  const onPanelKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const key = e.key.toLowerCase();
    if (key in KEYS) {
      e.preventDefault();
      e.stopPropagation();
      answer(KEYS[key]);
    }
  };

  const finish = () => {
    setRunning(false);
    const congruent = log.filter(l => l.congruent && l.correct);
    const incong = log.filter(l => !l.congruent && l.correct);
    const congAvg = avg(congruent.map(l => l.rt));
    const incongAvg = avg(incong.map(l => l.rt));
    const acc = (log.filter(l => l.correct).length / Math.max(1, log.length)) * 100;
    addRecord({ id: crypto.randomUUID(), game: 'stroop', dateIso: new Date().toISOString(), stroop: { congruentAvgMs: congAvg, incongruentAvgMs: incongAvg, accuracy: acc, costMs: Math.max(0, incongAvg - congAvg) } });
    onFinish?.();
  };

  return (
    <div className="container" style={{ display: 'grid', gap: 16 }}>
      <section className="card panel" style={{ display: 'grid', gap: 8 }}>
        <div className="title">Stroop</div>
        <div className="muted" style={{ fontSize: 14 }}>{t('stroop.rules')}</div>
        <div className="row">
          <Tile title={t('ui.progress')} value={`${Math.min(idx, total)}/${total}`} />
        </div>
        <div
          ref={panelRef}
          className="card panel"
          tabIndex={0}
          onKeyDown={onPanelKey}
          style={{ height: 220, display: 'grid', placeItems: 'center', outline: 'none' }}
        >
          {trial ? (
            <div style={{ fontSize: 64, fontWeight: 900, color: COLORS[trial.color], transition: 'transform .2s ease' }}>
              {trial.word}
            </div>
          ) : (
            <div className="muted">{running ? t('stroop.readyNext') : t('rt.clickToStart')}</div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {!running ? <button className="btn" onClick={() => { setIdx(0); setLog([]); setRunning(true); }}>开始</button> : <button className="btn secondary" onClick={() => setRunning(false)}>暂停</button>}
          {trial && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(Object.keys(COLORS) as ColorKey[]).map((c) => (
                <button key={c} className="btn" style={{ background: COLORS[c] }} onClick={() => answer(c)}>{c}</button>
              ))}
            </div>
          )}
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

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function avg(values: number[]) { return values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0; }


