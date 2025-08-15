import { useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from '@/contexts/HistoryContext';
import { loadPrefs } from '@/utils/prefs';
import { playClick } from '@/utils/sound';
import { useI18n } from '@/contexts/I18nContext';

type Cell = 0 | 1 | 2 | 3;

export default function SequenceMemory({ autoMode = false, onFinish }: { autoMode?: boolean; onFinish?: () => void } = {}) {
  const { addRecord } = useHistory();
  const { t } = useI18n();
  const [level, setLevel] = useState(1);
  const [seq, setSeq] = useState<Cell[]>([]);
  const [showing, setShowing] = useState(false);
  const [input, setInput] = useState<Cell[]>([]);
  const [longest, setLongest] = useState(1);
  const [active, setActive] = useState<Cell | null>(null);
  const timersRef = useRef<number[]>([]);
  const prefs = loadPrefs();

  useEffect(() => {
    startLevel(1);
    return () => { clearTimers(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearTimers = () => {
    for (const id of timersRef.current) clearTimeout(id);
    timersRef.current = [];
  };

  const playSequence = (s: Cell[]) => {
    clearTimers();
    setShowing(true);
    setActive(null);
    const showMs = prefs.sequence.showMs;
    const gapMs = prefs.sequence.gapMs;
    const totalPer = showMs + gapMs;
    s.forEach((cell, i) => {
      const onId = window.setTimeout(() => { setActive(cell); playClick(0.05); }, i * totalPer);
      const offId = window.setTimeout(() => setActive(null), i * totalPer + showMs);
      timersRef.current.push(onId, offId);
    });
    const endId = window.setTimeout(() => setShowing(false), s.length * totalPer + 10);
    timersRef.current.push(endId);
  };

  const startLevel = (lv: number) => {
    setLevel(lv);
    const s: Cell[] = Array.from({ length: lv }, () => Math.floor(Math.random() * 4) as Cell);
    setSeq(s);
    setInput([]);
    playSequence(s);
  };

  const clickCell = (cell: Cell) => {
    if (showing) return;
    const next = [...input, cell];
    setInput(next);
    for (let i = 0; i < next.length; i++) {
      if (next[i] !== seq[i]) {
        // fail
        const newLongest = Math.max(longest, level - 1);
        setLongest(newLongest);
        save(level - 1, newLongest);
        if (autoMode) { onFinish?.(); } else { return startLevel(1); }
        return;
      }
    }
    if (next.length === seq.length) {
      const nextLv = level + 1;
      const newLongest = Math.max(longest, nextLv);
      setLongest(newLongest);
      setTimeout(() => startLevel(nextLv), 400);
    }
  };

  const save = (lv: number, longestVal: number) => {
    addRecord({
      id: crypto.randomUUID(),
      game: 'sequence',
      dateIso: new Date().toISOString(),
      sequence: { level: lv, longest: longestVal }
    });
  };

  const grid = useMemo(() => [0, 1, 2, 3] as Cell[], []);

  return (
    <div className="container" style={{ display: 'grid', gap: 16 }}>
      <section className="card panel" style={{ display: 'grid', gap: 8 }}>
        <div className="title">{t('game.sequence')}</div>
        <div className="muted" style={{ fontSize: 14 }}>{t('seq.rules')}</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="card panel col">
            <div className="muted" style={{ fontSize: 12 }}>{t('seq.currentLevel')}</div>
            <div className="metric">{level}</div>
          </div>
          <div className="card panel col">
            <div className="muted" style={{ fontSize: 12 }}>{t('seq.longest')}</div>
            <div className="metric">{longest}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 160px)', gap: 12, justifyContent: 'start', padding: 6 }}>
          {grid.map((c) => (
            <button
              key={c}
              onClick={() => clickCell(c)}
              className="card"
              style={{
                width: 160,
                height: 160,
                borderRadius: 12,
                background:
                  (showing && active === c) ? '#ffcc66' :
                  (!showing && input[input.length - 1] === c) ? '#7c5cff' :
                  '#2b2f55'
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}


