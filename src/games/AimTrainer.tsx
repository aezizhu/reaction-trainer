import { useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from '@/contexts/HistoryContext';
import { loadPrefs } from '@/utils/prefs';
import { playClick, vibrate } from '@/utils/sound';
import { useI18n } from '@/contexts/I18nContext';

interface Target { id: string; x: number; y: number; r: number; born: number; }

export default function AimTrainer({ autoMode = false, onFinish }: { autoMode?: boolean; onFinish?: () => void } = {}) {
  const { addRecord } = useHistory();
  const { t } = useI18n();
  const [running, setRunning] = useState(false);
  const [targets, setTargets] = useState<Target[]>([]);
  const [hits, setHits] = useState(0);
  const [attempts, setAttempts] = useState(0); // 用户点击次数
  const [spawns, setSpawns] = useState(0);    // 生成目标总数
  const [missed, setMissed] = useState(0);    // 未击中且过期的目标数
  const [timeLeft, setTimeLeft] = useState(30);
  const areaRef = useRef<HTMLDivElement | null>(null);
  const targetsRef = useRef<Target[]>([]);
  const lastClickAtRef = useRef<number>(0);
  const prefs = loadPrefs();

  useEffect(() => {
    let timer: number | undefined;
    if (running && timeLeft > 0) {
      timer = window.setTimeout(() => setTimeLeft(t => t - 1), 1000);
    }
    if (running && timeLeft === 0) {
      setRunning(false);
      // auto-save on finish
      const record = {
        id: crypto.randomUUID(),
        game: 'aim' as const,
        dateIso: new Date().toISOString(),
        aim: { hits, accuracy, timeSec: prefs.aim.durationSec }
      };
      addRecord(record);
      onFinish?.();
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [running, timeLeft]);

  useEffect(() => {
    let spawnId: number | undefined;
    let lifeId: number | undefined;
    if (running) {
      const spawn = () => {
        const area = areaRef.current?.getBoundingClientRect();
        if (!area) return;
        const r = prefs.aim.radius;
        let x = 0, y = 0;
        // try to avoid overlap with existing targets
        const existing = targetsRef.current;
        for (let tries = 0; tries < 10; tries++) {
          const tx = r + Math.random() * (area.width - 2 * r);
          const ty = r + Math.random() * (area.height - 2 * r);
          const overlap = existing.some(t => {
            const dx = t.x - tx; const dy = t.y - ty; const minDist = t.r + r + 12;
            return dx*dx + dy*dy < minDist*minDist;
          });
          if (!overlap) { x = tx; y = ty; break; }
          if (tries === 9) { x = tx; y = ty; }
        }
        setTargets(prev => [{ id: crypto.randomUUID(), x, y, r, born: performance.now() }, ...prev].slice(0, 6));
        setSpawns(n => n + 1);
        spawnId = window.setTimeout(spawn, prefs.aim.spawnMinMs + Math.random() * (prefs.aim.spawnMaxMs - prefs.aim.spawnMinMs));
      };
      const cull = () => {
        const now = performance.now();
        setTargets(prev => {
          const expired = prev.filter(t => now - t.born >= prefs.aim.targetLifeMs);
          if (expired.length) setMissed(m => m + expired.length);
          return prev.filter(t => now - t.born < prefs.aim.targetLifeMs);
        });
        lifeId = window.setTimeout(cull, 100);
      };
      spawnId = window.setTimeout(spawn, 300);
      lifeId = window.setTimeout(cull, 100);
    }
    return () => { if (spawnId) clearTimeout(spawnId); if (lifeId) clearTimeout(lifeId); };
  }, [running]);

  const accuracy = useMemo(() => attempts === 0 ? 0 : Math.min(100, (hits / attempts) * 100), [hits, attempts]);
  // keep ref in sync
  useEffect(() => { targetsRef.current = targets; }, [targets]);

  const start = () => { setRunning(true); setTargets([]); setHits(0); setAttempts(0); setSpawns(0); setMissed(0); setTimeLeft(30); };
  useEffect(() => { if (autoMode) { setTargets([]); setHits(0); setAttempts(0); setSpawns(0); setMissed(0); setTimeLeft(prefs.aim.durationSec); setRunning(true); } }, [autoMode]);
  const stop = () => setRunning(false);

  const handleAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!running) return;
    const now = performance.now();
    if (now - lastClickAtRef.current < 120) return; // throttle to avoid accidental double-count
    lastClickAtRef.current = now;
    setAttempts(s => s + 1);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left; const y = e.clientY - rect.top;
    // Use snapshot of targets to avoid side-effects inside setState updater
    const current = targetsRef.current;
    let hitId: string | null = null;
    for (const t of current) {
      const dx = t.x - x; const dy = t.y - y; const dist2 = dx * dx + dy * dy;
      if (dist2 <= t.r * t.r) { hitId = t.id; break; }
    }
    if (hitId) {
      setHits(h => h + 1);
      if (prefs.soundEnabled) playClick(0.12);
      if (prefs.vibrateEnabled) vibrate(10);
      setTargets(prev => prev.filter(p => p.id !== hitId));
    }
  };

  const save = () => {
    const record = {
      id: crypto.randomUUID(),
      game: 'aim' as const,
      dateIso: new Date().toISOString(),
      aim: { hits, accuracy, timeSec: prefs.aim.durationSec }
    };
    addRecord(record);
  };

  return (
    <div className="container" style={{ display: 'grid', gap: 16 }}>
      <section className="card panel" style={{ display: 'grid', gap: 8 }}>
        <div className="title">{t('game.aim')}</div>
        <div className="muted" style={{ fontSize: 14 }}>{t('aim.rules')}</div>
        <div className="row">
          <Tile title={t('ui.hits')} value={String(hits)} />
          <Tile title={t('ui.clicks')} value={String(attempts)} />
          <Tile title={t('ui.accuracy')} value={`${Math.round(accuracy)}%`} />
          <Tile title={t('ui.timeLeft')} value={`${timeLeft}s`} />
          <Tile title={t('ui.spawns')} value={String(spawns)} />
          <Tile title={t('ui.missed')} value={String(missed)} />
        </div>
        {!autoMode && (
          <div style={{ display: 'flex', gap: 8 }}>
            {!running ? (
              <button className="btn" onClick={start}>{t('ui.start')}</button>
            ) : (
              <button className="btn secondary" onClick={stop}>{t('ui.pause')}</button>
            )}
            <button className="btn" onClick={save} disabled={attempts === 0}>{t('ui.save')}</button>
          </div>
        )}

        <div
          ref={areaRef}
          onClick={handleAreaClick}
          className="card"
          style={{ height: 360, position: 'relative', overflow: 'hidden', cursor: 'crosshair' }}
        >
          {targets.map(t => (
            <div
              key={t.id}
              style={{
                position: 'absolute',
                left: t.x - t.r,
                top: t.y - t.r,
                width: t.r * 2,
                height: t.r * 2,
                borderRadius: '999px',
                background: 'radial-gradient(circle at 35% 35%, #ff9aa8 0%, #ff5c7a 60%, #ab2240 100%)',
                boxShadow: '0 6px 18px rgba(0,0,0,0.4)'
              }}
              className="pop-in"
            />
          ))}
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


