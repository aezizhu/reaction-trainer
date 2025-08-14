import { useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from '@/contexts/HistoryContext';
import { loadPrefs } from '@/utils/prefs';
import { playClick, vibrate } from '@/utils/sound';

type Phase = 'idle' | 'ready' | 'wait' | 'go' | 'result';

export default function ReactionTime({ autoMode = false, targetAttempts = 8, onFinish }: { autoMode?: boolean; targetAttempts?: number; onFinish?: () => void } = {}) {
  const { addRecord } = useHistory();
  const [phase, setPhase] = useState<Phase>('idle');
  const [attempts, setAttempts] = useState<number[]>([]);
  const waitTimer = useRef<number | null>(null);
  const goAt = useRef<number>(0);

  const prefs = loadPrefs();

  const startTrial = () => {
    setPhase('ready');
    const delay = prefs.reaction.minDelayMs + Math.random() * (prefs.reaction.maxDelayMs - prefs.reaction.minDelayMs);
    if (waitTimer.current) window.clearTimeout(waitTimer.current);
    waitTimer.current = window.setTimeout(() => {
      goAt.current = performance.now();
      setPhase('go');
      if (prefs.soundEnabled) playClick(0.2);
    }, delay);
    setPhase('wait');
  };

  const handleClick = () => {
    if (phase === 'wait') {
      // false start
      setAttempts(prev => [...prev, 1000]);
      setPhase('result');
      return;
    }
    if (phase === 'go') {
      const rt = performance.now() - goAt.current;
      setAttempts(prev => [...prev, rt]);
      setPhase('result');
      if (prefs.vibrateEnabled) vibrate(20);
      return;
    }
    if (phase === 'idle' || phase === 'result') {
      startTrial();
    }
  };

  useEffect(() => () => { if (waitTimer.current) window.clearTimeout(waitTimer.current); }, []);

  const summary = useMemo(() => {
    if (attempts.length === 0) return null;
    const valid = attempts.filter(a => a >= 120);
    const avg = valid.reduce((s, v) => s + v, 0) / Math.max(valid.length, 1);
    const best = valid.length ? Math.min(...valid) : Math.min(...attempts);
    return { avg, best, validCount: valid.length };
  }, [attempts]);

  const save = () => {
    if (!summary) return;
    addRecord({
      id: crypto.randomUUID(),
      game: 'reaction',
      dateIso: new Date().toISOString(),
      reaction: { attempts, averageMs: summary.avg, bestMs: summary.best }
    });
    onFinish?.();
  };

  const reset = () => { setAttempts([]); setPhase('idle'); };

  useEffect(() => {
    if (autoMode && phase === 'idle') {
      startTrial();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoMode]);

  useEffect(() => {
    if (!autoMode) return;
    if (attempts.length >= targetAttempts && summary) {
      // auto save and finish
      addRecord({
        id: crypto.randomUUID(),
        game: 'reaction',
        dateIso: new Date().toISOString(),
        reaction: { attempts, averageMs: summary.avg, bestMs: summary.best }
      });
      onFinish?.();
    }
  }, [attempts, targetAttempts, summary, autoMode]);

  return (
    <div className="container" style={{ display: 'grid', gap: 16 }}>
      <section className="card panel" style={{ display: 'grid', gap: 8 }}>
        <div className="title">反应时 Reaction Time</div>
        <div className="muted" style={{ fontSize: 14 }}>规则：界面随机变色后尽快点击。过早点击计为1000ms（抢跑）。建议完成5-10次尝试。</div>

        <div
          onClick={handleClick}
          className="card"
          style={{
            height: 280,
            borderRadius: 14,
            display: 'grid',
            placeItems: 'center',
            background: phase === 'go' ? '#1f8b4c' : phase === 'wait' ? '#5b5f87' : '#2a2f5f',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          {phase === 'idle' && <Prompt text="点击开始" />}
          {phase === 'wait' && <Prompt text="等待变色... 不要抢跑" />}
          {phase === 'go' && <Prompt text="现在！点击！" />}
          {phase === 'result' && <Prompt text="再次点击继续" />}
        </div>

        {!autoMode && (
        <div className="row">
          <div className="card panel col">
            <div className="muted" style={{ fontSize: 12 }}>尝试次数</div>
            <div className="metric">{attempts.length}</div>
          </div>
          <div className="card panel col">
            <div className="muted" style={{ fontSize: 12 }}>平均</div>
            <div className="metric">{summary ? Math.round(summary.avg) : '--'}ms</div>
          </div>
          <div className="card panel col">
            <div className="muted" style={{ fontSize: 12 }}>最佳</div>
            <div className="metric">{summary ? Math.round(summary.best) : '--'}ms</div>
          </div>
        </div>) }

        {!autoMode && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={handleClick}>{phase === 'idle' ? '开始' : '继续'}</button>
          <button className="btn secondary" onClick={reset}>重置</button>
          <button className="btn" onClick={save} disabled={!summary}>保存到历史</button>
        </div>
        )}

        {!autoMode && (
          <ul className="muted" style={{ fontSize: 13, display: 'grid', gap: 6 }}>
            {attempts.map((a, i) => (
              <li key={i}>#{i + 1}：{Math.round(a)}ms {a < 120 ? '(无效/抢跑)' : ''}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Prompt({ text }: { text: string }) {
  return <div style={{ fontWeight: 900, fontSize: 24 }}>{text}</div>;
}


